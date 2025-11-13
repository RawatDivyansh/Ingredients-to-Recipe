"""
Pydantic schemas for recipe endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime


class RecipeIngredientResponse(BaseModel):
    """Schema for recipe ingredient with availability status."""
    ingredient_id: int
    ingredient_name: str
    quantity: str
    unit: str
    is_optional: bool
    is_available: bool = False
    
    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    """Base schema for recipe."""
    name: str
    description: Optional[str] = None
    instructions: List[str]
    cooking_time_minutes: int
    difficulty: str
    serving_size: int
    image_url: Optional[str] = None
    nutritional_info: Optional[Dict[str, Any]] = None


class RecipeResponse(RecipeBase):
    """Schema for recipe response with full details."""
    id: int
    ingredients: List[RecipeIngredientResponse]
    dietary_tags: List[str]
    average_rating: Optional[float] = None
    total_ratings: int = 0
    user_rating: Optional[int] = None
    match_percentage: Optional[float] = None
    view_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecipeSearchRequest(BaseModel):
    """Schema for recipe search request."""
    ingredients: List[str] = Field(..., min_length=1, description="List of available ingredients")
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional filters")
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Number of recipes per page")


class RecipeSearchResponse(BaseModel):
    """Schema for recipe search response with pagination."""
    recipes: List[RecipeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PopularRecipesResponse(BaseModel):
    """Schema for popular recipes response."""
    recipes: List[RecipeResponse]
