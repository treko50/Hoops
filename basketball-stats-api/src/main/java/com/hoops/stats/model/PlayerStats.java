package com.hoops.stats.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Player statistics model
 * Contains all statistical data for a player (season or career)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStats {
    private String playerId;
    private String season; // e.g., "2021" or "career"

    // Basic stats
    private Integer gamesPlayed;
    private Double pointsPerGame;
    private Double reboundsPerGame;
    private Double assistsPerGame;
    private Double stealsPerGame;
    private Double blocksPerGame;
    private Double turnoversPerGame;

    // Shooting percentages
    private Double fieldGoalPercentage;
    private Double threePointPercentage;
    private Double freeThrowPercentage;

    // Advanced stats (if available)
    private Double per; // Player Efficiency Rating
    private Double trueShootingPercentage;
    private Double usageRate;

    // Total stats (for career)
    private Integer totalPoints;
    private Integer totalRebounds;
    private Integer totalAssists;
    private Integer totalSteals;
    private Integer totalBlocks;
}
