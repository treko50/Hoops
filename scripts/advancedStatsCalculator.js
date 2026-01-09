/**
 * FIFA Ultimate Team Style Advanced Stats Calculator for Basketball Cards
 *
 * This module generates comprehensive player ratings with 6 main categories,
 * each containing 5-6 detailed sub-attributes, mimicking FIFA Ultimate Team's card system.
 *
 * Main Categories:
 * 1. OFFENSE (Finishing, Mid-Range, Three-Point, Free Throw, Shot Creation, Consistency)
 * 2. PLAYMAKING (Vision, Passing, Ball Handling, Assist %, Court Awareness, P&R IQ)
 * 3. DEFENSE (Perimeter, Interior, Steal, Block, Defensive IQ, Consistency)
 * 4. ATHLETICISM (Speed, Acceleration, Stamina, Strength, Vertical, Agility)
 * 5. REBOUNDING (Offensive, Defensive, Box Out, Rebounding IQ, Positioning, Contested)
 * 6. EFFICIENCY (True Shooting, Turnover Rate, Usage Efficiency, Plus/Minus, Shot Selection, Clutch Factor)
 */

/**
 * Main function: Calculate all FIFA-style advanced attributes for a player
 * @param {Object} playerData - Full player data from 2026.json
 * @param {string} position - Player position (PG, SG, SF, PF, C)
 * @returns {Object} Complete advanced stats with 6 categories and 30+ sub-attributes
 */
function calculateAdvancedAttributes(playerData, position) {
    const { averages, totals, percentages, Games_Played, Age } = playerData;

    // Calculate foundational advanced metrics
    const advancedMetrics = calculateFoundationalMetrics(averages, totals, percentages, Games_Played);

    // Calculate all 6 main categories with their sub-attributes
    const offense = calculateOffenseAttributes(averages, percentages, advancedMetrics, position);
    const playmaking = calculatePlaymakingAttributes(averages, totals, advancedMetrics, position);
    const defense = calculateDefenseAttributes(averages, totals, advancedMetrics, position);
    const athleticism = calculateAthleticismAttributes(averages, totals, Age, position);
    const rebounding = calculateReboundingAttributes(averages, totals, advancedMetrics, position);
    const efficiency = calculateEfficiencyAttributes(averages, totals, percentages, advancedMetrics, position);

    return {
        overallRating: calculateOverallRating({ offense, playmaking, defense, athleticism, rebounding, efficiency }, position),
        attributes: {
            offense,
            playmaking,
            defense,
            athleticism,
            rebounding,
            efficiency
        },
        advancedMetrics
    };
}

/**
 * ========================================
 * FOUNDATIONAL METRICS CALCULATIONS
 * ========================================
 * These are the building blocks for all other calculations
 */
function calculateFoundationalMetrics(averages, totals, percentages, gamesPlayed) {
    const ppg = averages.Points || 0;
    const fgm = averages.Field_Goals || 0;
    const fga = averages.Field_Goal_Attempts || 0;
    const fg3m = averages.Three_Point_Field_Goals || 0;
    const fg3a = averages.Three_Point_Field_Goal_Attempts || 0;
    const fg2m = averages.Two_Point_Field_Goals || 0;
    const fg2a = averages.Two_Point_Field_Goals_Attempted || 0;
    const ftm = averages.Free_Throws || 0;
    const fta = averages.Free_Throw_Attempts || 0;
    const orb = averages.Offensive_Rebounds || 0;
    const drb = averages.Defensive_Rebounds || 0;
    const trb = averages.Total_Rebounds || 0;
    const ast = averages.Assists || 0;
    const stl = averages.Steals || 0;
    const blk = averages.Blocks || 0;
    const tov = averages.Turnovers || 0;
    const pf = averages.Personal_Fouls || 0;
    const mpg = averages.Minutes_Played || 0;

    // Shooting percentages
    const fgPct = parsePercentage(percentages.Field_Goal_Percentage);
    const fg3Pct = parsePercentage(percentages.Three_Point_Field_Goal_Percentage);
    const fg2Pct = parsePercentage(percentages.Two_Point_Field_Goal_Percentage);
    const ftPct = parsePercentage(percentages.Free_Throw_Percentage);
    const efgPct = parsePercentage(percentages.Effective_Field_Goal_Percentage);

    // True Shooting % = PTS / (2 * (FGA + 0.44 * FTA))
    const tsp = fga + (0.44 * fta) > 0
        ? (ppg / (2 * (fga + (0.44 * fta)))) * 100
        : 0;

    // Usage Rate approximation (percentage of team plays used)
    const usageRate = mpg > 0
        ? ((fga + (0.44 * fta) + tov) / mpg) * 20
        : 0;

    // Assist Percentage (assists per 36 minutes)
    const astPer36 = mpg > 0 ? (ast * 36) / mpg : 0;

    // Turnover Ratio
    const tovRatio = (fga + (0.44 * fta) + tov) > 0
        ? (tov / (fga + (0.44 * fta) + tov)) * 100
        : 0;

    // Points Per Shot Attempt
    const pps = fga > 0 ? ppg / fga : 0;

    // Assist to Turnover Ratio
    const astToRatio = tov > 0 ? ast / tov : ast * 2;

    // Stocks per game (Steals + Blocks)
    const stocksPerGame = stl + blk;

    // Rebound percentages
    const orbPct = trb > 0 ? (orb / trb) * 100 : 0;
    const drbPct = trb > 0 ? (drb / trb) * 100 : 0;

    // Game Score = PTS + 0.4*FG - 0.7*FGA - 0.4*(FTA-FT) + 0.7*ORB + 0.3*DRB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV
    const gameScore = ppg + (0.4 * fgm) - (0.7 * fga) - (0.4 * (fta - ftm)) +
                      (0.7 * orb) + (0.3 * drb) + stl + (0.7 * ast) + (0.7 * blk) - (0.4 * pf) - tov;

    // Scoring Efficiency (points per true shooting attempt)
    const scoringEfficiency = tsp > 0 ? (ppg / (fga + (0.44 * fta))) : 0;

    // Consistency factor (games played reliability)
    const consistencyFactor = Math.min(100, (gamesPlayed / 82) * 100);

    return {
        // Shooting metrics
        fgPct, fg2Pct, fg3Pct, ftPct, efgPct, tsp,

        // Volume metrics
        ppg, fga, fg3a, fta, mpg,

        // Playmaking metrics
        ast, astPer36, astToRatio, tov, tovRatio,

        // Defensive metrics
        stl, blk, stocksPerGame, drb,

        // Rebounding metrics
        trb, orb, orbPct, drbPct,

        // Advanced metrics
        usageRate, pps, gameScore, scoringEfficiency, consistencyFactor
    };
}

