import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ingredientService } from '../services/ingredientService';
import { useDebounce } from '../hooks/useDebounce';
import { Ingredient } from '../types';
import './IngredientInput.css';

interface IngredientInputProps {
  onIngredientSelect: (ingredient: string) => void;
  showCharacterCount?: boolean;
  animateSuccess?: boolean;
}

const IngredientInput: React.FC<IngredientInputProps> = memo(({ 
  onIngredientSelect,
  showCharacterCount = true,
  animateSuccess = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const debouncedInputValue = useDebounce(inputValue, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSuggestionClick = useCallback((ingredient: Ingredient, index: number) => {
    // Add flash highlight effect
    const element = document.querySelector(`[data-suggestion-index="${index}"]`);
    if (element) {
      element.classList.add('selected-flash');
    }
    
    setTimeout(() => {
      if (animateSuccess) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 600);
      }
      onIngredientSelect(ingredient.name);
      setInputValue('');
      setSuggestions([]);
      setShowDropdown(false);
    }, 200);
  }, [onIngredientSelect, animateSuccess]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (animateSuccess) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 600);
      }
      onIngredientSelect(inputValue.trim());
      setInputValue('');
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [inputValue, onIngredientSelect, animateSuccess]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Calculate character count status
  const getCharacterCountClass = () => {
    const length = inputValue.length;
    if (length === 0) return '';
    if (length < 2) return 'char-count-warning';
    return 'char-count-success';
  };

  return (
    <div className="ingredient-input-container" ref={dropdownRef}>
      <div className={`ingredient-input-wrapper ${isFocused ? 'focused' : ''} ${showSuccess ? 'success' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="ingredient-input"
          placeholder="Type an ingredient (e.g., chicken, rice)..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Ingredient input"
          aria-autocomplete="list"
          aria-controls="ingredient-suggestions"
        />
        
        {showCharacterCount && inputValue.length > 0 && (
          <div className={`character-count ${getCharacterCountClass()}`}>
            {inputValue.length < 2 ? `${2 - inputValue.length} more character${2 - inputValue.length === 1 ? '' : 's'}` : '✓'}
          </div>
        )}
        
        {showSuccess && (
          <div className="success-checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <ul className="ingredient-suggestions slide-down" id="ingredient-suggestions" role="listbox">
          {suggestions.map((ingredient, index) => (
            <li
              key={ingredient.id}
              className="ingredient-suggestion-item"
              data-suggestion-index={index}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleSuggestionClick(ingredient, index)}
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
