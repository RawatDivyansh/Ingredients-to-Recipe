import React from 'react';
import './IngredientEmptyState.css';

interface IngredientEmptyStateProps {
  suggestions?: string[];
}

const defaultSuggestions = [
  '🍗 Try adding chicken, beef, or fish',
  '🥬 Add vegetables like tomatoes or onions',
  '🍝 Include grains like rice or pasta',
  '🧀 Don\'t forget dairy like cheese or milk',
  '🌶️ Spice it up with herbs and seasonings',
];

const IngredientEmptyState: React.FC<IngredientEmptyStateProps> = ({
  suggestions = defaultSuggestions,
}) => {
  return (
    <div className="ingredient-empty-state">
      <div className="empty-state-icon">
        <span className="icon-emoji">🔍</span>
        <span className="icon-emoji">🥘</span>
      </div>
      <h3 className="empty-state-title">No ingredients selected yet</h3>
      <p className="empty-state-message">
        Start typing to search for ingredients and build your recipe!
      </p>
      <div className="empty-state-suggestions">
        <p className="suggestions-title">Popular ingredients:</p>
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="suggestion-item"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IngredientEmptyState;
