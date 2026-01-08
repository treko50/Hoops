/**
 * API Service Layer
 * Handles all API calls to the Spring Boot backend
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fetch all cards with optional minimum rating filter
 * @param {number} minRating - Minimum rating (default: 0)
 * @returns {Promise<Array>} Array of card objects
 */
export const fetchAllCards = async (minRating = 0) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/advanced?minRating=${minRating}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.cards || [];
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};

/**
 * Fetch a single card by player ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Card object
 */
export const fetchCardById = async (playerId) => {
  try {
    const cards = await fetchAllCards();
    const card = cards.find(c => c.playerId === playerId);
    if (!card) {
      throw new Error(`Card not found for player ID: ${playerId}`);
    }
    return card;
  } catch (error) {
    console.error('Error fetching card by ID:', error);
    throw error;
  }
};

/**
 * Fetch cards by team abbreviation
 * @param {string} teamAbbr - Team abbreviation (e.g., 'LAL', 'GSW')
 * @returns {Promise<Array>} Array of card objects for the team
 */
export const fetchCardsByTeam = async (teamAbbr) => {
  try {
    const cards = await fetchAllCards();
    return cards.filter(card => card.teamAbbr === teamAbbr || card.team === teamAbbr);
  } catch (error) {
    console.error('Error fetching cards by team:', error);
    throw error;
  }
};

/**
 * Fetch cards with filters
 * @param {Object} filters - Filter object
 * @param {string} filters.rarity - Rarity filter
 * @param {string} filters.position - Position filter
 * @param {string} filters.team - Team filter
 * @param {number} filters.minRating - Minimum overall rating
 * @param {number} filters.maxRating - Maximum overall rating
 * @returns {Promise<Array>} Filtered array of card objects
 */
export const fetchCardsByFilters = async (filters = {}) => {
  try {
    const cards = await fetchAllCards();

    return cards.filter(card => {
      // Rarity filter
      if (filters.rarity && filters.rarity !== 'all' && card.rarity !== filters.rarity) {
        return false;
      }

      // Position filter
      if (filters.position && filters.position !== 'all' && card.position !== filters.position) {
        return false;
      }

      // Team filter
      if (filters.team && filters.team !== 'all') {
        if (card.teamAbbr !== filters.team && card.team !== filters.team) {
          return false;
        }
      }

      // Rating range filter
      if (filters.minRating !== undefined && card.overallRating < filters.minRating) {
        return false;
      }
      if (filters.maxRating !== undefined && card.overallRating > filters.maxRating) {
        return false;
      }

      return true;
    });
  } catch (error) {
    console.error('Error fetching cards with filters:', error);
    throw error;
  }
};

/**
 * Search cards by player name or team
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching card objects
 */
export const searchCards = async (query) => {
  try {
    const cards = await fetchAllCards();
    const lowerQuery = query.toLowerCase();

    return cards.filter(card => {
      const playerName = card.playerName?.toLowerCase() || '';
      const team = card.team?.toLowerCase() || '';
      const teamAbbr = card.teamAbbr?.toLowerCase() || '';

      return playerName.includes(lowerQuery) ||
             team.includes(lowerQuery) ||
             teamAbbr.includes(lowerQuery);
    });
  } catch (error) {
    console.error('Error searching cards:', error);
    throw error;
  }
};

/**
 * Get top cards by overall rating
 * @param {number} limit - Number of cards to return (default: 6)
 * @returns {Promise<Array>} Top rated cards
 */
export const getTopCards = async (limit = 6) => {
  try {
    const cards = await fetchAllCards();
    return cards
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top cards:', error);
    throw error;
  }
};

/**
 * Get cards by rarity tier
 * @param {string} rarity - Rarity tier (legendary, gold_rare, gold, silver_rare, silver, bronze)
 * @returns {Promise<Array>} Cards of specified rarity
 */
export const getCardsByRarity = async (rarity) => {
  try {
    const cards = await fetchAllCards();
    return cards.filter(card => card.rarity === rarity);
  } catch (error) {
    console.error('Error fetching cards by rarity:', error);
    throw error;
  }
};

/**
 * Get unique list of teams from cards
 * @returns {Promise<Array>} Array of team objects with abbreviation and full name
 */
export const getTeamList = async () => {
  try {
    const cards = await fetchAllCards();
    const teamMap = new Map();

    cards.forEach(card => {
      if (card.teamAbbr && !teamMap.has(card.teamAbbr)) {
        teamMap.set(card.teamAbbr, {
          abbreviation: card.teamAbbr,
          name: card.team
        });
      }
    });

    return Array.from(teamMap.values()).sort((a, b) =>
      a.abbreviation.localeCompare(b.abbreviation)
    );
  } catch (error) {
    console.error('Error fetching team list:', error);
    throw error;
  }
};

/**
 * Get unique list of positions from cards
 * @returns {Promise<Array>} Array of position strings
 */
export const getPositionList = async () => {
  try {
    const cards = await fetchAllCards();
    const positions = new Set(cards.map(card => card.position).filter(Boolean));
    return Array.from(positions).sort();
  } catch (error) {
    console.error('Error fetching position list:', error);
    throw error;
  }
};

/**
 * Get rarity statistics
 * @returns {Promise<Object>} Object with rarity counts
 */
export const getRarityStats = async () => {
  try {
    const cards = await fetchAllCards();
    const stats = {};

    cards.forEach(card => {
      stats[card.rarity] = (stats[card.rarity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching rarity stats:', error);
    throw error;
  }
};

export default {
  fetchAllCards,
  fetchCardById,
  fetchCardsByTeam,
  fetchCardsByFilters,
  searchCards,
  getTopCards,
  getCardsByRarity,
  getTeamList,
  getPositionList,
  getRarityStats,
};
