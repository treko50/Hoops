import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { PlayerCard } from '../components/PlayerCard';
import { AdvancedCardView } from '../components/AdvancedCardView';
import { PlayerSelector } from '../components/comparison/PlayerSelector';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { FiPlus, FiX } from 'react-icons/fi';
import './ComparisonPage.css';

/**
 * ComparisonPage Component
 * Compare up to 4 players side-by-side
 */
export const ComparisonPage = () => {
  const [players, setPlayers] = useState([null, null, null, null]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCardForView, setSelectedCardForView] = useState(null);
  const [isCardViewOpen, setIsCardViewOpen] = useState(false);

  const openSelector = (slotIndex) => {
    setSelectedSlot(slotIndex);
    setSelectorOpen(true);
  };

  const handleSelectPlayer = (player) => {
    if (selectedSlot !== null) {
      const newPlayers = [...players];
      newPlayers[selectedSlot] = player;
      setPlayers(newPlayers);
    }
  };

  const removePlayer = (slotIndex, event) => {
    event.stopPropagation();
    const newPlayers = [...players];
    newPlayers[slotIndex] = null;
    setPlayers(newPlayers);
  };

  const clearAll = () => {
    setPlayers([null, null, null, null]);
  };

  const handleCardClick = (player) => {
    setSelectedCardForView(player);
    setIsCardViewOpen(true);
  };

  // Get players that are already selected
  const selectedPlayerIds = players
    .filter(p => p !== null)
    .map(p => p.playerId);

  // Get players for comparison (non-null)
  const playersForComparison = players.filter(p => p !== null);

  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <div>
          <h1 className="page-title">Player Comparison</h1>
          <p className="page-subtitle">
            Select up to 4 players to compare side-by-side
          </p>
        </div>
        {playersForComparison.length > 0 && (
          <GlassButton variant="ghost" onClick={clearAll}>
            Clear All
          </GlassButton>
        )}
      </div>

      {/* Player Selection Slots */}
      <div className="player-slots">
        {players.map((player, index) => (
          <div key={index} className="player-slot">
            {player ? (
              <div className="player-slot-filled">
                <button
                  className="remove-player-btn"
                  onClick={(e) => removePlayer(index, e)}
                  aria-label="Remove player"
                >
                  <FiX />
                </button>
                <PlayerCard
                  cardData={player}
                  onClick={() => handleCardClick(player)}
                />
              </div>
            ) : (
              <GlassCard
                variant="light"
                interactive
                className="player-slot-empty"
                onClick={() => openSelector(index)}
              >
                <FiPlus className="slot-add-icon" />
                <div className="slot-add-text">Add Player</div>
              </GlassCard>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {playersForComparison.length >= 2 ? (
        <ComparisonTable players={playersForComparison} />
      ) : (
        <GlassCard variant="elevated" padding="lg" className="comparison-empty">
          <div className="empty-icon">⚖️</div>
          <h3 className="empty-title">
            {playersForComparison.length === 0
              ? 'Select Players to Compare'
              : 'Select at least one more player'}
          </h3>
          <p className="empty-message">
            {playersForComparison.length === 0
              ? 'Click the "Add Player" cards above to select players for comparison'
              : 'Add another player to start comparing stats and attributes'}
          </p>
        </GlassCard>
      )}

      {/* Player Selector Modal */}
      <PlayerSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelectPlayer={handleSelectPlayer}
        excludePlayerIds={selectedPlayerIds}
      />

      {/* Card Detail Modal */}
      {selectedCardForView && (
        <AdvancedCardView
          isOpen={isCardViewOpen}
          onClose={() => setIsCardViewOpen(false)}
          cardData={selectedCardForView}
        />
      )}
    </div>
  );
};

export default ComparisonPage;
