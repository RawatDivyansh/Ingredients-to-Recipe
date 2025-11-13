import React from 'react';
import './SelectedIngredientsList.css';

interface SelectedIngredientsListProps {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
}

const SelectedIngredientsList: React.FC<SelectedIngredientsListProps> = ({
  ingredients,
  onRemoveIngredient,
}) => {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div className="selected-ingredients-list">
      <h3>Selected Ingredients ({ingredients.length})</h3>
      <div className="ingredients-tags">
        {ingredients.map((ingredient, index) => (
          <div key={`${ingredient}-${index}`} className="ingredient-tag">
            <span className="ingredient-name">{ingredient}</span>
            <button
              className="remove-button"
              onClick={() => onRemoveIngredient(ingredient)}
              aria-label={`Remove ${ingredient}`}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedIngredientsList;
