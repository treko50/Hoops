import React, { useState } from 'react';
import { GlassModal } from './ui/GlassModal';
import { Badge } from './ui/Badge';
import '../styles/AdvancedCardView.css';

/**
 * AdvancedCardView Component
 * Displays detailed player information with tabs:
 * - Season Stats: Historical season-by-season performance
 * - Advanced Attributes: FIFA-style detailed attribute breakdown
 */
export const AdvancedCardView = ({ cardData, onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState('attributes');

  if (!cardData) return null;

  const { playerName, position, overallRating, rarity, team, teamAbbr, advancedAttributes, stats, photoUrl } = cardData;

  const tabs = [
    { id: 'stats', label: 'Season Stats', icon: '📊' },
    { id: 'attributes', label: 'Advanced Attributes', icon: '⚡' }
  ];

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      closeOnBackdropClick={true}
    >
      <div className="advanced-card-content">
        {/* Header */}
        <div className="advanced-card-header">
          <div className="header-left">
            {photoUrl && (
              <div className="header-photo">
                <img src={photoUrl} alt={playerName} />
              </div>
            )}
            <div>
              <h2>{playerName}</h2>
              <p>{position} • {teamAbbr || team}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="overall-rating-large">{overallRating}</div>
            <Badge variant={rarity?.replace('_', '-')} size="md">
              {rarity?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`card-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card-tab-content">
          {activeTab === 'stats' && <SeasonStatsTab cardData={cardData} />}
          {activeTab === 'attributes' && <AdvancedAttributesTab cardData={cardData} />}
        </div>
      </div>
    </GlassModal>
  );
};

/**
 * Season Stats Tab - Shows current season stats and averages
 */
function SeasonStatsTab({ cardData }) {
  const { stats, gamesPlayed, age } = cardData;

  const statCategories = [
    {
      title: 'Scoring',
      stats: [
        { label: 'Points Per Game', value: stats?.ppg?.toFixed(1) || '0.0', unit: 'PPG' },
        { label: 'Field Goal %', value: stats?.fgPct?.toFixed(1) || '0.0', unit: '%' },
        { label: '3-Point %', value: stats?.fg3Pct?.toFixed(1) || '0.0', unit: '%' },
        { label: 'Free Throw %', value: stats?.ftPct?.toFixed(1) || '0.0', unit: '%' }
      ]
    },
    {
      title: 'Playmaking',
      stats: [
        { label: 'Assists Per Game', value: stats?.apg?.toFixed(1) || '0.0', unit: 'APG' },
        { label: 'Turnovers Per Game', value: stats?.tov?.toFixed(1) || '0.0', unit: 'TOV' },
        { label: 'Steals Per Game', value: stats?.spg?.toFixed(1) || '0.0', unit: 'SPG' }
      ]
    },
    {
      title: 'Rebounding & Defense',
      stats: [
        { label: 'Rebounds Per Game', value: stats?.rpg?.toFixed(1) || '0.0', unit: 'RPG' },
        { label: 'Blocks Per Game', value: stats?.bpg?.toFixed(1) || '0.0', unit: 'BPG' },
        { label: 'Steals Per Game', value: stats?.spg?.toFixed(1) || '0.0', unit: 'SPG' }
      ]
    },
    {
      title: 'General',
      stats: [
        { label: 'Minutes Per Game', value: stats?.mpg?.toFixed(1) || '0.0', unit: 'MPG' },
        { label: 'Games Played', value: gamesPlayed || '0', unit: 'GP' },
        { label: 'Age', value: age || 'N/A', unit: 'yrs' }
      ]
    }
  ];

  return (
    <div className="season-stats-content">
      <div className="stats-grid">
        {statCategories.map(category => (
          <div key={category.title} className="stat-category-card">
            <h3 className="stat-category-title">{category.title}</h3>
            <div className="stat-rows">
              {category.stats.map(stat => (
                <div key={stat.label} className="stat-row">
                  <span className="stat-row-label">{stat.label}</span>
                  <span className="stat-row-value">
                    {stat.value} <span className="stat-row-unit">{stat.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="stats-footer-note">
        <p>📅 2026 Season Statistics</p>
        <p className="note-text">Full historical season-by-season data coming soon</p>
      </div>
    </div>
  );
}

/**
 * Advanced Attributes Tab - Shows FIFA-style attribute breakdown
 */
function AdvancedAttributesTab({ cardData }) {
  const { advancedAttributes, stats } = cardData;

  if (!advancedAttributes) {
    return (
      <div className="no-attributes">
        <p>Advanced attributes not available for this player.</p>
      </div>
    );
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
    <div className="advanced-attributes-content">
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
          <span className="stat-value">{stats?.ppg?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">RPG</span>
          <span className="stat-value">{stats?.rpg?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">APG</span>
          <span className="stat-value">{stats?.apg?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">FG%</span>
          <span className="stat-value">{stats?.fgPct?.toFixed(1) || '0.0'}%</span>
        </div>
      </div>
    </div>
  );
}

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
