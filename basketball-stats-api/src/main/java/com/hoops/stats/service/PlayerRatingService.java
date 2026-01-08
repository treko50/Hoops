package com.hoops.stats.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Player Rating Service
 * Calculates overall player ratings (0-100) based on statistics
 *
 * Rating System:
 * - Bronze: 40-64 (Role players)
 * - Silver: 65-74 (Solid starters)
 * - Gold: 75-84 (All-Star level)
 * - Elite: 85-94 (Superstars)
 * - Legend: 95-99 (All-time greats)
 */
@Slf4j
@Service
public class PlayerRatingService {

    /**
     * Calculate overall player rating from season stats
     */
    public int calculateOverallRating(Map<String, Object> playerData) {
        String position = (String) playerData.get("Position");

        @SuppressWarnings("unchecked")
        Map<String, Object> averages = (Map<String, Object>) playerData.get("averages");
        @SuppressWarnings("unchecked")
        Map<String, Object> percentages = (Map<String, Object>) playerData.get("percentages");

        if (averages == null || percentages == null) {
            return 50; // Default for missing data
        }

        // Get key stats
        double ppg = getDouble(averages, "Points");
        double rpg = getDouble(averages, "Total_Rebounds");
        double apg = getDouble(averages, "Assists");
        double spg = getDouble(averages, "Steals");
        double bpg = getDouble(averages, "Blocks");
        double topg = getDouble(averages, "Turnovers");

        double fgPct = getPercentage(percentages, "Field_Goal_Percentage");
        double fg3Pct = getPercentage(percentages, "Three_Point_Field_Goal_Percentage");
        double ftPct = getPercentage(percentages, "Free_Throw_Percentage");
        double efgPct = getPercentage(percentages, "Effective_Field_Goal_Percentage");

        // Position-specific weighting
        double rating = switch (position) {
            case "PG" -> calculateGuardRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
            case "SG" -> calculateShootingGuardRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
            case "SF" -> calculateForwardRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
            case "PF" -> calculatePowerForwardRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
            case "C" -> calculateCenterRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
            default -> calculateGeneralRating(ppg, rpg, apg, spg, bpg, topg, fgPct, fg3Pct, ftPct, efgPct);
        };

        // Clamp to 0-99 range
        return (int) Math.max(40, Math.min(99, rating));
    }

    /**
     * Point Guard rating (emphasizes assists, steals, FG%)
     */
    private double calculateGuardRating(double ppg, double rpg, double apg, double spg,
                                        double bpg, double topg, double fgPct, double fg3Pct,
                                        double ftPct, double efgPct) {
        double rating = 40.0;

        // Scoring (25% weight)
        rating += (ppg / 30.0) * 25;

        // Playmaking (30% weight) - PGs are distributors
        rating += (apg / 12.0) * 30;

        // Defense (15% weight)
        rating += (spg / 3.0) * 15;

        // Efficiency (25% weight)
        rating += (efgPct / 60.0) * 15;
        rating += (ftPct / 90.0) * 10;

        // Rebounding (5% weight)
        rating += (rpg / 8.0) * 5;

        // Turnover penalty
        rating -= (topg / 4.0) * 5;

        return rating;
    }

    /**
     * Shooting Guard rating (emphasizes scoring, 3PT%, perimeter defense)
     */
    private double calculateShootingGuardRating(double ppg, double rpg, double apg, double spg,
                                                 double bpg, double topg, double fgPct, double fg3Pct,
                                                 double ftPct, double efgPct) {
        double rating = 40.0;

        // Scoring (35% weight) - SGs are scorers
        rating += (ppg / 30.0) * 35;

        // Three-point shooting (20% weight)
        rating += (fg3Pct / 45.0) * 20;

        // Playmaking (10% weight)
        rating += (apg / 8.0) * 10;

        // Defense (15% weight)
        rating += (spg / 2.5) * 15;

        // Efficiency (15% weight)
        rating += (efgPct / 60.0) * 10;
        rating += (ftPct / 90.0) * 5;

        // Rebounding (5% weight)
        rating += (rpg / 6.0) * 5;

        // Turnover penalty
        rating -= (topg / 3.0) * 5;

        return rating;
    }

