package com.hoops.stats.card.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.card.model.PlayerAttribute;
import com.hoops.stats.card.model.PlayerCard;
import com.hoops.stats.config.R2Config;
import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import com.hoops.stats.service.PlayerService;
import com.hoops.stats.util.CompressionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.util.*;

/**
 * Advanced Card Generation Service
 * Generates FIFA-style player cards with advanced attributes for entire season
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdvancedCardGenerationService {

    private final com.hoops.stats.repository.R2DataRepository r2DataRepository;
    private final RatingCalculator ratingCalculator;
    private final AdvancedStatsCalculator advancedStatsCalculator;
    private final CompressionUtil compressionUtil;
    private final R2Config r2Config;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired(required = false)
    private S3Client r2Client;

    /**
     * Generate all advanced cards for a season and upload to R2
     */
    public Map<String, Object> generateAdvancedCardsForSeason(String season) throws Exception {
        log.info("Generating advanced cards for season {} (R2 ONLY - no Firestore)", season);

        if (!r2DataRepository.isR2Ready()) {
            throw new IllegalStateException("R2 data not loaded! Cannot generate cards without R2.");
        }

        long startTime = System.currentTimeMillis();

        // Get ALL players from R2 for this season
        List<Map<String, Object>> playerDataList = r2DataRepository.getAllPlayers(
                season,
                new java.util.HashMap<>(), // no filters
                10000, // large limit to get all
                0      // no offset
        );
        log.info("Found {} players in R2 for season {}", playerDataList.size(), season);

        Map<String, PlayerCard> allCards = new LinkedHashMap<>();
        int processedCount = 0;
        int skippedCount = 0;

        for (Map<String, Object> playerData : playerDataList) {
            String playerId = (String) playerData.get("id");

            try {
                // Convert R2 data to Player and PlayerStats objects
                Player player = mapToPlayer(playerData, playerId);
                PlayerStats stats = mapToPlayerStats(playerData, playerId, season);

                // Generate card with advanced attributes
                PlayerCard card = generateAdvancedCardForPlayer(player, stats);
                allCards.put(playerId, card);

                processedCount++;

                if (processedCount % 50 == 0) {
                    log.info("Processed {}/{} players", processedCount, playerDataList.size());
                }
            } catch (Exception e) {
                log.error("Error generating card for player {}: {}", playerId, e.getMessage());
                skippedCount++;
            }
        }

        log.info("Successfully generated {} cards for season {} (skipped: {})",
                allCards.size(), season, skippedCount);

        // Convert to JSON
        String jsonData = objectMapper.writeValueAsString(allCards);
        byte[] jsonBytes = jsonData.getBytes("UTF-8");

        // Calculate sizes
        double uncompressedSizeMB = jsonBytes.length / (1024.0 * 1024.0);
        log.info("Uncompressed size: {} MB", String.format("%.2f", uncompressedSizeMB));

        // Determine if compression is needed
        boolean shouldCompress = uncompressedSizeMB > 10.0;
        String fileName = "advanced-cards" + (shouldCompress ? ".json.gz" : ".json");

        byte[] dataToUpload;
        String contentType;

        if (shouldCompress) {
            log.info("Compressing data (size > 10MB)...");
            dataToUpload = compressionUtil.compressToGzip(allCards);
            contentType = "application/gzip";

            double compressedSizeMB = dataToUpload.length / (1024.0 * 1024.0);
            double compressionRatio = (1.0 - (compressedSizeMB / uncompressedSizeMB)) * 100;
            log.info("Compressed size: {} MB ({} % reduction)",
                    String.format("%.2f", compressedSizeMB),
                    String.format("%.1f", compressionRatio));
        } else {
            log.info("No compression needed (size < 10MB)");
            dataToUpload = jsonBytes;
            contentType = "application/json";
        }

        // Upload to R2
        log.info("Uploading to R2: {}", fileName);
        String uploadResult = uploadToR2(fileName, dataToUpload, contentType);

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("season", season);
        response.put("totalPlayers", allCards.size());
        response.put("fileName", fileName);
        response.put("compressed", shouldCompress);
        response.put("uncompressedSizeMB", String.format("%.2f", uncompressedSizeMB));

        if (shouldCompress) {
            double compressedSizeMB = dataToUpload.length / (1024.0 * 1024.0);
            response.put("compressedSizeMB", String.format("%.2f", compressedSizeMB));
            response.put("compressionRatio", String.format("%.1f%%",
                    (1.0 - (compressedSizeMB / uncompressedSizeMB)) * 100));
        }

        response.put("uploadResult", uploadResult);
        response.put("generationTimeMs", duration);
        response.put("r2Url", "https://hoops.r2.dev/" + fileName);

        log.info("Advanced card generation complete for season {}: {} players in {}ms",
                season, allCards.size(), duration);

        return response;
    }

    /**
     * Generate advanced card for a single player
     */
    public PlayerCard generateAdvancedCardForPlayer(Player player, PlayerStats stats) {
        // Calculate overall rating
        int overallRating = ratingCalculator.calculateOverallRating(stats, player.getPosition());

        // Calculate advanced attributes
        PlayerAttribute.AdvancedAttributes advancedAttributes =
                advancedStatsCalculator.calculateAdvancedAttributes(player, stats);

        // Determine rarity
        String rarity = getRarity(overallRating);

        // Get gradient
        String[] gradient = getGradient(rarity);

        // Build card
        return PlayerCard.fromPlayerAndStats(
                player,
                stats,
                overallRating,
                rarity,
                gradient,
                PlayerCard.CardType.BASE,
                advancedAttributes
        );
    }

    /**
     * Get sample advanced cards for testing
     */
    public Map<String, Object> getSampleAdvancedCards(String season) {
        log.info("Getting sample advanced cards for season {} (R2 ONLY)", season);

        if (!r2DataRepository.isR2Ready()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "R2 data not loaded");
            return error;
        }

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> samples = new ArrayList<>();

        // Sample players to showcase
        String[] samplePlayerIds = {
                "nikola-jokic",
                "luka-doncic",
                "giannis-antetokounmpo",
                "victor-wembanyama",
                "cade-cunningham"
        };

        for (String playerId : samplePlayerIds) {
            try {
                Optional<Map<String, Object>> playerDataOpt =
                        r2DataRepository.getPlayerStatsBySeason(playerId, season);

                if (playerDataOpt.isPresent()) {
                    Map<String, Object> playerData = playerDataOpt.get();
                    Player player = mapToPlayer(playerData, playerId);
                    PlayerStats stats = mapToPlayerStats(playerData, playerId, season);

                    PlayerCard card = generateAdvancedCardForPlayer(player, stats);

                    Map<String, Object> sampleData = new HashMap<>();
                    sampleData.put("player", player.getName());
                    sampleData.put("position", player.getPosition());
                    sampleData.put("overallRating", card.getOverallRating());
                    sampleData.put("advancedAttributes", card.getAdvancedAttributes());

                    samples.add(sampleData);
                }
            } catch (Exception e) {
                log.error("Error generating sample for {}: {}", playerId, e.getMessage());
            }
        }

        response.put("season", season);
        response.put("samplePlayers", samples);
        response.put("totalSamples", samples.size());

        return response;
    }

    private String getRarity(int rating) {
        if (rating >= 90) return "legendary";
        if (rating >= 85) return "gold_rare";
        if (rating >= 80) return "gold";
        if (rating >= 75) return "silver_rare";
        if (rating >= 65) return "silver";
        return "bronze";
    }

    private String[] getGradient(String rarity) {
        Map<String, String[]> gradients = new HashMap<>();
        gradients.put("bronze", new String[]{"#8B4513", "#CD7F32", "#A0522D"});
        gradients.put("silver", new String[]{"#808080", "#C0C0C0", "#A9A9A9"});
        gradients.put("silver_rare", new String[]{"#C0C0C0", "#E8E8E8", "#D3D3D3"});
        gradients.put("gold", new String[]{"#DAA520", "#FFD700", "#FFA500"});
        gradients.put("gold_rare", new String[]{"#FF8C00", "#FFD700", "#FF6347"});
        gradients.put("legendary", new String[]{"#4A148C", "#9C27B0", "#E91E63"});

        return gradients.getOrDefault(rarity, gradients.get("bronze"));
    }

    /**
     * Upload file to R2
     */
    private String uploadToR2(String fileName, byte[] data, String contentType) {
        if (r2Client == null) {
            log.warn("R2 client not available");
            return "R2 disabled";
        }

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(r2Config.getBucketName())
                    .key(fileName)
                    .contentType(contentType)
                    .build();

            r2Client.putObject(putObjectRequest, RequestBody.fromBytes(data));

            log.info("Successfully uploaded {} to R2 ({} bytes)", fileName, data.length);
            return "Success";

        } catch (Exception e) {
            log.error("Failed to upload to R2: {}", e.getMessage());
            return "Failed: " + e.getMessage();
        }
    }

    /**
     * Map R2 data to Player object
     */
    private Player mapToPlayer(Map<String, Object> data, String id) {
        return Player.builder()
                .id(id)
                .name((String) data.get("Name"))
                .displayName((String) data.get("Name"))
                .position((String) data.get("Position"))
                .team((String) data.get("Team"))
                .teamAbbr((String) data.get("Team_ID"))
                .number(data.get("Number") != null ? ((Number) data.get("Number")).intValue() : null)
                .photoUrl((String) data.get("Photo_URL"))
                .teamLogoUrl((String) data.get("Team_Logo_URL"))
                .build();
    }

    /**
     * Map R2 data to PlayerStats object
     */
    private PlayerStats mapToPlayerStats(Map<String, Object> data, String playerId, String season) {
        // Extract nested objects (new structure: { totals: {...}, averages: {...}, percentages: {...} })
        @SuppressWarnings("unchecked")
        Map<String, Object> averages = (Map<String, Object>) data.get("averages");
        @SuppressWarnings("unchecked")
        Map<String, Object> percentages = (Map<String, Object>) data.get("percentages");

        // Use averages if available, otherwise fall back to old flat structure
        Map<String, Object> statsSource = averages != null ? averages : data;
        Map<String, Object> percentSource = percentages != null ? percentages : data;

        return PlayerStats.builder()
                .playerId(playerId)
                .season(season)
                .gamesPlayed(getIntValue(data, "Games_Played"))
                .pointsPerGame(getDoubleValue(statsSource, "Points"))
                .reboundsPerGame(getDoubleValue(statsSource, "Total_Rebounds"))
                .assistsPerGame(getDoubleValue(statsSource, "Assists"))
                .stealsPerGame(getDoubleValue(statsSource, "Steals"))
                .blocksPerGame(getDoubleValue(statsSource, "Blocks"))
                .turnoversPerGame(getDoubleValue(statsSource, "Turnovers"))
                .fieldGoalPercentage(getPercentageValue(percentSource, "Field_Goal_Percentage"))
                .threePointPercentage(getPercentageValue(percentSource, "Three_Point_Field_Goal_Percentage"))
                .freeThrowPercentage(getPercentageValue(percentSource, "Free_Throw_Percentage"))
                .build();
    }

    private Integer getIntValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof Double) return ((Double) value).intValue();
        return 0;
    }

    private Double getDoubleValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Long) return ((Long) value).doubleValue();
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private Double getPercentageValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0.0;

        if (value instanceof String) {
            String strValue = ((String) value).replace("%", "").trim();
            try {
                return Double.parseDouble(strValue);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }

        if (value instanceof Double) return (Double) value;
        if (value instanceof Long) return ((Long) value).doubleValue();
        return 0.0;
    }
}
