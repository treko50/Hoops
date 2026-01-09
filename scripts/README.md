# Hoops Scripts

Utility scripts for data processing and management.

## Main Scripts

### generate-2026-cards.js
**The all-in-one card generation script**

Generates player cards for the 2026 season with:
- FIFA-style ratings based on stats
- Rarity tiers (Bronze → Legendary)
- Player images scraped from Basketball Reference
- Formatted stats for display

**Usage:**
```bash
cd scripts
node generate-2026-cards.js
```

**Output:** `basketball-stats-api/exports/2026-cards.json` (ready for R2 upload)

**Process:**
1. Reads player data from `basketball-stats-api/exports/2026.json`
2. Calculates ratings and rarity for each player
3. Scrapes player headshot from Basketball Reference (2s delay between requests)
4. Exports cards in R2-compatible format `{"cards": [...]}`

**Expected Runtime:** ~20 minutes for 500+ players (respects rate limits)

## Utility Modules

### advancedStatsCalculator.js
Calculates advanced stats for player cards (PER, TS%, etc.)

### ratingCalculator.js
Calculates overall ratings and assigns rarity tiers based on:
- Position-specific stat weights
- Performance thresholds
- Rarity distribution (90+ = Legendary, 85-89 = Gold Rare, etc.)

## R2 Upload Scripts

### r2-upload.js
Uploads card data to Cloudflare R2 storage

**Usage:**
```bash
cd scripts
node r2-upload.js
```

### upload-r2-sdk.js
Alternative R2 upload using AWS SDK directly

## Logs

Script execution logs are stored in the `logs/` subdirectory.

## Typical Workflow

1. **Generate Cards with Images:**
   ```bash
   cd scripts
   node generate-2026-cards.js
   ```
   This creates `basketball-stats-api/exports/2026-cards.json` with all player cards and images.

2. **Upload to R2:**
   ```bash
   node r2-upload.js
   ```
   Uploads the generated cards to Cloudflare R2 as `advanced-cards.json`.

3. **Reload Backend Cache:**
   ```bash
   curl -X POST http://localhost:8080/api/cards/advanced/cache/reload
   ```
   Backend reloads cards from R2 into memory.

4. **Verify:**
   Open http://localhost:5175 and check that cards display with images.

## Notes

- Image scraping respects Basketball Reference rate limits (2s delay)
- Failed image lookups result in `null` photoUrl (frontend shows placeholder)
- All scripts assume Node.js runtime
- R2 credentials must be configured in `application.properties`
