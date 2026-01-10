package com.hoops.stats.card.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.card.model.PlayerCard;
import com.hoops.stats.config.R2Config;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced Card Cache
 * Loads all advanced player cards from R2 on startup and caches in memory
 * Provides fast indexed access by player ID, team, position, etc.
 */
@Slf4j
@Component
public class AdvancedCardCache {

    @Autowired(required = false)
    private S3Client r2Client;

    @Autowired
    private R2Config r2Config;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory indexes for fast access
    private Map<String, PlayerCard> byId = new HashMap<>();
    private Map<String, List<PlayerCard>> byTeam = new HashMap<>();
    private Map<String, List<PlayerCard>> byPosition = new HashMap<>();
    private List<PlayerCard> allCards = new ArrayList<>();

    private boolean cacheReady = false;

    /**
     * Load advanced cards from R2 on startup
     */
    @PostConstruct
    public void loadAdvancedCards() {
        if (r2Client == null) {
            log.warn("R2 client not available - advanced card cache will not be loaded");
            return;
        }

        try {
            log.info("========================================");
            log.info("Loading advanced cards from R2...");
            log.info("========================================");

            long startTime = System.currentTimeMillis();

            // Fetch from R2
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(r2Config.getBucketName())
                    .key("advanced-cards.json")
                    .build();

            ResponseInputStream<GetObjectResponse> response = r2Client.getObject(request);

            // Parse JSON with UTF-8 encoding - format can be either:
            // 1. {"cards": [array of cards]} - new format
            // 2. {playerId: card, ...} - old format (map)
            InputStreamReader reader = new InputStreamReader(response, StandardCharsets.UTF_8);
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(reader);

            Map<String, PlayerCard> cardsMap = new HashMap<>();

            if (rootNode.has("cards") && rootNode.get("cards").isArray()) {
                // New format: {"cards": [...]}
                TypeReference<java.util.List<PlayerCard>> listTypeRef = new TypeReference<java.util.List<PlayerCard>>() {};
                java.util.List<PlayerCard> cardsList = objectMapper.convertValue(rootNode.get("cards"), listTypeRef);

                // Convert list to map indexed by playerId
                for (PlayerCard card : cardsList) {
                    if (card.getPlayerId() != null) {
                        cardsMap.put(card.getPlayerId(), card);
                    }
                }
            } else {
                // Old format: direct map
                TypeReference<Map<String, PlayerCard>> mapTypeRef = new TypeReference<Map<String, PlayerCard>>() {};
                cardsMap = objectMapper.convertValue(rootNode, mapTypeRef);
            }

            // Store in primary index
            byId = cardsMap;
            allCards = new ArrayList<>(cardsMap.values());

            // Build secondary indexes
            buildIndexes();

            long elapsed = System.currentTimeMillis() - startTime;
            double sizeMB = response.response().contentLength() / (1024.0 * 1024.0);

            log.info("========================================");
            log.info("Advanced cards loaded successfully!");
            log.info("Total cards: {}", allCards.size());
            log.info("File size: {} MB", String.format("%.2f", sizeMB));
            log.info("Load time: {} ms", elapsed);
            log.info("Teams indexed: {}", byTeam.size());
            log.info("Positions indexed: {}", byPosition.size());
            log.info("All queries now run in-memory (instant!)");
            log.info("========================================");

            cacheReady = true;

        } catch (Exception e) {
            log.error("Failed to load advanced cards from R2: {}", e.getMessage(), e);
            cacheReady = false;
        }
    }

    /**
     * Build indexes for fast filtering
     */
    private void buildIndexes() {
        // Index by team
        byTeam = allCards.stream()
                .filter(card -> card.getTeamAbbr() != null)
                .collect(Collectors.groupingBy(PlayerCard::getTeamAbbr));

        // Index by position
        byPosition = allCards.stream()
                .filter(card -> card.getPosition() != null)
                .collect(Collectors.groupingBy(PlayerCard::getPosition));

        log.debug("Built indexes: {} teams, {} positions", byTeam.size(), byPosition.size());
    }

    /**
     * Check if cache is ready
     */
    public boolean isCacheReady() {
        return cacheReady;
    }

    /**
     * Get single card by player ID
     */
    public Optional<PlayerCard> getCard(String playerId) {
        if (!cacheReady) {
            return Optional.empty();
        }
        return Optional.ofNullable(byId.get(playerId));
    }

    /**
     * Get all cards
     */
    public List<PlayerCard> getAllCards() {
        if (!cacheReady) {
            return Collections.emptyList();
        }
        return new ArrayList<>(allCards);
    }

    /**
     * Get cards by team abbreviation
     */
    public List<PlayerCard> getCardsByTeam(String teamAbbr) {
        if (!cacheReady) {
            return Collections.emptyList();
        }
        return byTeam.getOrDefault(teamAbbr.toUpperCase(), Collections.emptyList());
    }

    /**
     * Get cards by position
     */
    public List<PlayerCard> getCardsByPosition(String position) {
        if (!cacheReady) {
            return Collections.emptyList();
        }
        return byPosition.getOrDefault(position.toUpperCase(), Collections.emptyList());
    }

    /**
     * Get cards by team and position
     */
    public List<PlayerCard> getCardsByTeamAndPosition(String teamAbbr, String position) {
        if (!cacheReady) {
            return Collections.emptyList();
        }
        return allCards.stream()
                .filter(card -> teamAbbr.equalsIgnoreCase(card.getTeamAbbr()))
                .filter(card -> position.equalsIgnoreCase(card.getPosition()))
                .collect(Collectors.toList());
    }

    /**
     * Get multiple cards by player IDs
     */
    public List<PlayerCard> getCardsByIds(List<String> playerIds) {
        if (!cacheReady) {
            return Collections.emptyList();
        }
        return playerIds.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get cards filtered by multiple criteria
     */
    public List<PlayerCard> getCards(String teamAbbr, String position, Integer minRating, Integer maxRating) {
        if (!cacheReady) {
            return Collections.emptyList();
        }

        return allCards.stream()
                .filter(card -> teamAbbr == null || teamAbbr.equalsIgnoreCase(card.getTeamAbbr()))
                .filter(card -> position == null || position.equalsIgnoreCase(card.getPosition()))
                .filter(card -> minRating == null || card.getOverallRating() >= minRating)
                .filter(card -> maxRating == null || card.getOverallRating() <= maxRating)
                .collect(Collectors.toList());
    }

    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("cacheReady", cacheReady);
        stats.put("totalCards", allCards.size());
        stats.put("teamsIndexed", byTeam.size());
        stats.put("positionsIndexed", byPosition.size());
        return stats;
    }

    /**
     * Reload cache from R2
     */
    public void reload() {
        log.info("Reloading advanced card cache...");
        loadAdvancedCards();
    }
}
