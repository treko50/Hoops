import React from 'react';
import PropTypes from 'prop-types';
import './GlassCard.css';

/**
 * GlassCard Component
 * Reusable glassmorphism card with multiple variants
 * Base component for all glass surfaces in the app
 */
export const GlassCard = ({
  children,
  variant = 'default',
  interactive = false,
  padding = 'default',
  className = '',
  onClick,
  style,
  ...props
}) => {
  const classNames = [
    'glass-card',
    `glass-card--${variant}`,
    `glass-card--padding-${padding}`,
    interactive && 'glass-card--interactive',
    onClick && 'glass-card--clickable',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

GlassCard.propTypes = {
  /** Content to render inside the card */
  children: PropTypes.node,

  /** Visual variant of the card */
  variant: PropTypes.oneOf(['default', 'elevated', 'light', 'dark', 'compact']),

  /** Whether the card has interactive hover effects */
  interactive: PropTypes.bool,

  /** Padding size */
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),

  /** Additional CSS classes */
  className: PropTypes.string,

  /** Click handler */
  onClick: PropTypes.func,

  /** Inline styles */
  style: PropTypes.object,
};

export default GlassCard;
