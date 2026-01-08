package com.hoops.stats.card.service;

import com.hoops.stats.card.model.PlayerAttribute;
import com.hoops.stats.model.Player;
import com.hoops.stats.model.PlayerStats;
import org.springframework.stereotype.Service;

/**
 * Advanced Stats Calculator
 * FIFA Ultimate Team style attribute calculations with NBA analytics
 */
@Service
public class AdvancedStatsCalculator {

    /**
     * Calculate all advanced attributes for a player
     */
    public PlayerAttribute.AdvancedAttributes calculateAdvancedAttributes(
            Player player, PlayerStats stats) {

        return PlayerAttribute.AdvancedAttributes.builder()
                .offense(calculateOffense(player, stats))
                .playmaking(calculatePlaymaking(player, stats))
                .defense(calculateDefense(player, stats))
                .athleticism(calculateAthleticism(player, stats))
                .rebounding(calculateRebounding(player, stats))
                .efficiency(calculateEfficiency(player, stats))
                .build();
    }

    /**
     * OFFENSE: Scoring ability and offensive impact
     */
    private PlayerAttribute.Offense calculateOffense(Player player, PlayerStats stats) {
        String position = player.getPosition();

        int finishingAtRim = calculateFinishingAtRim(stats, position);
        int midRangeShooting = calculateMidRangeShooting(stats, position);
        int threePointShooting = calculateThreePointShooting(stats);
        int freeThrowShooting = calculateFreeThrowShooting(stats);
        int shotCreation = calculateShotCreation(stats, position);
        int offensiveConsistency = calculateOffensiveConsistency(stats);

        int overall = (int) Math.round(
            finishingAtRim * 0.25 +
            midRangeShooting * 0.20 +
            threePointShooting * 0.20 +
            freeThrowShooting * 0.10 +
            shotCreation * 0.15 +
            offensiveConsistency * 0.10
        );

        return PlayerAttribute.Offense.builder()
                .overall(clamp(overall))
                .finishingAtRim(finishingAtRim)
                .midRangeShooting(midRangeShooting)
                .threePointShooting(threePointShooting)
                .freeThrowShooting(freeThrowShooting)
                .shotCreation(shotCreation)
                .offensiveConsistency(offensiveConsistency)
                .build();
    }

    private int calculateFinishingAtRim(PlayerStats stats, String position) {
        double fgPct = stats.getFieldGoalPercentage();
        double ppg = stats.getPointsPerGame();

        // Centers and PFs should have higher expectations near rim
        double positionMultiplier = isInsidePlayer(position) ? 1.2 : 0.9;

        // Combine FG% and volume
        double base = normalize(fgPct, 40, 70) * 0.7 + normalize(ppg, 0, 30) * 0.3;
        return clamp((int) Math.round(base * 100 * positionMultiplier));
    }

    private int calculateMidRangeShooting(PlayerStats stats, String position) {
        double fgPct = stats.getFieldGoalPercentage();
        double fg3Pct = stats.getThreePointPercentage();

        // Mid-range is derived from overall FG% minus 3P impact
        double midRangeEstimate = fgPct - (fg3Pct * 0.2);
        return clamp((int) Math.round(normalize(midRangeEstimate, 35, 55) * 100));
    }

    private int calculateThreePointShooting(PlayerStats stats) {
        double fg3Pct = stats.getThreePointPercentage();
        return clamp((int) Math.round(normalize(fg3Pct, 25, 45) * 100));
    }

    private int calculateFreeThrowShooting(PlayerStats stats) {
        double ftPct = stats.getFreeThrowPercentage();
        return clamp((int) Math.round(normalize(ftPct, 60, 95) * 100));
    }

    private int calculateShotCreation(PlayerStats stats, String position) {
        double ppg = stats.getPointsPerGame();
        double apg = stats.getAssistsPerGame();

        // Shot creators score and facilitate
        double usage = ppg + (apg * 1.5);
        double positionBonus = isGuard(position) ? 1.1 : 0.9;

        return clamp((int) Math.round(normalize(usage, 5, 45) * 100 * positionBonus));
    }

    private int calculateOffensiveConsistency(PlayerStats stats) {
        double fgPct = stats.getFieldGoalPercentage();
        // Consistent players have good FG% with volume
        return clamp((int) Math.round(normalize(fgPct, 40, 60) * 100));
    }

