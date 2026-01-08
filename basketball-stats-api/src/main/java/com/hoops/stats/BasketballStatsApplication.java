package com.hoops.stats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Basketball Stats & Card Generation API
 *
 * Main Spring Boot application entry point.
 * Provides REST APIs for:
 * - Player statistics (current season, career averages)
 * - Live game data
 * - Player comparisons
 * - Leaderboards
 * - FIFA Ultimate Team style card generation
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BasketballStatsApplication {

    public static void main(String[] args) {
        SpringApplication.run(BasketballStatsApplication.class, args);
    }
}
