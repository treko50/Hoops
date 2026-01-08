package com.hoops.stats.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache Configuration
 * Configures Caffeine in-memory caching with TTL strategies
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_PLAYER_INFO = "playerInfo";
    public static final String CACHE_SEASON_STATS = "seasonStats";
    public static final String CACHE_CAREER_STATS = "careerStats";
    public static final String CACHE_LEADERBOARDS = "leaderboards";
    public static final String CACHE_COMPARISONS = "comparisons";
    public static final String CACHE_LIVE_GAMES = "liveGames";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_PLAYER_INFO,
                CACHE_SEASON_STATS,
                CACHE_CAREER_STATS,
                CACHE_LEADERBOARDS,
                CACHE_COMPARISONS,
                CACHE_LIVE_GAMES
        );

        cacheManager.setCaffeine(defaultCaffeine());
        return cacheManager;
    }

    private Caffeine<Object, Object> defaultCaffeine() {
        return Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(12, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * Career stats cache - 24 hours (rarely changes)
     */
    @Bean
    public Caffeine<Object, Object> careerStatsCaffeine() {
        return Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(24, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * Season stats cache - 12 hours (changes daily)
     */
    @Bean
    public Caffeine<Object, Object> seasonStatsCaffeine() {
        return Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(12, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * Leaderboards cache - 6 hours (changes throughout day)
     */
    @Bean
    public Caffeine<Object, Object> leaderboardsCaffeine() {
        return Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(6, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * Live games cache - 30 seconds (very volatile)
     */
    @Bean
    public Caffeine<Object, Object> liveGamesCaffeine() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(30, TimeUnit.SECONDS)
                .recordStats();
    }
}
