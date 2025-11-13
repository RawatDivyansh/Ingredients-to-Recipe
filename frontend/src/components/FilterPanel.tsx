import React, { useState, memo, useCallback } from 'react';
import { FilterOptions } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  recipeCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = memo(({ filters, onFilterChange, recipeCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const timeRanges = [
    { label: 'Under 15 minutes', value: [0, 15] as [number, number] },
    { label: '15-30 minutes', value: [15, 30] as [number, number] },
    { label: '30-60 minutes', value: [30, 60] as [number, number] },
    { label: 'Over 60 minutes', value: [60, 999] as [number, number] },
  ];

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free'];

  const handleTimeRangeChange = useCallback((range: [number, number] | null) => {
    onFilterChange({
      ...filters,
      cooking_time_range: range || undefined,
    });
  }, [filters, onFilterChange]);

  const handleDietaryChange = useCallback((option: string, checked: boolean) => {
    const currentPreferences = filters.dietary_preferences || [];
    const newPreferences = checked
      ? [...currentPreferences, option]
      : currentPreferences.filter(pref => pref !== option);
    
    onFilterChange({
      ...filters,
      dietary_preferences: newPreferences.length > 0 ? newPreferences : undefined,
    });
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = () => {
    return filters.cooking_time_range !== undefined || 
           (filters.dietary_preferences && filters.dietary_preferences.length > 0);
  };

  const getSelectedTimeRange = (): string | null => {
    if (!filters.cooking_time_range) return null;
    const [min, max] = filters.cooking_time_range;
    return `${min}-${max}`;
  };

  return (
    <>
      <button 
        className={`filter-panel-mobile-toggle ${!isCollapsed ? 'open' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        Filters {hasActiveFilters() && `(${(filters.dietary_preferences?.length || 0) + (filters.cooking_time_range ? 1 : 0)})`}
      </button>

      <div className={`filter-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="filter-panel-header">
          <h3 className="filter-panel-title">Filters</h3>
          <button 
            className="filter-panel-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters()}
          >
            Clear All
          </button>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Cooking Time</h4>
          <div className="filter-time-options">
            <div className="filter-time-option">
              <input
                type="radio"
                id="time-all"
                name="cooking-time"
                checked={!filters.cooking_time_range}
                onChange={() => handleTimeRangeChange(null)}
              />
              <label htmlFor="time-all">Any time</label>
            </div>
            {timeRanges.map((range, index) => {
              const rangeKey = `${range.value[0]}-${range.value[1]}`;
              const isSelected = getSelectedTimeRange() === rangeKey;
              return (
                <div key={index} className="filter-time-option">
                  <input
                    type="radio"
                    id={`time-${index}`}
                    name="cooking-time"
                    checked={isSelected}
                    onChange={() => handleTimeRangeChange(range.value)}
                  />
                  <label htmlFor={`time-${index}`}>{range.label}</label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="filter-section">
          <h4 className="filter-section-title">Dietary Preferences</h4>
          <div className="filter-dietary-options">
            {dietaryOptions.map((option, index) => {
              const isChecked = filters.dietary_preferences?.includes(option) || false;
              return (
                <div key={index} className="filter-dietary-option">
                  <input
                    type="checkbox"
                    id={`dietary-${option}`}
                    checked={isChecked}
                    onChange={(e) => handleDietaryChange(option, e.target.checked)}
                  />
                  <label htmlFor={`dietary-${option}`}>{option}</label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="filter-results-count">
          <strong>{recipeCount}</strong> {recipeCount === 1 ? 'recipe' : 'recipes'} found
        </div>
      </div>
    </>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
