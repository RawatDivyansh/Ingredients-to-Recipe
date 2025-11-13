import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import RecipeCard from './RecipeCard';
import SkeletonCard from './SkeletonCard';
import './PopularRecipes.css';

const PopularRecipes: React.FC = memo(() => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await recipeService.getPopularRecipes(6);
        setRecipes(response.recipes);
      } catch (err) {
        console.error('Error fetching popular recipes:', err);
        setError('Failed to load popular recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []);

  const handleRecipeClick = useCallback((recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="popular-recipes-section">
        <h2>Popular Recipes</h2>
        <p className="popular-recipes-subtitle">Discover trending recipes loved by our community</p>
        <div className="popular-recipes-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-recipes-section">
        <h2>Popular Recipes</h2>
        <div className="popular-recipes-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="popular-recipes-section">
      <h2>Popular Recipes</h2>
      <p className="popular-recipes-subtitle">Discover trending recipes loved by our community</p>
      
      <div className="popular-recipes-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
});

PopularRecipes.displayName = 'PopularRecipes';

export default PopularRecipes;
