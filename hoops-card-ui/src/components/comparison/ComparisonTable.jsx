import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import './ComparisonTable.css';

/**
 * ComparisonTable Component
 * Side-by-side comparison of player stats and attributes
 */
export const ComparisonTable = ({ players }) => {
  if (players.length === 0) {
    return null;
  }

  // Get the best value for each stat to highlight
  const getBestValue = (statPath) => {
    const values = players.map(p => getNestedValue(p, statPath)).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return Math.max(...values);
  };

  // Get nested value from object path (e.g., "stats.ppg")
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Check if this player has the best value
  const isBestValue = (player, statPath, bestValue) => {
    const value = getNestedValue(player, statPath);
    return value === bestValue && value !== null && value !== undefined;
  };

  const basicStats = [
    { label: 'Overall Rating', path: 'overallRating', format: (v) => v },
    { label: 'Position', path: 'position', format: (v) => v, noBest: true },
    { label: 'Team', path: 'team', format: (v) => v, noBest: true },
    { label: 'Rarity', path: 'rarity', format: (v) => v?.replace('_', ' '), noBest: true },
    { label: 'PPG', path: 'stats.ppg', format: (v) => v?.toFixed(1) },
    { label: 'RPG', path: 'stats.rpg', format: (v) => v?.toFixed(1) },
    { label: 'APG', path: 'stats.apg', format: (v) => v?.toFixed(1) },
    { label: 'SPG', path: 'stats.spg', format: (v) => v?.toFixed(1) },
    { label: 'BPG', path: 'stats.bpg', format: (v) => v?.toFixed(1) },
    { label: 'FG%', path: 'stats.fgPct', format: (v) => v?.toFixed(1) + '%' },
    { label: '3P%', path: 'stats.fg3Pct', format: (v) => v?.toFixed(1) + '%' },
    { label: 'FT%', path: 'stats.ftPct', format: (v) => v?.toFixed(1) + '%' },
  ];

  const attributeCategories = [
    { key: 'offense', label: 'Offense', icon: '⚡' },
    { key: 'playmaking', label: 'Playmaking', icon: '🎯' },
    { key: 'defense', label: 'Defense', icon: '🛡️' },
    { key: 'athleticism', label: 'Athleticism', icon: '💪' },
    { key: 'rebounding', label: 'Rebounding', icon: '📦' },
    { key: 'efficiency', label: 'Efficiency', icon: '📊' },
  ];

  return (
    <div className="comparison-table">
      {/* Player Headers */}
      <div className="comparison-header">
        <div className="comparison-label-col"></div>
        {players.map((player, idx) => (
          <div key={idx} className="comparison-player-col">
            <div className="player-header-card">
              <div className="player-header-name">{player.playerName}</div>
              <div className="player-header-rating">{player.overallRating}</div>
              <Badge variant={player.rarity?.replace('_', '-')} size="sm">
                {player.rarity?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Basic Stats */}
      <GlassCard variant="elevated" padding="lg" className="comparison-section">
        <h3 className="section-title">Basic Stats</h3>
        {basicStats.map((stat, idx) => {
          const bestValue = stat.noBest ? null : getBestValue(stat.path);
          return (
            <div key={idx} className="comparison-row">
              <div className="comparison-label">{stat.label}</div>
              {players.map((player, pidx) => {
                const value = getNestedValue(player, stat.path);
                const displayValue = stat.format(value) || 'N/A';
                const isBest = !stat.noBest && isBestValue(player, stat.path, bestValue);

                return (
                  <div
                    key={pidx}
                    className={`comparison-value ${isBest ? 'best-value' : ''}`}
                  >
                    {displayValue}
                    {isBest && <span className="best-indicator">★</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </GlassCard>

      {/* Advanced Attributes */}
      {attributeCategories.map((category) => {
        // Check if any player has this category
        const hasCategory = players.some(p => p.advancedAttributes?.[category.key]);
        if (!hasCategory) return null;

        // Get all sub-attributes from this category
        const subAttributes = new Set();
        players.forEach(p => {
          const cat = p.advancedAttributes?.[category.key];
          if (cat) {
            Object.keys(cat).forEach(key => {
              if (key !== 'overall') {
                subAttributes.add(key);
              }
            });
          }
        });

        return (
          <GlassCard key={category.key} variant="elevated" padding="lg" className="comparison-section">
            <h3 className="section-title">
              <span className="category-icon">{category.icon}</span>
              {category.label}
            </h3>

            {/* Overall */}
            <div className="comparison-row">
              <div className="comparison-label">Overall</div>
              {players.map((player, pidx) => {
                const value = player.advancedAttributes?.[category.key]?.overall;
                const bestValue = getBestValue(`advancedAttributes.${category.key}.overall`);
                const isBest = value === bestValue && value !== null && value !== undefined;

                return (
                  <div
                    key={pidx}
                    className={`comparison-value ${isBest ? 'best-value' : ''}`}
                  >
                    {value || 'N/A'}
                    {isBest && <span className="best-indicator">★</span>}
                  </div>
                );
              })}
            </div>

            {/* Sub-attributes */}
            {Array.from(subAttributes).map((subAttr) => {
              const label = subAttr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const bestValue = getBestValue(`advancedAttributes.${category.key}.${subAttr}`);

              return (
                <div key={subAttr} className="comparison-row sub-attribute">
                  <div className="comparison-label">{label}</div>
                  {players.map((player, pidx) => {
                    const value = player.advancedAttributes?.[category.key]?.[subAttr];
                    const isBest = value === bestValue && value !== null && value !== undefined;

                    return (
                      <div
                        key={pidx}
                        className={`comparison-value ${isBest ? 'best-value' : ''}`}
                      >
                        {value || 'N/A'}
                        {isBest && <span className="best-indicator">★</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </GlassCard>
        );
      })}
    </div>
  );
};

export default ComparisonTable;
