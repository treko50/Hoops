package com.hoops.stats.controller;

import com.hoops.stats.service.ComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Comparison API Controller
 * Compare multiple players side-by-side
 */
@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
@Tag(name = "Comparisons", description = "Player comparison endpoints")
public class ComparisonController {

    private final ComparisonService comparisonService;

    /**
     * GET /api/compare?ids=player1,player2,player3
     * Compare multiple players
     */
    @GetMapping
    @Operation(summary = "Compare players", description = "Compare 2-4 players side-by-side")
    public ResponseEntity<Map<String, Object>> comparePlayers(
            @Parameter(description = "Comma-separated player IDs (2-4 players)", required = true)
            @RequestParam String ids
    ) {
        if (ids == null || ids.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Missing required parameter");
            error.put("message", "Please provide player IDs in the 'ids' query parameter (comma-separated)");
            return ResponseEntity.badRequest().body(error);
        }

        List<String> playerIds = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .toList();

        if (playerIds.size() < 2) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid parameter");
            error.put("message", "Please provide at least 2 player IDs to compare");
            return ResponseEntity.badRequest().body(error);
        }

        if (playerIds.size() > 4) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Too many players");
            error.put("message", "Maximum 4 players can be compared at once");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            ComparisonService.ComparisonResult result = comparisonService.comparePlayers(playerIds);

            Map<String, Object> response = new HashMap<>();
            response.put("players", result.players());
            response.put("comparisonData", result.comparisonData());
            response.put("playerCount", result.players().size());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid request");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to compare players");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
