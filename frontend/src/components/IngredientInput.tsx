import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ingredientService } from '../services/ingredientService';
import { useDebounce } from '../hooks/useDebounce';
import { Ingredient } from '../types';
import './IngredientInput.css';

interface IngredientInputProps {
  onIngredientSelect: (ingredient: string) => void;
}

const IngredientInput: React.FC<IngredientInputProps> = memo(({ onIngredientSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedInputValue = useDebounce(inputValue, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete suggestions when debounced input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedInputValue.length >= 2) {
        setIsLoading(true);
        try {
          const response = await ingredientService.getAutocompleteSuggestions(debouncedInputValue);
          setSuggestions(response.suggestions);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching autocomplete suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    fetchSuggestions();
  }, [debouncedInputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSuggestionClick = useCallback((ingredient: Ingredient) => {
    onIngredientSelect(ingredient.name);
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
  }, [onIngredientSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onIngredientSelect(inputValue.trim());
      setInputValue('');
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [inputValue, onIngredientSelect]);

  return (
    <div className="ingredient-input-container" ref={dropdownRef}>
      <input
        type="text"
        className="ingredient-input"
        placeholder="Type an ingredient (e.g., chicken, rice)..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label="Ingredient input"
        aria-autocomplete="list"
        aria-controls="ingredient-suggestions"
      />
      
      {showDropdown && suggestions.length > 0 && (
        <ul className="ingredient-suggestions" id="ingredient-suggestions" role="listbox">
          {suggestions.map((ingredient) => (
            <li
              key={ingredient.id}
              className="ingredient-suggestion-item"
              onClick={() => handleSuggestionClick(ingredient)}
              role="option"
              aria-selected="false"
            >
              {ingredient.name}
              <span className="ingredient-category">{ingredient.category}</span>
            </li>
          ))}
        </ul>
      )}
      
      {isLoading && inputValue.length >= 2 && (
        <div className="ingredient-loading">Loading suggestions...</div>
      )}
      
      {showDropdown && suggestions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div className="ingredient-no-results">No ingredients found. Press Enter to add anyway.</div>
      )}
    </div>
  );
});

IngredientInput.displayName = 'IngredientInput';

export default IngredientInput;
