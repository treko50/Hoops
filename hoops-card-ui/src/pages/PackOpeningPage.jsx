import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';

/**
 * PackOpeningPage Component
 * Open card packs with animations (placeholder)
 */
export const PackOpeningPage = () => {
  return (
    <div>
      <h1 className="page-title">Pack Opening</h1>
      <GlassCard variant="elevated" padding="lg">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Pack opening feature with animations will be implemented in Phase 5.
        </p>
      </GlassCard>
    </div>
  );
};

export default PackOpeningPage;
