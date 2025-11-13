"""
Recipe generation prompt builder for Groq API.
Constructs structured prompts based on ingredients and filters.
"""
from typing import List, Dict, Optional, Tuple


def build_recipe_generation_prompt(
    ingredients: List[str],
    dietary_preferences: Optional[List[str]] = None,
    cooking_time_range: Optional[Tuple[int, int]] = None,
    num_recipes: int = 5
) -> str:
    """
    Build a structured prompt for recipe generation.
    
    Args:
        ingredients: List of available ingredient names
        dietary_preferences: List of dietary preferences (e.g., ['vegetarian', 'gluten-free'])
        cooking_time_range: Tuple of (min_minutes, max_minutes) for cooking time constraint
        num_recipes: Number of recipes to generate (default: 5)
    
    Returns:
        Formatted prompt string for Groq API
    """
    # Format ingredients list
    ingredients_str = ", ".join(ingredients)
    
    # Build dietary filter section
    dietary_filter = ""
    if dietary_preferences and len(dietary_preferences) > 0:
        dietary_list = ", ".join(dietary_preferences)
        dietary_filter = f"\n\nDIETARY REQUIREMENTS: All recipes must be {dietary_list}."
    
    # Build cooking time filter section
    time_filter = ""
    if cooking_time_range:
        min_time, max_time = cooking_time_range
        time_filter = f"\n\nCOOKING TIME CONSTRAINT: Recipes should take between {min_time} and {max_time} minutes to prepare and cook."
    
    # Construct the full prompt
    prompt = f"""Generate {num_recipes} diverse and delicious recipes using these available ingredients: {ingredients_str}.
{dietary_filter}{time_filter}

INSTRUCTIONS:
1. Prioritize recipes that use as many of the provided ingredients as possible
2. Each recipe should be practical and achievable for home cooks
3. Include a variety of cuisines and cooking styles
4. Recipes can include additional common ingredients not in the list (like salt, pepper, oil, water)
5. Clearly specify all ingredients needed, including those not in the available list

For each recipe, provide the following information in JSON format:

{{
  "recipes": [
    {{
      "name": "Recipe Name",
      "description": "A brief 1-2 sentence description of the dish",
      "ingredients": [
        {{
          "name": "ingredient name",
          "quantity": "amount (e.g., 2, 1/2, 1.5)",
          "unit": "measurement unit (e.g., cup, tablespoon, piece, gram)",
          "is_optional": false
        }}
      ],
      "instructions": [
        "Step 1: Detailed instruction",
        "Step 2: Detailed instruction",
        "Step 3: Detailed instruction"
      ],
      "cooking_time_minutes": 30,
      "difficulty": "easy|medium|hard",
      "serving_size": 4,
      "dietary_tags": ["vegetarian", "gluten-free", "vegan", "dairy-free", "etc"]
    }}
  ]
}}

IMPORTANT FORMATTING RULES:
- Return ONLY valid JSON, no additional text
- Use lowercase for ingredient names
- Use standard units (cup, tablespoon, teaspoon, gram, ml, piece, etc.)
- Instructions should be clear, numbered steps
- Cooking time should be realistic and include both prep and cooking
- Difficulty should be one of: easy, medium, or hard
- Dietary tags should only include tags that truly apply to the recipe
- Ensure all JSON is properly formatted with correct quotes and commas
"""
    
    return prompt


def build_filters_dict(
    dietary_preferences: Optional[List[str]] = None,
    cooking_time_range: Optional[Tuple[int, int]] = None
) -> Dict:
    """
    Build a filters dictionary from individual filter parameters.
    
    Args:
        dietary_preferences: List of dietary preferences
        cooking_time_range: Tuple of (min_minutes, max_minutes)
    
    Returns:
        Dictionary containing filter parameters
    """
    filters = {}
    
    if dietary_preferences:
        filters["dietary_preferences"] = sorted(dietary_preferences)
    
    if cooking_time_range:
        filters["cooking_time_range"] = cooking_time_range
    
    return filters


def extract_filters_from_dict(filters: Dict) -> Tuple[Optional[List[str]], Optional[Tuple[int, int]]]:
    """
    Extract individual filter parameters from a filters dictionary.
    
    Args:
        filters: Dictionary containing filter parameters
    
    Returns:
        Tuple of (dietary_preferences, cooking_time_range)
    """
    dietary_preferences = filters.get("dietary_preferences")
    cooking_time_range = filters.get("cooking_time_range")
    
    # Convert cooking_time_range list to tuple if needed
    if cooking_time_range and isinstance(cooking_time_range, list):
        cooking_time_range = tuple(cooking_time_range)
    
    return dietary_preferences, cooking_time_range
