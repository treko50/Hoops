/**
 * Generate Card Data for 2026 Season Players
 * Reads player data from basketball-stats-api/exports/2026.json
 * Generates base cards (Bronze/Silver/Gold) for all players
 */

const fs = require('fs');
const path = require('path');

// Import card generation modules
const { calculateOverallRating, getCardRarity, getCardGradient } = require('./utils/ratingCalculator');

/**
 * Map 2026 player data to card generator format
 */
function mapPlayerDataToCardFormat(playerId, playerData) {
    const { Name, Position, Age, Team, Team_ID, Games_Played, averages, percentages } = playerData;

    // Extract stats from averages
    const stats = {
        ppg: averages.Points || 0,
        rpg: averages.Total_Rebounds || 0,
        apg: averages.Assists || 0,
        spg: averages.Steals || 0,
        bpg: averages.Blocks || 0,
        fgPct: parsePercentage(percentages.Field_Goal_Percentage),
        fg3Pct: parsePercentage(percentages.Three_Point_Field_Goal_Percentage),
        ftPct: parsePercentage(percentages.Free_Throw_Percentage),
        mpg: averages.Minutes_Played || 0,
        tov: averages.Turnovers || 0
    };

    // Player info
    const playerInfo = {
        id: playerId,
        name: Name,
        displayName: Name,
        position: Position,
        age: Age,
        team: Team,
        teamAbbr: Team_ID,
        teamLogo: null, // Can be added later
        photoUrl: null, // Can be added later
        number: null, // Not available in current data
        jerseyNumber: null,
        gamesPlayed: Games_Played
    };

    return { playerInfo, stats };
}

/**
 * Generate card data for a single player
 */
function generatePlayerCard(playerId, playerData) {
    const { playerInfo, stats } = mapPlayerDataToCardFormat(playerId, playerData);

    // Calculate overall rating
    const overallRating = calculateOverallRating(stats, playerInfo.position);

    // Determine rarity
    const rarity = getCardRarity(overallRating);

    // Get gradient colors
    const gradient = getCardGradient(rarity);

    // Format stats for display
    const displayStats = {
        ppg: formatStat(stats.ppg, 1),
        rpg: formatStat(stats.rpg, 1),
        apg: formatStat(stats.apg, 1),
        spg: formatStat(stats.spg, 1),
        bpg: formatStat(stats.bpg, 1),
        fgPct: `${stats.fgPct.toFixed(1)}%`,
        fg3Pct: `${stats.fg3Pct.toFixed(1)}%`,
        ftPct: `${stats.ftPct.toFixed(1)}%`,
        mpg: formatStat(stats.mpg, 1)
    };

    return {
        playerId: playerInfo.id,
        playerName: playerInfo.name,
        position: playerInfo.position,
        overallRating,
        rarity,
        team: playerInfo.team,
        teamAbbr: playerInfo.teamAbbr,
        age: playerInfo.age,
        gamesPlayed: playerInfo.gamesPlayed,
        stats: displayStats,
        rawStats: stats,
        gradient,
        cardType: 'base',
        season: 2026,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Parse percentage string to number
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
 * Format stat to fixed decimal places
 */
function formatStat(value, decimals = 1) {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.0';
    return num.toFixed(decimals);
}

/**
 * Main execution
 */
async function main() {
    console.log('🏀 Generating 2026 Player Cards...\n');

    // Read 2026 player data
    const dataPath = path.join(__dirname, 'basketball-stats-api', 'exports', '2026.json');
    const playerData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const players = Object.keys(playerData);
    console.log(`Found ${players.length} players in 2026 season\n`);

    // Generate cards for all players
    const cards = {};
    const rarityCount = {
        legendary: 0,
        gold_rare: 0,
        gold: 0,
        silver_rare: 0,
        silver: 0,
        bronze: 0
    };

    players.forEach((playerId, index) => {
        try {
            const card = generatePlayerCard(playerId, playerData[playerId]);
            cards[playerId] = card;
            rarityCount[card.rarity]++;

            // Progress indicator
            if ((index + 1) % 50 === 0) {
                console.log(`Processed ${index + 1}/${players.length} players...`);
            }
        } catch (error) {
            console.error(`Error generating card for ${playerId}:`, error.message);
        }
    });

    console.log(`\n✅ Generated ${Object.keys(cards).length} cards\n`);

    // Display rarity distribution
    console.log('📊 Rarity Distribution:');
    console.log(`   Legendary (90+):    ${rarityCount.legendary} players`);
    console.log(`   Gold Rare (85-89):  ${rarityCount.gold_rare} players`);
    console.log(`   Gold (80-84):       ${rarityCount.gold} players`);
    console.log(`   Silver Rare (75-79):${rarityCount.silver_rare} players`);
    console.log(`   Silver (65-74):     ${rarityCount.silver} players`);
    console.log(`   Bronze (40-64):     ${rarityCount.bronze} players\n`);

    // Export card data
    const outputPath = path.join(__dirname, 'basketball-stats-api', 'exports', '2026-cards.json');
    fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2), 'utf8');
    console.log(`💾 Card data exported to: ${outputPath}\n`);

    // Generate top players list
    const topPlayers = Object.values(cards)
        .sort((a, b) => b.overallRating - a.overallRating)
        .slice(0, 20);

    console.log('🌟 Top 20 Rated Players:');
    topPlayers.forEach((player, index) => {
        console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${player.playerName.padEnd(25, ' ')} ${player.overallRating} (${player.position}) - ${player.rarity.toUpperCase()}`);
    });

    console.log('\n✨ Card generation complete!');
}

// Run the script
main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
