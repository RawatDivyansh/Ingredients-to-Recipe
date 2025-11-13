"""
Custom validators for input validation.
"""
from typing import List
import re


def validate_email_format(email: str) -> bool:
    """
    Validate email format using regex.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email format is valid, False otherwise
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    if len(password) > 128:
        return False, "Password must not exceed 128 characters"
    
    return True, ""


def validate_rating_value(rating: int) -> bool:
    """
    Validate rating value is within acceptable range.
    
    Args:
        rating: Rating value to validate
        
    Returns:
        True if rating is valid (1-5), False otherwise
    """
    return 1 <= rating <= 5


def validate_ingredient_list(ingredients: List[str]) -> tuple[bool, str]:
    """
    Validate ingredient list.
    
    Args:
        ingredients: List of ingredient names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not ingredients:
        return False, "At least one ingredient is required"
    
    if len(ingredients) > 50:
        return False, "Maximum 50 ingredients allowed"
    
    for ingredient in ingredients:
        if not ingredient or not ingredient.strip():
            return False, "Ingredient names cannot be empty"
        
        if len(ingredient) > 100:
            return False, "Ingredient name too long (max 100 characters)"
    
    return True, ""


def validate_cooking_time(minutes: int) -> tuple[bool, str]:
    """
    Validate cooking time.
    
    Args:
        minutes: Cooking time in minutes
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if minutes <= 0:
        return False, "Cooking time must be greater than 0"
    
    if minutes > 1440:  # 24 hours
        return False, "Cooking time cannot exceed 24 hours"
    
    return True, ""


def validate_difficulty_level(difficulty: str) -> bool:
    """
    Validate difficulty level.
    
    Args:
        difficulty: Difficulty level string
        
    Returns:
        True if difficulty is valid, False otherwise
    """
    valid_levels = ["easy", "medium", "hard"]
    return difficulty.lower() in valid_levels


def validate_serving_size(servings: int) -> tuple[bool, str]:
    """
    Validate serving size.
    
    Args:
        servings: Number of servings
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if servings <= 0:
        return False, "Serving size must be greater than 0"
    
    if servings > 100:
        return False, "Serving size cannot exceed 100"
    
    return True, ""


def sanitize_string(value: str) -> str:
    """
    Sanitize string input by trimming whitespace and removing control characters.
    
    Args:
        value: String to sanitize
        
    Returns:
        Sanitized string
    """
    # Remove control characters
    sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
    # Trim whitespace
    return sanitized.strip()


def normalize_ingredient_name(name: str) -> str:
    """
    Normalize ingredient name for consistent storage and comparison.
    
    Args:
        name: Ingredient name to normalize
        
    Returns:
        Normalized ingredient name
    """
    # Convert to lowercase
    normalized = name.lower()
    # Remove extra whitespace
    normalized = ' '.join(normalized.split())
    # Remove special characters except spaces and hyphens
    normalized = re.sub(r'[^a-z0-9\s-]', '', normalized)
    return normalized.strip()
