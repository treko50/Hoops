package com.hoops.stats.card.service;

import com.hoops.stats.card.model.PlayerCard;
import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import com.hoops.stats.service.PlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Card Generation Service
 * Generates FIFA Ultimate Team style player cards
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CardGenerationService {

    private final PlayerService playerService;
    private final RatingCalculator ratingCalculator;

    /**
     * Generate a base player card
     */
    public PlayerCard generateBaseCard(String playerId) {
        var playerWithStats = playerService.getPlayerWithStats(playerId);

        if (playerWithStats.isEmpty()) {
            throw new IllegalArgumentException("Player not found: " + playerId);
        }

        var data = playerWithStats.get();
        Player player = data.player();
        PlayerStats stats = data.currentSeasonStats();

        // Calculate overall rating
        int overallRating = ratingCalculator.calculateOverallRating(stats, player.getPosition());

        // Determine rarity
        String rarity = ratingCalculator.getCardRarity(overallRating);

        // Get gradient colors
        String[] gradient = ratingCalculator.getCardGradient(rarity);

        return PlayerCard.fromPlayerAndStats(
                player,
                stats,
                overallRating,
                rarity,
                gradient,
                PlayerCard.CardType.BASE
        );
    }

    /**
     * Generate a special card (TOTW, Icon, Legendary)
     */
    public PlayerCard generateSpecialCard(String playerId, PlayerCard.CardType cardType) {
        var playerWithStats = playerService.getPlayerWithStats(playerId);

        if (playerWithStats.isEmpty()) {
            throw new IllegalArgumentException("Player not found: " + playerId);
        }

        var data = playerWithStats.get();
        Player player = data.player();
        PlayerStats stats = data.currentSeasonStats();

        // Calculate base rating
        int baseRating = ratingCalculator.calculateOverallRating(stats, player.getPosition());

        // Apply card type boost
        int boost = getCardTypeBoost(cardType);
        int boostedRating = Math.min(99, baseRating + boost);

        // Get special gradient
        String[] gradient = getSpecialGradient(cardType);
        String rarity = cardType.toString();

        // Boost stats
        PlayerStats boostedStats = boostStats(stats, boost);

        return PlayerCard.fromPlayerAndStats(
                player,
                boostedStats,
                boostedRating,
                rarity,
                gradient,
                cardType
        );
    }

    /**
     * Get boost value for card type
     */
    private int getCardTypeBoost(PlayerCard.CardType cardType) {
        return switch (cardType) {
            case TOTW -> 3;
            case ICON -> 5;
            case LEGENDARY -> 7;
            case FLASHBACK -> 4;
            default -> 0;
        };
    }

    /**
     * Get special gradient for card type
     */
    private String[] getSpecialGradient(PlayerCard.CardType cardType) {
        return switch (cardType) {
            case TOTW -> new String[]{"#0077B6", "#00B4D8", "#48CAE4"};
            case ICON -> new String[]{"#880E4F", "#E91E63", "#F48FB1"};
            case LEGENDARY -> new String[]{"#4A148C", "#9C27B0", "#E1BEE7"};
            case FLASHBACK -> new String[]{"#E65100", "#FF9800", "#FFB74D"};
            default -> new String[]{"#8B4513", "#CD7F32", "#A0522D"};
        };
    }

    /**
     * Boost player stats
     */
    private PlayerStats boostStats(PlayerStats stats, int boost) {
        double multiplier = 1 + (boost * 0.05); // 5% boost per rating point

        return PlayerStats.builder()
                .playerId(stats.getPlayerId())
                .season(stats.getSeason())
                .gamesPlayed(stats.getGamesPlayed())
                .pointsPerGame(stats.getPointsPerGame() != null ? stats.getPointsPerGame() * multiplier : 0)
                .reboundsPerGame(stats.getReboundsPerGame() != null ? stats.getReboundsPerGame() * multiplier : 0)
                .assistsPerGame(stats.getAssistsPerGame() != null ? stats.getAssistsPerGame() * multiplier : 0)
                .stealsPerGame(stats.getStealsPerGame() != null ? stats.getStealsPerGame() * multiplier : 0)
                .blocksPerGame(stats.getBlocksPerGame() != null ? stats.getBlocksPerGame() * multiplier : 0)
                .fieldGoalPercentage(stats.getFieldGoalPercentage() != null ?
                        Math.min(100, stats.getFieldGoalPercentage() * 1.02) : 0)
                .threePointPercentage(stats.getThreePointPercentage() != null ?
                        Math.min(100, stats.getThreePointPercentage() * 1.02) : 0)
                .freeThrowPercentage(stats.getFreeThrowPercentage() != null ?
                        Math.min(100, stats.getFreeThrowPercentage() * 1.01) : 0)
                .build();
    }
}