    /**
     * Small Forward rating (balanced - scoring, rebounding, versatility)
     */
    private double calculateForwardRating(double ppg, double rpg, double apg, double spg,
                                          double bpg, double topg, double fgPct, double fg3Pct,
                                          double ftPct, double efgPct) {
        double rating = 40.0;

        // Scoring (30% weight)
        rating += (ppg / 28.0) * 30;

        // Rebounding (15% weight)
        rating += (rpg / 9.0) * 15;

        // Playmaking (12% weight)
        rating += (apg / 7.0) * 12;

        // Defense (18% weight)
        rating += (spg / 2.0) * 10;
        rating += (bpg / 1.5) * 8;

        // Efficiency (20% weight)
        rating += (efgPct / 58.0) * 15;
        rating += (ftPct / 85.0) * 5;

        // Versatility bonus (3PT shooting)
        rating += (fg3Pct / 40.0) * 5;

        // Turnover penalty
        rating -= (topg / 3.0) * 5;

        return rating;
    }

    /**
     * Power Forward rating (rebounding, interior scoring, defense)
     */
    private double calculatePowerForwardRating(double ppg, double rpg, double apg, double spg,
                                                double bpg, double topg, double fgPct, double fg3Pct,
                                                double ftPct, double efgPct) {
        double rating = 40.0;

        // Scoring (28% weight)
        rating += (ppg / 26.0) * 28;

        // Rebounding (25% weight) - Critical for PFs
        rating += (rpg / 11.0) * 25;

        // Interior defense (20% weight)
        rating += (bpg / 2.0) * 20;

        // Efficiency (20% weight) - High FG% expected
        rating += (fgPct / 55.0) * 15;
        rating += (ftPct / 80.0) * 5;

        // Playmaking (5% weight)
        rating += (apg / 5.0) * 5;

        // Perimeter defense
        rating += (spg / 1.5) * 2;

        // Turnover penalty
        rating -= (topg / 2.5) * 5;

        return rating;
    }

    /**
     * Center rating (rebounding, blocks, interior presence)
     */
    private double calculateCenterRating(double ppg, double rpg, double apg, double spg,
                                         double bpg, double topg, double fgPct, double fg3Pct,
                                         double ftPct, double efgPct) {
        double rating = 40.0;

        // Rebounding (30% weight) - Most important for centers
        rating += (rpg / 13.0) * 30;

        // Interior defense (25% weight)
        rating += (bpg / 2.5) * 25;

        // Scoring (20% weight)
        rating += (ppg / 24.0) * 20;

        // Efficiency (20% weight) - Should have high FG%
        rating += (fgPct / 60.0) * 20;

        // Playmaking (3% weight)
        rating += (apg / 4.0) * 3;

        // Free throw penalty (centers often struggle)
        if (ftPct < 65.0) {
            rating -= (65.0 - ftPct) / 10.0;
        }

        // Turnover penalty
        rating -= (topg / 3.0) * 2;

        return rating;
    }

    /**
     * General rating calculation (position unknown)
     */
    private double calculateGeneralRating(double ppg, double rpg, double apg, double spg,
                                          double bpg, double topg, double fgPct, double fg3Pct,
                                          double ftPct, double efgPct) {
        double rating = 40.0;

        rating += (ppg / 28.0) * 30;
        rating += (rpg / 10.0) * 15;
        rating += (apg / 8.0) * 15;
        rating += (spg / 2.0) * 8;
        rating += (bpg / 1.5) * 7;
        rating += (efgPct / 58.0) * 20;
        rating -= (topg / 3.0) * 5;

        return rating;
    }

    /**
     * Get card tier based on overall rating
     */
    public String getCardTier(int overallRating) {
        if (overallRating >= 95) return "LEGEND";
        if (overallRating >= 85) return "ELITE";
        if (overallRating >= 75) return "GOLD";
        if (overallRating >= 65) return "SILVER";
        return "BRONZE";
    }

    /**
     * Get card color based on tier
     */
    public String getCardColor(String tier) {
        return switch (tier) {
            case "LEGEND" -> "#FF00FF"; // Pink/Purple gradient
            case "ELITE" -> "#000000"; // Black
            case "GOLD" -> "#FFD700"; // Gold
            case "SILVER" -> "#C0C0C0"; // Silver
            case "BRONZE" -> "#CD7F32"; // Bronze
            default -> "#888888";
        };
    }

    // Helper methods
    private double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof Long) return ((Long) value).doubleValue();
        return 0.0;
    }

    private double getPercentage(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0.0;

        if (value instanceof String) {
            String str = ((String) value).replace("%", "").trim();
            try {
                return Double.parseDouble(str);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }

        return getDouble(map, key);
    }
}
