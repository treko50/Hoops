package com.hoops.stats.card.model;

import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Player Card Model
 * Represents a FIFA Ultimate Team style player card
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerCard {
    private String playerId;
    private String playerName;
    private String position;
    private String team;
    private String teamAbbr;
    private Integer number;
    private String photoUrl;      // Player headshot URL
    private String teamLogoUrl;   // Team logo URL
    private Integer age;
    private Integer gamesPlayed;

    private int overallRating;
    private String rarity;
    private String color;
    private String[] gradient;

    private CardStats stats;
    private PlayerAttribute.AdvancedAttributes advancedAttributes;  // NEW: FIFA-style attributes
    private CardType cardType;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardStats {
        private double ppg;
        private double rpg;
        private double apg;
        private double spg;
        private double bpg;
        private double fgPct;
        private double fg3Pct;
        private double ftPct;
    }

    public enum CardType {
        BASE,
        TOTW,
        ICON,
        LEGENDARY,
        FLASHBACK,
        COMPARISON
    }

    /**
     * Create from Player and PlayerStats with advanced attributes
     */
    public static PlayerCard fromPlayerAndStats(Player player, PlayerStats stats,
                                                 int overallRating, String rarity,
                                                 String[] gradient, CardType cardType,
                                                 PlayerAttribute.AdvancedAttributes advancedAttributes) {
        return PlayerCard.builder()
                .playerId(player.getId())
                .playerName(player.getName())
                .position(player.getPosition())
                .team(player.getTeam())
                .teamAbbr(player.getTeamAbbr())
                .number(player.getNumber())
                .photoUrl(player.getPhotoUrl())
                .teamLogoUrl(player.getTeamLogoUrl())
                .age(player.getAge())
                .gamesPlayed(stats.getGamesPlayed())
                .overallRating(overallRating)
                .rarity(rarity)
                .gradient(gradient)
                .cardType(cardType)
                .stats(CardStats.builder()
                        .ppg(stats.getPointsPerGame() != null ? stats.getPointsPerGame() : 0.0)
                        .rpg(stats.getReboundsPerGame() != null ? stats.getReboundsPerGame() : 0.0)
                        .apg(stats.getAssistsPerGame() != null ? stats.getAssistsPerGame() : 0.0)
                        .spg(stats.getStealsPerGame() != null ? stats.getStealsPerGame() : 0.0)
                        .bpg(stats.getBlocksPerGame() != null ? stats.getBlocksPerGame() : 0.0)
                        .fgPct(stats.getFieldGoalPercentage() != null ? stats.getFieldGoalPercentage() : 0.0)
                        .fg3Pct(stats.getThreePointPercentage() != null ? stats.getThreePointPercentage() : 0.0)
                        .ftPct(stats.getFreeThrowPercentage() != null ? stats.getFreeThrowPercentage() : 0.0)
                        .build())
                .advancedAttributes(advancedAttributes)
                .build();
    }

    /**
     * Create from Player and PlayerStats (backward compatibility)
     */
    public static PlayerCard fromPlayerAndStats(Player player, PlayerStats stats,
                                                 int overallRating, String rarity,
                                                 String[] gradient, CardType cardType) {
        return fromPlayerAndStats(player, stats, overallRating, rarity, gradient, cardType, null);
    }
}
