import React, { useState, memo, useCallback, useRef } from 'react';
import { FilterOptions } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  recipeCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = memo(({ filters, onFilterChange, recipeCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<FilterOptions>(filters);
  const applyButtonRef = useRef<HTMLButtonElement>(null);

  const timeRanges = [
    { label: 'Under 15 minutes', value: [0, 15] as [number, number] },
    { label: '15-30 minutes', value: [15, 30] as [number, number] },
    { label: '30-60 minutes', value: [30, 60] as [number, number] },
    { label: 'Over 60 minutes', value: [60, 999] as [number, number] },
  ];

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free'];

  const handleTimeRangeChange = useCallback((range: [number, number] | null) => {
    setPendingFilters({
      ...pendingFilters,
      cooking_time_range: range || undefined,
    });
  }, [pendingFilters]);

  const handleDietaryChange = useCallback((option: string, checked: boolean) => {
    const currentPreferences = pendingFilters.dietary_preferences || [];
    const newPreferences = checked
      ? [...currentPreferences, option]
      : currentPreferences.filter(pref => pref !== option);
    
    setPendingFilters({
      ...pendingFilters,
      dietary_preferences: newPreferences.length > 0 ? newPreferences : undefined,
    });
  }, [pendingFilters]);

  const handleApplyFilters = useCallback(() => {
    onFilterChange(pendingFilters);
    
    // Ripple effect
    if (applyButtonRef.current) {
      const button = applyButtonRef.current;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${rect.width / 2 - size / 2}px`;
      ripple.style.top = `${rect.height / 2 - size / 2}px`;
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }, [pendingFilters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setPendingFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  const handleRemoveFilter = useCallback((filterType: 'time' | 'dietary', value?: string) => {
    if (filterType === 'time') {
      const newFilters = { ...pendingFilters, cooking_time_range: undefined };
      setPendingFilters(newFilters);
      onFilterChange(newFilters);
    } else if (filterType === 'dietary' && value) {
      const currentPreferences = pendingFilters.dietary_preferences || [];
      const newPreferences = currentPreferences.filter(pref => pref !== value);
      const newFilters = {
        ...pendingFilters,
        dietary_preferences: newPreferences.length > 0 ? newPreferences : undefined,
      };
      setPendingFilters(newFilters);
      onFilterChange(newFilters);
    }
  }, [pendingFilters, onFilterChange]);

  const hasActiveFilters = () => {
    return filters.cooking_time_range !== undefined || 
           (filters.dietary_preferences && filters.dietary_preferences.length > 0);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.cooking_time_range) count++;
    if (filters.dietary_preferences) count += filters.dietary_preferences.length;
    return count;
  };

  const hasPendingChanges = () => {
    return JSON.stringify(filters) !== JSON.stringify(pendingFilters);
  };

  const getSelectedTimeRange = (): string | null => {
    if (!pendingFilters.cooking_time_range) return null;
    const [min, max] = pendingFilters.cooking_time_range;
    return `${min}-${max}`;
  };

  const getTimeRangeLabel = (range: [number, number]): string => {
    const [min, max] = range;
    if (max >= 999) return `Over ${min} min`;
    return `${min}-${max} min`;
  };

  return (
    <>
      <button 
        className={`filter-panel-mobile-toggle ${!isCollapsed ? 'open' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span>Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="filter-count-badge">{getActiveFilterCount()}</span>
        )}
      </button>

      <div className={`filter-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="filter-panel-header">
          <h3 className="filter-panel-title">
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="filter-count-badge">{getActiveFilterCount()}</span>
            )}
          </h3>
          <button 
            className="filter-panel-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters()}
          >
            Clear All
          </button>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters() && (
          <div className="active-filters">
            {filters.cooking_time_range && (
              <div className="filter-chip">
                <span>{getTimeRangeLabel(filters.cooking_time_range)}</span>
                <button
                  className="filter-chip-remove"
                  onClick={() => handleRemoveFilter('time')}
                  aria-label="Remove time filter"
                >
                  ×
                </button>
              </div>
            )}
            {filters.dietary_preferences?.map((pref) => (
              <div key={pref} className="filter-chip">
                <span>{pref}</span>
                <button
                  className="filter-chip-remove"
                  onClick={() => handleRemoveFilter('dietary', pref)}
                  aria-label={`Remove ${pref} filter`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="filter-section">
          <h4 className="filter-section-title">Cooking Time</h4>
          <div className="filter-time-options">
            <div className="filter-time-option">
              <input
                type="radio"
                id="time-all"
                name="cooking-time"
                checked={!pendingFilters.cooking_time_range}
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
              const isChecked = pendingFilters.dietary_preferences?.includes(option) || false;
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

        {hasPendingChanges() && (
          <button
            ref={applyButtonRef}
            className="filter-apply-button"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        )}

        <div className="filter-results-count">
          <strong>{recipeCount}</strong> {recipeCount === 1 ? 'recipe' : 'recipes'} found
        </div>
      </div>
    </>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
