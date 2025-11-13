"""
Recipe API routes for searching, retrieving, and managing recipes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
import logging
import math

from app.database import get_db
from app.schemas.recipe_schemas import (
    RecipeSearchRequest,
    RecipeSearchResponse,
    RecipeResponse,
    RecipeIngredientResponse,
    PopularRecipesResponse
)
from app.models import Recipe, RecipeIngredient, Ingredient, RecipeDietaryTag, DietaryTag, RecipeRating, User
from app.services.recipe_cache_service import generate_cache_key, get_cached_recipes
from app.services.recipe_generation_service import generate_recipes
from app.services.ingredient_service import normalize_ingredient_name
from app.services.auth_middleware import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


def calculate_match_percentage(recipe: Recipe, user_ingredients: List[str]) -> float:
    """
    Calculate the percentage of recipe ingredients that the user has.
    
    Args:
        recipe: Recipe object with ingredients loaded
        user_ingredients: List of normalized user ingredient names
    
    Returns:
        Match percentage (0-100)
    """
    if not recipe.recipe_ingredients:
        return 0.0
    
    # Normalize user ingredients
    normalized_user_ingredients = set(
        normalize_ingredient_name(ing) for ing in user_ingredients
    )
    
    # Count matching ingredients (excluding optional ones for better matching)
    required_ingredients = [
        ri for ri in recipe.recipe_ingredients if not ri.is_optional
    ]
    
    if not required_ingredients:
        # If all ingredients are optional, use all ingredients
        required_ingredients = recipe.recipe_ingredients
    
    matching_count = sum(
        1 for ri in required_ingredients
        if normalize_ingredient_name(ri.ingredient.name) in normalized_user_ingredients
    )
    
    match_percentage = (matching_count / len(required_ingredients)) * 100
    
    return round(match_percentage, 1)


def enrich_recipe_with_details(
    recipe: Recipe,
    user_ingredients: List[str],
    db: Session,
    user_id: Optional[int] = None
) -> RecipeResponse:
    """
    Enrich a recipe with match percentage, availability flags, and ratings.
    
    Args:
        recipe: Recipe object
        user_ingredients: List of user's available ingredients
        db: Database session
        user_id: Optional user ID to include user's rating
    
    Returns:
        RecipeResponse with enriched data
    """
    # Normalize user ingredients
    normalized_user_ingredients = set(
        normalize_ingredient_name(ing) for ing in user_ingredients
    )
    
    # Calculate match percentage
    match_percentage = calculate_match_percentage(recipe, user_ingredients)
    
    # Build ingredient list with availability
    ingredients_response = []
    for ri in recipe.recipe_ingredients:
        is_available = normalize_ingredient_name(ri.ingredient.name) in normalized_user_ingredients
        ingredients_response.append(
            RecipeIngredientResponse(
                ingredient_id=ri.ingredient_id,
                ingredient_name=ri.ingredient.name,
                quantity=ri.quantity or "",
                unit=ri.unit or "",
                is_optional=ri.is_optional,
                is_available=is_available
            )
        )
    
    # Get dietary tags
    dietary_tags = [rt.tag.name for rt in recipe.dietary_tags]
    
    # Calculate average rating and get user's rating
    ratings = db.query(
        func.avg(RecipeRating.rating).label('avg_rating'),
        func.count(RecipeRating.id).label('total_ratings')
    ).filter(RecipeRating.recipe_id == recipe.id).first()
    
    average_rating = float(ratings.avg_rating) if ratings.avg_rating else None
    total_ratings = ratings.total_ratings or 0
    
    # Get user's rating if user_id provided
    user_rating = None
    if user_id:
        user_rating_obj = db.query(RecipeRating).filter(
            RecipeRating.user_id == user_id,
            RecipeRating.recipe_id == recipe.id
        ).first()
        if user_rating_obj:
            user_rating = user_rating_obj.rating
    
    return RecipeResponse(
        id=recipe.id,
        name=recipe.name,
        description=recipe.description,
        instructions=recipe.instructions,
        cooking_time_minutes=recipe.cooking_time_minutes,
        difficulty=recipe.difficulty,
        serving_size=recipe.serving_size,
        image_url=recipe.image_url,
        nutritional_info=recipe.nutritional_info,
        ingredients=ingredients_response,
        dietary_tags=dietary_tags,
        average_rating=average_rating,
        total_ratings=total_ratings,
        user_rating=user_rating,
        match_percentage=match_percentage,
        view_count=recipe.view_count,
        created_at=recipe.created_at
    )


def apply_filters(query, filters: dict):
    """
    Apply filters to recipe query.
    
    Args:
        query: SQLAlchemy query object
        filters: Dictionary of filters
    
    Returns:
        Filtered query
    """
    # Apply cooking time filter
    if "cooking_time_range" in filters and filters["cooking_time_range"]:
        time_range = filters["cooking_time_range"]
        if isinstance(time_range, list) and len(time_range) == 2:
            min_time, max_time = time_range
            query = query.filter(
                Recipe.cooking_time_minutes >= min_time,
                Recipe.cooking_time_minutes <= max_time
            )
    
    # Apply dietary preferences filter
    if "dietary_preferences" in filters and filters["dietary_preferences"]:
        dietary_prefs = filters["dietary_preferences"]
        if isinstance(dietary_prefs, list) and len(dietary_prefs) > 0:
            # Recipe must have all specified dietary tags
            for pref in dietary_prefs:
                query = query.join(RecipeDietaryTag).join(DietaryTag).filter(
                    func.lower(DietaryTag.name) == pref.lower()
                )
    
    return query


@router.post("/search", response_model=RecipeSearchResponse)
async def search_recipes(
    search_request: RecipeSearchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Search for recipes based on available ingredients and filters.
    
    This endpoint:
    1. Checks cache for existing recipes matching the ingredients and filters
    2. If cache miss, generates new recipes using Groq API
    3. Returns recipes with match percentage and availability indicators
    4. Supports pagination
    
    Args:
        search_request: Recipe search request with ingredients, filters, and pagination
        db: Database session
    
    Returns:
        RecipeSearchResponse with paginated recipes and metadata
    
    Raises:
        HTTPException: If search fails (500)
    """
    try:
        ingredients = search_request.ingredients
        filters = search_request.filters or {}
        page = search_request.page
        page_size = search_request.page_size
        
        # Normalize ingredients
        normalized_ingredients = [
            normalize_ingredient_name(ing) for ing in ingredients
        ]
        
        logger.info(f"Searching recipes for ingredients: {normalized_ingredients}")
        
        # Generate cache key
        cache_key = generate_cache_key(normalized_ingredients, filters)
        
        # Check cache first
        cached_recipes = get_cached_recipes(db, cache_key)
        
        if cached_recipes:
            logger.info(f"Using {len(cached_recipes)} cached recipes")
            recipes = cached_recipes
        else:
            # Generate new recipes using Groq API
            logger.info("Cache miss - generating new recipes")
            recipes = generate_recipes(
                db=db,
                ingredients=normalized_ingredients,
                filters=filters,
                num_recipes=5
            )
        
        # Apply filters to recipes
        filtered_recipes = recipes
        
        # Apply cooking time filter
        if "cooking_time_range" in filters and filters["cooking_time_range"]:
            time_range = filters["cooking_time_range"]
            if isinstance(time_range, list) and len(time_range) == 2:
                min_time, max_time = time_range
                filtered_recipes = [
                    r for r in filtered_recipes
                    if min_time <= r.cooking_time_minutes <= max_time
                ]
        
        # Apply dietary preferences filter
        if "dietary_preferences" in filters and filters["dietary_preferences"]:
            dietary_prefs = set(pref.lower() for pref in filters["dietary_preferences"])
            filtered_recipes = [
                r for r in filtered_recipes
                if dietary_prefs.issubset(set(rt.tag.name.lower() for rt in r.dietary_tags))
            ]
        
        # Sort by match percentage (will be calculated during enrichment)
        # For now, keep original order
        
        # Calculate total and pagination
        total = len(filtered_recipes)
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        
        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_recipes = filtered_recipes[start_idx:end_idx]
        
        # Enrich recipes with details
        user_id = current_user.id if current_user else None
        enriched_recipes = [
            enrich_recipe_with_details(recipe, normalized_ingredients, db, user_id)
            for recipe in paginated_recipes
        ]
        
        # Sort by match percentage (descending)
        enriched_recipes.sort(key=lambda r: r.match_percentage or 0, reverse=True)
        
        logger.info(f"Returning {len(enriched_recipes)} recipes (page {page}/{total_pages})")
        
        return RecipeSearchResponse(
            recipes=enriched_recipes,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    except Exception as e:
        logger.error(f"Recipe search failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search recipes: {str(e)}"
        )


@router.get("/popular", response_model=PopularRecipesResponse)
async def get_popular_recipes(
    limit: int = Query(6, ge=1, le=50, description="Number of popular recipes to return"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get popular recipes sorted by view count.
    
    This endpoint returns the most viewed recipes, useful for homepage display.
    Results are sorted by view_count in descending order.
    
    Args:
        limit: Maximum number of recipes to return (default: 6, max: 50)
        db: Database session
    
    Returns:
        PopularRecipesResponse with list of popular recipes
    """
    # Query popular recipes sorted by view count
    popular_recipes = db.query(Recipe).order_by(
        desc(Recipe.view_count)
    ).limit(limit).all()
    
    logger.info(f"Retrieved {len(popular_recipes)} popular recipes")
    
    # Enrich recipes with details (no user ingredients)
    user_id = current_user.id if current_user else None
    enriched_recipes = [
        enrich_recipe_with_details(recipe, [], db, user_id)
        for recipe in popular_recipes
    ]
    
    return PopularRecipesResponse(recipes=enriched_recipes)


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe_detail(
    recipe_id: int = Path(..., description="Recipe ID"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get detailed information about a specific recipe.
    
    This endpoint:
    1. Retrieves the recipe with all related data
    2. Increments the view count
    3. Returns full recipe details including ratings
    
    Args:
        recipe_id: ID of the recipe to retrieve
        db: Database session
    
    Returns:
        RecipeResponse with full recipe details
    
    Raises:
        HTTPException: If recipe not found (404)
    """
    # Query recipe with all relationships
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with ID {recipe_id} not found"
        )
    
    # Increment view count
    recipe.view_count += 1
    db.commit()
    db.refresh(recipe)
    
    logger.info(f"Retrieved recipe {recipe_id}: {recipe.name} (views: {recipe.view_count})")
    
    # Enrich recipe with details (no user ingredients, so all marked as unavailable)
    user_id = current_user.id if current_user else None
    enriched_recipe = enrich_recipe_with_details(recipe, [], db, user_id)
    
    return enriched_recipe
