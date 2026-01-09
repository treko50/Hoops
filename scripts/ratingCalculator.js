/**
 * Overall Rating Calculator
 * Converts basketball stats into FIFA Ultimate Team style ratings (0-99)
 */

/**
 * Calculate overall rating for a player based on position and stats
 * @param {Object} stats - Player statistics
 * @param {string} position - Player position (PG, SG, SF, PF, C)
 * @returns {number} Overall rating (0-99)
 */
function calculateOverallRating(stats, position) {
    // Normalize stats to 0-100 scale
    const normalized = normalizeStats(stats);

    // Position-specific weights
    const weights = getPositionWeights(position);

    // Calculate weighted average
    let totalWeight = 0;
    let weightedSum = 0;

    for (const [stat, weight] of Object.entries(weights)) {
        if (normalized[stat] !== undefined) {
            weightedSum += normalized[stat] * weight;
            totalWeight += weight;
        }
    }

    const rawRating = totalWeight > 0 ? weightedSum / totalWeight : 50;

    // Apply position bonus/penalty
    const adjustedRating = applyPositionAdjustments(rawRating, stats, position);

    // Clamp to 40-99 range (no player below 40, max is 99)
    return Math.round(Math.max(40, Math.min(99, adjustedRating)));
}

/**
 * Normalize stats to 0-100 scale based on NBA benchmarks
 */
function normalizeStats(stats) {
    return {
        // Scoring (0-40 PPG range)
        points: normalizeValue(stats.ppg || stats.pointsPerGame || 0, 0, 35, 0, 100),

        // Playmaking (0-15 APG range)
        assists: normalizeValue(stats.apg || stats.assistsPerGame || 0, 0, 12, 0, 100),

        // Rebounding (0-15 RPG range)
        rebounds: normalizeValue(stats.rpg || stats.reboundsPerGame || 0, 0, 15, 0, 100),

        // Defense
        steals: normalizeValue(stats.spg || stats.stealsPerGame || 0, 0, 3, 0, 100),
        blocks: normalizeValue(stats.bpg || stats.blocksPerGame || 0, 0, 3, 0, 100),

        // Efficiency
        fieldGoalPct: normalizeValue(parsePercentage(stats.fgPct || stats.fieldGoalPercentage || 0), 0, 70, 0, 100),
        threePointPct: normalizeValue(parsePercentage(stats.fg3Pct || stats.threePointPercentage || 0), 0, 50, 0, 100),
        freeThrowPct: normalizeValue(parsePercentage(stats.ftPct || stats.freeThrowPercentage || 0), 0, 95, 0, 100),

        // Advanced metrics (if available)
        per: stats.per ? normalizeValue(stats.per, 0, 30, 0, 100) : null,
        trueShootingPct: stats.tsPct ? normalizeValue(parsePercentage(stats.tsPct), 0, 70, 0, 100) : null
    };
}

/**
 * Position-specific stat weights
 */
function getPositionWeights(position) {
    const weights = {
        'PG': { // Point Guard - emphasis on assists and ball handling
            points: 0.20,
            assists: 0.30,
            rebounds: 0.10,
            steals: 0.15,
            blocks: 0.05,
            fieldGoalPct: 0.10,
            threePointPct: 0.05,
            freeThrowPct: 0.05
        },
        'SG': { // Shooting Guard - emphasis on scoring and perimeter shooting
            points: 0.30,
            assists: 0.15,
            rebounds: 0.10,
            steals: 0.15,
            blocks: 0.05,
            fieldGoalPct: 0.10,
            threePointPct: 0.10,
            freeThrowPct: 0.05
        },
        'SF': { // Small Forward - balanced all-around
            points: 0.25,
            assists: 0.15,
            rebounds: 0.15,
            steals: 0.15,
            blocks: 0.10,
            fieldGoalPct: 0.10,
            threePointPct: 0.05,
            freeThrowPct: 0.05
        },
        'PF': { // Power Forward - emphasis on rebounds and interior scoring
            points: 0.25,
            assists: 0.10,
            rebounds: 0.25,
            steals: 0.05,
            blocks: 0.15,
            fieldGoalPct: 0.15,
            threePointPct: 0.00,
            freeThrowPct: 0.05
        },
        'C': { // Center - emphasis on rebounds and blocks
            points: 0.20,
            assists: 0.05,
            rebounds: 0.30,
            steals: 0.05,
            blocks: 0.20,
            fieldGoalPct: 0.15,
            threePointPct: 0.00,
            freeThrowPct: 0.05
        }
    };

    // Default to SF weights if position unknown
    return weights[position] || weights['SF'];
}

