# Groq API Integration

This document describes the Groq API integration for recipe generation.

## Overview

The application uses Groq's free API with the `llama-3.3-70b-versatile` model to dynamically generate recipe suggestions based on user-provided ingredients. The integration includes rate limiting, caching, error handling, and retry logic.

## Components

### 1. Groq Service (`app/services/groq_service.py`)

**Purpose**: Core service for interacting with Groq API

**Features**:
- API client initialization with API key from environment variable
- Rate limiting (30 requests/minute to stay within free tier)
- Retry logic with exponential backoff (up to 3 attempts)
- Error handling for API failures
- Singleton pattern for service reuse

**Key Classes**:
- `RateLimiter`: Implements sliding window rate limiting
- `GroqService`: Main service class for API interactions

**Usage**:
```python
from app.services.groq_service import get_groq_service

service = get_groq_service()
response = service.generate_completion(
    prompt="Generate recipes...",
    temperature=0.7,
    max_tokens=2000
)
```

### 2. Recipe Prompt Builder (`app/services/recipe_prompt_builder.py`)

**Purpose**: Constructs structured prompts for recipe generation

**Features**:
- Builds prompts from ingredients and filters
- Includes dietary preferences (vegetarian, vegan, gluten-free)
- Includes cooking time constraints
- Formats prompt to request JSON response with specific structure

**Key Functions**:
- `build_recipe_generation_prompt()`: Main prompt builder
- `build_filters_dict()`: Helper to build filters dictionary
- `extract_filters_from_dict()`: Helper to extract filter parameters

**Usage**:
```python
from app.services.recipe_prompt_builder import build_recipe_generation_prompt

prompt = build_recipe_generation_prompt(
    ingredients=["chicken", "rice", "garlic"],
    dietary_preferences=["gluten-free"],
    cooking_time_range=(20, 45),
    num_recipes=5
)
```

### 3. Recipe Generation Service (`app/services/recipe_generation_service.py`)

**Purpose**: Orchestrates recipe generation and storage

**Features**:
- Calls Groq API with structured prompts
- Parses JSON responses from AI
- Handles malformed AI responses gracefully
- Stores generated recipes in database with ingredients and tags
- Creates new ingredients if not found in database

**Key Functions**:
- `generate_recipes()`: Main function to generate and store recipes
- `parse_recipe_response()`: Parses and validates JSON response
- `store_recipe_in_db()`: Stores recipe with relationships

**Usage**:
```python
from app.services.recipe_generation_service import generate_recipes

recipes = generate_recipes(
    db=db_session,
    ingredients=["chicken", "rice"],
    filters={"dietary_preferences": ["gluten-free"]},
    num_recipes=5
)
```

### 4. Recipe Cache Service (`app/services/recipe_cache_service.py`)

**Purpose**: Manages recipe caching to reduce API calls

**Features**:
- Generates cache keys from sorted ingredients and filters
- Looks up cached recipes before calling API
- Stores recipes with cache_key for reuse
- Cache expiration (7 days default)
- Cache invalidation and cleanup utilities

**Key Functions**:
- `generate_cache_key()`: Creates SHA256 hash from ingredients and filters
- `get_cached_recipes()`: Retrieves cached recipes if not expired
- `invalidate_cache()`: Manually invalidate cache entries
- `cleanup_expired_cache()`: Remove expired cache entries

**Usage**:
```python
from app.services.recipe_cache_service import generate_cache_key, get_cached_recipes

cache_key = generate_cache_key(["chicken", "rice"], filters)
cached = get_cached_recipes(db_session, cache_key)

if cached:
    return cached
else:
    # Generate new recipes
    pass
```

## Cache Key Generation

Cache keys are generated using SHA256 hash of:
- Sorted list of normalized ingredients (lowercase, trimmed)
- Sorted dietary preferences (if any)
- Cooking time range (if any)

This ensures:
- Same ingredients in different order produce same key
- Different filters produce different keys
- Consistent caching across requests

## Error Handling

The integration includes comprehensive error handling:

1. **API Failures**: Retry up to 3 times with exponential backoff
2. **Rate Limiting**: Automatic waiting when approaching limits
3. **Malformed Responses**: Validation and clear error messages
4. **Missing API Key**: Raises ValueError with helpful message

## Testing

Comprehensive unit tests cover:
- Prompt building with various ingredient combinations
- JSON parsing from AI responses
- Cache key generation and consistency
- Error handling for API failures
- Rate limiting behavior
- Mock Groq API calls

Run tests:
```bash
pytest tests/test_groq_integration.py -v
```

## Environment Variables

Required environment variable:
```
GROQ_API_KEY=your_groq_api_key_here
```

## Rate Limits (Free Tier)

- 30 requests per minute
- 14,400 requests per day

The rate limiter automatically enforces these limits to prevent API errors.

## Next Steps

To use this integration in API endpoints:
1. Import `generate_recipes` from `recipe_generation_service`
2. Check cache first using `get_cached_recipes`
3. If cache miss, call `generate_recipes`
4. Return recipes with match percentage and availability flags

See task 6 in the implementation plan for recipe search endpoint implementation.
