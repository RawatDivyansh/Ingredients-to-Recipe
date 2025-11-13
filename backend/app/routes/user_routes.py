"""
User-related API routes for favorites and shopping list.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import User, UserFavorite, Recipe, ShoppingListItem, Ingredient, RecipeRating
from app.schemas.user_schemas import (
    FavoriteResponse,
    FavoriteRecipeResponse,
    FavoritesListResponse,
    ShoppingListItemCreate,
    ShoppingListItemResponse,
    ShoppingListResponse,
    SuccessResponse
)
from app.services.auth_middleware import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/favorites/{recipe_id}", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a recipe to user's favorites.
    
    Args:
        recipe_id: ID of the recipe to favorite
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If recipe not found (404) or already favorited (400)
    """
    # Check if recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Check if already favorited
    existing_favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.recipe_id == recipe_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipe already in favorites"
        )
    
    # Add to favorites
    favorite = UserFavorite(user_id=current_user.id, recipe_id=recipe_id)
    db.add(favorite)
    db.commit()
    
    return SuccessResponse(success=True, message="Recipe added to favorites")


@router.get("/favorites", response_model=FavoritesListResponse)
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all favorite recipes for the authenticated user.
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of favorite recipes with details
    """
    # Query favorites with recipe details and ratings
    favorites = db.query(
        Recipe,
        UserFavorite.created_at.label('favorited_at')
    ).join(
        UserFavorite, UserFavorite.recipe_id == Recipe.id
    ).filter(
        UserFavorite.user_id == current_user.id
    ).order_by(
        UserFavorite.created_at.desc()
    ).all()
    
    # Build response with recipe details and average ratings
    favorite_recipes = []
    for recipe, favorited_at in favorites:
        # Calculate average rating
        rating_stats = db.query(
            func.avg(RecipeRating.rating).label('avg_rating'),
            func.count(RecipeRating.id).label('total_ratings')
        ).filter(
            RecipeRating.recipe_id == recipe.id
        ).first()
        
        avg_rating = float(rating_stats.avg_rating) if rating_stats.avg_rating else None
        total_ratings = rating_stats.total_ratings or 0
        
        favorite_recipes.append(FavoriteRecipeResponse(
            id=recipe.id,
            name=recipe.name,
            description=recipe.description,
            cooking_time_minutes=recipe.cooking_time_minutes,
            difficulty=recipe.difficulty,
            serving_size=recipe.serving_size,
            image_url=recipe.image_url,
            average_rating=avg_rating,
            total_ratings=total_ratings,
            created_at=recipe.created_at,
            favorited_at=favorited_at
        ))
    
    return FavoritesListResponse(
        recipes=favorite_recipes,
        total=len(favorite_recipes)
    )


@router.delete("/favorites/{recipe_id}", response_model=SuccessResponse)
async def remove_favorite(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a recipe from user's favorites.
    
    Args:
        recipe_id: ID of the recipe to unfavorite
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If favorite not found (404)
    """
    # Find the favorite
    favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.recipe_id == recipe_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not in favorites"
        )
    
    # Remove from favorites
    db.delete(favorite)
    db.commit()
    
    return SuccessResponse(success=True, message="Recipe removed from favorites")


@router.post("/shopping-list", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
async def add_to_shopping_list(
    items: ShoppingListItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add ingredients to user's shopping list.
    
    Args:
        items: List of ingredient names to add
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success response with count of items added
        
    Raises:
        HTTPException: If ingredients not found (404)
    """
    added_count = 0
    not_found = []
    
    for ingredient_name in items.ingredients:
        # Find ingredient by name (case-insensitive)
        ingredient = db.query(Ingredient).filter(
            func.lower(Ingredient.name) == ingredient_name.lower()
        ).first()
        
        if not ingredient:
            not_found.append(ingredient_name)
            continue
        
        # Check if already in shopping list
        existing_item = db.query(ShoppingListItem).filter(
            ShoppingListItem.user_id == current_user.id,
            ShoppingListItem.ingredient_id == ingredient.id,
            ShoppingListItem.is_purchased == False
        ).first()
        
        if existing_item:
            # Skip if already in list
            continue
        
        # Add to shopping list
        shopping_item = ShoppingListItem(
            user_id=current_user.id,
            ingredient_id=ingredient.id
        )
        db.add(shopping_item)
        added_count += 1
    
    db.commit()
    
    if not_found:
        message = f"Added {added_count} items. Not found: {', '.join(not_found)}"
    else:
        message = f"Added {added_count} items to shopping list"
    
    return SuccessResponse(success=True, message=message)


@router.get("/shopping-list", response_model=ShoppingListResponse)
async def get_shopping_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's shopping list.
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of shopping list items
    """
    # Query shopping list items with ingredient details
    items = db.query(
        ShoppingListItem, Ingredient
    ).join(
        Ingredient, Ingredient.id == ShoppingListItem.ingredient_id
    ).filter(
        ShoppingListItem.user_id == current_user.id
    ).order_by(
        ShoppingListItem.created_at.desc()
    ).all()
    
    # Build response
    shopping_items = []
    for item, ingredient in items:
        shopping_items.append(ShoppingListItemResponse(
            id=item.id,
            ingredient_name=ingredient.name,
            quantity=item.quantity,
            unit=item.unit,
            is_purchased=item.is_purchased,
            created_at=item.created_at
        ))
    
    return ShoppingListResponse(
        items=shopping_items,
        total=len(shopping_items)
    )


@router.delete("/shopping-list/{item_id}", response_model=SuccessResponse)
async def remove_from_shopping_list(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove an item from user's shopping list.
    
    Args:
        item_id: ID of the shopping list item to remove
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If item not found (404)
    """
    # Find the shopping list item
    item = db.query(ShoppingListItem).filter(
        ShoppingListItem.id == item_id,
        ShoppingListItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list item not found"
        )
    
    # Remove from shopping list
    db.delete(item)
    db.commit()
    
    return SuccessResponse(success=True, message="Item removed from shopping list")
