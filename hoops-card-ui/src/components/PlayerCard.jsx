import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { removeWhiteBackground } from '../utils/removeWhiteBackground';
import '../styles/PlayerCardFUT.css';

/**
 * PlayerCard Component - FIFA Ultimate Team Style
 * Shield-shaped card with rating, position, photo, name, and 6 attributes in 2 columns
 *
 * @param {Object} props - Component props
 * @param {Object} props.cardData - Card data from backend
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
    teamAbbr,
    advancedAttributes,
    photoUrl
  } = cardData;

  // State for processed image (with white background removed)
  const [processedPhotoUrl, setProcessedPhotoUrl] = useState(null);

  // Process image to remove white background
  useEffect(() => {
    if (photoUrl) {
      removeWhiteBackground(photoUrl, 240)
        .then(url => setProcessedPhotoUrl(url))
        .catch(err => {
          console.error('Failed to process player image:', err);
          setProcessedPhotoUrl(photoUrl); // Fallback to original
        });
    } else {
      setProcessedPhotoUrl(null);
    }
  }, [photoUrl]);

  // Get top 6 attributes from advanced attributes
  const topAttributes = getTopAttributes(advancedAttributes);

  // Get gradient colors based on rarity
  const gradientColors = getDefaultGradient(rarity);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(cardData.playerId);
    }
  };

  return (
    <motion.div
      className={`fut-card ${rarity} ${className}`}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Card background with gradient */}
      <div
        className="fut-card-bg"
        style={{
          background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%)`
        }}
      />

      {/* Shine effect */}
      <div className="fut-card-shine" />

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          className={`fut-favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <FaHeart /> : <FiHeart />}
        </button>
      )}

      {/* Top section - Rating & Position */}
      <div className="fut-card-top">
        <div className="fut-rating">{overallRating}</div>
        <div className="fut-position">{position}</div>
        <div className="fut-team">{teamAbbr}</div>
      </div>

      {/* Player Photo */}
      <div className="fut-photo-container">
        {processedPhotoUrl ? (
          <img
            src={processedPhotoUrl}
            alt={playerName}
            className="fut-player-photo"
            loading="lazy"
          />
        ) : photoUrl ? (
          <div className="fut-photo-placeholder">
            <span className="fut-initial" style={{ fontSize: '14px' }}>...</span>
          </div>
        ) : (
          <div className="fut-photo-placeholder">
            <span className="fut-initial">{playerName?.charAt(0) || '?'}</span>
          </div>
        )}
      </div>

      {/* Player Name */}
      <div className="fut-name-section">
        <div className="fut-player-name">{truncateText(playerName, 18)}</div>
      </div>

      {/* Stats - 2 columns, 3 rows */}
      <div className="fut-stats">
        <div className="fut-stats-column">
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[0].value}</span>
            <span className="fut-stat-label">{topAttributes[0].label}</span>
          </div>
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[1].value}</span>
            <span className="fut-stat-label">{topAttributes[1].label}</span>
          </div>
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[2].value}</span>
            <span className="fut-stat-label">{topAttributes[2].label}</span>
          </div>
        </div>

        <div className="fut-stats-divider"></div>

        <div className="fut-stats-column">
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[3].value}</span>
            <span className="fut-stat-label">{topAttributes[3].label}</span>
          </div>
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[4].value}</span>
            <span className="fut-stat-label">{topAttributes[4].label}</span>
          </div>
          <div className="fut-stat-row">
            <span className="fut-stat-value">{topAttributes[5].value}</span>
            <span className="fut-stat-label">{topAttributes[5].label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Get top 6 attributes from advanced attributes
 */
function getTopAttributes(advancedAttributes) {
  if (!advancedAttributes) {
    return [
      { label: 'OFF', value: '--' },
      { label: 'DEF', value: '--' },
      { label: 'PLY', value: '--' },
      { label: 'ATH', value: '--' },
      { label: 'REB', value: '--' },
      { label: 'EFF', value: '--' }
    ];
  }

  return [
    { label: 'OFF', value: advancedAttributes.offense?.overall || '--' },
    { label: 'DEF', value: advancedAttributes.defense?.overall || '--' },
    { label: 'PLY', value: advancedAttributes.playmaking?.overall || '--' },
    { label: 'ATH', value: advancedAttributes.athleticism?.overall || '--' },
    { label: 'REB', value: advancedAttributes.rebounding?.overall || '--' },
    { label: 'EFF', value: advancedAttributes.efficiency?.overall || '--' }
  ];
}

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
    'bronze': ['#D4915F', '#B8734A', '#9E6042'],
    'silver': ['#C0C0C0', '#A8A8A8', '#909090'],
    'silver_rare': ['#E8E8E8', '#C0C0C0', '#A8A8A8'],
    'gold': ['#F5E6B3', '#D4AF37', '#C9A959'],
    'gold_rare': ['#FFD700', '#FFA500', '#DAA520'],
    'legendary': ['#E91E63', '#9C27B0', '#673AB7']
  };
  return gradients[rarity] || gradients.gold;
}

export default PlayerCard;
