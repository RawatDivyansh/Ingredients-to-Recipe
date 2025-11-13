"""
Recipe generation service using Groq API.
Handles recipe generation, parsing, and storage.
"""
import json
import logging
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Recipe, RecipeIngredient, Ingredient, DietaryTag, RecipeDietaryTag
from app.services.groq_service import get_groq_service
from app.services.recipe_prompt_builder import (
    build_recipe_generation_prompt,
    extract_filters_from_dict
)
from app.services.ingredient_service import find_ingredient_by_name_or_synonym

logger = logging.getLogger(__name__)


class RecipeGenerationError(Exception):
    """Custom exception for recipe generation errors."""
    pass


def parse_recipe_response(response_text: str) -> List[Dict]:
    """
    Parse JSON response from Groq API into recipe dictionaries.
    
    Args:
        response_text: Raw JSON response text from API
    
    Returns:
        List of recipe dictionaries
    
    Raises:
        RecipeGenerationError: If response is malformed or invalid
    """
    try:
        data = json.loads(response_text)
        
        if not isinstance(data, dict):
            raise RecipeGenerationError("Response is not a JSON object")
        
        if "recipes" not in data:
            raise RecipeGenerationError("Response missing 'recipes' key")
        
        recipes = data["recipes"]
        
        if not isinstance(recipes, list):
            raise RecipeGenerationError("'recipes' is not a list")
        
        if len(recipes) == 0:
            raise RecipeGenerationError("No recipes returned")
        
        # Validate each recipe has required fields
        required_fields = [
            "name", "description", "ingredients", "instructions",
            "cooking_time_minutes", "difficulty", "serving_size"
        ]
        
        for i, recipe in enumerate(recipes):
            for field in required_fields:
                if field not in recipe:
                    raise RecipeGenerationError(
                        f"Recipe {i} missing required field: {field}"
                    )
            
            # Validate ingredients structure
            if not isinstance(recipe["ingredients"], list):
                raise RecipeGenerationError(
                    f"Recipe {i} ingredients is not a list"
                )
            
            for j, ingredient in enumerate(recipe["ingredients"]):
                if not isinstance(ingredient, dict):
                    raise RecipeGenerationError(
                        f"Recipe {i} ingredient {j} is not an object"
                    )
                if "name" not in ingredient:
                    raise RecipeGenerationError(
                        f"Recipe {i} ingredient {j} missing 'name'"
                    )
            
            # Validate instructions structure
            if not isinstance(recipe["instructions"], list):
                raise RecipeGenerationError(
                    f"Recipe {i} instructions is not a list"
                )
        
        return recipes
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {str(e)}")
        raise RecipeGenerationError(f"Invalid JSON response: {str(e)}")
    except RecipeGenerationError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error parsing response: {str(e)}")
        raise RecipeGenerationError(f"Failed to parse response: {str(e)}")


