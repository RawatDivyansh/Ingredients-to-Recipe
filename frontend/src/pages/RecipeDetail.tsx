import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Recipe, RecipeIngredient } from '../types';
import { recipeService } from '../services';
import { RatingComponent, ShoppingListButton, FavoriteButton } from '../components';
import './RecipeDetail.css';

interface IngredientListProps {
  ingredients: RecipeIngredient[];
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients }) => {
  const availableIngredients = ingredients.filter(ing => ing.is_available);
  const missingIngredients = ingredients.filter(ing => !ing.is_available);

  return (
    <div className="ingredient-list">
      <h3>Ingredients</h3>
      
      {availableIngredients.length > 0 && (
        <div className="ingredients-section">
          <h4 className="available-header">Available</h4>
          <ul className="ingredients-available">
            {availableIngredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item available">
                <span className="ingredient-check">✓</span>
                <span className="ingredient-text">
                  {ingredient.quantity} {ingredient.unit} {ingredient.ingredient_name}
                  {ingredient.is_optional && <span className="optional-tag">(optional)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {missingIngredients.length > 0 && (
        <div className="ingredients-section">
          <h4 className="missing-header">Missing</h4>
          <ul className="ingredients-missing">
            {missingIngredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item missing">
                <span className="ingredient-cross">✗</span>
                <span className="ingredient-text">
                  {ingredient.quantity} {ingredient.unit} {ingredient.ingredient_name}
                  {ingredient.is_optional && <span className="optional-tag">(optional)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface InstructionStepsProps {
  instructions: string[];
}

const InstructionSteps: React.FC<InstructionStepsProps> = ({ instructions }) => {
  return (
    <div className="instruction-steps">
      <h3>Instructions</h3>
      <ol className="steps-list">
        {instructions.map((step, index) => (
          <li key={index} className="step-item">
            <span className="step-number">{index + 1}</span>
            <span className="step-text">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError('Recipe ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const recipeData = await recipeService.getRecipeById(parseInt(id, 10));
        setRecipe(recipeData);
      } catch (err: any) {
        console.error('Failed to fetch recipe:', err);
        setError(err.response?.data?.detail || 'Failed to load recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="recipe-detail-container">
        <div className="loading-spinner">Loading recipe...</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-container">
        <div className="error-message">
          <p>{error || 'Recipe not found'}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Results
      </button>

      <div className="recipe-header">
        {recipe.image_url && (
          <img src={recipe.image_url} alt={recipe.name} className="recipe-image" />
        )}
        <div className="recipe-title-section">
          <h1 className="recipe-name">{recipe.name}</h1>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
        </div>
      </div>

      <div className="recipe-metadata">
        <div className="metadata-item">
          <span className="metadata-icon">⏱️</span>
          <span className="metadata-label">Cooking Time:</span>
          <span className="metadata-value">{recipe.cooking_time_minutes} minutes</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-icon">📊</span>
          <span className="metadata-label">Difficulty:</span>
          <span className="metadata-value">{recipe.difficulty}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-icon">🍽️</span>
          <span className="metadata-label">Servings:</span>
          <span className="metadata-value">{recipe.serving_size}</span>
        </div>
      </div>

      {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
        <div className="dietary-tags">
          {recipe.dietary_tags.map((tag, index) => (
            <span key={index} className="dietary-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="recipe-actions">
        <FavoriteButton recipeId={recipe.id} />
        <ShoppingListButton ingredients={recipe.ingredients} />
      </div>

      <RatingComponent recipeId={recipe.id} />

      <div className="recipe-content">
        <div className="recipe-ingredients">
          <IngredientList ingredients={recipe.ingredients} />
        </div>

        <div className="recipe-instructions">
          <InstructionSteps instructions={recipe.instructions} />
        </div>
      </div>

      {recipe.nutritional_info && Object.keys(recipe.nutritional_info).length > 0 && (
        <div className="nutritional-info">
          <h3>Nutritional Information</h3>
          <div className="nutrition-grid">
            {Object.entries(recipe.nutritional_info).map(([key, value]) => (
              <div key={key} className="nutrition-item">
                <span className="nutrition-label">{key}:</span>
                <span className="nutrition-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
