package com.hoops.stats.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Game entity model
 * Represents an NBA game (scheduled, live, or completed)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {
    private String gameId;
    private LocalDateTime date;

    // Teams
    private String homeTeam;
    private String homeTeamAbbr;
    private String awayTeam;
    private String awayTeamAbbr;

    // Status
    private GameStatus status;
    private Integer quarter;
    private String timeRemaining;

    // Score
    private Integer homeScore;
    private Integer awayScore;

    public enum GameStatus {
        SCHEDULED,
        LIVE,
        FINAL
    }
}
