"""
Pydantic schemas for recipe rating endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional


class RatingCreate(BaseModel):
    """Schema for creating or updating a rating."""
    rating: int = Field(..., ge=1, le=5, description="Rating value between 1 and 5")


class RatingResponse(BaseModel):
    """Schema for rating response."""
    average_rating: Optional[float] = None
    total_ratings: int = 0
    user_rating: Optional[int] = None
    
    class Config:
        from_attributes = True
