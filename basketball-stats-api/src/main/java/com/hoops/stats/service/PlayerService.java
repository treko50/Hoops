package com.hoops.stats.service;

import com.hoops.stats.config.CacheConfig;
import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import com.hoops.stats.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Player Service
 * Business logic for player operations with caching
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;

    /**
     * Get all players with optional filters (CACHED to prevent quota exhaustion)
     */
    @Cacheable(value = CacheConfig.CACHE_PLAYER_INFO,
               key = "(#position ?: 'all') + ':' + (#team ?: 'all') + ':' + #limit + ':' + #offset")
    public List<Player> getAllPlayers(String position, String team, int limit, int offset) {
        log.info("Fetching players from Firestore - position: {}, team: {}, limit: {}, offset: {}",
                position, team, limit, offset);

        // CRITICAL: Limit offset to prevent quota exhaustion
        // Firestore offset reads ALL skipped docs!
        if (offset > 500) {
            log.warn("Offset {} exceeds safe limit. Capping at 500 to prevent quota exhaustion.", offset);
            offset = 500;
        }

        return playerRepository.getAllPlayers(position, team, limit, offset);
    }

    /**
     * Get player stats for a specific season (cached)
     */
    @Cacheable(value = CacheConfig.CACHE_SEASON_STATS, key = "#playerId + ':' + #season")
    public Optional<PlayerStats> getSeasonStats(String playerId, String season) {
        log.info("Fetching season stats for player: {}, season: {}", playerId, season);
        return playerRepository.getPlayerStatsBySeason(playerId, season);
    }

    /**
     * Get player career stats (cached)
     */
    @Cacheable(value = CacheConfig.CACHE_CAREER_STATS, key = "#playerId")
    public Optional<PlayerStats> getCareerStats(String playerId) {
        log.info("Fetching career stats for player: {}", playerId);
        return playerRepository.getCareerStats(playerId);
    }

    /**
     * Get player info with current season stats
     */
    public Optional<PlayerWithStats> getPlayerWithStats(String playerId) {
        String currentSeason = "2026"; // Updated to latest season

        var seasonStatsOpt = getSeasonStats(playerId, currentSeason);
        if (seasonStatsOpt.isEmpty()) {
            return Optional.empty();
        }

        PlayerStats seasonStats = seasonStatsOpt.get();
        var careerStatsOpt = getCareerStats(playerId);

        // Get player metadata efficiently from R2
        Player player = playerRepository.getPlayerById(playerId, currentSeason)
                .orElse(Player.builder().id(playerId).build());

        return Optional.of(new PlayerWithStats(player, seasonStats, careerStatsOpt.orElse(null)));
    }

    /**
     * DTO for player with stats
     */
    public record PlayerWithStats(
            Player player,
            PlayerStats currentSeasonStats,
            PlayerStats careerStats
    ) {}
}
