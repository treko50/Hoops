package com.hoops.stats.controller;

import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import com.hoops.stats.service.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Player API Controller
 * REST endpoints for player data and statistics
 */
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
@Tag(name = "Players", description = "Player information and statistics")
public class PlayerController {

    private final PlayerService playerService;

    /**
     * GET /api/players
     * Get all players with optional filters
     */
    @GetMapping
    @Operation(summary = "Get all players", description = "Retrieve list of players with optional filtering")
    public ResponseEntity<Map<String, Object>> getAllPlayers(
            @Parameter(description = "Filter by position (PG, SG, SF, PF, C)")
            @RequestParam(required = false) String position,

            @Parameter(description = "Filter by team abbreviation")
            @RequestParam(required = false) String team,

            @Parameter(description = "Maximum number of results")
            @RequestParam(defaultValue = "50") int limit,

            @Parameter(description = "Number of results to skip")
            @RequestParam(defaultValue = "0") int offset
    ) {
        List<Player> players = playerService.getAllPlayers(position, team, limit, offset);

        Map<String, Object> response = new HashMap<>();
        response.put("players", players);
        response.put("total", players.size());
        response.put("limit", limit);
        response.put("offset", offset);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/players/{id}
     * Get player details with current season and career stats
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get player by ID", description = "Retrieve player information with season and career stats")
    public ResponseEntity<Map<String, Object>> getPlayerById(
            @Parameter(description = "Player ID")
            @PathVariable String id
    ) {
        var playerWithStats = playerService.getPlayerWithStats(id);

        if (playerWithStats.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var data = playerWithStats.get();
        Map<String, Object> response = new HashMap<>();
        response.put("player", data.player());
        response.put("currentSeasonStats", data.currentSeasonStats());
        response.put("careerStats", data.careerStats());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/players/{id}/stats/season/{year}
     * Get player stats for a specific season
     */
    @GetMapping("/{id}/stats/season/{year}")
    @Operation(summary = "Get season stats", description = "Retrieve player statistics for a specific season")
    public ResponseEntity<Map<String, Object>> getSeasonStats(
            @Parameter(description = "Player ID")
            @PathVariable String id,

            @Parameter(description = "Season year (e.g., 2021)")
            @PathVariable String year
    ) {
        var stats = playerService.getSeasonStats(id, year);

        if (stats.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("playerId", id);
        response.put("seasonStats", stats.get());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/players/{id}/stats/career
     * Get player career statistics
     */
    @GetMapping("/{id}/stats/career")
    @Operation(summary = "Get career stats", description = "Retrieve player career statistics")
    public ResponseEntity<Map<String, Object>> getCareerStats(
            @Parameter(description = "Player ID")
            @PathVariable String id
    ) {
        var stats = playerService.getCareerStats(id);

        if (stats.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("playerId", id);
        response.put("careerStats", stats.get());

        return ResponseEntity.ok(response);
    }
}