/**
 * ========================================
 * 1. OFFENSE ATTRIBUTES
 * ========================================
 * FIFA-style breakdown of offensive capabilities
 */
function calculateOffenseAttributes(averages, percentages, metrics, position) {
    // Sub-attribute 1: Finishing at Rim
    const finishingAtRim = calculateFinishingAtRim(averages, percentages, metrics, position);

    // Sub-attribute 2: Mid-Range Shooting
    const midRangeShooting = calculateMidRangeShooting(averages, percentages, metrics, position);

    // Sub-attribute 3: Three-Point Shooting
    const threePointShooting = calculateThreePointShooting(averages, percentages, metrics, position);

    // Sub-attribute 4: Free Throw Shooting
    const freeThrowShooting = calculateFreeThrowShooting(averages, percentages, metrics, position);

    // Sub-attribute 5: Shot Creation/IQ
    const shotCreation = calculateShotCreation(averages, percentages, metrics, position);

    // Sub-attribute 6: Offensive Consistency
    const offensiveConsistency = calculateOffensiveConsistency(averages, metrics, position);

    // Calculate overall offense rating (weighted average)
    const weights = position === 'C' || position === 'PF'
        ? { finishing: 0.30, midRange: 0.20, threePoint: 0.10, freeThrow: 0.15, shotCreation: 0.15, consistency: 0.10 }
        : { finishing: 0.20, midRange: 0.15, threePoint: 0.25, freeThrow: 0.15, shotCreation: 0.15, consistency: 0.10 };

    const overall = calculateWeightedAverage({
        finishing: finishingAtRim,
        midRange: midRangeShooting,
        threePoint: threePointShooting,
        freeThrow: freeThrowShooting,
        shotCreation: shotCreation,
        consistency: offensiveConsistency
    }, weights);

    return {
        overall: clampRating(overall),
        finishingAtRim: clampRating(finishingAtRim),
        midRangeShooting: clampRating(midRangeShooting),
        threePointShooting: clampRating(threePointShooting),
        freeThrowShooting: clampRating(freeThrowShooting),
        shotCreation: clampRating(shotCreation),
        offensiveConsistency: clampRating(offensiveConsistency)
    };
}

// Offense Sub-Attribute Calculations

function calculateFinishingAtRim(averages, percentages, metrics, position) {
    const fg2Pct = metrics.fg2Pct;
    const fta = averages.Free_Throw_Attempts || 0;
    const ppg = metrics.ppg;

    let score = 0;

    // 2PT% is primary indicator
    score += normalizeValue(fg2Pct, 35, 70, 0, 40);

    // Free throw attempts indicate rim attacks
    score += normalizeValue(fta, 0, 10, 0, 25);

    // Volume scoring bonus
    score += normalizeValue(ppg, 0, 35, 0, 20);

    // Position-specific adjustments
    if (position === 'C' || position === 'PF') {
        // Big men should have high rim efficiency
        score += normalizeValue(fg2Pct, 50, 70, 0, 15);
    } else {
        // Guards/wings driving to rim
        if (fta >= 5 && fg2Pct >= 50) score += 10;
    }

    return score;
}

function calculateMidRangeShooting(averages, percentages, metrics, position) {
    const fgPct = metrics.fgPct;
    const fg3Pct = metrics.fg3Pct;
    const ppg = metrics.ppg;

    let score = 0;

    // Mid-range is estimated from overall FG% minus 3PT impact
    const estimatedMidRange = fgPct - (fg3Pct * 0.3);
    score += normalizeValue(estimatedMidRange, 30, 55, 0, 50);

    // Scoring volume matters
    score += normalizeValue(ppg, 10, 30, 0, 20);

    // Position adjustments
    if (position === 'SF' || position === 'PF') {
        // Wings/forwards typically better mid-range
        score += normalizeValue(fgPct, 45, 55, 0, 15);
    } else if (position === 'PG' || position === 'SG') {
        // Guards with good FG% likely have solid mid-range
        if (fgPct >= 47) score += 10;
    }

    // High scorers with good efficiency likely have diverse scoring
    if (ppg >= 20 && fgPct >= 48) score += 15;

    return score;
}

