# Scripts Consolidation - January 9, 2026

## Summary

Consolidated multiple image scraping scripts into the main card generation script for a streamlined, single-step workflow.

## Problem

The scripts folder had 4+ separate files for image scraping:
- `scrapePlayerImages.js` - Basketball Reference scraper
- `addPlayerImages.js` - NBA API image fetcher
- `addPlayerImagesSimple.js` - Simplified BBRef scraper with retry logic
- `retry-failed-players.js` - Script to retry failed image lookups

This required multiple manual steps:
1. Generate cards (without images)
2. Run image scraper separately
3. Retry failed lookups
4. Manually merge results
5. Upload to R2

## Solution

### Consolidated into `generate-2026-cards.js`

**Before:**
```bash
# Step 1: Generate cards
node generate-2026-cards.js

# Step 2: Add images (separate script)
node addPlayerImagesSimple.js

# Step 3: Handle failures
node retry-failed-players.js

# Step 4: Upload
node r2-upload.js
```

**After:**
```bash
# Single step - generates cards WITH images
node generate-2026-cards.js

# Upload to R2
node r2-upload.js
```

### Features Integrated

The updated `generate-2026-cards.js` now:
1. ✅ Generates player cards with FIFA-style ratings
2. ✅ Calculates rarity tiers
3. ✅ **Scrapes player images from Basketball Reference**
4. ✅ Handles rate limiting (2s delay between requests)
5. ✅ Handles redirects and retries
6. ✅ Outputs R2-compatible JSON format `{"cards": [...]}`
7. ✅ Shows progress and image success rate

### Technical Details

**Image Scraping Logic:**
- Uses Basketball Reference search to find player pages
- Extracts headshot URLs from player pages
- Respects rate limits with 2-second delays
- Handles HTTP errors gracefully
- Sets `photoUrl: null` for failed lookups (frontend shows placeholder)

**Export Format:**
```json
{
  "cards": [...],
  "generated": "2026-01-09T...",
  "season": 2026,
  "totalCards": 507
}
```

This format is directly compatible with the backend's `AdvancedCardCache`.

## Files Removed

Deleted redundant image scraping scripts:
- ❌ `scripts/addPlayerImages.js` (155 lines)
- ❌ `scripts/addPlayerImagesSimple.js` (200 lines)
- ❌ `scripts/scrapePlayerImages.js` (155 lines)
- ❌ `scripts/retry-failed-players.js` (89 lines)

**Total removed:** ~600 lines of redundant code

## Files Modified

### `scripts/generate-2026-cards.js`
- Added `https` module import
- Added `delay()` helper for rate limiting
- Added `fetchHTML()` with retry/redirect handling
- Added `findBBRefId()` to search for player pages
- Added `getHeadshotUrl()` to extract image URLs
- Added `fetchPlayerImage()` wrapper function
- Updated main loop to fetch images sequentially
- Changed output format to `{"cards": [...]}` for R2 compatibility
- Fixed path handling (now uses `path.join(__dirname, '..')`)

### `scripts/README.md`
- Complete rewrite with focus on main workflow
- Documented the all-in-one card generation process
- Added typical workflow section
- Removed references to deleted scripts
- Added expected runtime and notes about rate limiting

### `README.md` (project root)
- Updated Scripts & Utilities section
- Emphasized all-in-one nature of `generate-2026-cards.js`
- Streamlined workflow documentation

## Benefits

### 1. Simplified Workflow
- **Before:** 4 manual steps
- **After:** 1 command generates everything

### 2. Consistency
- Images are always included during card generation
- No risk of version mismatch between cards and images
- Single source of truth

### 3. Maintainability
- All card generation logic in one file
- Easier to debug issues
- Clear separation: `generate-2026-cards.js` → `r2-upload.js` → done

### 4. Error Handling
- Built-in rate limiting
- Automatic retries for HTTP errors
- Graceful failure (null photoUrl)

## Usage

### Generate Cards (with Images)
```bash
cd scripts
node generate-2026-cards.js
```

**Output:**
```
🏀 Generating 2026 Player Cards with Images...

Found 507 players in 2026 season

[1/507] LeBron James
  ✅ Image found
[2/507] Stephen Curry
  ✅ Image found
[3/507] Kevin Durant
  ⚠️  No image found
...

✅ Generated 507 cards
🖼️  Images found: 492/507
⚠️  Images missing: 15/507

📊 Rarity Distribution:
   Legendary (90+):    5 players
   Gold Rare (85-89):  12 players
   Gold (80-84):       28 players
   ...

💾 Card data exported to: basketball-stats-api/exports/2026-cards.json
```

### Upload to R2
```bash
cd scripts
node r2-upload.js
```

### Reload Backend Cache
```bash
curl -X POST http://localhost:8080/api/cards/advanced/cache/reload
```

## Performance

**Expected Runtime:** ~20 minutes for 507 players
- 2 seconds per player (rate limiting)
- 507 players × 2s = 1,014 seconds ≈ 17 minutes
- Plus processing time ≈ 20 minutes total

**Image Success Rate:** ~97% (492/507 based on current data)
- Most active players have Basketball Reference pages
- Missing images get `null` photoUrl (frontend shows placeholder)

## Future Improvements

Potential optimizations (if needed):
- [ ] Cache BBRef player IDs to speed up reruns
- [ ] Parallel image fetching with rate limit pool
- [ ] Fallback to NBA.com CDN for missing images
- [ ] Resume capability for interrupted runs

## Conclusion

The scripts folder is now streamlined with a clear, single-command workflow for card generation. This consolidation eliminates confusion, reduces maintenance burden, and makes the data pipeline much easier to understand and use.

**Before:** 7 scripts, unclear workflow, manual coordination
**After:** 3 core scripts, clear pipeline, automated workflow
