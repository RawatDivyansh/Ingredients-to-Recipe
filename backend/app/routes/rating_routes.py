"""
Rating API routes for submitting and retrieving recipe ratings.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.database import get_db
from app.schemas.rating_schemas import RatingCreate, RatingResponse
from app.services.rating_service import create_or_update_rating, get_recipe_ratings
from app.services.auth_middleware import get_current_user, get_current_user_optional
from app.models import User, Recipe

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/recipes", tags=["ratings"])


@router.post("/{recipe_id}/ratings", response_model=RatingResponse)
async def submit_rating(
    recipe_id: int = Path(..., description="Recipe ID"),
    rating_data: RatingCreate = ...,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit or update a rating for a recipe.
    
    Requires authentication. If the user has already rated this recipe,
    the existing rating will be updated. Otherwise, a new rating is created.
    
    Args:
        recipe_id: ID of the recipe to rate
        rating_data: Rating data (rating value 1-5)
        current_user: Authenticated user
        db: Database session
    
    Returns:
        RatingResponse with updated average rating and total ratings
    
    Raises:
        HTTPException: If recipe not found (404) or rating invalid (400)
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with ID {recipe_id} not found"
        )
    
    try:
        # Create or update rating
        create_or_update_rating(
            db=db,
            user_id=current_user.id,
            recipe_id=recipe_id,
            rating_value=rating_data.rating
        )
        
        # Get updated rating information
        average_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db,
            recipe_id=recipe_id,
            user_id=current_user.id
        )
        
        logger.info(f"User {current_user.id} rated recipe {recipe_id}: {rating_data.rating}")
        
        return RatingResponse(
            average_rating=average_rating,
            total_ratings=total_ratings,
            user_rating=user_rating
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to submit rating: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit rating"
        )


@router.get("/{recipe_id}/ratings", response_model=RatingResponse)
async def get_ratings(
    recipe_id: int = Path(..., description="Recipe ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get rating information for a recipe.
    
    Returns the average rating, total number of ratings, and the current user's
    rating if authenticated.
    
    Args:
        recipe_id: ID of the recipe
        current_user: Optional authenticated user
        db: Database session
    
    Returns:
        RatingResponse with rating information
    
    Raises:
        HTTPException: If recipe not found (404)
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with ID {recipe_id} not found"
        )
    
    # Get rating information
    user_id = current_user.id if current_user else None
    average_rating, total_ratings, user_rating = get_recipe_ratings(
        db=db,
        recipe_id=recipe_id,
        user_id=user_id
    )
    
    return RatingResponse(
        average_rating=average_rating,
        total_ratings=total_ratings,
        user_rating=user_rating
    )
