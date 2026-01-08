import React from 'react';
import { useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';

/**
 * TeamPage Component
 * View all players from a specific team (placeholder)
 */
export const TeamPage = () => {
  const { teamAbbr } = useParams();

  return (
    <div>
      <h1 className="page-title">Team: {teamAbbr}</h1>
      <GlassCard variant="elevated" padding="lg">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Team roster page will be implemented in Phase 4.
        </p>
      </GlassCard>
    </div>
  );
};

export default TeamPage;
