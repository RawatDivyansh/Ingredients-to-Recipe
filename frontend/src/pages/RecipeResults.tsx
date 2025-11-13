import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Recipe, FilterOptions } from '../types';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import FilterPanel from '../components/FilterPanel';
import './RecipeResults.css';

const RECIPES_PER_PAGE = 20;

const RecipeResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get ingredients from location state
  const ingredients = (location.state as any)?.ingredients || [];

  useEffect(() => {
    if (ingredients.length === 0) {
      navigate('/');
      return;
    }
    
    fetchRecipes();
  }, [ingredients]);

  useEffect(() => {
    applyFilters();
  }, [recipes, filters]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.searchRecipes({
        ingredients,
        filters: {},
      });
      
      setRecipes(response.recipes);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(err.response?.data?.detail || 'Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recipes];

    // Apply cooking time filter
    if (filters.cooking_time_range) {
      const [min, max] = filters.cooking_time_range;
      filtered = filtered.filter(recipe => {
        return recipe.cooking_time_minutes >= min && recipe.cooking_time_minutes <= max;
      });
    }

    // Apply dietary preferences filter
    if (filters.dietary_preferences && filters.dietary_preferences.length > 0) {
      filtered = filtered.filter(recipe => {
        return filters.dietary_preferences!.every(pref => 
          recipe.dietary_tags.includes(pref)
        );
      });
    }

    setFilteredRecipes(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`, {
      state: { availableIngredients: ingredients }
    });
  };

  const handleRetry = () => {
    fetchRecipes();
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="recipe-results">
        <div className="recipe-results-container">
          <div className="recipe-results-loading">
            <div className="recipe-results-spinner"></div>
            <p className="recipe-results-loading-text">Finding delicious recipes for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-results">
        <div className="recipe-results-container">
          <div className="recipe-results-error">
            <div className="recipe-results-error-icon">⚠️</div>
            <h2 className="recipe-results-error-title">Oops! Something went wrong</h2>
            <p className="recipe-results-error-message">{error}</p>
            <button className="recipe-results-error-button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-results">
      <div className="recipe-results-container">
        <div className="recipe-results-header">
          <h1 className="recipe-results-title">Recipe Results</h1>
          <p className="recipe-results-subtitle">
            Showing recipes based on your ingredients
          </p>
          <div className="recipe-results-ingredients">
            {ingredients.map((ingredient: string, index: number) => (
              <span key={index} className="recipe-results-ingredient-tag">
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="recipe-results-empty">
            <div className="recipe-results-empty-icon">🔍</div>
            <h2 className="recipe-results-empty-title">No recipes found</h2>
            <p className="recipe-results-empty-message">
              We couldn't find any recipes matching your criteria.
            </p>
            <div className="recipe-results-empty-suggestions">
              <p><strong>Try:</strong></p>
              <ul>
                <li>Removing some filters</li>
                <li>Adding more ingredients</li>
                <li>Trying different ingredient combinations</li>
              </ul>
            </div>
            <button className="recipe-results-error-button" onClick={handleBackToHome}>
              Back to Home
            </button>
          </div>
        ) : (
          <div className="recipe-results-content">
            <div className="recipe-results-filters">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                recipeCount={filteredRecipes.length}
              />
            </div>

            <div className="recipe-results-main">
              <div className="recipe-results-grid">
                {currentRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="recipe-results-pagination">
                  <button
                    className="recipe-results-pagination-button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="recipe-results-pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="recipe-results-pagination-button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeResults;
