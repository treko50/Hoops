package com.hoops.stats.card.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.card.model.PlayerCard;
import com.hoops.stats.repository.R2DataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.zip.GZIPOutputStream;

/**
 * Bulk Card Generation Service
 * Generates cards for all players in a season and stores in R2
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BulkCardGenerationService {

    private final CardGenerationService cardService;
    private final R2DataRepository r2DataRepository;
    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    private static final String BUCKET_NAME = "hoops";
    private static final String CARDS_PREFIX = "cards/";

    /**
     * Generate cards for all players in a season
     */
    public Map<String, Object> generateCardsForSeason(String season) {
        log.info("Starting bulk card generation for season {}", season);
        long startTime = System.currentTimeMillis();

        // Get all players for the season
        List<Map<String, Object>> players = r2DataRepository.getAllPlayers(season, new HashMap<>(), 10000, 0);
        log.info("Found {} players for season {}", players.size(), season);

        int successCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();

        // Card types to generate
        PlayerCard.CardType[] cardTypes = {
                PlayerCard.CardType.BASE,
                PlayerCard.CardType.TOTW,
                PlayerCard.CardType.ICON,
                PlayerCard.CardType.LEGENDARY,
                PlayerCard.CardType.FLASHBACK
        };

        for (Map<String, Object> playerData : players) {
            String playerId = (String) playerData.get("id");

            try {
                // Generate all card types for this player
                Map<String, PlayerCard> playerCards = new HashMap<>();

                for (PlayerCard.CardType cardType : cardTypes) {
                    try {
                        PlayerCard card;
                        if (cardType == PlayerCard.CardType.BASE) {
                            card = cardService.generateBaseCard(playerId);
                        } else {
                            card = cardService.generateSpecialCard(playerId, cardType);
                        }
                        playerCards.put(cardType.name(), card);
                    } catch (Exception e) {
                        log.warn("Failed to generate {} card for {}: {}", cardType, playerId, e.getMessage());
                    }
                }

                // Store all cards for this player in R2
                if (!playerCards.isEmpty()) {
                    storePlayerCards(season, playerId, playerCards);
                    successCount++;
                }

            } catch (Exception e) {
                errorCount++;
                errors.add(playerId + ": " + e.getMessage());
                log.error("Error generating cards for player {}", playerId, e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;

        log.info("Bulk card generation completed: {} players, {} errors, {} ms",
                successCount, errorCount, duration);

        Map<String, Object> result = new HashMap<>();
        result.put("season", season);
        result.put("totalPlayers", players.size());
        result.put("successCount", successCount);
        result.put("errorCount", errorCount);
        result.put("durationMs", duration);
        result.put("errors", errors);
        result.put("cardTypesGenerated", cardTypes.length);
        result.put("totalCardsGenerated", successCount * cardTypes.length);

        return result;
    }

    /**
     * Store player cards in R2 with compression
     */
    private void storePlayerCards(String season, String playerId, Map<String, PlayerCard> cards) throws IOException {
        // Convert to JSON
        String json = objectMapper.writeValueAsString(cards);

        // Compress with GZIP
        byte[] compressedData = compressData(json.getBytes());

        // Store in R2: cards/{season}/{playerId}.json.gz
        String key = CARDS_PREFIX + season + "/" + playerId + ".json.gz";

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(key)
                .contentType("application/json")
                .contentEncoding("gzip")
                .metadata(Map.of(
                        "player-id", playerId,
                        "season", season,
                        "card-count", String.valueOf(cards.size()),
                        "uncompressed-size", String.valueOf(json.length()),
                        "compressed-size", String.valueOf(compressedData.length)
                ))
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(compressedData));

        log.debug("Stored {} cards for {} (compressed: {} bytes → {} bytes)",
                cards.size(), playerId, json.length(), compressedData.length);
    }

    /**
     * Compress data with GZIP
     */
    private byte[] compressData(byte[] data) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipStream = new GZIPOutputStream(byteStream)) {
            gzipStream.write(data);
        }
        return byteStream.toByteArray();
    }

    /**
     * Get compression stats for a season
     */
    public Map<String, Object> getCompressionStats(String season) {
        List<Map<String, Object>> players = r2DataRepository.getAllPlayers(season, new HashMap<>(), 10000, 0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("season", season);
        stats.put("totalPlayers", players.size());
        stats.put("cardTypesPerPlayer", 5);
        stats.put("estimatedTotalCards", players.size() * 5);
        stats.put("estimatedUncompressedSize", players.size() * 5 * 400 + " bytes (~" + (players.size() * 5 * 400 / 1024) + " KB)");
        stats.put("estimatedCompressedSize", players.size() * 5 * 150 + " bytes (~" + (players.size() * 5 * 150 / 1024) + " KB)");
        stats.put("estimatedCompressionRatio", "~60-70%");

        return stats;
    }
}
