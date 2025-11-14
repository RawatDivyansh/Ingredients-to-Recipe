import React, { memo, useState } from 'react';
import { Recipe } from '../types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  matchScore?: number;
  isPerfectMatch?: boolean;
  onSave?: (recipeId: number) => void;
  onShare?: (recipeId: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = memo(({ 
  recipe, 
  onClick, 
  matchScore, 
  isPerfectMatch,
  onSave,
  onShare 
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const getDietaryBadgeColor = (tag: string): string => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('vegan')) return '#27ae60';
    if (tagLower.includes('vegetarian')) return '#2ecc71';
    if (tagLower.includes('gluten')) return '#f39c12';
    if (tagLower.includes('dairy')) return '#3498db';
    if (tagLower.includes('keto')) return '#9b59b6';
    if (tagLower.includes('paleo')) return '#e67e22';
    return '#95a5a6';
  };

  const getDietaryIcon = (tag: string): string => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('vegan')) return '🌱';
    if (tagLower.includes('vegetarian')) return '🥗';
    if (tagLower.includes('gluten')) return '🌾';
    if (tagLower.includes('dairy')) return '🥛';
    if (tagLower.includes('keto')) return '🥑';
    if (tagLower.includes('paleo')) return '🍖';
    return '✓';
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(recipe.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(recipe.id);
  };

  const finalMatchScore = matchScore ?? recipe.match_percentage;
  const finalIsPerfectMatch = isPerfectMatch ?? (finalMatchScore !== undefined && finalMatchScore >= 100);

  return (
    <div 
      className="recipe-card touch-feedback" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
        {finalMatchScore !== undefined && (
          <div 
            className="recipe-card-match-badge"
            style={{ backgroundColor: getMatchColor(finalMatchScore) }}
          >
            {Math.round(finalMatchScore)}% Match
          </div>
        )}
        {finalIsPerfectMatch && (
          <div className="recipe-card-perfect-match-badge">
            <span className="perfect-match-icon">✨</span>
            <span>Perfect Match</span>
          </div>
        )}
      </div>
      
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.name}</h3>
        
        <div className="recipe-card-meta">
          <span className="recipe-card-time">
            <span className="clock-icon">🕐</span>
            <span>{formatCookingTime(recipe.cooking_time_minutes)}</span>
          </span>
          <span className="recipe-card-difficulty">
            {recipe.difficulty}
          </span>
        </div>

        {finalMatchScore !== undefined && (
          <div className="recipe-card-match-score">
            <div className="match-score-bar">
              <div 
                className="match-score-fill"
                style={{ width: `${finalMatchScore}%` }}
              />
            </div>
            <span className="match-score-text">{Math.round(finalMatchScore)}% ingredient match</span>
          </div>
        )}

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
              <span 
                key={index} 
                className="recipe-card-tag"
                style={{ backgroundColor: getDietaryBadgeColor(tag) }}
              >
                <span className="tag-icon">{getDietaryIcon(tag)}</span>
                <span>{tag}</span>
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

      {/* Quick Actions */}
      {(onSave || onShare) && (
        <div className={`recipe-card-quick-actions ${isHovered ? 'visible' : ''}`}>
          {onSave && (
            <button 
              className="quick-action-btn save-btn touch-target touch-ripple"
              onClick={handleSave}
              aria-label="Save recipe"
              title="Save recipe"
            >
              <span>💾</span>
            </button>
          )}
          {onShare && (
            <button 
              className="quick-action-btn share-btn touch-target touch-ripple"
              onClick={handleShare}
              aria-label="Share recipe"
              title="Share recipe"
            >
              <span>🔗</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';

export default RecipeCard;