function calculateThreePointShooting(averages, percentages, metrics, position) {
    const fg3Pct = metrics.fg3Pct;
    const fg3a = averages.Three_Point_Field_Goal_Attempts || 0;

    let score = 0;

    // 3PT% is primary metric
    score += normalizeValue(fg3Pct, 25, 45, 0, 60);

    // Volume three-point shooting
    score += normalizeValue(fg3a, 0, 12, 0, 25);

    // Elite shooter bonus
    if (fg3Pct >= 40 && fg3a >= 5) score += 15;
    if (fg3Pct >= 38 && fg3a >= 7) score += 10;

    // Position adjustments
    if (position === 'PG' || position === 'SG') {
        // Guards expected to shoot threes
        score += normalizeValue(fg3a, 3, 10, 0, 10);
    } else if (position === 'C') {
        // Stretch big bonus
        if (fg3Pct >= 35 && fg3a >= 2) score += 15;
    }

    return score;
}

function calculateFreeThrowShooting(averages, percentages, metrics, position) {
    const ftPct = metrics.ftPct;
    const fta = averages.Free_Throw_Attempts || 0;

    let score = 0;

    // FT% is primary metric
    score += normalizeValue(ftPct, 60, 95, 0, 70);

    // Volume (getting to the line)
    score += normalizeValue(fta, 0, 10, 0, 20);

    // Elite FT shooter bonus
    if (ftPct >= 90) score += 10;
    if (ftPct >= 85 && fta >= 5) score += 5;

    // Position adjustments
    if (position === 'PG' || position === 'SG') {
        // Guards typically better FT shooters
        score += normalizeValue(ftPct, 80, 92, 0, 10);
    }

    return score;
}

function calculateShotCreation(averages, percentages, metrics, position) {
    const ppg = metrics.ppg;
    const usageRate = metrics.usageRate;
    const ast = metrics.ast;

    let score = 0;

    // High usage scorers create their own shots
    score += normalizeValue(usageRate, 15, 35, 0, 30);

    // Scoring volume
    score += normalizeValue(ppg, 10, 35, 0, 30);

    // Playmaking ability indicates shot creation
    score += normalizeValue(ast, 2, 10, 0, 20);

    // True shooting efficiency while creating
    score += normalizeValue(metrics.tsp, 50, 65, 0, 20);

    // Elite shot creator bonus
    if (ppg >= 25 && usageRate >= 28) score += 10;

    return score;
}

function calculateOffensiveConsistency(averages, metrics, position) {
    const consistencyFactor = metrics.consistencyFactor;
    const tsp = metrics.tsp;
    const ppg = metrics.ppg;

    let score = 0;

    // Games played consistency
    score += normalizeValue(consistencyFactor, 50, 100, 0, 35);

    // Efficient scorers are consistent
    score += normalizeValue(tsp, 50, 65, 0, 30);

    // Reliable scoring
    score += normalizeValue(ppg, 10, 30, 0, 25);

    // Low variance bonus (low turnovers relative to usage)
    const tovPerUsage = metrics.usageRate > 0 ? metrics.tov / metrics.usageRate : 0;
    score += normalizeValue(1 / (tovPerUsage + 0.1), 0, 10, 0, 10);

    return score;
}

/**
 * ========================================
 * 2. PLAYMAKING ATTRIBUTES
 * ========================================
 */
function calculatePlaymakingAttributes(averages, totals, metrics, position) {
    const vision = calculateVision(averages, metrics, position);
    const passingAccuracy = calculatePassingAccuracy(averages, metrics, position);
    const ballHandling = calculateBallHandling(averages, metrics, position);
    const assistPercentage = calculateAssistPercentage(averages, metrics, position);
    const courtAwareness = calculateCourtAwareness(averages, metrics, position);
    const pickAndRollIQ = calculatePickAndRollIQ(averages, metrics, position);

    const weights = position === 'PG'
        ? { vision: 0.20, passing: 0.20, ballHandling: 0.20, assistPct: 0.15, awareness: 0.15, pickRoll: 0.10 }
        : position === 'C' || position === 'PF'
        ? { vision: 0.15, passing: 0.15, ballHandling: 0.10, assistPct: 0.15, awareness: 0.15, pickRoll: 0.30 }
        : { vision: 0.18, passing: 0.18, ballHandling: 0.18, assistPct: 0.16, awareness: 0.16, pickRoll: 0.14 };

    const overall = calculateWeightedAverage({
        vision, passing: passingAccuracy, ballHandling, assistPct: assistPercentage, awareness: courtAwareness, pickRoll: pickAndRollIQ
    }, weights);

    return {
        overall: clampRating(overall),
        vision: clampRating(vision),
        passingAccuracy: clampRating(passingAccuracy),
        ballHandling: clampRating(ballHandling),
        assistPercentage: clampRating(assistPercentage),
        courtAwareness: clampRating(courtAwareness),
        pickAndRollIQ: clampRating(pickAndRollIQ)
    };
}

