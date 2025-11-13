import React from 'react';
import { Recipe } from '../types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const getMatchColor = (percentage?: number): string => {
    if (!percentage) return '#999';
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const formatCookingTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-image-container">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.name}
            className="recipe-card-image"
            loading="lazy"
          />
        ) : (
          <div className="recipe-card-image-placeholder">
            <span>🍽️</span>
          </div>
        )}
        {recipe.match_percentage !== undefined && (
          <div 
            className="recipe-card-match-badge"
            style={{ backgroundColor: getMatchColor(recipe.match_percentage) }}
          >
            {Math.round(recipe.match_percentage)}% Match
          </div>
        )}
      </div>
      
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.name}</h3>
        
        <div className="recipe-card-meta">
          <span className="recipe-card-time">
            ⏱️ {formatCookingTime(recipe.cooking_time_minutes)}
          </span>
          <span className="recipe-card-difficulty">
            {recipe.difficulty}
          </span>
        </div>

        {recipe.description && (
          <p className="recipe-card-description">
            {recipe.description.length > 100 
              ? `${recipe.description.substring(0, 100)}...` 
              : recipe.description}
          </p>
        )}

        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.dietary_tags.map((tag, index) => (
              <span key={index} className="recipe-card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {recipe.average_rating !== undefined && recipe.average_rating > 0 && (
          <div className="recipe-card-rating">
            <span className="recipe-card-stars">
              {'⭐'.repeat(Math.round(recipe.average_rating))}
            </span>
            <span className="recipe-card-rating-text">
              {recipe.average_rating.toFixed(1)} ({recipe.total_ratings})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
