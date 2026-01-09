import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import './GlassInput.css';

/**
 * GlassInput Component
 * Glassmorphism-styled input fields with multiple types
 */
export const GlassInput = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  label,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const isSearch = type === 'search' || leftIcon === 'search';

  const containerClasses = [
    'glass-input-container',
    error && 'glass-input-container--error',
    disabled && 'glass-input-container--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'glass-input',
    leftIcon || isSearch ? 'glass-input--has-left-icon' : '',
    rightIcon ? 'glass-input--has-right-icon' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="glass-input-label">{label}</label>
      )}

      <div className="glass-input-wrapper">
        {(isSearch || leftIcon) && (
          <span className="glass-input-icon glass-input-icon--left">
            {isSearch ? <FiSearch /> : leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={type === 'search' ? 'text' : type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <span className="glass-input-icon glass-input-icon--right">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <span className={`glass-input-helper ${error ? 'glass-input-helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

GlassInput.propTypes = {
  /** Input type */
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'search', 'tel', 'url']),

  /** Placeholder text */
  placeholder: PropTypes.string,

  /** Input value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** Change handler */
  onChange: PropTypes.func,

  /** Focus handler */
  onFocus: PropTypes.func,

  /** Blur handler */
  onBlur: PropTypes.func,

  /** Disabled state */
  disabled: PropTypes.bool,

  /** Error message */
  error: PropTypes.string,

  /** Label text */
  label: PropTypes.string,

  /** Helper text */
  helperText: PropTypes.string,

  /** Icon or 'search' for search icon on the left */
  leftIcon: PropTypes.node,

  /** Icon on the right */
  rightIcon: PropTypes.node,

  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * GlassSelect Component
 * Glassmorphism-styled select dropdown
 */
export const GlassSelect = forwardRef(({
  options = [],
  value,
  onChange,
  placeholder,
  label,
  error,
  helperText,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const containerClasses = [
    'glass-input-container',
    error && 'glass-input-container--error',
    disabled && 'glass-input-container--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="glass-input-label">{label}</label>
      )}

      <div className="glass-select-wrapper">
        <select
          ref={ref}
          className="glass-select"
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option
              key={option.value || index}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {(error || helperText) && (
        <span className={`glass-input-helper ${error ? 'glass-input-helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';

GlassSelect.propTypes = {
  /** Options array [{label, value}] */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,

  /** Selected value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** Change handler */
  onChange: PropTypes.func,

  /** Placeholder text */
  placeholder: PropTypes.string,

  /** Label text */
  label: PropTypes.string,

  /** Error message */
  error: PropTypes.string,

  /** Helper text */
  helperText: PropTypes.string,

  /** Disabled state */
  disabled: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * GlassRangeSlider Component
 * Glassmorphism-styled range slider
 */
export const GlassRangeSlider = ({
  min = 0,
  max = 100,
  value = 0,
  onChange,
  label,
  showValue = true,
  disabled = false,
  className = '',
  ...props
}) => {
  const percentage = value !== undefined && value !== null ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={`glass-slider-container ${className}`}>
      {label && (
        <div className="glass-slider-header">
          <label className="glass-input-label">{label}</label>
          {showValue && (
            <span className="glass-slider-value">{value}</span>
          )}
        </div>
      )}

      <div className="glass-slider-wrapper">
        <input
          type="range"
          className="glass-slider"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            background: `linear-gradient(to right,
              rgba(99, 102, 241, 0.6) 0%,
              rgba(99, 102, 241, 0.6) ${percentage}%,
              rgba(255, 255, 255, 0.1) ${percentage}%,
              rgba(255, 255, 255, 0.1) 100%)`
          }}
          {...props}
        />
      </div>
    </div>
  );
};

GlassRangeSlider.propTypes = {
  /** Minimum value */
  min: PropTypes.number,

  /** Maximum value */
  max: PropTypes.number,

  /** Current value */
  value: PropTypes.number,

  /** Change handler */
  onChange: PropTypes.func,

  /** Label text */
  label: PropTypes.string,

  /** Show current value */
  showValue: PropTypes.bool,

  /** Disabled state */
  disabled: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default GlassInput;