def store_recipe_in_db(
    db: Session,
    recipe_data: Dict,
    cache_key: str,
    user_ingredients: List[str]
) -> Recipe:
    """
    Store a generated recipe in the database with ingredients and tags.
    
    Args:
        db: Database session
        recipe_data: Recipe dictionary from parsed API response
        cache_key: Cache key for this recipe generation
        user_ingredients: List of user's available ingredients
    
    Returns:
        Created Recipe object
    """
    # Create recipe record
    recipe = Recipe(
        name=recipe_data["name"],
        description=recipe_data.get("description", ""),
        instructions=recipe_data["instructions"],
        cooking_time_minutes=recipe_data["cooking_time_minutes"],
        difficulty=recipe_data["difficulty"],
        serving_size=recipe_data["serving_size"],
        image_url=recipe_data.get("image_url"),
        nutritional_info=recipe_data.get("nutritional_info"),
        source="groq_ai",
        cache_key=cache_key,
        view_count=0
    )
    
    db.add(recipe)
    db.flush()  # Get recipe ID
    
    # Store recipe ingredients
    for ingredient_data in recipe_data["ingredients"]:
        ingredient_name = ingredient_data["name"].lower().strip()
        
        # Find or create ingredient
        ingredient = find_ingredient_by_name_or_synonym(db, ingredient_name)
        
        if not ingredient:
            # Create new ingredient if not found
            ingredient = Ingredient(
                name=ingredient_name,
                category="other",  # Default category
                synonyms=[]
            )
            db.add(ingredient)
            db.flush()
        
        # Create recipe-ingredient relationship
        recipe_ingredient = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ingredient.id,
            quantity=ingredient_data.get("quantity", ""),
            unit=ingredient_data.get("unit", ""),
            is_optional=ingredient_data.get("is_optional", False)
        )
        db.add(recipe_ingredient)
    
    # Store dietary tags
    dietary_tags = recipe_data.get("dietary_tags", [])
    for tag_name in dietary_tags:
        tag_name_lower = tag_name.lower().strip()
        
        # Find or create dietary tag
        tag = db.query(DietaryTag).filter(
            func.lower(DietaryTag.name) == tag_name_lower
        ).first()
        
        if not tag:
            tag = DietaryTag(name=tag_name_lower)
            db.add(tag)
            db.flush()
        
        # Create recipe-tag relationship
        recipe_tag = RecipeDietaryTag(
            recipe_id=recipe.id,
            tag_id=tag.id
        )
        db.add(recipe_tag)
    
    db.commit()
    db.refresh(recipe)
    
    return recipe


def generate_recipes(
    db: Session,
    ingredients: List[str],
    filters: Optional[Dict] = None,
    num_recipes: int = 5
) -> List[Recipe]:
    """
    Generate recipes using Groq API based on ingredients and filters.
    
    Args:
        db: Database session
        ingredients: List of available ingredient names
        filters: Optional filters (dietary_preferences, cooking_time_range)
        num_recipes: Number of recipes to generate
    
    Returns:
        List of generated Recipe objects
    
    Raises:
        RecipeGenerationError: If generation fails
    """
    if not ingredients or len(ingredients) == 0:
        raise RecipeGenerationError("At least one ingredient is required")
    
    # Normalize ingredients
    normalized_ingredients = [ing.lower().strip() for ing in ingredients]
    
    # Extract filters
    filters = filters or {}
    dietary_preferences, cooking_time_range = extract_filters_from_dict(filters)
    
    # Build prompt
    prompt = build_recipe_generation_prompt(
        ingredients=normalized_ingredients,
        dietary_preferences=dietary_preferences,
        cooking_time_range=cooking_time_range,
        num_recipes=num_recipes
    )
    
    logger.info(f"Generating {num_recipes} recipes for ingredients: {normalized_ingredients}")
    
    # Call Groq API
    try:
        groq_service = get_groq_service()
        response = groq_service.generate_completion(
            prompt=prompt,
            system_message="You are a professional chef assistant. Generate detailed recipes in JSON format.",
            temperature=0.7,
            max_tokens=2000
        )
        
        if not response or not response.choices:
            raise RecipeGenerationError("Empty response from Groq API")
        
        response_text = response.choices[0].message.content
        
        # Parse response
        recipes_data = parse_recipe_response(response_text)
        
        logger.info(f"Successfully parsed {len(recipes_data)} recipes from API response")
        
        # Generate cache key (will be implemented in next subtask)
        from app.services.recipe_cache_service import generate_cache_key
        cache_key = generate_cache_key(normalized_ingredients, filters)
        
        # Store recipes in database
        stored_recipes = []
        for recipe_data in recipes_data:
            try:
                recipe = store_recipe_in_db(db, recipe_data, cache_key, normalized_ingredients)
                stored_recipes.append(recipe)
            except Exception as e:
                logger.error(f"Failed to store recipe '{recipe_data.get('name', 'unknown')}': {str(e)}")
                # Continue with other recipes
        
        if len(stored_recipes) == 0:
            raise RecipeGenerationError("Failed to store any recipes in database")
        
        logger.info(f"Successfully stored {len(stored_recipes)} recipes in database")
        
        return stored_recipes
        
    except RecipeGenerationError:
        raise
    except Exception as e:
        logger.error(f"Recipe generation failed: {str(e)}")
        raise RecipeGenerationError(f"Failed to generate recipes: {str(e)}")
