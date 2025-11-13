"""
Recipe caching service.
Handles cache key generation, cache lookup, and cache expiration.
"""
import hashlib
import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import Recipe
import logging

logger = logging.getLogger(__name__)


def generate_cache_key(ingredients: List[str], filters: Optional[Dict] = None) -> str:
    """
    Generate a unique cache key from ingredients and filters.
    
    The cache key is a hash of:
    - Sorted list of normalized ingredients
    - Sorted dietary preferences (if any)
    - Cooking time range (if any)
    
    Args:
        ingredients: List of ingredient names (should be normalized)
        filters: Optional filters dictionary
    
    Returns:
        Cache key string (SHA256 hash)
    """
    # Sort ingredients for consistent hashing
    sorted_ingredients = sorted([ing.lower().strip() for ing in ingredients])
    
    # Build cache data structure
    cache_data = {
        "ingredients": sorted_ingredients
    }
    
    # Add filters if present
    if filters:
        if "dietary_preferences" in filters and filters["dietary_preferences"]:
            cache_data["dietary_preferences"] = sorted(filters["dietary_preferences"])
        
        if "cooking_time_range" in filters and filters["cooking_time_range"]:
            cache_data["cooking_time_range"] = filters["cooking_time_range"]
    
    # Convert to JSON string for hashing
    cache_string = json.dumps(cache_data, sort_keys=True)
    
    # Generate SHA256 hash
    cache_key = hashlib.sha256(cache_string.encode()).hexdigest()
    
    logger.debug(f"Generated cache key: {cache_key} for data: {cache_string}")
    
    return cache_key


def get_cached_recipes(
    db: Session,
    cache_key: str,
    max_age_days: int = 7
) -> Optional[List[Recipe]]:
    """
    Retrieve cached recipes by cache key if not expired.
    
    Args:
        db: Database session
        cache_key: Cache key to lookup
        max_age_days: Maximum age of cached recipes in days (default: 7)
    
    Returns:
        List of Recipe objects if found and not expired, None otherwise
    """
    # Calculate expiration threshold
    expiration_threshold = datetime.utcnow() - timedelta(days=max_age_days)
    
    # Query recipes with matching cache key that are not expired
    recipes = db.query(Recipe).filter(
        and_(
            Recipe.cache_key == cache_key,
            Recipe.created_at >= expiration_threshold
        )
    ).all()
    
    if recipes and len(recipes) > 0:
        logger.info(f"Cache hit: Found {len(recipes)} recipes for key {cache_key}")
        return recipes
    
    logger.info(f"Cache miss: No valid recipes found for key {cache_key}")
    return None


def invalidate_cache(db: Session, cache_key: str) -> int:
    """
    Invalidate (delete) cached recipes by cache key.
    
    Args:
        db: Database session
        cache_key: Cache key to invalidate
    
    Returns:
        Number of recipes deleted
    """
    recipes = db.query(Recipe).filter(Recipe.cache_key == cache_key).all()
    count = len(recipes)
    
    for recipe in recipes:
        db.delete(recipe)
    
    db.commit()
    
    logger.info(f"Invalidated cache: Deleted {count} recipes for key {cache_key}")
    
    return count


def cleanup_expired_cache(db: Session, max_age_days: int = 7) -> int:
    """
    Clean up expired cached recipes.
    
    Args:
        db: Database session
        max_age_days: Maximum age of cached recipes in days
    
    Returns:
        Number of recipes deleted
    """
    expiration_threshold = datetime.utcnow() - timedelta(days=max_age_days)
    
    expired_recipes = db.query(Recipe).filter(
        and_(
            Recipe.cache_key.isnot(None),
            Recipe.created_at < expiration_threshold
        )
    ).all()
    
    count = len(expired_recipes)
    
    for recipe in expired_recipes:
        db.delete(recipe)
    
    db.commit()
    
    logger.info(f"Cleaned up {count} expired cached recipes")
    
    return count


def get_cache_stats(db: Session) -> Dict:
    """
    Get statistics about cached recipes.
    
    Args:
        db: Database session
    
    Returns:
        Dictionary with cache statistics
    """
    total_cached = db.query(Recipe).filter(
        Recipe.cache_key.isnot(None)
    ).count()
    
    expiration_threshold = datetime.utcnow() - timedelta(days=7)
    valid_cached = db.query(Recipe).filter(
        and_(
            Recipe.cache_key.isnot(None),
            Recipe.created_at >= expiration_threshold
        )
    ).count()
    
    expired_cached = total_cached - valid_cached
    
    unique_cache_keys = db.query(Recipe.cache_key).filter(
        Recipe.cache_key.isnot(None)
    ).distinct().count()
    
    return {
        "total_cached_recipes": total_cached,
        "valid_cached_recipes": valid_cached,
        "expired_cached_recipes": expired_cached,
        "unique_cache_keys": unique_cache_keys
    }
