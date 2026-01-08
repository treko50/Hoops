package com.hoops.stats.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Player entity model
 * Represents a basketball player with basic information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    private String id;
    private String name;
    private String displayName;
    private String position; // PG, SG, SF, PF, C
    private String team;
    private String teamAbbr;
    private Integer number;
    private String photoUrl;
    private String teamLogoUrl;

    // Physical attributes
    private String height;
    private Integer weight;
    private Integer age;

    // Career info
    private String college;
    private Integer yearsPlayed;
}
