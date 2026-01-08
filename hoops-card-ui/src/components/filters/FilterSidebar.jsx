import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassSelect } from '../ui/GlassInput';
import { GlassRangeSlider } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { getTeamList, getPositionList } from '../../services/api';
import './FilterSidebar.css';

/**
 * FilterSidebar Component
 * Advanced filtering options for cards
 */
export const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Load teams and positions
    const loadFilterOptions = async () => {
      try {
        const [teamList, positionList] = await Promise.all([
          getTeamList(),
          getPositionList()
        ]);
        setTeams(teamList);
        setPositions(positionList);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (filterKey, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [filterKey]: value });
    }
  };

  const handleRatingChange = (values) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        minRating: values[0],
        maxRating: values[1]
      });
    }
  };

  const rarities = [
    { value: 'all', label: 'All Rarities' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'gold_rare', label: 'Gold Rare' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver_rare', label: 'Silver Rare' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' }
  ];

  // Format position options
  const positionOptions = [
    { label: 'All Positions', value: 'all' },
    ...positions.map(pos => ({ label: pos, value: pos }))
  ];

  // Format team options
  const teamOptions = [
    { label: 'All Teams', value: 'all' },
    ...teams.map(team => ({
      label: `${team.abbreviation} - ${team.name}`,
      value: team.abbreviation
    }))
  ];

  return (
    <div className="filter-sidebar">
      <GlassCard variant="elevated" padding="lg" className="filter-card">
        <div className="filter-header">
          <h2 className="filter-title">Filters</h2>
          {onClearFilters && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
            >
              Clear All
            </GlassButton>
          )}
        </div>

        <div className="filter-section">
          {/* Rarity Filter */}
          <div className="filter-group">
            <label className="filter-label">Rarity</label>
            <GlassSelect
              value={filters.rarity || 'all'}
              onChange={(e) => handleFilterChange('rarity', e.target.value)}
              options={rarities}
            />
          </div>

          {/* Position Filter */}
          <div className="filter-group">
            <label className="filter-label">Position</label>
            <GlassSelect
              value={filters.position || 'all'}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              options={positionOptions}
            />
          </div>

          {/* Team Filter */}
          <div className="filter-group">
            <label className="filter-label">Team</label>
            <GlassSelect
              value={filters.team || 'all'}
              onChange={(e) => handleFilterChange('team', e.target.value)}
              options={teamOptions}
            />
          </div>

          {/* Rating Range Filter */}
          <div className="filter-group">
            <label className="filter-label">
              Overall Rating: {filters.minRating || 0} - {filters.maxRating || 100}
            </label>
            <GlassRangeSlider
              min={0}
              max={100}
              values={[filters.minRating || 0, filters.maxRating || 100]}
              onChange={handleRatingChange}
            />
          </div>
        </div>

        {/* Filter Summary */}
        <div className="filter-summary">
          {filters.rarity && filters.rarity !== 'all' && (
            <span className="filter-tag">
              Rarity: {filters.rarity.replace('_', ' ')}
            </span>
          )}
          {filters.position && filters.position !== 'all' && (
            <span className="filter-tag">
              Position: {filters.position}
            </span>
          )}
          {filters.team && filters.team !== 'all' && (
            <span className="filter-tag">
              Team: {filters.team}
            </span>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FilterSidebar;
