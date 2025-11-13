"""
Service for managing recipe ratings.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Tuple
import logging

from app.models import RecipeRating, Recipe

logger = logging.getLogger(__name__)


def create_or_update_rating(
    db: Session,
    user_id: int,
    recipe_id: int,
    rating_value: int
) -> RecipeRating:
    """
    Create a new rating or update existing rating for a recipe.
    
    If the user has already rated this recipe, update the existing rating.
    Otherwise, create a new rating.
    
    Args:
        db: Database session
        user_id: ID of the user submitting the rating
        recipe_id: ID of the recipe being rated
        rating_value: Rating value (1-5)
    
    Returns:
        RecipeRating object
    
    Raises:
        ValueError: If rating_value is not between 1 and 5
    """
    if not 1 <= rating_value <= 5:
        raise ValueError("Rating must be between 1 and 5")
    
    # Check if user has already rated this recipe
    existing_rating = db.query(RecipeRating).filter(
        RecipeRating.user_id == user_id,
        RecipeRating.recipe_id == recipe_id
    ).first()
    
    if existing_rating:
        # Update existing rating
        logger.info(f"Updating rating for user {user_id}, recipe {recipe_id}: {existing_rating.rating} -> {rating_value}")
        existing_rating.rating = rating_value
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    else:
        # Create new rating
        logger.info(f"Creating new rating for user {user_id}, recipe {recipe_id}: {rating_value}")
        new_rating = RecipeRating(
            user_id=user_id,
            recipe_id=recipe_id,
            rating=rating_value
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating


def get_recipe_ratings(
    db: Session,
    recipe_id: int,
    user_id: Optional[int] = None
) -> Tuple[Optional[float], int, Optional[int]]:
    """
    Get rating information for a recipe.
    
    Args:
        db: Database session
        recipe_id: ID of the recipe
        user_id: Optional user ID to get user's specific rating
    
    Returns:
        Tuple of (average_rating, total_ratings, user_rating)
        - average_rating: Average rating (1-5) or None if no ratings
        - total_ratings: Total number of ratings
        - user_rating: User's rating if user_id provided and user has rated, else None
    """
    # Calculate average rating and total count
    ratings_query = db.query(
        func.avg(RecipeRating.rating).label('avg_rating'),
        func.count(RecipeRating.id).label('total_ratings')
    ).filter(RecipeRating.recipe_id == recipe_id).first()
    
    average_rating = float(ratings_query.avg_rating) if ratings_query.avg_rating else None
    total_ratings = ratings_query.total_ratings or 0
    
    # Get user's rating if user_id provided
    user_rating = None
    if user_id:
        user_rating_obj = db.query(RecipeRating).filter(
            RecipeRating.user_id == user_id,
            RecipeRating.recipe_id == recipe_id
        ).first()
        if user_rating_obj:
            user_rating = user_rating_obj.rating
    
    logger.info(f"Recipe {recipe_id} ratings: avg={average_rating}, total={total_ratings}, user_rating={user_rating}")
    
    return average_rating, total_ratings, user_rating


def calculate_average_rating(db: Session, recipe_id: int) -> Optional[float]:
    """
    Calculate the average rating for a recipe.
    
    Args:
        db: Database session
        recipe_id: ID of the recipe
    
    Returns:
        Average rating (1-5) or None if no ratings exist
    """
    result = db.query(func.avg(RecipeRating.rating)).filter(
        RecipeRating.recipe_id == recipe_id
    ).scalar()
    
    return float(result) if result else None
