# Integration Example

How to use `hoops-card-ui` in your React applications.

## Quick Start

### 1. Install the Library

```bash
# Local development (from your app directory)
npm install ../path/to/hoops-card-ui

# Or when published to npm
npm install hoops-card-ui
```

### 2. Import Components

```jsx
import { PlayerCard, CardGrid } from 'hoops-card-ui';
```

### 3. Load Card Data

```jsx
import { useState, useEffect } from 'react';
import { CardGrid } from 'hoops-card-ui';

function MyApp() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // Option A: Load from static JSON
    fetch('/data/2026-cards.json')
      .then(res => res.json())
      .then(data => setCards(Object.values(data)));

    // Option B: Load from API
    fetch('/api/cards/2026')
      .then(res => res.json())
      .then(data => setCards(data));
  }, []);

  return <CardGrid cards={cards} onCardClick={(card) => console.log(card)} />;
}
```

## Full Example: Player Card Gallery

```jsx
import React, { useState, useEffect } from 'react';
import { CardGrid, PlayerCard } from 'hoops-card-ui';

function PlayerGallery() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState('all');

  // Load cards on mount
  useEffect(() => {
    fetch('/api/cards/2026')
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(err => console.error('Failed to load cards:', err));
  }, []);

  // Filter cards by rarity
  const filteredCards = cards.filter(card =>
    filter === 'all' || card.rarity === filter
  );

  // Handle card selection
  const handleCardClick = (card) => {
    setSelectedCard(card);
    // Show modal, navigate to detail page, etc.
  };

  return (
    <div>
      <h1>2026 Player Cards</h1>

      {/* Filter buttons */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('gold')}>Gold</button>
        <button onClick={() => setFilter('silver')}>Silver</button>
        <button onClick={() => setFilter('bronze')}>Bronze</button>
      </div>

      {/* Card grid */}
      <CardGrid
        cards={filteredCards}
        onCardClick={handleCardClick}
      />

      {/* Selected card modal (optional) */}
      {selectedCard && (
        <div className="modal">
          <h2>{selectedCard.playerName}</h2>
          <p>Rating: {selectedCard.overallRating}</p>
          <button onClick={() => setSelectedCard(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default PlayerGallery;
```

## Single Card Example

```jsx
import { PlayerCard } from 'hoops-card-ui';

function FeaturedPlayer() {
  const jokicCard = {
    playerId: "nikola-jokic",
    playerName: "Nikola Jokić",
    position: "C",
    overallRating: 80,
    rarity: "gold",
    team: "DEN",
    teamAbbr: "DEN",
    stats: {
      ppg: "31.5",
      rpg: "13.1",
      apg: "9.2",
      fgPct: "58.5%"
    },
    gradient: ["#DAA520", "#FFD700", "#FFA500"]
  };

  return (
    <div>
      <h2>Featured Player</h2>
      <PlayerCard
        cardData={jokicCard}
        onClick={() => alert('Clicked Jokic!')}
      />
    </div>
  );
}
```

## With Search and Sort

```jsx
import { useState, useMemo } from 'react';
import { CardGrid } from 'hoops-card-ui';

function SearchableCardGallery({ cards }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Filter and sort cards
  const displayCards = useMemo(() => {
    let filtered = cards.filter(card =>
      card.playerName.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.overallRating - a.overallRating;
      if (sortBy === 'name') return a.playerName.localeCompare(b.playerName);
      if (sortBy === 'ppg') return parseFloat(b.stats.ppg) - parseFloat(a.stats.ppg);
      return 0;
    });
  }, [cards, search, sortBy]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="rating">Overall Rating</option>
        <option value="name">Name</option>
        <option value="ppg">Points Per Game</option>
      </select>

      <CardGrid cards={displayCards} />
    </div>
  );
}
```

## Backend Integration

### Express API Example

```javascript
// server.js
const express = require('express');
const fs = require('fs');
const app = express();

// Serve all 2026 cards
app.get('/api/cards/2026', (req, res) => {
  const cards = JSON.parse(
    fs.readFileSync('./basketball-stats-api/exports/2026-cards.json', 'utf8')
  );
  res.json(Object.values(cards));
});

// Get specific player card
app.get('/api/cards/2026/:playerId', (req, res) => {
  const cards = JSON.parse(
    fs.readFileSync('./basketball-stats-api/exports/2026-cards.json', 'utf8')
  );
  const card = cards[req.params.playerId];

  if (card) {
    res.json(card);
  } else {
    res.status(404).json({ error: 'Card not found' });
  }
});

// Filter by rarity
app.get('/api/cards/2026/rarity/:rarity', (req, res) => {
  const cards = JSON.parse(
    fs.readFileSync('./basketball-stats-api/exports/2026-cards.json', 'utf8')
  );
  const filtered = Object.values(cards).filter(
    card => card.rarity === req.params.rarity
  );
  res.json(filtered);
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### React Query Example

```jsx
import { useQuery } from '@tanstack/react-query';
import { CardGrid } from 'hoops-card-ui';

function CardsWithQuery() {
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards', '2026'],
    queryFn: () => fetch('/api/cards/2026').then(res => res.json())
  });

  if (isLoading) return <div>Loading cards...</div>;
  if (error) return <div>Error loading cards</div>;

  return <CardGrid cards={cards} />;
}
```

## Styling and Customization

### Custom CSS

```css
/* Override card styles */
.player-card {
  width: 250px !important;
  height: 350px !important;
}

.player-card:hover {
  transform: scale(1.05) !important;
}

/* Custom grid layout */
.card-grid {
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 20px !important;
}
```

### Wrapper Component

```jsx
import { PlayerCard } from 'hoops-card-ui';

function CustomPlayerCard({ cardData }) {
  return (
    <div className="my-custom-wrapper">
      <PlayerCard cardData={cardData} />
      <div className="custom-actions">
        <button>Add to Favorites</button>
        <button>Share</button>
      </div>
    </div>
  );
}
```

## TypeScript Support

```typescript
// types.ts
export interface CardData {
  playerId: string;
  playerName: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  overallRating: number;
  rarity: 'bronze' | 'silver' | 'silver_rare' | 'gold' | 'gold_rare' | 'legendary';
  team: string;
  teamAbbr: string;
  age: number;
  gamesPlayed: number;
  stats: {
    ppg: string;
    rpg: string;
    apg: string;
    spg: string;
    bpg: string;
    fgPct: string;
    fg3Pct: string;
    ftPct: string;
    mpg: string;
  };
  gradient: [string, string, string];
  cardType: string;
  season: number;
}

// Component usage
import { PlayerCard } from 'hoops-card-ui';
import { CardData } from './types';

const MyComponent: React.FC = () => {
  const card: CardData = { /* ... */ };
  return <PlayerCard cardData={card} />;
};
```

## Common Patterns

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const CardGrid = lazy(() => import('hoops-card-ui').then(m => ({ default: m.CardGrid })));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CardGrid cards={cards} />
    </Suspense>
  );
}
```

### Pagination

```jsx
function PaginatedCards({ cards }) {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const displayCards = cards.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <>
      <CardGrid cards={displayCards} />
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </>
  );
}
```

## Tips

1. **Performance**: Use `React.memo` for large lists
2. **Images**: Preload player photos for smoother UX
3. **Accessibility**: Add aria-labels to cards
4. **SEO**: Use semantic HTML around cards
5. **Analytics**: Track card clicks and interactions

## Support

For issues or questions, refer to the main README.md or create an issue in the repository.
