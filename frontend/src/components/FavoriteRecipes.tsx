import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { userService } from '../services/userService';
import RecipeCard from './RecipeCard';
import AnimatedEmptyState from './AnimatedEmptyState';
import './FavoriteRecipes.css';

const FavoriteRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await userService.getFavorites();
        setRecipes(response.recipes);
      } catch (err: any) {
        console.error('Failed to fetch favorites:', err);
        setError('Failed to load your favorite recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (isLoading) {
    return (
      <div className="favorite-recipes-loading">
        <div className="loading-spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorite-recipes-error">
        <p>{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <AnimatedEmptyState
        icon="❤️"
        title="No Favorite Recipes Yet"
        message="Start exploring recipes and save your favorites to see them here!"
        suggestions={[
          'Browse popular recipes on the homepage',
          'Search for recipes with your ingredients',
          'Click the heart icon on any recipe to save it'
        ]}
        action={{
          label: 'Explore Recipes',
          onClick: () => navigate('/'),
          ariaLabel: 'Go to homepage to explore recipes'
        }}
      />
    );
  }

  return (
    <div className="favorite-recipes">
      <div className="favorite-recipes-grid">
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
};

export default FavoriteRecipes;
