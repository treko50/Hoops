# Basketball Stats API - Quick Start Guide

## What We Built

A complete **Spring Boot REST API** for basketball statistics and FIFA Ultimate Team style card generation.

### Core Features

✅ **Player Statistics API** - Season and career stats (2003-2021)
✅ **Live Game Data** - Real-time NBA game scores
✅ **Player Comparisons** - Side-by-side stat comparisons
✅ **Leaderboards** - Top players by category
✅ **Card Generation** - FIFA UT style player cards with ratings
✅ **Auto-Updates** - Scheduled daily scraping (disabled by default)
✅ **Caching** - Caffeine in-memory caching for performance
✅ **API Documentation** - Interactive Swagger UI

## Prerequisites

1. **Java 17** - [Download](https://adoptium.net/)
2. **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
3. **Firebase credentials** - `serviceAccountKey.json` (already copied ✓)

## ⚠️ CRITICAL: Firestore Quota Protection

**Your API has built-in protections to prevent quota exhaustion:**

✅ **All endpoints are cached** - Subsequent requests hit cache, not Firestore
✅ **Pagination is limited** - Max offset: 500, Max limit: 100
✅ **DevTools disabled** - Prevents repeated initialization
✅ **Swagger try-it-out disabled** - Prevents accidental API execution

**Firestore Free Tier:** 50,000 reads/day

**How offset() works:**
- `offset(0), limit(50)` = **50 reads**
- `offset(50), limit(50)` = **100 reads** (50 skipped + 50 returned)
- `offset(100), limit(50)` = **150 reads** (100 skipped + 50 returned)

**Never paginate beyond offset 500** or you'll exhaust the quota!

## Quick Start (3 Steps)

### 1. Build the Project

```bash
cd basketball-stats-api
build.bat
```

This will download dependencies and compile the application.

### 2. Run the Application

```bash
run.bat
```

The API will start on **http://localhost:8080**

### 3. Test the API

Open your browser to:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/health

## API Endpoints

### Player APIs

```
GET /api/players
    - Get all players
    - Query params: position, team, limit, offset

GET /api/players/{id}
    - Get player with current season and career stats

GET /api/players/{id}/stats/season/{year}
    - Get player stats for specific season

GET /api/players/{id}/stats/career
    - Get career statistics
```

### Game APIs

```
GET /api/games/live
    - Get currently live games

GET /api/games/date/{date}
    - Get games for specific date (YYYY-MM-DD format)

POST /api/games/polling/start
    - Start live game polling

POST /api/games/polling/stop
    - Stop live game polling
```

### Comparison APIs

```
GET /api/compare?ids=player1,player2,player3
    - Compare 2-4 players side-by-side
```

### Leaderboard APIs

```
GET /api/leaderboards/{category}
    - Get top players by category
    - Categories: points, rebounds, assists, steals, blocks
    - Query params: season (default: 2021), limit (default: 10)

GET /api/leaderboards
    - List available categories
```

### Card Generation APIs

```
POST /api/cards/generate?playerId={id}&cardType={type}
    - Generate FIFA UT style player card
    - Card types: base, totw, icon, legendary, flashback

GET /api/cards/types
    - List available card types
```

## Example Requests

### Get All Players
```
http://localhost:8080/api/players?limit=10
```

### Get Player Stats
```
http://localhost:8080/api/players/lebron-james
```

### Compare Two Players
```
http://localhost:8080/api/compare?ids=lebron-james,kevin-durant
```

### Get Points Leaders
```
http://localhost:8080/api/leaderboards/points?season=2021&limit=10
```

### Generate Player Card
```
POST http://localhost:8080/api/cards/generate?playerId=lebron-james&cardType=legendary
```

## Configuration

Edit `src/main/resources/application.properties` to customize:

```properties
# Server port
server.port=8080

# Enable/disable features
scheduler.enabled=false          # Daily scraping (set to true to enable)
live.polling.enabled=false       # Live game polling (set to true to enable)

# Scheduler settings
scheduler.daily.cron=0 0 2 * * *        # Daily at 2 AM
scheduler.weekly.cron=0 0 3 * * SUN     # Sunday at 3 AM
scheduler.timezone=America/New_York

# Live polling settings
live.polling.interval.seconds=10
```

## Project Structure

```
basketball-stats-api/
├── src/main/java/com/hoops/stats/
│   ├── BasketballStatsApplication.java     # Main entry point
│   │
│   ├── config/
│   │   ├── FirebaseConfig.java             # Firebase Admin SDK setup
│   │   └── CacheConfig.java                # Caffeine caching config
│   │
│   ├── model/
│   │   ├── Player.java                     # Player entity
│   │   ├── PlayerStats.java                # Stats entity
│   │   └── Game.java                       # Game entity
│   │
│   ├── repository/
│   │   └── PlayerRepository.java           # Firestore data access
│   │
│   ├── service/
│   │   ├── PlayerService.java              # Player business logic
│   │   ├── ComparisonService.java          # Comparison logic
│   │   ├── LeaderboardService.java         # Leaderboard logic
│   │   ├── BallDontLieApiService.java      # Live game API client
│   │   ├── LiveGameService.java            # Live game polling
│   │   └── CareerStatsService.java         # Career stats aggregation
│   │
│   ├── controller/
│   │   ├── HealthController.java           # Health endpoints
│   │   ├── PlayerController.java           # Player APIs
│   │   ├── GameController.java             # Game APIs
│   │   ├── ComparisonController.java       # Comparison APIs
│   │   └── LeaderboardController.java      # Leaderboard APIs
│   │
│   ├── scraper/
│   │   └── BasketballReferenceScraper.java # Web scraping service
│   │
│   ├── scheduler/
│   │   └── DataUpdateScheduler.java        # Scheduled jobs
│   │
│   └── card/
│       ├── model/
│       │   └── PlayerCard.java             # Card model
│       ├── service/
│       │   ├── RatingCalculator.java       # Rating algorithm
│       │   └── CardGenerationService.java  # Card generation
│       └── controller/
│           └── CardController.java         # Card APIs
│
├── src/main/resources/
│   └── application.properties              # Configuration
│
├── serviceAccountKey.json                  # Firebase credentials
├── pom.xml                                 # Maven dependencies
├── build.bat                               # Build script
├── run.bat                                 # Run script
└── README.md                               # Full documentation
```

## Technology Stack

- **Java 17** - Programming language
- **Spring Boot 3.2.1** - Framework
- **Firebase Firestore** - Database (19 years of data)
- **Caffeine** - In-memory caching
- **JSoup** - Web scraping
- **OkHttp** - HTTP client
- **Lombok** - Boilerplate reduction
- **Swagger/OpenAPI** - API documentation
- **Maven** - Build tool

## Caching Strategy

| Cache | TTL | Max Size | Purpose |
|-------|-----|----------|---------|
| Player Info | 24h | 5,000 | Rarely changes |
| Season Stats | 12h | 5,000 | Daily updates |
| Career Stats | 24h | 5,000 | Infrequent changes |
| Leaderboards | 6h | 1,000 | Regular updates |
| Comparisons | 12h | 5,000 | Moderate changes |
| Live Games | 30s | 100 | Real-time data |

## Card Rating System

Players are rated **40-99** (like FIFA Ultimate Team):

### Position-Specific Weights

**Point Guard (PG):**
- Assists: 30%
- Points: 20%
- Steals: 15%

**Shooting Guard (SG):**
- Points: 30%
- 3PT%: 10%
- Steals: 15%

**Small Forward (SF):**
- Balanced all-around (25% points, 15% assists, 15% rebounds)

**Power Forward (PF):**
- Rebounds: 25%
- Points: 25%
- Blocks: 15%

**Center (C):**
- Rebounds: 30%
- Blocks: 20%
- Points: 20%

### Card Rarities

| Rating | Rarity | Color |
|--------|--------|-------|
| 90-99 | Legendary | Purple |
| 85-89 | Gold Rare | Orange |
| 80-84 | Gold | Gold |
| 75-79 | Silver Rare | Light Silver |
| 65-74 | Silver | Silver |
| 40-64 | Bronze | Bronze |

### Special Cards

- **TOTW** (Team of the Week) - +3 rating
- **Icon** - +5 rating
- **Legendary** - +7 rating
- **Flashback** - +4 rating

## Monitoring

Access actuator endpoints:

```
GET /actuator/health        - Application health
GET /actuator/metrics       - Application metrics
GET /actuator/cache         - Cache statistics
```

## Troubleshooting

### Port 8080 already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /F /PID <pid>
```

### Maven not found
Download and install Maven from https://maven.apache.org/download.cgi
Add Maven `bin` directory to PATH

### Firebase connection error
Ensure `serviceAccountKey.json` is in the project root directory

### Build errors
```bash
# Clean Maven cache
mvn clean

# Update dependencies
mvn dependency:purge-local-repository
```

## Next Steps

1. **Test all endpoints** using Swagger UI
2. **Enable scheduler** for daily updates (set `scheduler.enabled=true`)
3. **Enable live polling** for real-time games (set `live.polling.enabled=true`)
4. **Deploy to production** (Railway, Render, or your VPS)

## Support

- **Full Documentation**: See `README.md`
- **API Reference**: http://localhost:8080/swagger-ui.html
- **Issues**: Report on GitHub

---

**Enjoy your Basketball Stats API!** 🏀
