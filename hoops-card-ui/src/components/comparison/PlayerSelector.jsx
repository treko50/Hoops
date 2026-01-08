import React, { useState, useEffect } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { SearchBar } from '../filters/SearchBar';
import { GlassCard } from '../ui/GlassCard';
import { GlassSelect } from '../ui/GlassInput';
import { PlayerCard } from '../PlayerCard';
import { fetchAllCards } from '../../services/api';
import './PlayerSelector.css';

/**
 * PlayerSelector Component
 * Modal for selecting a player to compare
 */
export const PlayerSelector = ({ isOpen, onClose, onSelectPlayer, excludePlayerIds = [] }) => {
  const [allCards, setAllCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadCards();
    }
  }, [isOpen]);

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

  // Get unique positions and teams
  const positions = [...new Set(allCards.map(c => c.position).filter(Boolean))].sort();
  const teams = [...new Set(allCards.map(c => c.teamAbbr).filter(Boolean))].sort();

  // Format options for GlassSelect
  const positionOptions = [
    { label: 'All Positions', value: 'all' },
    ...positions.map(pos => ({ label: pos, value: pos }))
  ];

  const teamOptions = [
    { label: 'All Teams', value: 'all' },
    ...teams.map(team => ({ label: team, value: team }))
  ];

  const rarityOptions = [
    { label: 'All Rarities', value: 'all' },
    { label: 'Legendary', value: 'legendary' },
    { label: 'Gold Rare', value: 'gold_rare' },
    { label: 'Gold', value: 'gold' },
    { label: 'Silver Rare', value: 'silver_rare' },
    { label: 'Silver', value: 'silver' },
    { label: 'Bronze', value: 'bronze' }
  ];

  // Filter cards by search, filters, and exclude already selected
  const filteredCards = allCards
    .filter(card => {
      // Exclude already selected players
      if (excludePlayerIds.includes(card.playerId)) {
        return false;
      }

      // Position filter
      if (positionFilter !== 'all' && card.position !== positionFilter) {
        return false;
      }

      // Team filter
      if (teamFilter !== 'all' && card.teamAbbr !== teamFilter) {
        return false;
      }

      // Rarity filter
      if (rarityFilter !== 'all' && card.rarity !== rarityFilter) {
        return false;
      }

      // Search filter
      if (search) {
        const lowerSearch = search.toLowerCase();
        const matchesSearch =
          card.playerName?.toLowerCase().includes(lowerSearch) ||
          card.team?.toLowerCase().includes(lowerSearch) ||
          card.teamAbbr?.toLowerCase().includes(lowerSearch);
        return matchesSearch;
      }

      return true;
    })
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 30); // Limit to top 30 results

  const handleCardClick = (card) => {
    onSelectPlayer(card);
    onClose();
    setSearch('');
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Player"
      size="xl"
    >
      <div className="player-selector">
        {/* Filter Controls */}
        <div className="selector-filters">
          <GlassSelect
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            options={positionOptions}
          />

          <GlassSelect
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            options={teamOptions}
          />

          <GlassSelect
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            options={rarityOptions}
          />
        </div>

        <div className="selector-search">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search for a player to compare..."
          />
        </div>

        {loading ? (
          <div className="selector-loading">Loading players...</div>
        ) : filteredCards.length === 0 ? (
          <div className="selector-empty">
            No players found. Try a different search.
          </div>
        ) : (
          <div className="selector-grid">
            {filteredCards.map(card => (
              <GlassCard
                key={card.playerId}
                variant="light"
                interactive
                className="selector-card"
                onClick={() => handleCardClick(card)}
              >
                <div className="selector-card-rating">{card.overallRating}</div>
                <div className="selector-card-name">{card.playerName}</div>
                <div className="selector-card-details">
                  {card.position} • {card.teamAbbr || card.team}
                </div>
                <div className={`selector-card-rarity ${card.rarity}`}>
                  {card.rarity?.replace('_', ' ').toUpperCase()}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </GlassModal>
  );
};

export default PlayerSelector;