function calculateVision(averages, metrics, position) {
    const ast = metrics.ast;
    const astPer36 = metrics.astPer36;

    let score = normalizeValue(ast, 0, 11, 0, 50);
    score += normalizeValue(astPer36, 2, 15, 0, 30);

    // Position-specific
    if (position === 'PG') {
        score += normalizeValue(ast, 7, 12, 0, 20);
    } else if (position === 'C' || position === 'PF') {
        if (ast >= 5) score += 20; // Elite passing big
        if (ast >= 4) score += 10;
    }

    return score;
}

function calculatePassingAccuracy(averages, metrics, position) {
    const astToRatio = metrics.astToRatio;
    const ast = metrics.ast;
    const tov = metrics.tov;

    let score = normalizeValue(astToRatio, 0.8, 4.0, 0, 60);
    score += normalizeValue(ast, 2, 10, 0, 20);

    // Low turnover bonus
    if (tov <= 1.5) score += 15;
    if (astToRatio >= 3.0) score += 10;

    return score;
}

function calculateBallHandling(averages, metrics, position) {
    const tov = metrics.tov;
    const ast = metrics.ast;
    const usageRate = metrics.usageRate;

    let score = 50; // Base score

    // Low turnovers = good ball handling
    score += normalizeValue(4 - tov, 0, 3, 0, 25);

    // High usage with low turnovers
    if (usageRate >= 25 && tov <= 2.5) score += 15;

    // Position baseline
    const positionBonus = { 'PG': 25, 'SG': 20, 'SF': 10, 'PF': 0, 'C': -10 };
    score += positionBonus[position] || 0;

    // Guards with assists have great handles
    if ((position === 'PG' || position === 'SG') && ast >= 5) score += 10;

    return score;
}

function calculateAssistPercentage(averages, metrics, position) {
    const astPer36 = metrics.astPer36;
    const ast = metrics.ast;
    const mpg = metrics.mpg;

    let score = normalizeValue(astPer36, 2, 15, 0, 50);
    score += normalizeValue(ast, 1, 11, 0, 30);

    // High minutes playmakers
    if (mpg >= 30 && ast >= 6) score += 20;

    return score;
}

function calculateCourtAwareness(averages, metrics, position) {
    const ast = metrics.ast;
    const stl = metrics.stl;
    const tov = metrics.tov;
    const astToRatio = metrics.astToRatio;

    let score = normalizeValue(ast + stl, 1, 12, 0, 40);
    score += normalizeValue(astToRatio, 1, 4, 0, 30);

    // Smart players: high AST+STL, low TOV
    if (ast + stl >= 7 && tov <= 2) score += 20;

    // Position adjustments
    if (position === 'PG' && ast >= 7 && stl >= 1.5) score += 10;

    return score;
}

function calculatePickAndRollIQ(averages, metrics, position) {
    const ast = metrics.ast;
    const ppg = metrics.ppg;
    const fg2Pct = metrics.fg2Pct;

    let score = 50; // Base

    if (position === 'PG' || position === 'SG') {
        // Ball handlers: AST-heavy P&R
        score += normalizeValue(ast, 3, 10, 0, 30);
        score += normalizeValue(ppg, 10, 30, 0, 20);
    } else if (position === 'C' || position === 'PF') {
        // Roll men: efficient finishing
        score += normalizeValue(fg2Pct, 50, 70, 0, 30);
        score += normalizeValue(ppg, 10, 25, 0, 20);
        if (ast >= 3) score += 15; // Passing big
    } else {
        // Wings: balanced
        score += normalizeValue(ast, 2, 7, 0, 25);
        score += normalizeValue(ppg, 12, 28, 0, 25);
    }

    return score;
}

/**
 * ========================================
 * 3. DEFENSE ATTRIBUTES
 * ========================================
 */
function calculateDefenseAttributes(averages, totals, metrics, position) {
    const perimeterDefense = calculatePerimeterDefense(averages, metrics, position);
    const interiorDefense = calculateInteriorDefense(averages, metrics, position);
    const stealAbility = calculateStealAbility(averages, metrics, position);
    const blockAbility = calculateBlockAbility(averages, metrics, position);
    const defensiveIQ = calculateDefensiveIQ(averages, metrics, position);
    const defensiveConsistency = calculateDefensiveConsistency(averages, metrics, position);

    const weights = position === 'C' || position === 'PF'
        ? { perimeter: 0.10, interior: 0.30, steal: 0.10, block: 0.25, iq: 0.15, consistency: 0.10 }
        : { perimeter: 0.25, interior: 0.15, steal: 0.20, block: 0.10, iq: 0.20, consistency: 0.10 };

    const overall = calculateWeightedAverage({
        perimeter: perimeterDefense, interior: interiorDefense, steal: stealAbility,
        block: blockAbility, iq: defensiveIQ, consistency: defensiveConsistency
    }, weights);

    return {
        overall: clampRating(overall),
        perimeterDefense: clampRating(perimeterDefense),
        interiorDefense: clampRating(interiorDefense),
        stealAbility: clampRating(stealAbility),
        blockAbility: clampRating(blockAbility),
        defensiveIQ: clampRating(defensiveIQ),
        defensiveConsistency: clampRating(defensiveConsistency)
    };
}

