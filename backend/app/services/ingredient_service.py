"""
Service layer for ingredient management.
Handles ingredient retrieval, autocomplete, normalization, and synonym matching.
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models import Ingredient
from typing import List, Optional
import re


def normalize_ingredient_name(name: str) -> str:
    """
    Normalize ingredient name for consistent matching.
    
    Args:
        name: Raw ingredient name
        
    Returns:
        Normalized ingredient name (lowercase, trimmed, no special chars)
    """
    # Convert to lowercase
    normalized = name.lower().strip()
    
    # Remove special characters except spaces and hyphens
    normalized = re.sub(r'[^a-z0-9\s\-]', '', normalized)
    
    # Replace multiple spaces with single space
    normalized = re.sub(r'\s+', ' ', normalized)
    
    return normalized


def get_all_ingredients(db: Session, skip: int = 0, limit: int = 1000) -> List[Ingredient]:
    """
    Retrieve all ingredients from the database.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Ingredient objects
    """
    return db.query(Ingredient).offset(skip).limit(limit).all()


def get_ingredient_count(db: Session) -> int:
    """
    Get total count of ingredients in the database.
    
    Args:
        db: Database session
        
    Returns:
        Total number of ingredients
    """
    return db.query(Ingredient).count()


def autocomplete_ingredients(
    db: Session, 
    query: str, 
    limit: int = 10
) -> List[Ingredient]:
    """
    Search for ingredients matching the query string with autocomplete.
    Implements synonym matching and case-insensitive search.
    
    Args:
        db: Database session
        query: Search query string
        limit: Maximum number of results to return
        
    Returns:
        List of matching Ingredient objects
    """
    if not query or len(query) < 2:
        return []
    
    # Normalize the query
    normalized_query = normalize_ingredient_name(query)
    
    # Create ILIKE pattern for partial matching
    pattern = f"%{normalized_query}%"
    
    # Search in ingredient name only (synonym matching done in Python for compatibility)
    # Using ILIKE for case-insensitive pattern matching
    results = db.query(Ingredient).filter(
        func.lower(Ingredient.name).like(pattern)
    ).limit(limit * 2).all()  # Get more results to filter by synonyms
    
    # Filter by synonyms in Python for database compatibility
    filtered_results = []
    for ingredient in results:
        # Check if name matches
        if normalized_query in ingredient.name.lower():
            filtered_results.append(ingredient)
        # Check if any synonym matches
        elif ingredient.synonyms:
            for synonym in ingredient.synonyms:
                if synonym and normalized_query in synonym.lower():
                    filtered_results.append(ingredient)
                    break
    
    # Limit results
    results = filtered_results[:limit]
    
    # Sort results: exact matches first, then starts-with, then contains
    def sort_key(ingredient: Ingredient) -> tuple:
        name_lower = ingredient.name.lower()
        query_lower = normalized_query
        
        # Priority 1: Exact match
        if name_lower == query_lower:
            return (0, name_lower)
        
        # Priority 2: Starts with query
        if name_lower.startswith(query_lower):
            return (1, name_lower)
        
        # Priority 3: Contains query
        if query_lower in name_lower:
            return (2, name_lower)
        
        # Priority 4: Synonym match
        if ingredient.synonyms:
            for synonym in ingredient.synonyms:
                if synonym and query_lower in synonym.lower():
                    return (3, name_lower)
        
        # Default
        return (4, name_lower)
    
    sorted_results = sorted(results, key=sort_key)
    
    return sorted_results


def find_ingredient_by_name(db: Session, name: str) -> Optional[Ingredient]:
    """
    Find an ingredient by exact name match (case-insensitive).
    
    Args:
        db: Database session
        name: Ingredient name to search for
        
    Returns:
        Ingredient object if found, None otherwise
    """
    normalized_name = normalize_ingredient_name(name)
    
    return db.query(Ingredient).filter(
        func.lower(Ingredient.name) == normalized_name
    ).first()


def find_ingredient_by_name_or_synonym(db: Session, name: str) -> Optional[Ingredient]:
    """
    Find an ingredient by name or synonym match.
    
    Args:
        db: Database session
        name: Ingredient name or synonym to search for
        
    Returns:
        Ingredient object if found, None otherwise
    """
    normalized_name = normalize_ingredient_name(name)
    
    # First try exact name match
    ingredient = db.query(Ingredient).filter(
        func.lower(Ingredient.name) == normalized_name
    ).first()
    
    if ingredient:
        return ingredient
    
    # Then try synonym match
    ingredient = db.query(Ingredient).filter(
        Ingredient.synonyms.any(normalized_name)
    ).first()
    
    return ingredient
