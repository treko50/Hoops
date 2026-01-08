import React from 'react';
import { useCollection } from '../context/CollectionContext';
import { GlassCard } from '../components/ui/GlassCard';

/**
 * CollectionPage Component
 * View favorited cards (placeholder)
 */
export const CollectionPage = () => {
  const { favorites, getFavoriteCount } = useCollection();

  return (
    <div>
      <h1 className="page-title">My Collection</h1>
      <GlassCard variant="elevated" padding="lg">
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
          You have {getFavoriteCount()} cards in your collection.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Full collection page will be implemented in Phase 5.
        </p>
      </GlassCard>
    </div>
  );
};

export default CollectionPage;
