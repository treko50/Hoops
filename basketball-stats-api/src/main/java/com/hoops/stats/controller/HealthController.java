package com.hoops.stats.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Basic health and info endpoints
 */
@RestController
@Tag(name = "Health", description = "Health check and system info")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the API is running")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Basketball Stats API");
        response.put("version", "1.0.0");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    @Operation(summary = "API info", description = "Get API information and available endpoints")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Basketball Stats & Card Generation API");
        response.put("version", "1.0.0");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("health", "/health");
        endpoints.put("swagger", "/swagger-ui.html");
        endpoints.put("players", "/api/players");
        endpoints.put("playerById", "/api/players/{id}");
        endpoints.put("seasonStats", "/api/players/{id}/stats/season/{year}");
        endpoints.put("careerStats", "/api/players/{id}/stats/career");
        endpoints.put("liveGames", "/api/games/live");
        endpoints.put("compare", "/api/compare?ids=player1,player2");
        endpoints.put("leaderboards", "/api/leaderboards/{category}");

        response.put("endpoints", endpoints);
        response.put("documentation", "/swagger-ui.html");

        return ResponseEntity.ok(response);
    }
}