    /**
     * PLAYMAKING: Passing and court vision
     */
    private PlayerAttribute.Playmaking calculatePlaymaking(Player player, PlayerStats stats) {
        String position = player.getPosition();

        int vision = calculateVision(stats, position);
        int passingAccuracy = calculatePassingAccuracy(stats);
        int ballHandling = calculateBallHandling(stats, position);
        int assistPercentage = calculateAssistPercentage(stats, position);
        int courtAwareness = calculateCourtAwareness(stats);
        int pickAndRollIQ = calculatePickAndRollIQ(stats, position);

        int overall = (int) Math.round(
            vision * 0.25 +
            passingAccuracy * 0.20 +
            ballHandling * 0.20 +
            assistPercentage * 0.15 +
            courtAwareness * 0.10 +
            pickAndRollIQ * 0.10
        );

        return PlayerAttribute.Playmaking.builder()
                .overall(clamp(overall))
                .vision(vision)
                .passingAccuracy(passingAccuracy)
                .ballHandling(ballHandling)
                .assistPercentage(assistPercentage)
                .courtAwareness(courtAwareness)
                .pickAndRollIQ(pickAndRollIQ)
                .build();
    }

    private int calculateVision(PlayerStats stats, String position) {
        double apg = stats.getAssistsPerGame();
        double positionMultiplier = isGuard(position) ? 1.0 : 0.7;
        return clamp((int) Math.round(normalize(apg, 0, 12) * 100 * positionMultiplier));
    }

    private int calculatePassingAccuracy(PlayerStats stats) {
        double apg = stats.getAssistsPerGame();
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;

        double astToRatio = apg / Math.max(tov, 0.5);
        return clamp((int) Math.round(normalize(astToRatio, 0.5, 4.0) * 100));
    }

    private int calculateBallHandling(PlayerStats stats, String position) {
        double apg = stats.getAssistsPerGame();
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;

        // Guards should excel at ball handling
        double positionMultiplier = isGuard(position) ? 1.2 : 0.6;
        double handling = (apg / Math.max(tov, 1.0)) * positionMultiplier;

        return clamp((int) Math.round(normalize(handling, 0.5, 4.0) * 100));
    }

    private int calculateAssistPercentage(PlayerStats stats, String position) {
        double apg = stats.getAssistsPerGame();
        // Default to 30 minutes per game (typical starter)
        double mpg = 30.0;

        // Normalize by minutes and position
        double astPct = (apg / mpg) * 48; // Per 48 minutes
        return clamp((int) Math.round(normalize(astPct, 0, 20) * 100));
    }

    private int calculateCourtAwareness(PlayerStats stats) {
        double apg = stats.getAssistsPerGame();
        double spg = stats.getStealsPerGame();
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;

        // Smart players assist, steal, and don't turn over
        double awareness = apg + spg - (tov * 0.5);
        return clamp((int) Math.round(normalize(awareness, 0, 12) * 100));
    }

    private int calculatePickAndRollIQ(PlayerStats stats, String position) {
        double apg = stats.getAssistsPerGame();

        // Guards and PFs excel in pick and roll
        double positionMultiplier = (isGuard(position) || "PF".equals(position)) ? 1.1 : 0.8;
        return clamp((int) Math.round(normalize(apg, 0, 10) * 100 * positionMultiplier));
    }

    /**
     * DEFENSE: Defensive ability
     */
    private PlayerAttribute.Defense calculateDefense(Player player, PlayerStats stats) {
        String position = player.getPosition();

        int perimeterDefense = calculatePerimeterDefense(stats, position);
        int interiorDefense = calculateInteriorDefense(stats, position);
        int stealAbility = calculateStealAbility(stats);
        int blockAbility = calculateBlockAbility(stats);
        int defensiveIQ = calculateDefensiveIQ(stats);
        int defensiveConsistency = calculateDefensiveConsistency(stats);

        int overall = (int) Math.round(
            perimeterDefense * 0.25 +
            interiorDefense * 0.20 +
            stealAbility * 0.20 +
            blockAbility * 0.15 +
            defensiveIQ * 0.10 +
            defensiveConsistency * 0.10
        );

        return PlayerAttribute.Defense.builder()
                .overall(clamp(overall))
                .perimeterDefense(perimeterDefense)
                .interiorDefense(interiorDefense)
                .stealAbility(stealAbility)
                .blockAbility(blockAbility)
                .defensiveIQ(defensiveIQ)
                .defensiveConsistency(defensiveConsistency)
                .build();
    }

