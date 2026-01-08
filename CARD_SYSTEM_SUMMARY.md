# 2026 Player Card System - Implementation Summary

## What Was Built

### 1. Card Data Generation (`generate-2026-cards.js`)

A script that processes all 507 players from the 2026 season and generates card data:

**Location**: `generate-2026-cards.js` (root directory)

**What it does**:
- Reads player stats from `basketball-stats-api/exports/2026.json`
- Calculates FIFA-style overall ratings (40-99 scale) using position-specific weights
- Assigns rarity tiers based on rating:
  - Legendary: 90+ (0 players currently)
  - Gold Rare: 85-89 (0 players)
  - Gold: 80-84 (1 player - Nikola Jokić)
  - Silver Rare: 75-79 (2 players)
  - Silver: 65-74 (7 players)
  - Bronze: 40-64 (497 players)
- Exports card data to `basketball-stats-api/exports/2026-cards.json`

**Usage**:
```bash
node generate-2026-cards.js
```

**Top Rated Players**:
1. Nikola Jokić (80 - Gold)
2. Luka Dončić (76 - Silver Rare)
3. Victor Wembanyama (75 - Silver Rare)
4. Giannis Antetokounmpo (70 - Silver)
5. Cade Cunningham (69 - Silver)

### 2. Common UI Library (`hoops-card-ui/`)

A reusable React component library for displaying player cards across any application.

**Location**: `hoops-card-ui/` directory

**Key Features**:
- FIFA Ultimate Team inspired design
- Rarity-based color gradients
- Responsive layout (mobile-friendly)
- Hover animations and effects
- Framework-ready for npm publishing

**Components**:

#### PlayerCard
- Displays individual player card with:
  - Overall rating and position badge
  - Player name
  - Stats (PPG, RPG, APG, FG%)
  - Team info
  - Rarity badge
  - Games played
  - Gradient background based on rarity

#### CardGrid
- Responsive grid layout for multiple cards
- Auto-adjusts columns based on screen size
- Handles card click events

### 3. Interactive Demo Application

A full-featured demo showing all 2026 player cards.

**Features**:
- Search by player name or team
- Filter by rarity (All, Legendary, Gold Rare, Gold, Silver Rare, Silver, Bronze)
- Responsive grid display
- Card click handling
- Live player count per rarity
- Sorting by overall rating

**Access the demo**:
```bash
cd hoops-card-ui
npm run dev
```
Then visit: http://localhost:5173/

## Project Structure

```
Hoops/
├── generate-2026-cards.js              # Card generation script
├── basketball-stats-api/
│   └── exports/
│       ├── 2026.json                   # Raw player data
│       └── 2026-cards.json             # Generated card data (507 cards)
├── shared-base-module/
│   └── src/
│       └── cards/
│           ├── ratingCalculator.js     # Rating calculation logic
│           ├── generators/             # Card generators (used by backend)
│           └── templates/              # SVG templates (backend)
└── hoops-card-ui/                      # New common UI library
    ├── package.json
    ├── vite.config.js
    ├── README.md
    ├── src/
    │   ├── components/
    │   │   ├── PlayerCard.jsx          # Main card component
    │   │   └── CardGrid.jsx            # Grid layout component
    │   ├── styles/
    │   │   ├── PlayerCard.css          # Card styles
    │   │   ├── CardGrid.css            # Grid styles
    │   │   └── demo.css                # Demo app styles
    │   ├── index.js                    # Library exports
    │   └── demo.jsx                    # Demo application
    └── dist/                           # Build output (after npm run build)
```

## How to Use in Other Apps

### Option 1: Local Development (Monorepo)

Install as a local package in another React app:

```bash
cd your-other-app
npm install ../path/to/hoops-card-ui
```

Then import:

```jsx
import { PlayerCard, CardGrid } from 'hoops-card-ui';

// Load card data
const cards = await fetch('/api/2026-cards').then(r => r.json());

// Use components
<CardGrid cards={Object.values(cards)} />
```

