import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './GlassModal.css';

/**
 * GlassModal Component
 * Glassmorphism modal with backdrop and animations
 */
export const GlassModal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="glass-modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
        >
          <motion.div
            className={`glass-modal glass-modal--${size} ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {(title || showCloseButton) && (
              <div className="glass-modal-header">
                {title && (
                  <h3 id="modal-title" className="glass-modal-title">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    className="glass-modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}

            <div className="glass-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

GlassModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,

  /** Close handler */
  onClose: PropTypes.func.isRequired,

  /** Modal content */
  children: PropTypes.node.isRequired,

  /** Modal title */
  title: PropTypes.string,

  /** Modal size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),

  /** Show close button */
  showCloseButton: PropTypes.bool,

  /** Close on backdrop click */
  closeOnBackdropClick: PropTypes.bool,

  /** Close on escape key */
  closeOnEscape: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default GlassModal;
