package com.hoops.stats.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.config.R2Config;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * R2 Data Repository
 * Loads all basketball stats from R2 and caches in memory
 *
 * Architecture:
 * - Startup: Load all JSON files from R2 (~30 MB total)
 * - Runtime: All queries hit in-memory cache (instant, no DB calls!)
 * - Daily: Reload current season JSON (1 read from R2)
 */
@Slf4j
@Repository
@ConditionalOnBean(S3Client.class)
public class R2DataRepository {

    @Autowired(required = false)
    private S3Client r2Client;

    @Autowired
    private R2Config r2Config;

    @Value("${r2.enabled:false}")
    private boolean r2Enabled;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory cache of ALL basketball data
    private final Map<String, Map<String, Map<String, Object>>> seasonCache = new ConcurrentHashMap<>();
    private Map<String, Map<String, Object>> careerAveragesCache = new ConcurrentHashMap<>();

    private static final List<String> SEASONS = Arrays.asList(
            "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010",
            "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018",
            "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"
    );

    /**
     * Load all data from R2 on startup
     * This happens ONCE when the server starts
     */
    @PostConstruct
    public void loadAllDataFromR2() {
        if (!r2Enabled || r2Client == null) {
            log.warn("R2 is disabled. Using Firestore fallback.");
            return;
        }

        log.info("========================================");
        log.info("Loading basketball stats from R2...");
        log.info("========================================");

        long startTime = System.currentTimeMillis();
        int totalPlayers = 0;
        long totalBytes = 0;

        // Load each season
        for (String season : SEASONS) {
            try {
                log.info("Loading season {}...", season);
                LoadResult result = loadSeasonFromR2(season);
                totalPlayers += result.playerCount;
                totalBytes += result.bytes;
                log.info("Season {} loaded: {} players, {} KB",
                        season, result.playerCount, result.bytes / 1024);
            } catch (Exception e) {
                log.error("Failed to load season {}: {}", season, e.getMessage());
            }
        }

        // Load career averages
        try {
            log.info("Loading career averages...");
            LoadResult result = loadCareerAveragesFromR2();
            log.info("Career averages loaded: {} players, {} KB",
                    result.playerCount, result.bytes / 1024);
        } catch (Exception e) {
            log.error("Failed to load career averages: {}", e.getMessage());
        }

        long elapsed = System.currentTimeMillis() - startTime;

        log.info("========================================");
        log.info("R2 data loaded successfully!");
        log.info("Total players across all seasons: {}", totalPlayers);
        log.info("Total memory: {} MB", totalBytes / 1024 / 1024);
        log.info("Load time: {} ms", elapsed);
        log.info("All queries now run in-memory (instant!)");
        log.info("========================================");
    }

    /**
     * Load a single season from R2
     */
    private LoadResult loadSeasonFromR2(String season) throws IOException {
        String key = season + ".json";
        long bytes = 0;

        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(r2Config.getBucketName())
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> response = r2Client.getObject(request);
            bytes = response.response().contentLength();

            // Parse JSON into Map
            TypeReference<Map<String, Map<String, Object>>> typeRef =
                    new TypeReference<Map<String, Map<String, Object>>>() {};
            Map<String, Map<String, Object>> seasonData = objectMapper.readValue(response, typeRef);

            // Cache in memory
            seasonCache.put(season, seasonData);

            return new LoadResult(seasonData.size(), bytes);

        } catch (Exception e) {
            log.error("Error loading season {} from R2", season, e);
            throw new IOException("Failed to load season: " + season, e);
        }
    }

    /**
     * Load career averages from R2
     */
    private LoadResult loadCareerAveragesFromR2() throws IOException {
        String key = "career_averages.json";
        long bytes = 0;

        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(r2Config.getBucketName())
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> response = r2Client.getObject(request);
            bytes = response.response().contentLength();

            // Parse JSON into Map
            TypeReference<Map<String, Map<String, Object>>> typeRef =
                    new TypeReference<Map<String, Map<String, Object>>>() {};
            careerAveragesCache = objectMapper.readValue(response, typeRef);

            return new LoadResult(careerAveragesCache.size(), bytes);

        } catch (Exception e) {
            log.error("Error loading career averages from R2", e);
            throw new IOException("Failed to load career averages", e);
        }
    }

    /**
     * Get player stats for a season (from in-memory cache)
     */
    public Optional<Map<String, Object>> getPlayerStatsBySeason(String playerId, String season) {
        Map<String, Map<String, Object>> seasonData = seasonCache.get(season);
        if (seasonData == null) {
            return Optional.empty();
        }

        Map<String, Object> playerData = seasonData.get(playerId);
        return Optional.ofNullable(playerData);
    }

    /**
     * Get career stats (from in-memory cache)
     */
    public Optional<Map<String, Object>> getCareerStats(String playerId) {
        Map<String, Object> careerData = careerAveragesCache.get(playerId);
        return Optional.ofNullable(careerData);
    }

    /**
     * Get ALL players for a season (instant - in-memory)
     * Can filter by any field combination without database hits!
     */
    public List<Map<String, Object>> getAllPlayers(String season, Map<String, String> filters, int limit, int offset) {
        Map<String, Map<String, Object>> seasonData = seasonCache.get(season);
        if (seasonData == null) {
            return Collections.emptyList();
        }

        // Filter in-memory (lightning fast!)
        List<Map<String, Object>> allPlayers = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> entry : seasonData.entrySet()) {
            Map<String, Object> playerData = new HashMap<>(entry.getValue());
            playerData.put("id", entry.getKey()); // Add player ID

            // Apply filters
            boolean matches = true;
            for (Map.Entry<String, String> filter : filters.entrySet()) {
                String fieldValue = String.valueOf(playerData.get(filter.getKey()));
                if (!fieldValue.equalsIgnoreCase(filter.getValue())) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                allPlayers.add(playerData);
            }
        }

        // Apply offset and limit
        int fromIndex = Math.min(offset, allPlayers.size());
        int toIndex = Math.min(offset + limit, allPlayers.size());

        return allPlayers.subList(fromIndex, toIndex);
    }

    /**
     * Reload a specific season (for daily updates)
     */
    public void reloadSeason(String season) {
        try {
            log.info("Reloading season {} from R2...", season);
            LoadResult result = loadSeasonFromR2(season);
            log.info("Season {} reloaded: {} players", season, result.playerCount);
        } catch (Exception e) {
            log.error("Failed to reload season {}", season, e);
        }
    }

    /**
     * Check if R2 is ready
     */
    public boolean isR2Ready() {
        return r2Enabled && r2Client != null && !seasonCache.isEmpty();
    }

    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("r2Enabled", r2Enabled);
        stats.put("seasonsLoaded", seasonCache.size());
        stats.put("careerAveragesLoaded", careerAveragesCache.size());

        int totalPlayers = seasonCache.values().stream()
                .mapToInt(Map::size)
                .sum();
        stats.put("totalPlayers", totalPlayers);

        return stats;
    }

    private static class LoadResult {
        int playerCount;
        long bytes;

        LoadResult(int playerCount, long bytes) {
            this.playerCount = playerCount;
            this.bytes = bytes;
        }
    }
}
