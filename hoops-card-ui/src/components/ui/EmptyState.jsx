import React from 'react';
import PropTypes from 'prop-types';
import { FiInbox } from 'react-icons/fi';
import { GlassButton } from './GlassButton';
import './EmptyState.css';

/**
 * EmptyState Component
 * Display when no content is available
 */
export const EmptyState = ({
  icon = <FiInbox />,
  title = 'No items found',
  message,
  action,
  actionLabel,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && actionLabel && (
        <GlassButton variant="primary" onClick={action}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  /** Icon to display */
  icon: PropTypes.node,
  /** Title text */
  title: PropTypes.string,
  /** Message text */
  message: PropTypes.string,
  /** Action button handler */
  action: PropTypes.func,
  /** Action button label */
  actionLabel: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default EmptyState;
