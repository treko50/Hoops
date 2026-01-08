import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

/**
 * Badge Component
 * Glassmorphism badges for rarity, position, and general labels
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  /** Badge content */
  children: PropTypes.node.isRequired,

  /** Badge variant */
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'legendary',
    'gold-rare',
    'gold',
    'silver-rare',
    'silver',
    'bronze',
  ]),

  /** Badge size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge;
