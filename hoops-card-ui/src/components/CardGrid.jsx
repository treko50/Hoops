import React from 'react';
import { motion } from 'framer-motion';
import PlayerCard from './PlayerCard';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { EmptyState } from './ui/EmptyState';
import '../styles/CardGrid.css';

/**
 * CardGrid Component
 * Displays a responsive grid of player cards with stagger animations
 *
 * @param {Object} props - Component props
 * @param {Array} props.cards - Array of card data objects
 * @param {Function} props.onCardClick - Optional click handler for cards
 * @param {Function} props.onToggleFavorite - Toggle favorite handler
 * @param {Array} props.favorites - Array of favorited player IDs
 * @param {boolean} props.loading - Loading state
 * @param {number} props.columns - Number of columns (default: auto-responsive)
 * @param {string} props.className - Optional additional CSS class
 */
export const CardGrid = ({
  cards = [],
  onCardClick,
  onToggleFavorite,
  favorites = [],
  loading = false,
  columns,
  className = ''
}) => {
  const gridStyle = columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {};

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className={`card-grid ${className}`} style={gridStyle}>
        <LoadingSkeleton count={6} variant="card" />
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <EmptyState
        title="No cards found"
        message="Try adjusting your filters or search query"
      />
    );
  }

  return (
    <motion.div
      className={`card-grid ${className}`}
      style={gridStyle}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div key={card.playerId || index} variants={itemVariants}>
          <PlayerCard
            cardData={card}
            onClick={() => onCardClick && onCardClick(card)}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(card.playerId)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CardGrid;
