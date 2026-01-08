import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import '../styles/PlayerCard.css';

/**
 * PlayerCard Component
 * Displays a FIFA Ultimate Team style basketball player card with glassmorphism
 *
 * @param {Object} props - Component props
 * @param {Object} props.cardData - Card data from backend (2026-cards.json format)
 * @param {Function} props.onClick - Optional click handler
 * @param {boolean} props.isFavorite - Whether card is favorited
 * @param {Function} props.onToggleFavorite - Toggle favorite handler
 * @param {string} props.className - Optional additional CSS class
 */
export const PlayerCard = ({
  cardData,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  className = ''
}) => {
  const {
    playerName,
    position,
    overallRating,
    rarity,
    team,
    teamAbbr,
    stats,
    gradient,
    age,
    gamesPlayed
  } = cardData;

  // Get gradient colors based on rarity
  const gradientColors = gradient || getDefaultGradient(rarity);
  const gradientStyle = {
    background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%)`
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(cardData.playerId);
    }
  };

  return (
    <motion.div
      className={`player-card ${rarity} ${className}`}
      onClick={onClick}
      style={gradientStyle}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Shine overlay */}
      <div className="card-shine" />

      {/* Glass overlay */}
      <div className="card-glass-overlay" />

      {/* Border */}
      <div className="card-border" />

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <FaHeart /> : <FiHeart />}
        </button>
      )}

      {/* Rating Section */}
      <div className="rating-section">
        <div className="rating-badge">
          <div className="overall-rating">{overallRating}</div>
          <div className="position">{position}</div>
        </div>
      </div>

      {/* Player Photo Placeholder */}
      <div className="photo-section">
        <div className="photo-placeholder">
          <span className="player-initial">{playerName?.charAt(0) || '?'}</span>
        </div>
      </div>

      {/* Player Name */}
      <div className="name-section">
        <div className="player-name">{truncateText(playerName, 20)}</div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat">
          <div className="stat-label">PPG</div>
          <div className="stat-value">{stats?.ppg || '0.0'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">RPG</div>
          <div className="stat-value">{stats?.rpg || '0.0'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">APG</div>
          <div className="stat-value">{stats?.apg || '0.0'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">FG%</div>
          <div className="stat-value">{stats?.fgPct || '0%'}</div>
        </div>
      </div>

      {/* Team Info */}
      <div className="team-section">
        <span className="team-name">{teamAbbr || team || 'N/A'}</span>
      </div>

      {/* Rarity Badge */}
      <div className="rarity-section">
        <div className="rarity-badge">{rarity?.toUpperCase()?.replace('_', ' ')}</div>
      </div>

      {/* Games Played (Bottom Right) */}
      {gamesPlayed && (
        <div className="games-played">GP: {gamesPlayed}</div>
      )}
    </motion.div>
  );
};

/**
 * Helper: Truncate text to max length
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Helper: Get default gradient colors based on rarity
 */
function getDefaultGradient(rarity) {
  const gradients = {
    'bronze': ['#8B4513', '#CD7F32', '#A0522D'],
    'silver': ['#808080', '#C0C0C0', '#A9A9A9'],
    'silver_rare': ['#C0C0C0', '#E8E8E8', '#D3D3D3'],
    'gold': ['#DAA520', '#FFD700', '#FFA500'],
    'gold_rare': ['#FF8C00', '#FFD700', '#FF6347'],
    'legendary': ['#4A148C', '#9C27B0', '#E91E63']
  };
  return gradients[rarity] || gradients.bronze;
}

export default PlayerCard;
