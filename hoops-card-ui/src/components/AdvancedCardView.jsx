import React from 'react';
import { GlassModal } from './ui/GlassModal';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';
import '../styles/AdvancedCardView.css';

/**
 * AdvancedCardView Component
 * Displays detailed FIFA-style advanced attributes for a player card
 */
export const AdvancedCardView = ({ cardData, onClose, isOpen }) => {
  if (!cardData) return null;

  const { playerName, position, overallRating, rarity, team, teamAbbr, advancedAttributes, stats } = cardData;

  if (!advancedAttributes) {
    return null;
  }

  const categories = [
    { key: 'offense', label: 'Offense', icon: '⚡' },
    { key: 'playmaking', label: 'Playmaking', icon: '🎯' },
    { key: 'defense', label: 'Defense', icon: '🛡️' },
    { key: 'athleticism', label: 'Athleticism', icon: '💪' },
    { key: 'rebounding', label: 'Rebounding', icon: '📦' },
    { key: 'efficiency', label: 'Efficiency', icon: '📊' }
  ];

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={true}
      closeOnBackdropClick={true}
    >
      <div className="advanced-card-content">
        {/* Header */}
        <div className="advanced-card-header">
          <div className="header-left">
            <h2>{playerName}</h2>
            <p>{position} • {teamAbbr || team}</p>
          </div>
          <div className="header-right">
            <div className="overall-rating-large">{overallRating}</div>
            <Badge variant={rarity?.replace('_', '-')} size="md">
              {rarity?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Advanced Attributes Grid */}
        <div className="attributes-grid">
          {categories.map(({ key, label, icon }) => {
            const category = advancedAttributes[key];
            if (!category) return null;

            return (
              <div key={key} className="attribute-category">
                <div className="category-header">
                  <span className="category-icon">{icon}</span>
                  <h3>{label}</h3>
                  <div className="category-overall">{category.overall}</div>
                </div>
                <div className="sub-attributes">
                  {Object.entries(category).map(([subKey, value]) => {
                    if (subKey === 'overall') return null;

                    // Convert camelCase to Title Case
                    const label = subKey.replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());

                    return (
                      <div key={subKey} className="sub-attribute">
                        <div className="sub-label">{label}</div>
                        <div className="sub-value-bar">
                          <div
                            className="sub-value-fill"
                            style={{
                              width: `${value}%`,
                              backgroundColor: getColorForValue(value)
                            }}
                          />
                          <span className="sub-value-text">{value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Basic Stats Footer */}
        <div className="stats-footer">
          <div className="stat-item">
            <span className="stat-label">PPG</span>
            <span className="stat-value">{cardData.stats?.ppg?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">RPG</span>
            <span className="stat-value">{cardData.stats?.rpg?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">APG</span>
            <span className="stat-value">{cardData.stats?.apg?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">FG%</span>
            <span className="stat-value">{stats?.fgPct?.toFixed(1) || '0.0'}%</span>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};

/**
 * Get color based on attribute value (FIFA-style rating colors)
 */
function getColorForValue(value) {
  if (value >= 90) return '#00ff00'; // Green - Elite
  if (value >= 80) return '#7fff00'; // Lime - Excellent
  if (value >= 70) return '#ffd700'; // Gold - Good
  if (value >= 60) return '#ffa500'; // Orange - Average
  if (value >= 50) return '#ff8c00'; // Dark Orange - Below Average
  return '#ff4500'; // Red - Poor
}

export default AdvancedCardView;
