import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * CollectionContext
 * Manages user's favorited cards with localStorage persistence
 */
const CollectionContext = createContext();

/**
 * Custom hook to use the collection context
 */
export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};

/**
 * CollectionProvider Component
 * Provides collection state and methods to all child components
 */
export const CollectionProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('hoops-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('hoops-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  /**
   * Add a card to favorites
   */
  const addFavorite = (playerId) => {
    setFavorites((prev) => {
      if (prev.includes(playerId)) {
        return prev; // Already favorited
      }
      return [...prev, playerId];
    });
  };

  /**
   * Remove a card from favorites
   */
  const removeFavorite = (playerId) => {
    setFavorites((prev) => prev.filter((id) => id !== playerId));
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = (playerId) => {
    if (favorites.includes(playerId)) {
      removeFavorite(playerId);
    } else {
      addFavorite(playerId);
    }
  };

  /**
   * Check if a card is favorited
   */
  const isFavorite = (playerId) => {
    return favorites.includes(playerId);
  };

  /**
   * Clear all favorites
   */
  const clearFavorites = () => {
    setFavorites([]);
  };

  /**
   * Get total count of favorites
   */
  const getFavoriteCount = () => {
    return favorites.length;
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoriteCount,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionContext;
