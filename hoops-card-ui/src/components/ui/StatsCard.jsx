import React from 'react';
import PropTypes from 'prop-types';
import { GlassCard } from './GlassCard';
import './StatsCard.css';

/**
 * StatsCard Component
 * Glass card for displaying single stat with icon
 */
export const StatsCard = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  variant = 'default',
  className = '',
}) => {
  return (
    <GlassCard className={`stats-card ${className}`} variant="elevated">
      {icon && <div className="stats-card-icon">{icon}</div>}
      <div className="stats-card-content">
        <div className="stats-card-label">{label}</div>
        <div className={`stats-card-value stats-card-value--${variant}`}>{value}</div>
        {trend && trendValue && (
          <div className={`stats-card-trend stats-card-trend--${trend}`}>
            <span className="stats-card-trend-icon">
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
            <span className="stats-card-trend-value">{trendValue}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

StatsCard.propTypes = {
  /** Icon to display */
  icon: PropTypes.node,
  /** Stat label */
  label: PropTypes.string.isRequired,
  /** Stat value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Trend direction */
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  /** Trend value (e.g., "+12%") */
  trendValue: PropTypes.string,
  /** Color variant */
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'danger']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default StatsCard;
