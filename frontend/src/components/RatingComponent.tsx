import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { recipeService } from '../services';
import './RatingComponent.css';

interface RatingComponentProps {
  recipeId: number;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ recipeId }) => {
  const { isAuthenticated } = useAuth();
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [recipeId]);

  const fetchRatings = async () => {
    try {
      const ratingsData = await recipeService.getRecipeRatings(recipeId);
      setAverageRating(ratingsData.averageRating || 0);
      setTotalRatings(ratingsData.totalRatings || 0);
      setUserRating(ratingsData.userRating);
    } catch (err: any) {
      console.error('Failed to fetch ratings:', err);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (!isAuthenticated) {
      setError('Please log in to rate this recipe');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await recipeService.rateRecipe(recipeId, rating);
      
      setUserRating(rating);
      setAverageRating(response.averageRating);
      
      // Update total ratings count
      if (userRating === undefined) {
        setTotalRatings(prev => prev + 1);
      }
      
      setSuccessMessage(userRating === undefined ? 'Rating submitted!' : 'Rating updated!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err.response?.data?.detail || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <span
          key={i}
          className={`star ${filled ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => handleRatingClick(i) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        >
          {filled ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const displayRating = hoveredStar > 0 ? hoveredStar : (userRating || 0);

  return (
    <div className="rating-component">
      <div className="rating-header">
        <h3>Rating</h3>
      </div>

      <div className="average-rating">
        <div className="stars-display">
          {renderStars(Math.round(averageRating))}
        </div>
        <div className="rating-info">
          <span className="rating-value">{averageRating.toFixed(1)}</span>
          <span className="rating-count">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
        </div>
      </div>

      {isAuthenticated && (
        <div className="user-rating-section">
          <p className="rating-prompt">
            {userRating ? 'Your rating:' : 'Rate this recipe:'}
          </p>
          <div className="user-rating-stars">
            {renderStars(displayRating, true)}
          </div>
          {userRating && (
            <p className="rating-note">Click to update your rating</p>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="login-prompt">
          <a href="/login">Log in</a> to rate this recipe
        </p>
      )}

      {error && <div className="rating-error">{error}</div>}
      {successMessage && <div className="rating-success">{successMessage}</div>}
    </div>
  );
};

export default RatingComponent;