function calculatePerimeterDefense(averages, metrics, position) {
    const stl = metrics.stl;
    const drb = metrics.drb;

    let score = normalizeValue(stl, 0, 2.5, 0, 50);
    score += normalizeValue(drb, 2, 8, 0, 20);

    // Position-specific
    if (position === 'PG' || position === 'SG' || position === 'SF') {
        score += normalizeValue(stl, 1.0, 2.5, 0, 20);
        if (stl >= 1.8) score += 10; // Elite perimeter defender
    }

    return score;
}

function calculateInteriorDefense(averages, metrics, position) {
    const blk = metrics.blk;
    const drb = metrics.drb;

    let score = normalizeValue(blk, 0, 3.0, 0, 50);
    score += normalizeValue(drb, 3, 12, 0, 25);

    // Position-specific
    if (position === 'C' || position === 'PF') {
        score += normalizeValue(blk, 1.0, 3.5, 0, 20);
        score += normalizeValue(drb, 6, 12, 0, 15);
        if (blk >= 2.0) score += 10; // Elite rim protector
    }

    return score;
}

function calculateStealAbility(averages, metrics, position) {
    const stl = metrics.stl;

    let score = normalizeValue(stl, 0, 2.5, 0, 80);

    if (stl >= 2.0) score += 15;
    if (stl >= 1.5) score += 10;

    return score;
}

function calculateBlockAbility(averages, metrics, position) {
    const blk = metrics.blk;

    let score = normalizeValue(blk, 0, 3.5, 0, 80);

    if (blk >= 2.5) score += 15;
    if (blk >= 2.0) score += 10;

    return score;
}

function calculateDefensiveIQ(averages, metrics, position) {
    const stocks = metrics.stocksPerGame;
    const tov = metrics.tov;
    const pf = averages.Personal_Fouls || 0;

    let score = normalizeValue(stocks, 0, 4.0, 0, 50);

    // Low fouls = smart defense
    score += normalizeValue(6 - pf, 0, 4, 0, 25);

    // Low turnovers (doesn't gamble)
    score += normalizeValue(4 - tov, 0, 3, 0, 15);

    if (stocks >= 3.0 && pf <= 2.5) score += 10;

    return score;
}

function calculateDefensiveConsistency(averages, metrics, position) {
    const consistencyFactor = metrics.consistencyFactor;
    const stocks = metrics.stocksPerGame;

    let score = normalizeValue(consistencyFactor, 50, 100, 0, 50);
    score += normalizeValue(stocks, 1, 4, 0, 40);

    if (metrics.mpg >= 30) score += 10; // Plays heavy minutes

    return score;
}

/**
 * ========================================
 * 4. ATHLETICISM ATTRIBUTES
 * ========================================
 */
function calculateAthleticismAttributes(averages, totals, age, position) {
    const speed = calculateSpeed(averages, age, position);
    const acceleration = calculateAcceleration(averages, age, position);
    const stamina = calculateStamina(averages, age, position);
    const strength = calculateStrength(averages, position);
    const vertical = calculateVertical(averages, position);
    const agility = calculateAgility(averages, age, position);

    const overall = calculateWeightedAverage({
        speed, acceleration, stamina, strength, vertical, agility
    }, { speed: 0.20, acceleration: 0.15, stamina: 0.15, strength: 0.20, vertical: 0.15, agility: 0.15 });

    return {
        overall: clampRating(overall),
        speed: clampRating(speed),
        acceleration: clampRating(acceleration),
        stamina: clampRating(stamina),
        strength: clampRating(strength),
        vertical: clampRating(vertical),
        agility: clampRating(agility)
    };
}

function calculateSpeed(averages, age, position) {
    const stl = averages.Steals || 0;
    const mpg = averages.Minutes_Played || 0;

    // Age curve
    let ageScore = 100;
    if (age <= 22) ageScore = 85;
    else if (age >= 23 && age <= 27) ageScore = 100;
    else if (age >= 28 && age <= 30) ageScore = 90;
    else if (age >= 31 && age <= 33) ageScore = 75;
    else if (age >= 34) ageScore = 60 - ((age - 34) * 5);

    let score = ageScore * 0.30;

    // Position baseline
    const positionSpeed = { 'PG': 30, 'SG': 28, 'SF': 22, 'PF': 15, 'C': 8 };
    score += positionSpeed[position] || 20;

    // Steals indicate speed
    score += normalizeValue(stl, 0, 2.5, 0, 20);

    // Minutes
    score += normalizeValue(mpg, 25, 38, 0, 10);

    return score;
}

function calculateAcceleration(averages, age, position) {
    const stl = averages.Steals || 0;

    let ageScore = age >= 23 && age <= 27 ? 100 : age <= 30 ? 90 : age >= 31 ? 75 : 80;
    let score = ageScore * 0.35;

    const positionAccel = { 'PG': 28, 'SG': 26, 'SF': 20, 'PF': 14, 'C': 8 };
    score += positionAccel[position] || 18;

    score += normalizeValue(stl, 0, 2.5, 0, 25);

    return score;
}

