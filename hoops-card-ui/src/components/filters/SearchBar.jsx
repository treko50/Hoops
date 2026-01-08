import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

/**
 * SearchBar Component
 * Glass search input with debouncing
 */
export const SearchBar = ({ value, onChange, placeholder = 'Search players or teams...', debounceMs = 300 }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          className="clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
