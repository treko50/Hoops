import React from 'react';
import { useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';

/**
 * PlayerDetailPage Component
 * Detailed view of a single player (placeholder)
 */
export const PlayerDetailPage = () => {
  const { playerId } = useParams();

  return (
    <div>
      <h1 className="page-title">Player Detail</h1>
      <GlassCard variant="elevated" padding="lg">
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Player ID: {playerId}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
          Full player detail page will be implemented in Phase 4.
        </p>
      </GlassCard>
    </div>
  );
};

export default PlayerDetailPage;
