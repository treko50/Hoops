package com.hoops.stats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoops.stats.model.Game;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * BallDontLie API Service
 * Fetches live NBA game data from balldontlie.io
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BallDontLieApiService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${balldontlie.api.base-url}")
    private String baseUrl;

    /**
     * Get games for a specific date
     */
    public List<Game> getGamesByDate(LocalDate date) throws IOException {
        String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String url = String.format("%s/games?dates[]=%s", baseUrl, dateStr);

        log.info("Fetching games for date: {}", dateStr);

        Request request = new Request.Builder()
                .url(url)
                .header("User-Agent", "Basketball-Stats-API")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response code: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode data = root.get("data");

            List<Game> games = new ArrayList<>();
            if (data != null && data.isArray()) {
                for (JsonNode gameNode : data) {
                    games.add(parseGame(gameNode));
                }
            }

            log.info("Fetched {} games for {}", games.size(), dateStr);
            return games;
        }
    }

    /**
     * Get currently live games
     */
    public List<Game> getLiveGames() throws IOException {
        LocalDate today = LocalDate.now();
        List<Game> allGames = getGamesByDate(today);

        // Filter for live games
        List<Game> liveGames = allGames.stream()
                .filter(game -> game.getStatus() == Game.GameStatus.LIVE)
                .toList();

        log.info("Found {} live games", liveGames.size());
        return liveGames;
    }

    /**
     * Parse game data from JSON
     */
    private Game parseGame(JsonNode gameNode) {
        Game.GameStatus status = parseGameStatus(gameNode);

        JsonNode homeTeam = gameNode.get("home_team");
        JsonNode visitorTeam = gameNode.get("visitor_team");

        return Game.builder()
                .gameId(gameNode.get("id").asText())
                .date(parseDateTime(gameNode.get("date")))
                .homeTeam(homeTeam != null ? homeTeam.get("full_name").asText() : "Unknown")
                .homeTeamAbbr(homeTeam != null ? homeTeam.get("abbreviation").asText() : "???")
                .awayTeam(visitorTeam != null ? visitorTeam.get("full_name").asText() : "Unknown")
                .awayTeamAbbr(visitorTeam != null ? visitorTeam.get("abbreviation").asText() : "???")
                .status(status)
                .quarter(gameNode.has("period") ? gameNode.get("period").asInt() : 0)
                .timeRemaining(gameNode.has("time") ? gameNode.get("time").asText() : "")
                .homeScore(gameNode.has("home_team_score") ? gameNode.get("home_team_score").asInt() : 0)
                .awayScore(gameNode.has("visitor_team_score") ? gameNode.get("visitor_team_score").asInt() : 0)
                .build();
    }

    /**
     * Parse game status from JSON
     */
    private Game.GameStatus parseGameStatus(JsonNode gameNode) {
        if (!gameNode.has("status") || !gameNode.has("period")) {
            return Game.GameStatus.SCHEDULED;
        }

        String status = gameNode.get("status").asText();
        int period = gameNode.get("period").asInt();

        if ("Final".equalsIgnoreCase(status)) {
            return Game.GameStatus.FINAL;
        }

        if (period > 0 && !"Final".equalsIgnoreCase(status)) {
            return Game.GameStatus.LIVE;
        }

        return Game.GameStatus.SCHEDULED;
    }

    /**
     * Parse date/time from JSON
     */
    private LocalDateTime parseDateTime(JsonNode dateNode) {
        if (dateNode == null) {
            return LocalDateTime.now();
        }

        try {
            String dateStr = dateNode.asText();
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            log.warn("Error parsing date: {}", e.getMessage());
            return LocalDateTime.now();
        }
    }
}