function calculateStamina(averages, age, position) {
    const mpg = averages.Minutes_Played || 0;

    let score = normalizeValue(mpg, 20, 38, 0, 50);

    // Age factor
    if (age >= 23 && age <= 29) score += 20;
    else if (age >= 30 && age <= 32) score += 15;
    else if (age >= 33) score += 10;
    else score += 15;

    // Heavy minutes players
    if (mpg >= 35) score += 20;
    if (mpg >= 32) score += 10;

    return score;
}

function calculateStrength(averages, position) {
    const trb = averages.Total_Rebounds || 0;
    const blk = averages.Blocks || 0;
    const fta = averages.Free_Throw_Attempts || 0;

    let score = 0;

    // Position baseline
    const positionStr = { 'PG': 10, 'SG': 15, 'SF': 25, 'PF': 40, 'C': 50 };
    score += positionStr[position] || 25;

    // Rebounding indicates strength
    score += normalizeValue(trb, 2, 14, 0, 25);

    // Blocks
    score += normalizeValue(blk, 0, 3, 0, 15);

    // Getting to line (contact finishing)
    score += normalizeValue(fta, 2, 10, 0, 15);

    return score;
}

function calculateVertical(averages, position) {
    const blk = averages.Blocks || 0;
    const orb = averages.Offensive_Rebounds || 0;
    const trb = averages.Total_Rebounds || 0;

    let score = 0;

    // Blocks = vertical leap
    score += normalizeValue(blk, 0, 3.5, 0, 35);

    // Offensive rebounds
    score += normalizeValue(orb, 0, 4, 0, 20);

    // Total rebounds
    score += normalizeValue(trb, 3, 14, 0, 20);

    // Position adjustments
    if (position === 'PG' || position === 'SG') {
        score += 15; // Guards need hops to finish
    } else if (position === 'PF' || position === 'C') {
        score += 20; // Bigs jumping at rim
    }

    return score;
}

function calculateAgility(averages, age, position) {
    const stl = averages.Steals || 0;
    const ast = averages.Assists || 0;

    let ageScore = age >= 23 && age <= 28 ? 100 : age <= 30 ? 90 : 80;
    let score = ageScore * 0.30;

    // Position baseline
    const positionAgil = { 'PG': 30, 'SG': 28, 'SF': 22, 'PF': 12, 'C': 5 };
    score += positionAgil[position] || 20;

    // Quick hands/feet
    score += normalizeValue(stl, 0, 2.5, 0, 20);
    score += normalizeValue(ast, 0, 10, 0, 15);

    return score;
}

/**
 * ========================================
 * 5. REBOUNDING ATTRIBUTES
 * ========================================
 */
function calculateReboundingAttributes(averages, totals, metrics, position) {
    const offensiveRebounding = calculateOffensiveRebounding(averages, metrics, position);
    const defensiveRebounding = calculateDefensiveRebounding(averages, metrics, position);
    const boxOutAbility = calculateBoxOutAbility(averages, metrics, position);
    const reboundingIQ = calculateReboundingIQ(averages, metrics, position);
    const positioning = calculatePositioning(averages, metrics, position);
    const contestedRebounding = calculateContestedRebounding(averages, metrics, position);

    const overall = calculateWeightedAverage({
        offensive: offensiveRebounding, defensive: defensiveRebounding, boxOut: boxOutAbility,
        iq: reboundingIQ, positioning, contested: contestedRebounding
    }, { offensive: 0.15, defensive: 0.30, boxOut: 0.15, iq: 0.15, positioning: 0.15, contested: 0.10 });

    return {
        overall: clampRating(overall),
        offensiveRebounding: clampRating(offensiveRebounding),
        defensiveRebounding: clampRating(defensiveRebounding),
        boxOutAbility: clampRating(boxOutAbility),
        reboundingIQ: clampRating(reboundingIQ),
        positioning: clampRating(positioning),
        contestedRebounding: clampRating(contestedRebounding)
    };
}

function calculateOffensiveRebounding(averages, metrics, position) {
    const orb = averages.Offensive_Rebounds || 0;
    const orbPct = metrics.orbPct;

    let score = normalizeValue(orb, 0, 4, 0, 50);
    score += normalizeValue(orbPct, 5, 35, 0, 30);

    // Position-specific
    if (position === 'C' || position === 'PF') {
        score += normalizeValue(orb, 1.5, 4, 0, 15);
        if (orb >= 2.5) score += 10;
    } else if (position === 'PG' || position === 'SG') {
        if (orb >= 1.0) score += 20;
    }

    return score;
}

function calculateDefensiveRebounding(averages, metrics, position) {
    const drb = metrics.drb;
    const drbPct = metrics.drbPct;

    let score = normalizeValue(drb, 0, 12, 0, 50);
    score += normalizeValue(drbPct, 50, 95, 0, 30);

    // Position-specific
    if (position === 'C') {
        score += normalizeValue(drb, 8, 12, 0, 15);
        if (drb >= 10) score += 10;
    } else if (position === 'PF') {
        score += normalizeValue(drb, 6, 10, 0, 15);
    } else if (position === 'PG' || position === 'SG') {
        if (drb >= 5) score += 15;
    }

    return score;
}