    private int calculatePerimeterDefense(PlayerStats stats, String position) {
        double spg = stats.getStealsPerGame();
        // Guards excel at perimeter defense
        double positionMultiplier = isGuard(position) ? 1.3 : 0.8;
        return clamp((int) Math.round(normalize(spg, 0, 3) * 100 * positionMultiplier));
    }

    private int calculateInteriorDefense(PlayerStats stats, String position) {
        double bpg = stats.getBlocksPerGame();
        // Centers and PFs excel at interior defense
        double positionMultiplier = isInsidePlayer(position) ? 1.4 : 0.6;
        return clamp((int) Math.round(normalize(bpg, 0, 3) * 100 * positionMultiplier));
    }

    private int calculateStealAbility(PlayerStats stats) {
        double spg = stats.getStealsPerGame();
        return clamp((int) Math.round(normalize(spg, 0, 3) * 100));
    }

    private int calculateBlockAbility(PlayerStats stats) {
        double bpg = stats.getBlocksPerGame();
        return clamp((int) Math.round(normalize(bpg, 0, 3) * 100));
    }

    private int calculateDefensiveIQ(PlayerStats stats) {
        double spg = stats.getStealsPerGame();
        double bpg = stats.getBlocksPerGame();

        // Defensive IQ combines both defensive stats
        double defensiveImpact = (spg * 1.5) + (bpg * 1.5);
        return clamp((int) Math.round(normalize(defensiveImpact, 0, 6) * 100));
    }

    private int calculateDefensiveConsistency(PlayerStats stats) {
        double defensiveRating = calculateStealAbility(stats) + calculateBlockAbility(stats);
        return clamp((int) Math.round(defensiveRating / 2.0));
    }

    /**
     * ATHLETICISM: Speed, strength, and physical attributes
     */
    private PlayerAttribute.Athleticism calculateAthleticism(Player player, PlayerStats stats) {
        String position = player.getPosition();
        Integer age = player.getAge();

        int speed = calculateSpeed(position, age);
        int acceleration = calculateAcceleration(position, age);
        int stamina = calculateStamina(stats);
        int strength = calculateStrength(stats, position);
        int vertical = calculateVertical(stats, position);
        int agility = calculateAgility(position, age);

        int overall = (int) Math.round(
            speed * 0.20 +
            acceleration * 0.15 +
            stamina * 0.15 +
            strength * 0.20 +
            vertical * 0.15 +
            agility * 0.15
        );

        return PlayerAttribute.Athleticism.builder()
                .overall(clamp(overall))
                .speed(speed)
                .acceleration(acceleration)
                .stamina(stamina)
                .strength(strength)
                .vertical(vertical)
                .agility(agility)
                .build();
    }

    private int calculateSpeed(String position, Integer age) {
        // Guards are faster than centers
        int baseSpeed = isGuard(position) ? 80 : (isInsidePlayer(position) ? 60 : 70);

        // Age factor (peak at 25-28)
        int ageFactor = calculateAgeFactor(age);

        return clamp(baseSpeed + ageFactor);
    }

    private int calculateAcceleration(String position, Integer age) {
        // Similar to speed but slightly different
        int baseAccel = isGuard(position) ? 78 : (isInsidePlayer(position) ? 58 : 68);
        int ageFactor = calculateAgeFactor(age);
        return clamp(baseAccel + ageFactor);
    }

    private int calculateStamina(PlayerStats stats) {
        // Default to 30 minutes per game (typical starter)
        double mpg = 30.0;
        // More minutes = better stamina
        return clamp((int) Math.round(normalize(mpg, 15, 38) * 100));
    }

    private int calculateStrength(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();

        // Centers and PFs are stronger
        int baseStrength = isInsidePlayer(position) ? 75 : (isGuard(position) ? 55 : 65);
        int reboundBonus = (int) (rpg * 2); // Rebounding indicates strength

        return clamp(baseStrength + reboundBonus);
    }

