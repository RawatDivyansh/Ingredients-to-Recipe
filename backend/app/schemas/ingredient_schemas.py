"""
Pydantic schemas for ingredient endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class IngredientBase(BaseModel):
    """Base schema for ingredient."""
    name: str
    category: str
    synonyms: Optional[List[str]] = []


class IngredientCreate(IngredientBase):
    """Schema for creating an ingredient."""
    pass


class IngredientResponse(IngredientBase):
    """Schema for ingredient response."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class IngredientAutocompleteResponse(BaseModel):
    """Schema for autocomplete response."""
    suggestions: List[IngredientResponse]


class IngredientsListResponse(BaseModel):
    """Schema for list of ingredients."""
    ingredients: List[IngredientResponse]
    total: int
