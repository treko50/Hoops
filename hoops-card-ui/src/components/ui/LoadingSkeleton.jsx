import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSkeleton.css';

/**
 * LoadingSkeleton Component
 * Card-shaped loading skeleton with shimmer effect
 */
export const LoadingSkeleton = ({ count = 1, variant = 'card', className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`loading-skeleton loading-skeleton--${variant} ${className}`}
          aria-busy="true"
          aria-label="Loading"
        >
          {variant === 'card' && (
            <>
              <div className="skeleton-header"></div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-line--title"></div>
                <div className="skeleton-line skeleton-line--text"></div>
                <div className="skeleton-line skeleton-line--text"></div>
                <div className="skeleton-line skeleton-line--short"></div>
              </div>
            </>
          )}
          {variant === 'text' && <div className="skeleton-line skeleton-line--text"></div>}
          {variant === 'circle' && <div className="skeleton-circle"></div>}
          {variant === 'rect' && <div className="skeleton-rect"></div>}
        </div>
      ))}
    </>
  );
};

LoadingSkeleton.propTypes = {
  /** Number of skeletons to render */
  count: PropTypes.number,
  /** Skeleton variant */
  variant: PropTypes.oneOf(['card', 'text', 'circle', 'rect']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default LoadingSkeleton;