    private int calculateVertical(PlayerStats stats, String position) {
        double bpg = stats.getBlocksPerGame();
        double rpg = stats.getReboundsPerGame();

        // Vertical based on blocks and rebounds
        double jumpIndicator = (bpg * 8) + (rpg * 3);
        return clamp((int) Math.round(normalize(jumpIndicator, 0, 50) * 100));
    }

    private int calculateAgility(String position, Integer age) {
        // Guards are more agile
        int baseAgility = isGuard(position) ? 82 : (isInsidePlayer(position) ? 60 : 72);
        int ageFactor = calculateAgeFactor(age);
        return clamp(baseAgility + ageFactor);
    }

    private int calculateAgeFactor(Integer age) {
        if (age == null) return 0;

        // Peak athletic years: 25-28
        if (age >= 25 && age <= 28) return 5;
        if (age >= 22 && age <= 24) return 3;
        if (age >= 29 && age <= 31) return 0;
        if (age >= 32 && age <= 34) return -5;
        if (age >= 35) return -10;
        if (age <= 21) return 0; // Young but raw

        return 0;
    }

    /**
     * REBOUNDING: Offensive and defensive rebounding
     */
    private PlayerAttribute.Rebounding calculateRebounding(Player player, PlayerStats stats) {
        String position = player.getPosition();

        int offensiveRebounding = calculateOffensiveRebounding(stats, position);
        int defensiveRebounding = calculateDefensiveRebounding(stats, position);
        int boxOutAbility = calculateBoxOutAbility(stats, position);
        int reboundingIQ = calculateReboundingIQ(stats, position);
        int positioning = calculateReboundingPositioning(stats, position);
        int contestedRebounding = calculateContestedRebounding(stats);

        int overall = (int) Math.round(
            offensiveRebounding * 0.20 +
            defensiveRebounding * 0.25 +
            boxOutAbility * 0.15 +
            reboundingIQ * 0.15 +
            positioning * 0.15 +
            contestedRebounding * 0.10
        );

        return PlayerAttribute.Rebounding.builder()
                .overall(clamp(overall))
                .offensiveRebounding(offensiveRebounding)
                .defensiveRebounding(defensiveRebounding)
                .boxOutAbility(boxOutAbility)
                .reboundingIQ(reboundingIQ)
                .positioning(positioning)
                .contestedRebounding(contestedRebounding)
                .build();
    }

    private int calculateOffensiveRebounding(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();
        // Estimate ~30% of rebounds are offensive
        double orb = rpg * 0.3;
        double positionMultiplier = isInsidePlayer(position) ? 1.3 : 0.7;
        return clamp((int) Math.round(normalize(orb, 0, 4) * 100 * positionMultiplier));
    }

    private int calculateDefensiveRebounding(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();
        // Estimate ~70% of rebounds are defensive
        double drb = rpg * 0.7;
        double positionMultiplier = isInsidePlayer(position) ? 1.2 : 0.8;
        return clamp((int) Math.round(normalize(drb, 0, 10) * 100 * positionMultiplier));
    }

    private int calculateBoxOutAbility(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();
        // Box out ability correlates with rebounding success
        double positionMultiplier = isInsidePlayer(position) ? 1.2 : 0.8;
        return clamp((int) Math.round(normalize(rpg, 0, 12) * 100 * positionMultiplier));
    }

    private int calculateReboundingIQ(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();
        // Default to 30 minutes per game (typical starter)
        double mpg = 30.0;

        // Rebounding per minute indicates IQ
        double reboundRate = (rpg / mpg) * 48;
        return clamp((int) Math.round(normalize(reboundRate, 0, 25) * 100));
    }

    private int calculateReboundingPositioning(PlayerStats stats, String position) {
        double rpg = stats.getReboundsPerGame();
        return clamp((int) Math.round(normalize(rpg, 0, 12) * 100));
    }

    private int calculateContestedRebounding(PlayerStats stats) {
        double rpg = stats.getReboundsPerGame();
        // High rebounders get contested boards
        return clamp((int) Math.round(normalize(rpg, 0, 12) * 100));
    }

