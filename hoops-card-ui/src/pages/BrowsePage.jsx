import React, { useState, useEffect } from 'react';
import { CardGrid } from '../components/CardGrid';
import { AdvancedCardView } from '../components/AdvancedCardView';
import { SearchBar } from '../components/filters/SearchBar';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { useCollection } from '../context/CollectionContext';
import { fetchAllCards } from '../services/api';
import './BrowsePage.css';

/**
 * BrowsePage Component
 * Browse and filter all player cards with sidebar and advanced filtering
 */
export const BrowsePage = () => {
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [filters, setFilters] = useState({
    rarity: 'all',
    position: 'all',
    team: 'all',
    minRating: 0,
    maxRating: 100
  });
  const { favorites, toggleFavorite } = useCollection();

  // Load all cards on mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        const cards = await fetchAllCards();
        setAllCards(cards);
        setLoading(false);
      } catch (error) {
        console.error('Error loading cards:', error);
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  // Apply all filters and search
  const filteredCards = allCards.filter(card => {
    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      const matchesSearch =
        card.playerName?.toLowerCase().includes(lowerSearch) ||
        card.team?.toLowerCase().includes(lowerSearch) ||
        card.teamAbbr?.toLowerCase().includes(lowerSearch);

      if (!matchesSearch) return false;
    }

    // Rarity filter
    if (filters.rarity !== 'all' && card.rarity !== filters.rarity) {
      return false;
    }

    // Position filter
    if (filters.position !== 'all' && card.position !== filters.position) {
      return false;
    }

    // Team filter
    if (filters.team !== 'all') {
      if (card.teamAbbr !== filters.team && card.team !== filters.team) {
        return false;
      }
    }

    // Rating range filter
    if (card.overallRating < filters.minRating || card.overallRating > filters.maxRating) {
      return false;
    }

    return true;
  });

  // Sort by rating (highest first)
  const sortedCards = [...filteredCards].sort((a, b) => b.overallRating - a.overallRating);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleClearFilters = () => {
    setFilters({
      rarity: 'all',
      position: 'all',
      team: 'all',
      minRating: 0,
      maxRating: 100
    });
    setSearch('');
  };

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="page-title">Browse Cards</h1>
        <p className="page-subtitle">
          Explore {allCards.length} player cards from the 2026 season
        </p>
      </div>

      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="search-section">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search players or teams..."
            />
          </div>

          {/* Main Content Area */}
          <div className="browse-content">
            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
            />

            {/* Card Grid Area */}
            <div className="cards-area">
              <div className="results-info">
                <span className="results-count">
                  Showing {sortedCards.length} of {allCards.length} cards
                </span>
              </div>

              <CardGrid
                cards={sortedCards}
                onCardClick={handleCardClick}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                loading={loading}
              />
            </div>
          </div>
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
};

export default BrowsePage;
