import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Recipe, FilterOptions } from '../types';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import FilterPanel from '../components/FilterPanel';
import SkeletonCard from '../components/SkeletonCard';
import SkeletonLoader from '../components/SkeletonLoader';
import RecipeStatsDashboard from '../components/RecipeStatsDashboard';
import AnimatedEmptyState from '../components/AnimatedEmptyState';
import HelpIcon from '../components/HelpIcon';
import './RecipeResults.css';

const RECIPES_PER_PAGE = 20;

const RecipeResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get ingredients from location state
  const ingredients = (location.state as any)?.ingredients || [];

  const fetchRecipes = useCallback(async () => {
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
  }, [ingredients]);

  useEffect(() => {
    if (ingredients.length === 0) {
      navigate('/');
      return;
    }
    
    fetchRecipes();
  }, [ingredients, navigate, fetchRecipes]);

  // Memoize filtered recipes to avoid unnecessary recalculations
  const filteredRecipes = useMemo(() => {
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

    return filtered;
  }, [recipes, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRecipes]);

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleRecipeClick = useCallback((recipeId: number) => {
    navigate(`/recipes/${recipeId}`, {
      state: { availableIngredients: ingredients }
    });
  }, [navigate, ingredients]);

  const handleRetry = useCallback(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Memoize pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
    const endIndex = startIndex + RECIPES_PER_PAGE;
    const currentRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    return { totalPages, currentRecipes };
  }, [filteredRecipes, currentPage]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, paginationData.totalPages]);

  if (loading) {
    return (
      <div className="recipe-results">
        <div className="recipe-results-container">
          <div className="recipe-results-header">
            <h1 className="recipe-results-title">Recipe Results</h1>
            <p className="recipe-results-subtitle">
              Finding delicious recipes for you...
            </p>
            {ingredients.length > 0 && (
              <div className="recipe-results-ingredients">
                {ingredients.map((ingredient: string, index: number) => (
                  <span key={index} className="recipe-results-ingredient-tag">
                    {ingredient}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="recipe-results-content">
            <div className="recipe-results-filters">
              <SkeletonLoader variant="filter-panel" />
            </div>
            <div className="recipe-results-main">
              <div className="recipe-results-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
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
          <div className="recipe-results-title-wrapper">
            <h1 className="recipe-results-title">Recipe Results</h1>
            <HelpIcon
              content="Browse recipes that match your ingredients. Use filters on the left to narrow down results by cooking time and dietary preferences."
              position="bottom"
              ariaLabel="Help with recipe results"
            />
          </div>
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
          <AnimatedEmptyState
            icon="🔍"
            title="No recipes found"
            message="We couldn't find any recipes matching your criteria."
            suggestions={[
              'Removing some filters',
              'Adding more ingredients',
              'Trying different ingredient combinations',
            ]}
            action={{
              label: 'Back to Home',
              onClick: handleBackToHome,
            }}
          />
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
              <RecipeStatsDashboard recipes={filteredRecipes} />
              
              <div className="recipe-results-grid">
                {paginationData.currentRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="recipe-grid-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe.id)}
                    />
                  </div>
                ))}
              </div>

              {paginationData.totalPages > 1 && (
                <div className="recipe-results-pagination">
                  <button
                    className="recipe-results-pagination-button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="recipe-results-pagination-info">
                    Page {currentPage} of {paginationData.totalPages}
                  </span>
                  <button
                    className="recipe-results-pagination-button"
                    onClick={handleNextPage}
                    disabled={currentPage === paginationData.totalPages}
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