function calculateBoxOutAbility(averages, metrics, position) {
    const drb = metrics.drb;
    const trb = metrics.trb;

    let score = normalizeValue(drb, 3, 12, 0, 50);
    score += normalizeValue(trb, 4, 14, 0, 30);

    // Position-specific
    if (position === 'C' || position === 'PF') {
        score += 20; // Bigs expected to box out
    }

    return score;
}

function calculateReboundingIQ(averages, metrics, position) {
    const trb = metrics.trb;
    const mpg = metrics.mpg;

    // Rebounds per minute
    const rebPerMin = mpg > 0 ? trb / mpg : 0;

    let score = normalizeValue(rebPerMin, 0.1, 0.4, 0, 50);
    score += normalizeValue(trb, 3, 14, 0, 30);

    // Position-adjusted expectations
    if (position === 'PG' && trb >= 5) score += 20;
    if (position === 'C' && trb >= 11) score += 20;

    return score;
}

function calculatePositioning(averages, metrics, position) {
    const trb = metrics.trb;
    const drbPct = metrics.drbPct;

    let score = normalizeValue(trb, 3, 14, 0, 50);
    score += normalizeValue(drbPct, 60, 95, 0, 30);

    // Good positioning = consistent rebounding
    if (metrics.consistencyFactor >= 80) score += 20;

    return score;
}

function calculateContestedRebounding(averages, metrics, position) {
    const orb = averages.Offensive_Rebounds || 0;
    const trb = metrics.trb;

    // ORB are typically contested
    let score = normalizeValue(orb, 0.5, 4, 0, 40);
    score += normalizeValue(trb, 5, 14, 0, 40);

    if (position === 'C' || position === 'PF') {
        if (orb >= 2.0) score += 15;
    }

    return score;
}

/**
 * ========================================
 * 6. EFFICIENCY ATTRIBUTES
 * ========================================
 */
function calculateEfficiencyAttributes(averages, totals, percentages, metrics, position) {
    const trueShootingPct = calculateTrueShootingPctRating(metrics);
    const turnoverRate = calculateTurnoverRateRating(metrics);
    const usageEfficiency = calculateUsageEfficiency(metrics);
    const plusMinusImpact = calculatePlusMinusImpact(averages, metrics, position);
    const shotSelectionIQ = calculateShotSelectionIQ(averages, metrics, position);
    const consistencyFactor = calculateConsistencyFactorRating(metrics);

    const overall = calculateWeightedAverage({
        tsp: trueShootingPct, tovRate: turnoverRate, usage: usageEfficiency,
        plusMinus: plusMinusImpact, shotSelection: shotSelectionIQ, consistency: consistencyFactor
    }, { tsp: 0.25, tovRate: 0.20, usage: 0.20, plusMinus: 0.15, shotSelection: 0.10, consistency: 0.10 });

    return {
        overall: clampRating(overall),
        trueShootingPct: clampRating(trueShootingPct),
        turnoverRate: clampRating(turnoverRate),
        usageEfficiency: clampRating(usageEfficiency),
        plusMinusImpact: clampRating(plusMinusImpact),
        shotSelectionIQ: clampRating(shotSelectionIQ),
        consistencyFactor: clampRating(consistencyFactor)
    };
}

function calculateTrueShootingPctRating(metrics) {
    const tsp = metrics.tsp;

    let score = normalizeValue(tsp, 45, 70, 0, 80);

    if (tsp >= 65) score += 15;
    if (tsp >= 60) score += 10;

    return score;
}

function calculateTurnoverRateRating(metrics) {
    const tovRatio = metrics.tovRatio;
    const tov = metrics.tov;

    // Lower is better (invert)
    let score = normalizeValue(25 - tovRatio, 5, 20, 0, 50);
    score += normalizeValue(5 - tov, 0, 4, 0, 30);

    if (tov <= 1.5) score += 15;
    if (tov <= 1.0) score += 10;

    return score;
}

function calculateUsageEfficiency(metrics) {
    const usageRate = metrics.usageRate;
    const tsp = metrics.tsp;
    const ppg = metrics.ppg;

    // High usage + high efficiency = elite
    const usageEfficiency = usageRate > 0 ? (tsp * ppg) / usageRate : 0;

    let score = normalizeValue(usageEfficiency, 30, 100, 0, 50);
    score += normalizeValue(tsp, 50, 65, 0, 25);
    score += normalizeValue(ppg, 10, 30, 0, 15);

    if (usageRate >= 28 && tsp >= 58) score += 15;

    return score;
}

function calculatePlusMinusImpact(averages, metrics, position) {
    const gameScore = metrics.gameScore;
    const stocks = metrics.stocksPerGame;
    const ast = metrics.ast;

    // Estimate impact from game score
    let score = normalizeValue(gameScore, 5, 25, 0, 40);
    score += normalizeValue(stocks, 1, 4, 0, 20);
    score += normalizeValue(ast, 2, 10, 0, 20);

    // All-around players
    if (metrics.ppg >= 15 && ast >= 5 && stocks >= 2) score += 20;

    return score;
}

