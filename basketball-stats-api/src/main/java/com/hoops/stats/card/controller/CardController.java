package com.hoops.stats.card.controller;

import com.hoops.stats.card.model.PlayerCard;
import com.hoops.stats.card.service.BulkCardGenerationService;
import com.hoops.stats.card.service.CardGenerationService;
import com.hoops.stats.card.service.CardStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Card API Controller
 * FIFA Ultimate Team style card generation endpoints
 */
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Tag(name = "Cards", description = "Player card generation")
public class CardController {

    private final com.hoops.stats.card.service.AdvancedCardGenerationService advancedCardService;
    private final com.hoops.stats.card.service.AdvancedCardCache advancedCardCache;

    /**
     * POST /api/cards/advanced/generate/{season}
     * Generate advanced FIFA-style cards for entire season and upload to R2
     */
    @PostMapping("/advanced/generate/{season}")
    @Operation(summary = "Generate advanced cards", description = "Generate all advanced cards with FIFA-style attributes, compress if > 10MB, and upload to R2")
    public ResponseEntity<Map<String, Object>> generateAdvancedCards(
            @Parameter(description = "Season year (e.g., 2026)", required = true)
            @PathVariable String season
    ) {
        try {
            Map<String, Object> result = advancedCardService.generateAdvancedCardsForSeason(season);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Advanced card generation failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * GET /api/cards/advanced/sample/{season}
     * Get sample advanced cards to preview the attribute system
     */
    @GetMapping("/advanced/sample/{season}")
    @Operation(summary = "Get sample advanced cards", description = "Get sample cards showing advanced attribute breakdown for top players")
    public ResponseEntity<Map<String, Object>> getSampleAdvancedCards(
            @Parameter(description = "Season year (e.g., 2026)")
            @PathVariable String season
    ) {
        try {
            Map<String, Object> samples = advancedCardService.getSampleAdvancedCards(season);
            return ResponseEntity.ok(samples);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get samples");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // ADVANCED CARD CACHE ENDPOINTS
    // ============================================

    /**
     * GET /api/cards/advanced/{playerId}
     * Get single advanced card from cache
     */
    @GetMapping("/advanced/{playerId}")
    @Operation(summary = "Get advanced card", description = "Get a single advanced card by player ID from cache")
    public ResponseEntity<Object> getAdvancedCard(
            @Parameter(description = "Player ID", required = true)
            @PathVariable String playerId
    ) {
        try {
            if (!advancedCardCache.isCacheReady()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Cache not ready");
                error.put("message", "Advanced card cache is still loading");
                return ResponseEntity.status(503).body(error);
            }

            var cardOpt = advancedCardCache.getCard(playerId);
            if (cardOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Card not found");
                error.put("message", "No advanced card found for player: " + playerId);
                return ResponseEntity.status(404).body(error);
            }

            return ResponseEntity.ok(cardOpt.get());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve card");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * GET /api/cards/advanced
     * Get advanced cards with optional filters
     */
    @GetMapping("/advanced")
    @Operation(summary = "Get advanced cards", description = "Get advanced cards with optional filters (team, position, rating range, or multiple player IDs)")
    public ResponseEntity<Object> getAdvancedCards(
            @Parameter(description = "Team abbreviation (e.g., LAL, GSW)")
            @RequestParam(required = false) String team,

            @Parameter(description = "Position (PG, SG, SF, PF, C)")
            @RequestParam(required = false) String position,

            @Parameter(description = "Comma-separated player IDs")
            @RequestParam(required = false) String playerIds,

            @Parameter(description = "Minimum overall rating")
            @RequestParam(required = false) Integer minRating,

            @Parameter(description = "Maximum overall rating")
            @RequestParam(required = false) Integer maxRating
    ) {
        try {
            if (!advancedCardCache.isCacheReady()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Cache not ready");
                error.put("message", "Advanced card cache is still loading");
                return ResponseEntity.status(503).body(error);
            }

            java.util.List<com.hoops.stats.card.model.PlayerCard> cards;

            // Handle playerIds query (comma-separated list)
            if (playerIds != null && !playerIds.isEmpty()) {
                List<String> ids = Arrays.asList(playerIds.split(","));
                cards = advancedCardCache.getCardsByIds(ids);
            }
            // Handle filtered query
            else {
                cards = advancedCardCache.getCards(team, position, minRating, maxRating);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("cards", cards);
            response.put("count", cards.size());
            response.put("filters", Map.of(
                    "team", team != null ? team : "all",
                    "position", position != null ? position : "all",
                    "minRating", minRating != null ? minRating : "none",
                    "maxRating", maxRating != null ? maxRating : "none"
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve cards");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * GET /api/cards/advanced/cache/stats
     * Get cache statistics
     */
    @GetMapping("/advanced/cache/stats")
    @Operation(summary = "Get cache stats", description = "Get advanced card cache statistics")
    public ResponseEntity<Map<String, Object>> getAdvancedCacheStats() {
        return ResponseEntity.ok(advancedCardCache.getCacheStats());
    }

    /**
     * POST /api/cards/advanced/cache/reload
     * Reload cache from R2
     */
    @PostMapping("/advanced/cache/reload")
    @Operation(summary = "Reload cache", description = "Reload advanced card cache from R2")
    public ResponseEntity<Map<String, Object>> reloadAdvancedCache() {
        try {
            advancedCardCache.reload();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cache reloaded successfully");
            response.put("stats", advancedCardCache.getCacheStats());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to reload cache");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
