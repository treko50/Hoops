# Hoops - Basketball Statistics Platform

A comprehensive basketball statistics platform with card generation and visualization.

## Repository Structure

```
Hoops/
├── .gitignore                          # Git ignore rules (includes credentials)
├── README.md                           # This file
├── CARD_SYSTEM_SUMMARY.md              # Card system documentation
│
├── basketball-stats-api/               # Spring Boot Backend API
│   ├── src/                            # Java source code
│   ├── exports/                        # Generated player data JSONs
│   │   ├── 2026.json                   # 2026 season raw data
│   │   └── 2026-cards.json             # 2026 generated cards
│   └── pom.xml                         # Maven configuration
│
├── hoops-card-ui/                      # React UI Component Library
│   ├── src/                            # React components
│   │   ├── components/                 # PlayerCard, CardGrid
│   │   ├── styles/                     # CSS files
│   │   └── demo.jsx                    # Demo application
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md                       # Component library docs
│   └── INTEGRATION_EXAMPLE.md          # How to use in other apps
│
├── utils/                              # Shared utilities
│   └── ratingCalculator.js             # FIFA-style rating calculator
│
├── generate-2026-cards.js              # Card generation script
└── serviceAccountKey.json              # Firebase credentials (gitignored)
```

## Components

### 1. Basketball Stats API (Spring Boot)
**Location**: `basketball-stats-api/`

The main backend application built with Spring Framework.

**Responsibilities**:
- RESTful API endpoints for player data
- Data scraping from Basketball Reference
- Data processing and storage
- Card generation via API
- Upload to Cloudflare R2 storage

**Tech Stack**:
- Java + Spring Boot
- Maven
- Firebase Admin SDK (for Firestore)

### 2. Hoops Card UI (React Library)
**Location**: `hoops-card-ui/`

Reusable React component library for displaying FIFA Ultimate Team style basketball cards.

**Components**:
- `PlayerCard` - Individual player card
- `CardGrid` - Responsive grid layout

**Features**:
- Rarity-based styling (Bronze, Silver, Gold, Legendary)
- Responsive design
- Hover animations
- Ready for npm publishing

**Development**:
```bash
cd hoops-card-ui
npm install
npm run dev        # Start demo at http://localhost:5173
npm run build      # Build for production
```

### 3. Card Generation System
**Location**: `generate-2026-cards.js`, `utils/ratingCalculator.js`

Generates player cards with FIFA-style ratings.

**Usage**:
```bash
node generate-2026-cards.js
```

**Output**: `basketball-stats-api/exports/2026-cards.json` (507 cards)

## Getting Started

### Backend (Spring Boot)
```bash
cd basketball-stats-api
mvn clean install
mvn spring-boot:run
```

### UI Library Development
```bash
cd hoops-card-ui
npm install
npm run dev
```

### Generate Player Cards
```bash
node generate-2026-cards.js
```

## Data Flow

1. **Data Scraping** (Backend): Basketball Reference → Spring API → JSON exports
2. **Card Generation**: JSON data → `generate-2026-cards.js` → Card data
3. **UI Display**: Card data → React components → User interface

## Card Rating System

Players are rated on a 0-99 scale using position-specific weights:

- **Point Guard (PG)**: 30% Assists, 20% Points, 15% Steals
- **Shooting Guard (SG)**: 30% Points, 15% Assists, 10% 3PT%
- **Small Forward (SF)**: Balanced across all stats
- **Power Forward (PF)**: 25% Rebounds, 25% Points, 15% Blocks
- **Center (C)**: 30% Rebounds, 20% Blocks, 20% Points

**Rarity Tiers**:
- Legendary: 90+ rating
- Gold Rare: 85-89
- Gold: 80-84
- Silver Rare: 75-79
- Silver: 65-74
- Bronze: 40-64

## Environment Setup

### Required Files (Not in Git)
- `serviceAccountKey.json` - Firebase Admin credentials
- `.env` files (if needed for local config)

### Git Ignored Items
- `node_modules/`
- Build outputs (`dist/`, `target/`)
- Credentials (`serviceAccountKey.json`, `.env`)
- IDE files (`.vscode/`, `.idea/`)
- Logs and temporary files

## Development Workflow

### Adding New Features

1. **Backend**: Add endpoints in `basketball-stats-api/src/`
2. **Frontend**: Add components in `hoops-card-ui/src/components/`
3. **Utilities**: Add shared code in `utils/`

### Data Updates

1. Run data scraping via Spring API
2. Generate cards: `node generate-2026-cards.js`
3. Deploy to R2 via Spring API

## Deployment

### Backend
```bash
cd basketball-stats-api
mvn clean package
java -jar target/basketball-stats-api.jar
```

### UI Library
```bash
cd hoops-card-ui
npm run build
npm publish  # When ready
```

## Integration with Other Apps

The `hoops-card-ui` library can be installed in any React app:

```bash
npm install ../path/to/hoops-card-ui

# Or when published
npm install hoops-card-ui
```

Usage:
```jsx
import { PlayerCard, CardGrid } from 'hoops-card-ui';

<CardGrid cards={cardData} />
```

See `hoops-card-ui/INTEGRATION_EXAMPLE.md` for detailed examples.

## Key Technologies

- **Backend**: Java, Spring Boot, Maven
- **Frontend**: React, Vite
- **Data**: Firebase Firestore, Cloudflare R2
- **Scraping**: Cheerio, Axios (will be moved to backend)
- **Styling**: CSS, Gradients, Responsive design

## Documentation

- `CARD_SYSTEM_SUMMARY.md` - Complete card system overview
- `hoops-card-ui/README.md` - Component library documentation
- `hoops-card-ui/INTEGRATION_EXAMPLE.md` - Integration guide

## Future Enhancements

- [ ] Player photos and team logos
- [ ] Special card types (TOTW, Icons, Flashback)
- [ ] Card animations and pack opening
- [ ] User collections and trading
- [ ] Historical cards (2003-2025)
- [ ] Mobile app integration
- [ ] Real-time stats updates

## License

ISC

## Maintenance Notes

### Cleanup Completed (2026-01-07)
- ✅ Removed `shared-base-module/` (Express app superseded by Spring)
- ✅ Removed old scraping scripts (moved to backend)
- ✅ Removed debug files
- ✅ Removed root `node_modules/` (no longer needed)
- ✅ Extracted rating calculator to `utils/`
- ✅ Added comprehensive `.gitignore`
- ✅ Credentials properly ignored from Git

The repository is now clean and organized with clear separation between backend, frontend, and utilities.
