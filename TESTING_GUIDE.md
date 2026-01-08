# Testing Both Applications Together

## ✅ Current Status

Both applications are running and connected:

### Backend (Spring Boot)
- **Status**: ✅ Running
- **Port**: 8080
- **URL**: http://localhost:8080
- **Data Loaded**: 11,873 players across all seasons (2003-2026)
- **2026 Season**: 507 players loaded in-memory

### Frontend (React/Vite)
- **Status**: ✅ Running
- **Port**: 5173
- **URL**: http://localhost:5173
- **Connected to**: Backend API at localhost:8080

---

## 🧪 Testing the Integration

### 1. View the Card UI Demo
Open in your browser:
```
http://localhost:5173
```

You should see:
- All 507 player cards from 2026 season
- Search functionality
- Filter by rarity
- Responsive card grid

### 2. Test Backend API Endpoints

#### Get All 2026 Cards
```bash
curl http://localhost:8080/api/cards/season/2026
```

Expected: JSON object with all 507 cards

#### Get Player Data
```bash
curl http://localhost:8080/api/players/nikola-jokic
```

Expected: Player details with stats

#### Get Specific Season Stats
```bash
curl http://localhost:8080/api/players/nikola-jokic/stats/season/2026
```

Expected: 2026 season stats for Jokic

#### Generate a Card (On-demand)
```bash
curl -X POST "http://localhost:8080/api/cards/generate?playerId=nikola-jokic&cardType=base"
```

Expected: Generated card data with rating

### 3. Test API Documentation (Swagger)
Open in your browser:
```
http://localhost:8080/swagger-ui.html
```

You should see:
- Complete API documentation
- All available endpoints
- Try-it-out functionality (disabled by default to prevent quota exhaustion)

### 4. Check Health
```bash
curl http://localhost:8080/actuator/health
```

Expected: `{"status":"UP"}`

---

## 🔍 What To Test in the UI

### Search Functionality
1. Type a player name in the search box
2. Cards should filter in real-time
3. Try: "Jokic", "Giannis", "Luka"

### Filter by Rarity
1. Click different rarity buttons:
   - All (507 players)
   - Gold (1 player - Nikola Jokić)
   - Silver Rare (2 players)
   - Silver (7 players)
   - Bronze (497 players)

### Card Interactions
1. Hover over cards - should see hover effect
2. Click a card - should log to console
3. Cards should be sorted by rating (highest first)

### Responsive Design
1. Resize browser window
2. Cards should reflow in responsive grid
3. Works on mobile, tablet, desktop

---

## 🛠️ Available API Endpoints

### Player Endpoints
- `GET /api/players` - Get all players (with filters)
- `GET /api/players/{id}` - Get player by ID
- `GET /api/players/{id}/stats/season/{year}` - Get season stats
- `GET /api/players/{id}/stats/career` - Get career stats

### Card Endpoints
- `GET /api/cards/season/{year}` - Get all cards for season (NEW!)
- `POST /api/cards/generate` - Generate single card
- `GET /api/cards/types` - List card types
- `POST /api/cards/bulk/generate` - Generate all cards for season
- `GET /api/cards/stored` - Get stored cards from R2
- `GET /api/cards/bulk/stats` - Get compression stats

### Other Endpoints
- `GET /api/leaderboard` - Top players by stat
- `GET /api/compare` - Compare multiple players
- `GET /api/games` - Game data
- `GET /actuator/health` - Health check

---

## 📊 Data Flow

```
User Browser (localhost:5173)
    ↓
    Fetch from localhost:8080/api/cards/season/2026
    ↓
Spring Boot API
    ↓
    Reads from exports/2026-cards.json
    ↓
    Returns JSON to frontend
    ↓
React Components (PlayerCard, CardGrid)
    ↓
    Renders 507 cards with FIFA Ultimate Team styling
```

---

## 🎯 Test Scenarios

### Scenario 1: View Top Players
1. Open http://localhost:5173
2. Cards should load automatically
3. Top card should be Nikola Jokić (80 rating, Gold)
4. Second should be Luka Dončić (76 rating, Silver Rare)

### Scenario 2: Search for a Player
1. Type "Giannis" in search
2. Should see Giannis Antetokounmpo card (70 rating, Silver)
3. All other cards should be hidden

### Scenario 3: Filter by Rarity
1. Click "Gold" button
2. Should see only 1 card (Nikola Jokić)
3. Click "Silver" button
4. Should see 7 cards

### Scenario 4: Backend Card Generation
```bash
# Generate a special card (TOTW - Team of the Week)
curl -X POST "http://localhost:8080/api/cards/generate?playerId=luka-doncic&cardType=totw"
```
Expected: Luka card with +3 rating boost (79 instead of 76)

### Scenario 5: Compare Players
```bash
curl "http://localhost:8080/api/compare?ids=nikola-jokic,luka-doncic,giannis-antetokounmpo"
```
Expected: Side-by-side comparison data

---

## 🚨 Troubleshooting

### Frontend Not Loading Cards
**Issue**: Cards won't load, shows "Loading..." forever

**Solution**:
1. Check backend is running: `curl http://localhost:8080/actuator/health`
2. Check CORS: Open browser console (F12) - should not see CORS errors
3. Verify endpoint: `curl http://localhost:8080/api/cards/season/2026`

### CORS Errors
**Issue**: "Access to fetch at ... has been blocked by CORS policy"

**Solution**:
- Backend has CORS enabled for localhost:5173
- If still having issues, check basketball-stats-api/src/main/java/com/hoops/stats/config/CorsConfig.java

### Backend Not Responding
**Issue**: Cannot reach localhost:8080

**Solution**:
1. Check if Spring Boot is running
2. Look for "Tomcat started on port 8080" in logs
3. Restart backend if needed:
   ```bash
   cd basketball-stats-api
   ./mvnw.cmd spring-boot:run
   ```

### Cards Look Wrong
**Issue**: Cards display but styling is off

**Solution**:
- Make sure hoops-card-ui CSS files are loaded
- Check browser console for CSS errors
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

## 📝 Next Steps

After testing, you can:

1. **Add Player Photos**: Update cards with actual player images
2. **Add Team Logos**: Include team logos in card display
3. **Generate Special Cards**: Use the TOTW, Icon, Legendary endpoints
4. **Build Collection System**: Allow users to save favorite cards
5. **Deploy**: Prepare both apps for production deployment

---

## 🎉 Success Criteria

You've successfully tested when:
- ✅ Frontend loads at localhost:5173
- ✅ Cards display from backend API
- ✅ Search works
- ✅ Filters work
- ✅ Backend responds to API calls
- ✅ Swagger docs are accessible
- ✅ All 507 cards are visible

**Both applications are fully integrated and working!**
