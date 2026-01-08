package com.hoops.stats.service;

import com.hoops.stats.config.CacheConfig;
import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Comparison Service
 * Compare multiple players side-by-side
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ComparisonService {

    private final PlayerService playerService;

    /**
     * Compare multiple players (2-4 players)
     */
    @Cacheable(value = CacheConfig.CACHE_COMPARISONS, key = "#playerIds.toString()")
    public ComparisonResult comparePlayers(List<String> playerIds) {
        if (playerIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 players required for comparison");
        }

        if (playerIds.size() > 4) {
            throw new IllegalArgumentException("Maximum 4 players allowed for comparison");
        }

        List<PlayerComparison> players = new ArrayList<>();

        // Fetch stats for each player
        for (String playerId : playerIds) {
            var playerWithStats = playerService.getPlayerWithStats(playerId);
            if (playerWithStats.isEmpty()) {
                throw new IllegalArgumentException("Player not found: " + playerId);
            }

            var data = playerWithStats.get();
            players.add(new PlayerComparison(
                    data.player(),
                    data.currentSeasonStats(),
                    data.careerStats()
            ));
        }

        // Calculate comparison data
        Map<String, StatComparison> comparisonData = calculateComparisonData(players);

        return new ComparisonResult(players, comparisonData);
    }

    /**
     * Calculate which player wins each statistical category
     */
    private Map<String, StatComparison> calculateComparisonData(List<PlayerComparison> players) {
        Map<String, StatComparison> comparisons = new HashMap<>();

        String[] stats = {"pointsPerGame", "reboundsPerGame", "assistsPerGame",
                "stealsPerGame", "blocksPerGame", "fieldGoalPercentage",
                "threePointPercentage", "freeThrowPercentage"};

        for (String stat : stats) {
            StatComparison comparison = new StatComparison();
            comparison.category = stat;
            comparison.values = new HashMap<>();

            double maxValue = Double.MIN_VALUE;
            String winnerId = null;

            for (PlayerComparison player : players) {
                double value = getStatValue(player.currentSeasonStats(), stat);
                comparison.values.put(player.player().getId(), value);

                if (value > maxValue) {
                    maxValue = value;
                    winnerId = player.player().getId();
                }
            }

            comparison.winner = winnerId;
            comparison.maxValue = maxValue;

            comparisons.put(stat, comparison);
        }

        return comparisons;
    }

    /**
     * Get stat value from PlayerStats
     */
    private double getStatValue(PlayerStats stats, String statName) {
        if (stats == null) return 0.0;

        return switch (statName) {
            case "pointsPerGame" -> stats.getPointsPerGame() != null ? stats.getPointsPerGame() : 0.0;
            case "reboundsPerGame" -> stats.getReboundsPerGame() != null ? stats.getReboundsPerGame() : 0.0;
            case "assistsPerGame" -> stats.getAssistsPerGame() != null ? stats.getAssistsPerGame() : 0.0;
            case "stealsPerGame" -> stats.getStealsPerGame() != null ? stats.getStealsPerGame() : 0.0;
            case "blocksPerGame" -> stats.getBlocksPerGame() != null ? stats.getBlocksPerGame() : 0.0;
            case "fieldGoalPercentage" ->
                    stats.getFieldGoalPercentage() != null ? stats.getFieldGoalPercentage() : 0.0;
            case "threePointPercentage" ->
                    stats.getThreePointPercentage() != null ? stats.getThreePointPercentage() : 0.0;
            case "freeThrowPercentage" ->
                    stats.getFreeThrowPercentage() != null ? stats.getFreeThrowPercentage() : 0.0;
            default -> 0.0;
        };
    }

    // DTOs
    public record PlayerComparison(
            Player player,
            PlayerStats currentSeasonStats,
            PlayerStats careerStats
    ) {
    }

    public record ComparisonResult(
            List<PlayerComparison> players,
            Map<String, StatComparison> comparisonData
    ) {
    }

    public static class StatComparison {
        public String category;
        public Map<String, Double> values;
        public String winner;
        public double maxValue;

        public String getCategory() {
            return category;
        }

        public Map<String, Double> getValues() {
            return values;
        }

        public String getWinner() {
            return winner;
        }

        public double getMaxValue() {
            return maxValue;
        }
    }
}