function calculateShotSelectionIQ(averages, metrics, position) {
    const tsp = metrics.tsp;
    const fgPct = metrics.fgPct;
    const pps = metrics.pps;

    let score = normalizeValue(tsp, 50, 65, 0, 40);
    score += normalizeValue(pps, 0.9, 1.4, 0, 30);
    score += normalizeValue(fgPct, 40, 60, 0, 20);

    // Efficient high scorers have great shot selection
    if (metrics.ppg >= 20 && tsp >= 58) score += 15;

    return score;
}

function calculateConsistencyFactorRating(metrics) {
    const consistencyFactor = metrics.consistencyFactor;

    let score = normalizeValue(consistencyFactor, 50, 100, 0, 70);

    if (consistencyFactor >= 90) score += 20;
    if (consistencyFactor >= 80) score += 10;

    return score;
}

/**
 * ========================================
 * OVERALL RATING CALCULATION
 * ========================================
 */
function calculateOverallRating(attributes, position) {
    const { offense, playmaking, defense, athleticism, rebounding, efficiency } = attributes;

    // Position-specific weights for overall rating
    const weights = {
        'PG': { offense: 0.25, playmaking: 0.25, defense: 0.15, athleticism: 0.15, rebounding: 0.05, efficiency: 0.15 },
        'SG': { offense: 0.30, playmaking: 0.15, defense: 0.15, athleticism: 0.15, rebounding: 0.05, efficiency: 0.20 },
        'SF': { offense: 0.25, playmaking: 0.15, defense: 0.20, athleticism: 0.15, rebounding: 0.10, efficiency: 0.15 },
        'PF': { offense: 0.20, playmaking: 0.10, defense: 0.20, athleticism: 0.15, rebounding: 0.20, efficiency: 0.15 },
        'C': { offense: 0.20, playmaking: 0.08, defense: 0.25, athleticism: 0.12, rebounding: 0.25, efficiency: 0.10 }
    };

    const w = weights[position] || weights['SF'];

    const overall = (offense.overall * w.offense) +
                   (playmaking.overall * w.playmaking) +
                   (defense.overall * w.defense) +
                   (athleticism.overall * w.athleticism) +
                   (rebounding.overall * w.rebounding) +
                   (efficiency.overall * w.efficiency);

    return clampRating(overall);
}

/**
 * ========================================
 * HELPER FUNCTIONS
 * ========================================
 */

/**
 * Normalize value from source range to target range
 */
function normalizeValue(value, sourceMin, sourceMax, targetMin, targetMax) {
    const clamped = Math.max(sourceMin, Math.min(sourceMax, value));
    const normalized = (clamped - sourceMin) / (sourceMax - sourceMin);
    return targetMin + normalized * (targetMax - targetMin);
}

/**
 * Parse percentage string to number (handles "45.5%" or 45.5)
 */
function parsePercentage(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const cleaned = value.replace('%', '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

/**
 * Clamp rating to 0-99 range and round
 */
function clampRating(value) {
    return Math.round(Math.max(0, Math.min(99, value)));
}

/**
 * Calculate weighted average from object of values and weights
 */
function calculateWeightedAverage(values, weights) {
    let sum = 0;
    let totalWeight = 0;

    for (const key in weights) {
        if (values[key] !== undefined) {
            sum += values[key] * weights[key];
            totalWeight += weights[key];
        }
    }

    return totalWeight > 0 ? sum / totalWeight : 50;
}

/**
 * Get letter grade for attribute rating (A+ to F)
 */
function getAttributeGrade(rating) {
    if (rating >= 90) return 'A+';
    if (rating >= 85) return 'A';
    if (rating >= 80) return 'A-';
    if (rating >= 75) return 'B+';
    if (rating >= 70) return 'B';
    if (rating >= 65) return 'B-';
    if (rating >= 60) return 'C+';
    if (rating >= 55) return 'C';
    if (rating >= 50) return 'C-';
    if (rating >= 45) return 'D+';
    if (rating >= 40) return 'D';
    return 'F';
}

/**
 * Get color for attribute rating (for UI display)
 */
function getAttributeColor(rating) {
    if (rating >= 90) return '#9C27B0'; // Purple - Elite
    if (rating >= 85) return '#FF9800'; // Orange - Excellent
    if (rating >= 80) return '#FFD700'; // Gold - Great
    if (rating >= 75) return '#4CAF50'; // Green - Good
    if (rating >= 70) return '#2196F3'; // Blue - Above Average
    if (rating >= 60) return '#9E9E9E'; // Gray - Average
    return '#F44336'; // Red - Below Average
}

/**
 * Get FIFA-style category name mapping
 */
function getCategoryDisplayName(category) {
    const displayNames = {
        offense: 'Offense',
        playmaking: 'Playmaking',
        defense: 'Defense',
        athleticism: 'Athleticism',
        rebounding: 'Rebounding',
        efficiency: 'Efficiency'
    };
    return displayNames[category] || category;
}

module.exports = {
    calculateAdvancedAttributes,
    calculateFoundationalMetrics,
    getAttributeGrade,
    getAttributeColor,
    getCategoryDisplayName
};