### Option 2: Extract to Separate Repo (Future)

When ready to publish independently:

1. Move `hoops-card-ui/` to its own repository
2. Publish to npm: `npm publish`
3. Install in any app: `npm install hoops-card-ui`

## Card Data Format

Cards use this JSON structure (compatible with backend):

```json
{
  "playerId": "nikola-jokic",
  "playerName": "Nikola Jokić",
  "position": "C",
  "overallRating": 80,
  "rarity": "gold",
  "team": "DEN",
  "teamAbbr": "DEN",
  "age": 28,
  "gamesPlayed": 36,
  "stats": {
    "ppg": "31.5",
    "rpg": "13.1",
    "apg": "9.2",
    "spg": "1.2",
    "bpg": "0.7",
    "fgPct": "58.5%",
    "fg3Pct": "35.2%",
    "ftPct": "81.6%",
    "mpg": "34.2"
  },
  "rawStats": { /* detailed stats */ },
  "gradient": ["#DAA520", "#FFD700", "#FFA500"],
  "cardType": "base",
  "season": 2026,
  "generatedAt": "2026-01-07T..."
}
```

## Rating Calculation System

The rating calculator uses position-specific weights:

**Point Guard (PG)**:
- 30% Assists
- 20% Points
- 15% Steals
- 10% Rebounds, FG%, 3PT%
- 5% Blocks, FT%

**Shooting Guard (SG)**:
- 30% Points
- 15% Assists, Steals
- 10% Rebounds, FG%, 3PT%
- 5% Blocks, FT%

**Small Forward (SF)**: Balanced
**Power Forward (PF)**: Emphasis on rebounds, blocks
**Center (C)**: Emphasis on rebounds, blocks, interior scoring

**Bonuses**:
- +3 for 28+ PPG (superstar scorer)
- +2 for elite efficiency (55%+ FG)
- +4 for triple-double threats
- -3 penalty for high volume, low efficiency

## Next Steps

### Recommended Enhancements:

1. **Player Photos**: Add actual player images to replace initials
2. **Team Logos**: Integrate team logo images
3. **Special Cards**: Generate TOTW, Icon, Legendary, Flashback variants
4. **Card Animations**: Add flip animations, pack opening effects
5. **Backend API**: Create Express endpoints to serve cards dynamically
6. **Database**: Store card data in Firebase/database instead of JSON
7. **User Collections**: Allow users to collect and trade cards
8. **Card Packs**: Implement pack opening system with rarity probabilities
9. **Comparison Mode**: Side-by-side player comparisons
10. **Historical Cards**: Generate cards for previous seasons (2003-2025)

### Publishing the UI Library:

When ready to publish `hoops-card-ui` to npm:

```bash
cd hoops-card-ui
npm run build
npm publish
```

Then any app can install it:
```bash
npm install hoops-card-ui
```

## Files Generated

1. ✅ `generate-2026-cards.js` - Card generation script
2. ✅ `basketball-stats-api/exports/2026-cards.json` - 507 player cards
3. ✅ `hoops-card-ui/` - Complete React UI library
4. ✅ `hoops-card-ui/README.md` - Library documentation
5. ✅ `CARD_SYSTEM_SUMMARY.md` - This file

## Development Commands

```bash
# Generate/regenerate 2026 cards
node generate-2026-cards.js

# Start UI demo
cd hoops-card-ui
npm run dev

# Build UI library
cd hoops-card-ui
npm run build

# Preview production build
cd hoops-card-ui
npm run preview
```

## Summary

You now have:
- ✅ 507 player cards generated for 2026 season
- ✅ Reusable React component library (`hoops-card-ui`)
- ✅ Interactive demo application with search/filter
- ✅ Clean separation ready for monorepo or separate repo
- ✅ FIFA Ultimate Team inspired card design
- ✅ Ready to integrate into any React application

The card data is stored in JSON format and the UI components can be imported into any React app. When you're ready, the `hoops-card-ui` library can be extracted to its own repository and published to npm for use across multiple applications.