/**
 * Apply position-specific adjustments
 */
function applyPositionAdjustments(rating, stats, position) {
    let adjusted = rating;

    // Bonus for elite efficiency
    const fgPct = parsePercentage(stats.fgPct || stats.fieldGoalPercentage || 0);
    if (fgPct > 55) {
        adjusted += 2; // Elite shooter bonus
    }

    // Bonus for high volume scorers
    const ppg = stats.ppg || stats.pointsPerGame || 0;
    if (ppg > 28) {
        adjusted += 3; // Superstar scorer bonus
    } else if (ppg > 25) {
        adjusted += 2;
    }

    // Bonus for triple-double threats
    const apg = stats.apg || stats.assistsPerGame || 0;
    const rpg = stats.rpg || stats.reboundsPerGame || 0;
    if (ppg > 15 && apg > 7 && rpg > 7) {
        adjusted += 4; // All-around excellence bonus
    }

    // Penalty for low efficiency
    if (fgPct < 40 && ppg > 15) {
        adjusted -= 3; // High volume, low efficiency penalty
    }

    return adjusted;
}

/**
 * Determine card rarity based on overall rating
 */
function getCardRarity(overallRating) {
    if (overallRating >= 90) return 'legendary';
    if (overallRating >= 85) return 'gold_rare';
    if (overallRating >= 80) return 'gold';
    if (overallRating >= 75) return 'silver_rare';
    if (overallRating >= 65) return 'silver';
    return 'bronze';
}

/**
 * Get card color based on rarity
 */
function getCardColor(rarity) {
    const colors = {
        'bronze': '#CD7F32',
        'silver': '#C0C0C0',
        'silver_rare': '#E8E8E8',
        'gold': '#FFD700',
        'gold_rare': '#FFA500',
        'legendary': '#9C27B0' // Purple for legendary
    };

    return colors[rarity] || colors.bronze;
}

/**
 * Get gradient colors for card background
 */
function getCardGradient(rarity) {
    const gradients = {
        'bronze': ['#8B4513', '#CD7F32', '#A0522D'],
        'silver': ['#808080', '#C0C0C0', '#A9A9A9'],
        'silver_rare': ['#C0C0C0', '#E8E8E8', '#D3D3D3'],
        'gold': ['#DAA520', '#FFD700', '#FFA500'],
        'gold_rare': ['#FF8C00', '#FFD700', '#FF6347'],
        'legendary': ['#4A148C', '#9C27B0', '#E91E63'] // Purple to pink
    };

    return gradients[rarity] || gradients.bronze;
}

/**
 * Calculate individual attribute ratings (for detailed cards)
 */
function calculateAttributeRatings(stats, position) {
    const normalized = normalizeStats(stats);

    return {
        // Offensive attributes
        scoring: Math.round((normalized.points * 0.6 + normalized.fieldGoalPct * 0.4)),
        shooting: Math.round((normalized.threePointPct * 0.6 + normalized.freeThrowPct * 0.4)),
        playmaking: Math.round(normalized.assists),

        // Physical attributes
        physicality: Math.round((normalized.rebounds * 0.6 + normalized.blocks * 0.4)),

        // Defensive attributes
        defense: Math.round((normalized.steals * 0.5 + normalized.blocks * 0.5)),

        // Overall efficiency
        efficiency: normalized.fieldGoalPct
    };
}

/**
 * Helper: Normalize value to target range
 */
function normalizeValue(value, sourceMin, sourceMax, targetMin, targetMax) {
    // Clamp source value
    const clamped = Math.max(sourceMin, Math.min(sourceMax, value));

    // Normalize to 0-1
    const normalized = (clamped - sourceMin) / (sourceMax - sourceMin);

    // Scale to target range
    return targetMin + normalized * (targetMax - targetMin);
}

/**
 * Helper: Parse percentage string to number
 */
function parsePercentage(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Remove % sign if present
        const cleaned = value.replace('%', '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

// Import advanced stats calculator
const advancedStatsCalculator = require('./advancedStatsCalculator');

module.exports = {
    calculateOverallRating,
    getCardRarity,
    getCardColor,
    getCardGradient,
    calculateAttributeRatings,
    normalizeStats,
    // Export advanced stats functions
    calculateAdvancedAttributes: advancedStatsCalculator.calculateAdvancedAttributes,
    calculateAdvancedMetrics: advancedStatsCalculator.calculateAdvancedMetrics,
    getAttributeGrade: advancedStatsCalculator.getAttributeGrade,
    getAttributeColor: advancedStatsCalculator.getAttributeColor
};
