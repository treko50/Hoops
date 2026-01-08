# Hoops Card UI

A reusable React component library for displaying FIFA Ultimate Team style basketball player cards.

## Features

- **PlayerCard Component**: Individual player card with stats, rating, and rarity
- **CardGrid Component**: Responsive grid layout for multiple cards
- **FIFA-Inspired Design**: Gradient backgrounds, rarity-based styling, and polished UI
- **Fully Typed**: Ready for TypeScript integration
- **Responsive**: Mobile-friendly and adapts to different screen sizes
- **Framework Agnostic Data**: Works with any backend providing card data

## Installation

```bash
npm install hoops-card-ui
```

## Usage

### Basic Example

```jsx
import { PlayerCard, CardGrid } from 'hoops-card-ui';

// Single card
const cardData = {
  playerName: "Nikola Jokić",
  position: "C",
  overallRating: 80,
  rarity: "gold",
  team: "DEN",
  stats: {
    ppg: "31.5",
    rpg: "13.1",
    apg: "9.2",
    fgPct: "58.5%"
  },
  gradient: ["#DAA520", "#FFD700", "#FFA500"]
};

<PlayerCard cardData={cardData} onClick={(card) => console.log(card)} />

// Grid of cards
const cards = [cardData1, cardData2, cardData3];
<CardGrid cards={cards} onCardClick={(card) => console.log(card)} />
```

### Card Data Format

Cards expect the following data structure (matches the backend's 2026-cards.json format):

```javascript
{
  playerId: "nikola-jokic",
  playerName: "Nikola Jokić",
  position: "C",           // PG, SG, SF, PF, C
  overallRating: 80,       // 40-99
  rarity: "gold",          // bronze, silver, silver_rare, gold, gold_rare, legendary
  team: "DEN",
  teamAbbr: "DEN",
  age: 28,
  gamesPlayed: 36,
  stats: {
    ppg: "31.5",
    rpg: "13.1",
    apg: "9.2",
    spg: "1.2",
    bpg: "0.7",
    fgPct: "58.5%",
    fg3Pct: "35.2%",
    ftPct: "81.6%"
  },
  gradient: ["#DAA520", "#FFD700", "#FFA500"],
  cardType: "base",
  season: 2026
}
```

## Development

### Running the Demo

```bash
npm run dev
```

This starts a Vite dev server with a demo application showcasing all 2026 player cards.

### Building the Library

```bash
npm run build
```

Builds the library for production to the `dist` folder.

## Components

### PlayerCard

Individual player card component.

**Props:**
- `cardData` (Object, required): Card data object
- `onClick` (Function, optional): Click handler
- `className` (String, optional): Additional CSS class

### CardGrid

Responsive grid for displaying multiple cards.

**Props:**
- `cards` (Array, required): Array of card data objects
- `onCardClick` (Function, optional): Click handler for individual cards
- `columns` (Number, optional): Number of columns (default: auto-responsive)
- `className` (String, optional): Additional CSS class

## Rarity System

Cards are styled based on rarity:

- **Legendary** (90+): Purple/Pink gradient
- **Gold Rare** (85-89): Orange/Gold gradient
- **Gold** (80-84): Gold gradient
- **Silver Rare** (75-79): Light silver gradient
- **Silver** (65-74): Silver gradient
- **Bronze** (40-64): Bronze gradient

## Integration with Other Apps

This library is designed to be imported into any React application:

```bash
# In your app
npm install ../path/to/hoops-card-ui

# Or when published
npm install hoops-card-ui
```

Then import and use:

```jsx
import { PlayerCard, CardGrid } from 'hoops-card-ui';
```

## License

ISC
