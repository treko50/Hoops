package com.hoops.stats.repository;

import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;

/**
 * Player Repository
 * R2-ONLY: All queries hit in-memory R2 cache (instant!)
 * NO FIRESTORE: Firestore support has been completely removed
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class PlayerRepository {

    private final R2DataRepository r2DataRepository;

    /**
     * Get player stats by ID and season (R2 ONLY)
     */
    public Optional<PlayerStats> getPlayerStatsBySeason(String playerId, String season) {
        if (!r2DataRepository.isR2Ready()) {
            throw new IllegalStateException("R2 data not available - cannot fetch player stats");
        }

        log.debug("Fetching {} season {} from R2 cache", playerId, season);
        Optional<Map<String, Object>> data = r2DataRepository.getPlayerStatsBySeason(playerId, season);

        return data.map(d -> mapToPlayerStats(d, playerId, season));
    }

    /**
     * Get career statistics for a player (R2 ONLY)
     */
    public Optional<PlayerStats> getCareerStats(String playerId) {
        if (!r2DataRepository.isR2Ready()) {
            throw new IllegalStateException("R2 data not available - cannot fetch career stats");
        }

        log.debug("Fetching {} career stats from R2 cache", playerId);
        Optional<Map<String, Object>> data = r2DataRepository.getCareerStats(playerId);

        return data.map(d -> mapToPlayerStats(d, playerId, "career"));
    }

    /**
     * Get player metadata by ID (R2 ONLY)
     */
    public Optional<Player> getPlayerById(String playerId, String season) {
        if (!r2DataRepository.isR2Ready()) {
            throw new IllegalStateException("R2 data not available - cannot fetch player");
        }

        log.debug("Fetching {} metadata from R2 cache (season {})", playerId, season);
        Optional<Map<String, Object>> data = r2DataRepository.getPlayerStatsBySeason(playerId, season);

        return data.map(d -> mapToPlayer(d, playerId));
    }

    /**
     * Get all players with optional filters (R2 ONLY)
     */
    public List<Player> getAllPlayers(String position, String team, int limit, int offset) {
        if (!r2DataRepository.isR2Ready()) {
            throw new IllegalStateException("R2 data not available - cannot fetch players");
        }

        log.debug("Fetching players from R2 cache: position={}, team={}", position, team);

        Map<String, String> filters = new HashMap<>();
        if (position != null && !position.isEmpty()) {
            filters.put("Position", position.toUpperCase());
        }
        if (team != null && !team.isEmpty()) {
            filters.put("Team_ID", team.toUpperCase());
        }

        List<Map<String, Object>> playerData = r2DataRepository.getAllPlayers("2021", filters, limit, offset);
        List<Player> players = new ArrayList<>();

        for (Map<String, Object> data : playerData) {
            String playerId = (String) data.get("id");
            players.add(mapToPlayer(data, playerId));
        }

        log.debug("R2 cache returned {} players (instant, no DB reads!)", players.size());
        return players;
    }

    /**
     * Map R2 data to Player object
     */
    private Player mapToPlayer(Map<String, Object> data, String id) {
        return Player.builder()
                .id(id)
                .name((String) data.get("Name"))
                .displayName((String) data.get("Name"))
                .position((String) data.get("Position"))
                .team((String) data.get("Team"))
                .teamAbbr((String) data.get("Team_ID"))
                .number(data.get("Number") != null ? ((Long) data.get("Number")).intValue() : null)
                .photoUrl((String) data.get("Photo_URL"))
                .build();
    }

    /**
     * Map R2 data to PlayerStats object
     * New structure: { totals: {...}, averages: {...}, percentages: {...} }
     */
    private PlayerStats mapToPlayerStats(Map<String, Object> data, String playerId, String season) {
        // Extract nested objects
        @SuppressWarnings("unchecked")
        Map<String, Object> averages = (Map<String, Object>) data.get("averages");
        @SuppressWarnings("unchecked")
        Map<String, Object> percentages = (Map<String, Object>) data.get("percentages");
        @SuppressWarnings("unchecked")
        Map<String, Object> totals = (Map<String, Object>) data.get("totals");

        // Use averages if available, otherwise fall back to old flat structure
        Map<String, Object> statsSource = averages != null ? averages : data;
        Map<String, Object> percentSource = percentages != null ? percentages : data;

        return PlayerStats.builder()
                .playerId(playerId)
                .season(season)
                .gamesPlayed(getIntValue(data, "Games_Played"))
                .pointsPerGame(getDoubleValue(statsSource, "Points"))
                .reboundsPerGame(getDoubleValue(statsSource, "Total_Rebounds"))
                .assistsPerGame(getDoubleValue(statsSource, "Assists"))
                .stealsPerGame(getDoubleValue(statsSource, "Steals"))
                .blocksPerGame(getDoubleValue(statsSource, "Blocks"))
                .fieldGoalPercentage(getPercentageValue(percentSource, "Field_Goal_Percentage"))
                .threePointPercentage(getPercentageValue(percentSource, "Three_Point_Field_Goal_Percentage"))
                .freeThrowPercentage(getPercentageValue(percentSource, "Free_Throw_Percentage"))
                .build();
    }

    private Integer getIntValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof Double) return ((Double) value).intValue();
        return 0;
    }

    private Double getDoubleValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Long) return ((Long) value).doubleValue();
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private Double getPercentageValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return 0.0;

        if (value instanceof String) {
            String strValue = ((String) value).replace("%", "").trim();
            try {
                return Double.parseDouble(strValue);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }

        if (value instanceof Double) return (Double) value;
        if (value instanceof Long) return ((Long) value).doubleValue();
        return 0.0;
    }
}
