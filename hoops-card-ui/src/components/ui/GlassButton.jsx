import React from 'react';
import PropTypes from 'prop-types';
import './GlassButton.css';

/**
 * GlassButton Component
 * Glassmorphism-styled button with variants and states
 */
export const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classNames = [
    'glass-btn',
    `glass-btn--${variant}`,
    `glass-btn--${size}`,
    fullWidth && 'glass-btn--full-width',
    loading && 'glass-btn--loading',
    disabled && 'glass-btn--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={classNames}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="glass-btn__spinner">
          <span className="spinner"></span>
        </span>
      )}

      {!loading && leftIcon && <span className="glass-btn__icon glass-btn__icon--left">{leftIcon}</span>}

      <span className="glass-btn__content">{children}</span>

      {!loading && rightIcon && <span className="glass-btn__icon glass-btn__icon--right">{rightIcon}</span>}
    </button>
  );
};

GlassButton.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,

  /** Button variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'outline']),

  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  /** Make button full width */
  fullWidth: PropTypes.bool,

  /** Loading state */
  loading: PropTypes.bool,

  /** Disabled state */
  disabled: PropTypes.bool,

  /** Icon to display on the left */
  leftIcon: PropTypes.node,

  /** Icon to display on the right */
  rightIcon: PropTypes.node,

  /** Click handler */
  onClick: PropTypes.func,

  /** Button type */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default GlassButton;
