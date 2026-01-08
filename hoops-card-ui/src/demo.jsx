import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PlayerCard, CardGrid } from './index';
import { AdvancedCardView } from './components/AdvancedCardView';
import './styles/global.css';
import './styles/animations.css';
import './styles/demo.css';

/**
 * Demo Application
 * Showcases the player card components with 2026 season data
 */
function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    // Load advanced cards from Spring Boot API cache
    fetch('http://localhost:8080/api/cards/advanced?minRating=0')
      .then(res => res.json())
      .then(data => {
        const cardArray = data.cards || [];
        setCards(cardArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading cards:', err);
        setLoading(false);
      });
  }, []);

  // Filter cards by rarity and search
  const filteredCards = cards.filter(card => {
    const matchesFilter = filter === 'all' || card.rarity === filter;
    const matchesSearch = search === '' ||
      card.playerName.toLowerCase().includes(search.toLowerCase()) ||
      card.team.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort by rating (highest first)
  const sortedCards = [...filteredCards].sort((a, b) => b.overallRating - a.overallRating);

  const handleCardClick = (card) => {
    console.log('Card clicked:', card);
    setSelectedCard(card);
  };

  // Get rarity counts
  const rarityCounts = cards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hoops Card UI - 2026 Season</h1>
        <p className="subtitle">FIFA Ultimate Team Style Basketball Cards</p>
      </header>

      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : (
        <>
          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search players or teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({cards.length})
              </button>
              <button
                className={`filter-btn legendary ${filter === 'legendary' ? 'active' : ''}`}
                onClick={() => setFilter('legendary')}
              >
                Legendary ({rarityCounts.legendary || 0})
              </button>
              <button
                className={`filter-btn gold ${filter === 'gold_rare' ? 'active' : ''}`}
                onClick={() => setFilter('gold_rare')}
              >
                Gold Rare ({rarityCounts.gold_rare || 0})
              </button>
              <button
                className={`filter-btn gold ${filter === 'gold' ? 'active' : ''}`}
                onClick={() => setFilter('gold')}
              >
                Gold ({rarityCounts.gold || 0})
              </button>
              <button
                className={`filter-btn silver ${filter === 'silver_rare' ? 'active' : ''}`}
                onClick={() => setFilter('silver_rare')}
              >
                Silver Rare ({rarityCounts.silver_rare || 0})
              </button>
              <button
                className={`filter-btn silver ${filter === 'silver' ? 'active' : ''}`}
                onClick={() => setFilter('silver')}
              >
                Silver ({rarityCounts.silver || 0})
              </button>
              <button
                className={`filter-btn bronze ${filter === 'bronze' ? 'active' : ''}`}
                onClick={() => setFilter('bronze')}
              >
                Bronze ({rarityCounts.bronze || 0})
              </button>
            </div>
          </div>

          <div className="results-info">
            Showing {sortedCards.length} of {cards.length} cards
          </div>

          <CardGrid cards={sortedCards} onCardClick={handleCardClick} />
        </>
      )}

      {/* Advanced Card Modal */}
      <AdvancedCardView
        cardData={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
