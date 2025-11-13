"""
Pydantic schemas for user-related endpoints (favorites, shopping list).
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FavoriteResponse(BaseModel):
    """Schema for favorite recipe response."""
    user_id: int
    recipe_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FavoriteRecipeResponse(BaseModel):
    """Schema for favorite recipe with full recipe details."""
    id: int
    name: str
    description: Optional[str] = None
    cooking_time_minutes: int
    difficulty: str
    serving_size: int
    image_url: Optional[str] = None
    average_rating: Optional[float] = None
    total_ratings: int = 0
    created_at: datetime
    favorited_at: datetime
    
    class Config:
        from_attributes = True


class FavoritesListResponse(BaseModel):
    """Schema for list of favorite recipes."""
    recipes: List[FavoriteRecipeResponse]
    total: int


class ShoppingListItemCreate(BaseModel):
    """Schema for creating shopping list items."""
    ingredients: List[str] = Field(
        ..., 
        min_length=1, 
        description="List of ingredient names to add"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "ingredients": ["chicken", "rice", "tomato"]
            }
        }


class ShoppingListItemResponse(BaseModel):
    """Schema for shopping list item response."""
    id: int
    ingredient_name: str
    quantity: Optional[str] = None
    unit: Optional[str] = None
    is_purchased: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class ShoppingListResponse(BaseModel):
    """Schema for shopping list response."""
    items: List[ShoppingListItemResponse]
    total: int


class SuccessResponse(BaseModel):
    """Schema for generic success response."""
    success: bool
    message: str
