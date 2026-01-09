/**
 * Generate Card Data for 2026 Season Players
 * Reads player data from basketball-stats-api/exports/2026.json
 * Generates base cards (Bronze/Silver/Gold) for all players with images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Import card generation modules
const { calculateOverallRating, getCardRarity, getCardGradient } = require('./ratingCalculator');

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
 * Delay helper for rate limiting
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch HTML from URL with redirect and retry handling
 */
async function fetchHTML(url, retries = 0) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, async (res) => {
            // Handle rate limiting (429)
            if (res.statusCode === 429 && retries < 3) {
                const waitTime = (retries + 1) * 5000;
                console.log(`  ⏳ Rate limited, waiting ${waitTime/1000}s...`);
                await delay(waitTime);
                return fetchHTML(url, retries + 1).then(resolve).catch(reject);
            }

            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchHTML(res.headers.location, retries).then(resolve).catch(reject);
            }

            // Handle errors
            if (res.statusCode >= 400) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Find Basketball Reference ID for a player
 */
async function findBBRefId(playerName) {
    try {
        const searchUrl = `https://www.basketball-reference.com/search/search.fcgi?search=${encodeURIComponent(playerName)}`;
        const html = await fetchHTML(searchUrl);
        const match = html.match(/\/players\/[a-z]\/([a-z0-9]+)\.html/i);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Get player headshot URL from Basketball Reference
 */
async function getHeadshotUrl(bbrefId) {
    try {
        const firstLetter = bbrefId.charAt(0).toLowerCase();
        const playerUrl = `https://www.basketball-reference.com/players/${firstLetter}/${bbrefId}.html`;
        const html = await fetchHTML(playerUrl);

        // Pattern for headshot image
        const match = html.match(/src=['"']([^'"']+\/req\/\d+\/images\/headshots\/[^'"']+\.jpg)['"']/i);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch player image URL with retry
 */
async function fetchPlayerImage(playerName) {
    try {
        const bbrefId = await findBBRefId(playerName);
        if (!bbrefId) {
            return null;
        }

        const headshotUrl = await getHeadshotUrl(bbrefId);
        return headshotUrl;
    } catch (error) {
        return null;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🏀 Generating 2026 Player Cards with Images...\n');

    // Read 2026 player data
    const dataPath = path.join(__dirname, '..', 'basketball-stats-api', 'exports', '2026.json');
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

    let imageSuccess = 0;
    let imageFailed = 0;

    for (let index = 0; index < players.length; index++) {
        const playerId = players[index];
        try {
            const card = generatePlayerCard(playerId, playerData[playerId]);

            // Fetch player image
            console.log(`[${index + 1}/${players.length}] ${card.playerName}`);
            const photoUrl = await fetchPlayerImage(card.playerName);

            if (photoUrl) {
                card.photoUrl = photoUrl;
                imageSuccess++;
                console.log(`  ✅ Image found`);
            } else {
                card.photoUrl = null;
                imageFailed++;
                console.log(`  ⚠️  No image found`);
            }

            cards[playerId] = card;
            rarityCount[card.rarity]++;

            // Add delay to respect rate limits (2 seconds between requests)
            if (index < players.length - 1) {
                await delay(2000);
            }
        } catch (error) {
            console.error(`  ❌ Error generating card: ${error.message}`);
        }
    }

    console.log(`\n✅ Generated ${Object.keys(cards).length} cards`);
    console.log(`🖼️  Images found: ${imageSuccess}/${players.length}`);
    console.log(`⚠️  Images missing: ${imageFailed}/${players.length}\n`);

    // Display rarity distribution
    console.log('📊 Rarity Distribution:');
    console.log(`   Legendary (90+):    ${rarityCount.legendary} players`);
    console.log(`   Gold Rare (85-89):  ${rarityCount.gold_rare} players`);
    console.log(`   Gold (80-84):       ${rarityCount.gold} players`);
    console.log(`   Silver Rare (75-79):${rarityCount.silver_rare} players`);
    console.log(`   Silver (65-74):     ${rarityCount.silver} players`);
    console.log(`   Bronze (40-64):     ${rarityCount.bronze} players\n`);

    // Export card data as array format for R2
    const cardsArray = {
        cards: Object.values(cards),
        generated: new Date().toISOString(),
        season: 2026,
        totalCards: Object.keys(cards).length
    };

    const outputPath = path.join(__dirname, '..', 'basketball-stats-api', 'exports', '2026-cards.json');
    fs.writeFileSync(outputPath, JSON.stringify(cardsArray, null, 2), 'utf8');
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