    /**
     * EFFICIENCY: Overall efficiency metrics
     */
    private PlayerAttribute.Efficiency calculateEfficiency(Player player, PlayerStats stats) {
        int trueShootingPct = calculateTrueShootingPct(stats);
        int turnoverRate = calculateTurnoverRate(stats);
        int usageEfficiency = calculateUsageEfficiency(stats);
        int plusMinusImpact = calculatePlusMinusImpact(stats);
        int shotSelectionIQ = calculateShotSelectionIQ(stats);
        int consistencyFactor = calculateConsistencyFactor(stats);

        int overall = (int) Math.round(
            trueShootingPct * 0.25 +
            turnoverRate * 0.20 +
            usageEfficiency * 0.20 +
            plusMinusImpact * 0.15 +
            shotSelectionIQ * 0.10 +
            consistencyFactor * 0.10
        );

        return PlayerAttribute.Efficiency.builder()
                .overall(clamp(overall))
                .trueShootingPct(trueShootingPct)
                .turnoverRate(turnoverRate)
                .usageEfficiency(usageEfficiency)
                .plusMinusImpact(plusMinusImpact)
                .shotSelectionIQ(shotSelectionIQ)
                .consistencyFactor(consistencyFactor)
                .build();
    }

    private int calculateTrueShootingPct(PlayerStats stats) {
        double fgPct = stats.getFieldGoalPercentage();
        double fg3Pct = stats.getThreePointPercentage();
        double ftPct = stats.getFreeThrowPercentage();

        // Simplified True Shooting % calculation
        double ts = (fgPct + (fg3Pct * 0.5) + (ftPct * 0.3)) / 1.8;
        return clamp((int) Math.round(normalize(ts, 40, 75) * 100));
    }

    private int calculateTurnoverRate(PlayerStats stats) {
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;
        double ppg = stats.getPointsPerGame();
        double apg = stats.getAssistsPerGame();

        // Lower turnovers relative to usage is better (inverse)
        double usage = ppg + apg;
        double tovRate = (tov / Math.max(usage, 5.0)) * 100;

        // Invert so lower TOV = higher rating
        return clamp(100 - (int) Math.round(normalize(tovRate, 0, 25) * 100));
    }

    private int calculateUsageEfficiency(PlayerStats stats) {
        double ppg = stats.getPointsPerGame();
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;

        // Points per turnover
        double efficiency = ppg / Math.max(tov, 0.5);
        return clamp((int) Math.round(normalize(efficiency, 2, 20) * 100));
    }

    private int calculatePlusMinusImpact(PlayerStats stats) {
        // Estimate impact based on all-around stats
        double ppg = stats.getPointsPerGame();
        double rpg = stats.getReboundsPerGame();
        double apg = stats.getAssistsPerGame();
        double spg = stats.getStealsPerGame();
        double bpg = stats.getBlocksPerGame();
        double tov = stats.getTurnoversPerGame() != null ? stats.getTurnoversPerGame() : 1.0;

        double impact = ppg + rpg + apg + spg + bpg - (tov * 2);
        return clamp((int) Math.round(normalize(impact, 0, 50) * 100));
    }

    private int calculateShotSelectionIQ(PlayerStats stats) {
        double fgPct = stats.getFieldGoalPercentage();
        // Good shot selection = good FG%
        return clamp((int) Math.round(normalize(fgPct, 40, 65) * 100));
    }

    private int calculateConsistencyFactor(PlayerStats stats) {
        // Estimate based on FG% (consistent shooters have good %)
        double fgPct = stats.getFieldGoalPercentage();
        return clamp((int) Math.round(normalize(fgPct, 40, 60) * 100));
    }

    // =============== HELPER METHODS ===============

    private boolean isGuard(String position) {
        return "PG".equals(position) || "SG".equals(position);
    }

    private boolean isInsidePlayer(String position) {
        return "C".equals(position) || "PF".equals(position);
    }

    /**
     * Normalize value to 0-1 range
     */
    private double normalize(Double value, double min, double max) {
        if (value == null || Double.isNaN(value)) return 0.5;
        double clamped = Math.max(min, Math.min(max, value));
        return (clamped - min) / (max - min);
    }

    /**
     * Clamp value to 0-99 range
     */
    private int clamp(int value) {
        return Math.max(0, Math.min(99, value));
    }
}
