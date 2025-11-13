import React, { useState } from 'react';
import { useAuth } from '../contexts';
import { userService } from '../services';
import { RecipeIngredient } from '../types';
import './ShoppingListButton.css';

interface ShoppingListButtonProps {
  ingredients: RecipeIngredient[];
}

const ShoppingListButton: React.FC<ShoppingListButtonProps> = ({ ingredients }) => {
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const missingIngredients = ingredients.filter(ing => !ing.is_available);

  const handleAddToShoppingList = async () => {
    if (!isAuthenticated) {
      setError('Please log in to add items to your shopping list');
      return;
    }

    if (missingIngredients.length === 0) {
      setError('No missing ingredients to add');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      setSuccessMessage(null);

      // Format ingredients as strings with quantity and unit
      const ingredientStrings = missingIngredients.map(
        ing => `${ing.quantity} ${ing.unit} ${ing.ingredient_name}`.trim()
      );

      await userService.addToShoppingList(ingredientStrings);
      
      setSuccessMessage(
        `Added ${missingIngredients.length} ${missingIngredients.length === 1 ? 'ingredient' : 'ingredients'} to your shopping list!`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to add to shopping list:', err);
      setError(err.response?.data?.detail || 'Failed to add to shopping list. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="shopping-list-button-container">
        <p className="login-required">
          <a href="/login">Log in</a> to add missing ingredients to your shopping list
        </p>
      </div>
    );
  }

  if (missingIngredients.length === 0) {
    return (
      <div className="shopping-list-button-container">
        <p className="no-missing-ingredients">
          ✓ You have all the ingredients for this recipe!
        </p>
      </div>
    );
  }

  return (
    <div className="shopping-list-button-container">
      <button
        className="shopping-list-button"
        onClick={handleAddToShoppingList}
        disabled={isAdding}
      >
        {isAdding ? (
          <>
            <span className="button-icon">⏳</span>
            Adding...
          </>
        ) : (
          <>
            <span className="button-icon">🛒</span>
            Add Missing Ingredients to Shopping List ({missingIngredients.length})
          </>
        )}
      </button>

      {error && <div className="shopping-list-error">{error}</div>}
      {successMessage && <div className="shopping-list-success">{successMessage}</div>}
    </div>
  );
};

export default ShoppingListButton;
