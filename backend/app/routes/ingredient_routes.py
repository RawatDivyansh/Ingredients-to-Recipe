"""
Ingredient API routes for retrieving ingredients and autocomplete functionality.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ingredient_schemas import (
    IngredientResponse,
    IngredientAutocompleteResponse,
    IngredientsListResponse
)
from app.services import ingredient_service
from typing import Optional

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("", response_model=IngredientsListResponse)
async def get_ingredients(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all ingredients from the database.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (max 1000)
        db: Database session
        
    Returns:
        IngredientsListResponse with list of ingredients and total count
    """
    ingredients = ingredient_service.get_all_ingredients(db, skip=skip, limit=limit)
    total = ingredient_service.get_ingredient_count(db)
    
    return IngredientsListResponse(
        ingredients=[IngredientResponse.model_validate(ing) for ing in ingredients],
        total=total
    )


@router.get("/autocomplete", response_model=IngredientAutocompleteResponse)
async def autocomplete_ingredients(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of suggestions"),
    db: Session = Depends(get_db)
):
    """
    Autocomplete search for ingredients based on query string.
    Searches ingredient names and synonyms with case-insensitive matching.
    
    Args:
        q: Search query string (minimum 2 characters)
        limit: Maximum number of suggestions to return (max 50)
        db: Database session
        
    Returns:
        IngredientAutocompleteResponse with list of matching ingredients
    """
    if len(q) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 2 characters long"
        )
    
    suggestions = ingredient_service.autocomplete_ingredients(db, query=q, limit=limit)
    
    return IngredientAutocompleteResponse(
        suggestions=[IngredientResponse.model_validate(ing) for ing in suggestions]
    )
