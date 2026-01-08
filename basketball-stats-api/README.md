# Basketball Stats API

Spring Boot REST API for basketball player statistics and FIFA Ultimate Team style card generation.

## Features

- **Player Statistics**: Season and career stats for NBA players (2003-2021)
- **Live Game Data**: Real-time game scores via BallDontLie API
- **Player Comparisons**: Side-by-side player stat comparisons
- **Leaderboards**: Top players by various statistical categories
- **Card Generation**: FIFA UT style player cards (Bronze/Silver/Gold/Legendary)
- **Caching**: In-memory caching with Caffeine for optimal performance
- **Auto-Updates**: Scheduled daily scraping of latest stats

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Firebase Firestore** (Database)
- **Caffeine** (In-memory caching)
- **JSoup** (Web scraping)
- **Lombok** (Boilerplate reduction)
- **Swagger/OpenAPI** (API documentation)
- **Maven** (Build tool)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Firebase project with Firestore enabled
- Firebase service account key (`serviceAccountKey.json`)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd basketball-stats-api
   ```

2. **Add Firebase credentials**
   - Place your `serviceAccountKey.json` in the project root
   - Or set environment variable: `FIREBASE_CREDENTIALS_PATH`

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   Or with custom port:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8080
   ```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server port
server.port=8080

# Firebase credentials
firebase.credentials.path=serviceAccountKey.json

# Enable/disable features
scheduler.enabled=false
live.polling.enabled=false
```

## API Endpoints

### Players

- `GET /api/players` - Get all players (with filters)
- `GET /api/players/{id}` - Get player with stats
- `GET /api/players/{id}/stats/season/{year}` - Get season stats
- `GET /api/players/{id}/stats/career` - Get career stats

### Games

- `GET /api/games/live` - Get live games
- `GET /api/games/{gameId}` - Get game details

### Comparisons

- `GET /api/compare?ids=player1,player2` - Compare players

### Leaderboards

- `GET /api/leaderboards/{category}` - Get leaderboard
  - Categories: `points`, `rebounds`, `assists`, `steals`, `blocks`

### Health & Monitoring

- `GET /health` - Health check
- `GET /actuator/health` - Detailed health
- `GET /actuator/cache` - Cache statistics

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8080/api-docs

## Caching Strategy

| Cache Type | TTL | Max Size | Use Case |
|------------|-----|----------|----------|
| Player Info | 24h | 5,000 | Rarely changes |
| Season Stats | 12h | 5,000 | Daily updates |
| Career Stats | 24h | 5,000 | Infrequent changes |
| Leaderboards | 6h | 1,000 | Regular updates |
| Live Games | 30s | 100 | Real-time data |

## Project Structure

```
basketball-stats-api/
├── src/main/java/com/hoops/stats/
│   ├── config/           # Spring configurations
│   ├── controller/       # REST controllers
│   ├── model/            # Entity models
│   ├── repository/       # Firebase repositories
│   ├── service/          # Business logic
│   ├── scheduler/        # Cron jobs
│   ├── scraper/          # Web scraping
│   └── util/             # Utilities
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## Development

### Run tests
```bash
mvn test
```

### Package as JAR
```bash
mvn package
java -jar target/basketball-stats-api-1.0.0.jar
```

### Debug mode
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account key | `serviceAccountKey.json` |
| `FIREBASE_DATABASE_URL` | Firebase database URL | - |
| `SCHEDULER_ENABLED` | Enable daily scraping | `false` |
| `LIVE_POLLING_ENABLED` | Enable live game polling | `false` |

## License

MIT

## Author

Hoops Basketball Stats
