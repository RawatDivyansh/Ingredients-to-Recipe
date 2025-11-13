import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { userService } from '../services';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  recipeId: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ recipeId }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkIfFavorite();
    }
  }, [recipeId, isAuthenticated]);

  const checkIfFavorite = async () => {
    try {
      const { recipes } = await userService.getFavorites();
      const isFav = recipes.some(recipe => recipe.id === recipeId);
      setIsFavorite(isFav);
    } catch (err: any) {
      console.error('Failed to check favorite status:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setError('Please log in to favorite recipes');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isFavorite) {
        await userService.removeFavorite(recipeId);
        setIsFavorite(false);
      } else {
        await userService.addFavorite(recipeId);
        setIsFavorite(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      setError(err.response?.data?.detail || 'Failed to update favorite status. Please try again.');
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favorite-button-container">
        <button className="favorite-button disabled" disabled title="Log in to favorite">
          <span className="heart-icon">♡</span>
          <span className="button-text">Favorite</span>
        </button>
        <p className="login-hint">
          <a href="/login">Log in</a> to save favorites
        </p>
      </div>
    );
  }

  return (
    <div className="favorite-button-container">
      <button
        className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <span className="heart-icon">{isFavorite ? '♥' : '♡'}</span>
        <span className="button-text">
          {isLoading ? 'Updating...' : isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      </button>
      {error && <div className="favorite-error">{error}</div>}
    </div>
  );
};

export default FavoriteButton;
