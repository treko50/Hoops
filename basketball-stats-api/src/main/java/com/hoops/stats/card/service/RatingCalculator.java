package com.hoops.stats.card.service;

import com.hoops.stats.model.PlayerStats;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Rating Calculator
 * Calculates FIFA Ultimate Team style overall ratings (0-99) for players
 */
@Component
public class RatingCalculator {

    /**
     * Calculate overall rating for a player
     */
    public int calculateOverallRating(PlayerStats stats, String position) {
        Map<String, Double> normalized = normalizeStats(stats);
        Map<String, Double> weights = getPositionWeights(position);

        double totalWeight = 0;
        double weightedSum = 0;

        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            String stat = entry.getKey();
            double weight = entry.getValue();

            if (normalized.containsKey(stat)) {
                weightedSum += normalized.get(stat) * weight;
                totalWeight += weight;
            }
        }

        double rawRating = totalWeight > 0 ? weightedSum / totalWeight : 50;
        double adjustedRating = applyPositionAdjustments(rawRating, stats);

        // Clamp to 40-99 range
        return (int) Math.round(Math.max(40, Math.min(99, adjustedRating)));
    }

    /**
     * Normalize stats to 0-100 scale
     */
    private Map<String, Double> normalizeStats(PlayerStats stats) {
        Map<String, Double> normalized = new HashMap<>();

        // Scoring (0-40 PPG range)
        normalized.put("points", normalizeValue(stats.getPointsPerGame(), 0, 35, 0, 100));

        // Playmaking (0-15 APG range)
        normalized.put("assists", normalizeValue(stats.getAssistsPerGame(), 0, 12, 0, 100));

        // Rebounding (0-15 RPG range)
        normalized.put("rebounds", normalizeValue(stats.getReboundsPerGame(), 0, 15, 0, 100));

        // Defense
        normalized.put("steals", normalizeValue(stats.getStealsPerGame(), 0, 3, 0, 100));
        normalized.put("blocks", normalizeValue(stats.getBlocksPerGame(), 0, 3, 0, 100));

        // Efficiency
        normalized.put("fieldGoalPct", normalizeValue(stats.getFieldGoalPercentage(), 0, 70, 0, 100));
        normalized.put("threePointPct", normalizeValue(stats.getThreePointPercentage(), 0, 50, 0, 100));
        normalized.put("freeThrowPct", normalizeValue(stats.getFreeThrowPercentage(), 0, 95, 0, 100));

        return normalized;
    }

    /**
     * Get position-specific stat weights
     */
    private Map<String, Double> getPositionWeights(String position) {
        Map<String, Double> weights = new HashMap<>();

        switch (position != null ? position.toUpperCase() : "SF") {
            case "PG": // Point Guard - assists and ball handling
                weights.put("points", 0.20);
                weights.put("assists", 0.30);
                weights.put("rebounds", 0.10);
                weights.put("steals", 0.15);
                weights.put("blocks", 0.05);
                weights.put("fieldGoalPct", 0.10);
                weights.put("threePointPct", 0.05);
                weights.put("freeThrowPct", 0.05);
                break;

            case "SG": // Shooting Guard - scoring and perimeter shooting
                weights.put("points", 0.30);
                weights.put("assists", 0.15);
                weights.put("rebounds", 0.10);
                weights.put("steals", 0.15);
                weights.put("blocks", 0.05);
                weights.put("fieldGoalPct", 0.10);
                weights.put("threePointPct", 0.10);
                weights.put("freeThrowPct", 0.05);
                break;

            case "SF": // Small Forward - balanced all-around
                weights.put("points", 0.25);
                weights.put("assists", 0.15);
                weights.put("rebounds", 0.15);
                weights.put("steals", 0.15);
                weights.put("blocks", 0.10);
                weights.put("fieldGoalPct", 0.10);
                weights.put("threePointPct", 0.05);
                weights.put("freeThrowPct", 0.05);
                break;

            case "PF": // Power Forward - rebounds and interior scoring
                weights.put("points", 0.25);
                weights.put("assists", 0.10);
                weights.put("rebounds", 0.25);
                weights.put("steals", 0.05);
                weights.put("blocks", 0.15);
                weights.put("fieldGoalPct", 0.15);
                weights.put("threePointPct", 0.00);
                weights.put("freeThrowPct", 0.05);
                break;

            case "C": // Center - rebounds and blocks
                weights.put("points", 0.20);
                weights.put("assists", 0.05);
                weights.put("rebounds", 0.30);
                weights.put("steals", 0.05);
                weights.put("blocks", 0.20);
                weights.put("fieldGoalPct", 0.15);
                weights.put("threePointPct", 0.00);
                weights.put("freeThrowPct", 0.05);
                break;

            default:
                // Default to SF weights
                return getPositionWeights("SF");
        }

        return weights;
    }

    /**
     * Apply position-specific adjustments
     */
    private double applyPositionAdjustments(double rating, PlayerStats stats) {
        double adjusted = rating;

        // Bonus for elite efficiency
        if (stats.getFieldGoalPercentage() != null && stats.getFieldGoalPercentage() > 55) {
            adjusted += 2;
        }

        // Bonus for high volume scorers
        if (stats.getPointsPerGame() != null) {
            if (stats.getPointsPerGame() > 28) {
                adjusted += 3;
            } else if (stats.getPointsPerGame() > 25) {
                adjusted += 2;
            }
        }

        // Bonus for triple-double threats
        if (stats.getPointsPerGame() != null && stats.getAssistsPerGame() != null &&
                stats.getReboundsPerGame() != null) {
            if (stats.getPointsPerGame() > 15 && stats.getAssistsPerGame() > 7 &&
                    stats.getReboundsPerGame() > 7) {
                adjusted += 4;
            }
        }

        // Penalty for low efficiency
        if (stats.getFieldGoalPercentage() != null && stats.getPointsPerGame() != null) {
            if (stats.getFieldGoalPercentage() < 40 && stats.getPointsPerGame() > 15) {
                adjusted -= 3;
            }
        }

        return adjusted;
    }

    /**
     * Determine card rarity based on overall rating
     */
    public String getCardRarity(int overallRating) {
        if (overallRating >= 90) return "legendary";
        if (overallRating >= 85) return "gold_rare";
        if (overallRating >= 80) return "gold";
        if (overallRating >= 75) return "silver_rare";
        if (overallRating >= 65) return "silver";
        return "bronze";
    }

    /**
     * Get card color based on rarity
     */
    public String getCardColor(String rarity) {
        return switch (rarity) {
            case "bronze" -> "#CD7F32";
            case "silver" -> "#C0C0C0";
            case "silver_rare" -> "#E8E8E8";
            case "gold" -> "#FFD700";
            case "gold_rare" -> "#FFA500";
            case "legendary" -> "#9C27B0";
            default -> "#CD7F32";
        };
    }

    /**
     * Get gradient colors for card background
     */
    public String[] getCardGradient(String rarity) {
        return switch (rarity) {
            case "bronze" -> new String[]{"#8B4513", "#CD7F32", "#A0522D"};
            case "silver" -> new String[]{"#808080", "#C0C0C0", "#A9A9A9"};
            case "silver_rare" -> new String[]{"#C0C0C0", "#E8E8E8", "#D3D3D3"};
            case "gold" -> new String[]{"#DAA520", "#FFD700", "#FFA500"};
            case "gold_rare" -> new String[]{"#FF8C00", "#FFD700", "#FF6347"};
            case "legendary" -> new String[]{"#4A148C", "#9C27B0", "#E91E63"};
            default -> new String[]{"#8B4513", "#CD7F32", "#A0522D"};
        };
    }

    /**
     * Normalize value to target range
     */
    private double normalizeValue(Double value, double sourceMin, double sourceMax,
                                   double targetMin, double targetMax) {
        if (value == null) return targetMin;

        // Clamp source value
        double clamped = Math.max(sourceMin, Math.min(sourceMax, value));

        // Normalize to 0-1
        double normalized = (clamped - sourceMin) / (sourceMax - sourceMin);

        // Scale to target range
        return targetMin + normalized * (targetMax - targetMin);
    }
}
