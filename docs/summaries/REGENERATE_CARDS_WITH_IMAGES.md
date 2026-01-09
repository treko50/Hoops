# Regenerate Advanced Cards with Player Images

## What Changed

✅ **Image URL generation integrated** into `AdvancedCardGenerationService`
- Automatically generates image URLs with player initials and team colors
- Uses UI Avatars API (instant, no rate limits)
- Team-colored backgrounds (e.g., Lakers purple, Warriors blue)

✅ **Removed legacy code**:
- Removed `CardGenerationService` (old single-card generation)
- Removed `BulkCardGenerationService` (individual per-player files)
- Removed `CardStorageService` (reads individual player files)
- Removed 6 legacy API endpoints from `CardController`

## Step 1: Regenerate Advanced Cards with Images

### Option A: Using the API (Recommended)

1. **Make sure Spring Boot API is running**:
   ```bash
   cd basketball-stats-api
   ./mvnw.cmd spring-boot:run
   ```

2. **Call the generation endpoint**:
   ```bash
   curl -X POST "http://localhost:8080/api/cards/advanced/generate/2026"
   ```

3. **Wait for completion** (should take 1-2 minutes for ~500 players)
   - You'll see logs showing progress
   - Response will include stats (file size, player count, etc.)

4. **Reload the cache**:
   ```bash
   curl -X POST "http://localhost:8080/api/cards/advanced/cache/reload"
   ```

### Option B: Manual Update (if you have the JSON downloaded)

If you already have `advanced-cards.json` downloaded:

1. **Update with images**:
   ```bash
   node addPlayerImagesSimple.js update C:\Users\Tarek Halabi\Downloads\advanced-cards.json advanced-cards-updated.json
   ```

2. **Upload to R2** (you'll need AWS CLI configured for R2):
   ```bash
   aws s3 cp advanced-cards-updated.json s3://hoops/advanced-cards.json --endpoint-url <YOUR_R2_ENDPOINT>
   ```

3. **Reload cache via API**:
   ```bash
   curl -X POST "http://localhost:8080/api/cards/advanced/cache/reload"
   ```

## Step 2: Clean Up Legacy R2 Files

### What to Delete

The `cards/2026/` folder in R2 contains individual player files like:
- `cards/2026/lebron-james.json.gz`
- `cards/2026/stephen-curry.json.gz`
- etc. (one file per player)

**These are no longer used!** The app now uses only `advanced-cards.json`.

### How to Delete

#### Option 1: Using AWS CLI

```bash
# List files in cards folder
aws s3 ls s3://hoops/cards/2026/ --endpoint-url <YOUR_R2_ENDPOINT>

# Delete the entire cards folder
aws s3 rm s3://hoops/cards/ --recursive --endpoint-url <YOUR_R2_ENDPOINT>
```

#### Option 2: Using Cloudflare Dashboard

1. Go to Cloudflare R2 dashboard
2. Open the `hoops` bucket
3. Navigate to `cards/` folder
4. Delete the entire `cards/` folder

## Step 3: Verify Everything Works

1. **Check cache stats**:
   ```bash
   curl "http://localhost:8080/api/cards/advanced/cache/stats"
   ```
   Should show:
   - Total cards loaded
   - Cache ready: true

2. **Test frontend**:
   - Open http://localhost:5174
   - Go to Browse or Compare pages
   - Player cards should display with image placeholders showing initials

3. **Test a specific player**:
   ```bash
   curl "http://localhost:8080/api/cards/advanced/lebron-james"
   ```
   Should return a card with `photoUrl` populated

## What the Image URLs Look Like

Example for LeBron James (Lakers):
```
https://ui-avatars.com/api/?name=LeBron%20James&size=400&bold=true&background=552583&color=ffffff
```

- Shows "LJ" initials
- Lakers purple background (#552583)
- White text
- 400x400px size

## Expected Results

After regeneration:
- ✅ All 500+ players have `photoUrl` field populated
- ✅ Images display instantly (no broken images)
- ✅ Team colors match each player's team
- ✅ R2 storage reduced (no individual player files)
- ✅ Faster frontend loads (single file instead of 500+)

## Troubleshooting

### "R2 data not loaded"
- Make sure R2 is configured in `application.properties`
- Check that `r2.enabled=true`

### "Cache not ready"
- Wait a few seconds after API startup
- Check logs for R2 connection errors

### Images not showing on frontend
- Clear browser cache
- Check that cache was reloaded after regeneration
- Verify photoUrl in API response

## Next Steps

After this cleanup, you can:
1. Optionally add real NBA headshot URLs later (if you get access to NBA API)
2. Focus on other features (the image system is now automated)
3. Every time you regenerate cards, images will be included automatically
