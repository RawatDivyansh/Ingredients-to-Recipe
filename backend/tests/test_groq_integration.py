"""
Unit tests for Groq API integration.
Tests prompt building, JSON parsing, cache key generation, and error handling.
"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

from app.services.recipe_prompt_builder import (
    build_recipe_generation_prompt,
    build_filters_dict,
    extract_filters_from_dict
)
from app.services.recipe_cache_service import (
    generate_cache_key,
    get_cached_recipes,
    invalidate_cache,
    cleanup_expired_cache
)
from app.services.recipe_generation_service import (
    parse_recipe_response,
    RecipeGenerationError
)
from app.services.groq_service import GroqService, RateLimiter


class TestPromptBuilder:
    """Test recipe generation prompt builder."""
    
    def test_basic_prompt_with_ingredients_only(self):
        """Test prompt building with only ingredients."""
        ingredients = ["chicken", "rice", "garlic"]
        prompt = build_recipe_generation_prompt(ingredients)
        
        assert "chicken, rice, garlic" in prompt
        assert "Generate 5 diverse" in prompt
        assert "JSON format" in prompt
        assert "recipes" in prompt
    
    def test_prompt_with_dietary_preferences(self):
        """Test prompt building with dietary preferences."""
        ingredients = ["tofu", "vegetables"]
        dietary_preferences = ["vegetarian", "gluten-free"]
        
        prompt = build_recipe_generation_prompt(
            ingredients,
            dietary_preferences=dietary_preferences
        )
        
        assert "vegetarian, gluten-free" in prompt
        assert "DIETARY REQUIREMENTS" in prompt
    
    def test_prompt_with_cooking_time_range(self):
        """Test prompt building with cooking time constraints."""
        ingredients = ["pasta", "tomato"]
        cooking_time_range = (15, 30)
        
        prompt = build_recipe_generation_prompt(
            ingredients,
            cooking_time_range=cooking_time_range
        )
        
        assert "between 15 and 30 minutes" in prompt
        assert "COOKING TIME CONSTRAINT" in prompt
    
    def test_prompt_with_all_filters(self):
        """Test prompt building with all filter types."""
        ingredients = ["chicken", "broccoli"]
        dietary_preferences = ["gluten-free"]
        cooking_time_range = (20, 45)
        
        prompt = build_recipe_generation_prompt(
            ingredients,
            dietary_preferences=dietary_preferences,
            cooking_time_range=cooking_time_range,
            num_recipes=3
        )
        
        assert "chicken, broccoli" in prompt
        assert "gluten-free" in prompt
        assert "between 20 and 45 minutes" in prompt
        assert "Generate 3 diverse" in prompt
    
    def test_build_filters_dict(self):
        """Test building filters dictionary."""
        dietary_preferences = ["vegan", "gluten-free"]
        cooking_time_range = (10, 30)
        
        filters = build_filters_dict(dietary_preferences, cooking_time_range)
        
        assert filters["dietary_preferences"] == ["gluten-free", "vegan"]  # sorted
        assert filters["cooking_time_range"] == (10, 30)
    
    def test_extract_filters_from_dict(self):
        """Test extracting filters from dictionary."""
        filters = {
            "dietary_preferences": ["vegetarian"],
            "cooking_time_range": [15, 45]
        }
        
        dietary, time_range = extract_filters_from_dict(filters)
        
        assert dietary == ["vegetarian"]
        assert time_range == (15, 45)


class TestCacheKeyGeneration:
    """Test cache key generation."""
    
    def test_same_ingredients_same_key(self):
        """Test that same ingredients produce same cache key."""
        ingredients1 = ["chicken", "rice", "garlic"]
        ingredients2 = ["chicken", "rice", "garlic"]
        
        key1 = generate_cache_key(ingredients1)
        key2 = generate_cache_key(ingredients2)
        
        assert key1 == key2
    
    def test_different_order_same_key(self):
        """Test that ingredient order doesn't affect cache key."""
        ingredients1 = ["chicken", "rice", "garlic"]
        ingredients2 = ["garlic", "chicken", "rice"]
        
        key1 = generate_cache_key(ingredients1)
        key2 = generate_cache_key(ingredients2)
        
        assert key1 == key2
    
    def test_different_ingredients_different_key(self):
        """Test that different ingredients produce different keys."""
        ingredients1 = ["chicken", "rice"]
        ingredients2 = ["beef", "pasta"]
        
        key1 = generate_cache_key(ingredients1)
        key2 = generate_cache_key(ingredients2)
        
        assert key1 != key2
    
    def test_filters_affect_cache_key(self):
        """Test that filters affect the cache key."""
        ingredients = ["chicken", "rice"]
        filters1 = {"dietary_preferences": ["vegetarian"]}
        filters2 = {"dietary_preferences": ["vegan"]}
        
        key1 = generate_cache_key(ingredients, filters1)
        key2 = generate_cache_key(ingredients, filters2)
        key3 = generate_cache_key(ingredients, None)
        
        assert key1 != key2
        assert key1 != key3
        assert key2 != key3
    
    def test_cache_key_is_hash(self):
        """Test that cache key is a valid hash string."""
        ingredients = ["chicken", "rice"]
        key = generate_cache_key(ingredients)
        
        # SHA256 produces 64 character hex string
        assert len(key) == 64
        assert all(c in "0123456789abcdef" for c in key)


class TestJSONParsing:
    """Test JSON response parsing from Groq API."""
    
    def test_parse_valid_response(self):
        """Test parsing a valid recipe response."""
        response = {
            "recipes": [
                {
                    "name": "Chicken Rice",
                    "description": "Simple chicken and rice dish",
                    "ingredients": [
                        {"name": "chicken", "quantity": "2", "unit": "pieces", "is_optional": False},
                        {"name": "rice", "quantity": "1", "unit": "cup", "is_optional": False}
                    ],
                    "instructions": ["Cook rice", "Cook chicken", "Combine"],
                    "cooking_time_minutes": 30,
                    "difficulty": "easy",
                    "serving_size": 2,
                    "dietary_tags": ["gluten-free"]
                }
            ]
        }
        
        response_text = json.dumps(response)
        recipes = parse_recipe_response(response_text)
        
        assert len(recipes) == 1
        assert recipes[0]["name"] == "Chicken Rice"
        assert len(recipes[0]["ingredients"]) == 2
        assert len(recipes[0]["instructions"]) == 3
    
    def test_parse_multiple_recipes(self):
        """Test parsing multiple recipes."""
        response = {
            "recipes": [
                {
                    "name": "Recipe 1",
                    "description": "First recipe",
                    "ingredients": [{"name": "ingredient1", "quantity": "1", "unit": "cup"}],
                    "instructions": ["Step 1"],
                    "cooking_time_minutes": 20,
                    "difficulty": "easy",
                    "serving_size": 2
                },
                {
                    "name": "Recipe 2",
                    "description": "Second recipe",
                    "ingredients": [{"name": "ingredient2", "quantity": "2", "unit": "cups"}],
                    "instructions": ["Step 1", "Step 2"],
                    "cooking_time_minutes": 30,
                    "difficulty": "medium",
                    "serving_size": 4
                }
            ]
        }
        
        response_text = json.dumps(response)
        recipes = parse_recipe_response(response_text)
        
        assert len(recipes) == 2
        assert recipes[0]["name"] == "Recipe 1"
        assert recipes[1]["name"] == "Recipe 2"
    
    def test_parse_invalid_json(self):
        """Test parsing invalid JSON raises error."""
        invalid_json = "{ invalid json }"
        
        with pytest.raises(RecipeGenerationError) as exc_info:
            parse_recipe_response(invalid_json)
        
        assert "Invalid JSON" in str(exc_info.value)
    
    def test_parse_missing_recipes_key(self):
        """Test parsing response without 'recipes' key."""
        response = {"data": []}
        response_text = json.dumps(response)
        
        with pytest.raises(RecipeGenerationError) as exc_info:
            parse_recipe_response(response_text)
        
        assert "missing 'recipes' key" in str(exc_info.value)
    
    def test_parse_empty_recipes_list(self):
        """Test parsing response with empty recipes list."""
        response = {"recipes": []}
        response_text = json.dumps(response)
        
        with pytest.raises(RecipeGenerationError) as exc_info:
            parse_recipe_response(response_text)
        
        assert "No recipes returned" in str(exc_info.value)
    
    def test_parse_missing_required_field(self):
        """Test parsing recipe missing required field."""
        response = {
            "recipes": [
                {
                    "name": "Recipe",
                    "description": "Description",
                    # Missing ingredients, instructions, etc.
                }
            ]
        }
        response_text = json.dumps(response)
        
        with pytest.raises(RecipeGenerationError) as exc_info:
            parse_recipe_response(response_text)
        
        assert "missing required field" in str(exc_info.value)
    
    def test_parse_invalid_ingredients_structure(self):
        """Test parsing recipe with invalid ingredients structure."""
        response = {
            "recipes": [
                {
                    "name": "Recipe",
                    "description": "Description",
                    "ingredients": "not a list",  # Should be a list
                    "instructions": ["Step 1"],
                    "cooking_time_minutes": 30,
                    "difficulty": "easy",
                    "serving_size": 2
                }
            ]
        }
        response_text = json.dumps(response)
        
        with pytest.raises(RecipeGenerationError) as exc_info:
            parse_recipe_response(response_text)
        
        assert "ingredients is not a list" in str(exc_info.value)


class TestRateLimiter:
    """Test rate limiting functionality."""
    
    def test_rate_limiter_allows_requests_under_limit(self):
        """Test that rate limiter allows requests under the limit."""
        limiter = RateLimiter(max_requests_per_minute=5)
        
        # Should allow 5 requests without waiting
        for _ in range(5):
            limiter.wait_if_needed()
        
        # All requests should have been recorded
        assert len(limiter.requests) == 5
    
    def test_rate_limiter_initialization(self):
        """Test rate limiter initialization."""
        limiter = RateLimiter(max_requests_per_minute=30)
        
        assert limiter.max_requests == 30
        assert limiter.window_seconds == 60
        assert len(limiter.requests) == 0


class TestGroqService:
    """Test Groq service initialization and error handling."""
    
    def test_groq_service_initialization_with_api_key(self):
        """Test GroqService initialization with API key."""
        service = GroqService(api_key="test_key")
        
        assert service.api_key == "test_key"
        assert service.model == "llama-3.3-70b-versatile"
        assert service.rate_limiter is not None
    
    def test_groq_service_initialization_without_api_key(self):
        """Test GroqService initialization without API key raises error."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError) as exc_info:
                GroqService()
            
            assert "API key not found" in str(exc_info.value)
    
    @patch('app.services.groq_service.Groq')
    def test_generate_completion_success(self, mock_groq_class):
        """Test successful completion generation."""
        # Mock the Groq client
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        # Mock the response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"recipes": []}'
        mock_client.chat.completions.create.return_value = mock_response
        
        service = GroqService(api_key="test_key")
        result = service.generate_completion("test prompt")
        
        assert result is not None
        assert result.choices[0].message.content == '{"recipes": []}'
    
    @patch('app.services.groq_service.Groq')
    def test_generate_completion_retry_on_failure(self, mock_groq_class):
        """Test retry logic on API failure."""
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        # First two calls fail, third succeeds
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"recipes": []}'
        
        mock_client.chat.completions.create.side_effect = [
            Exception("API Error 1"),
            Exception("API Error 2"),
            mock_response
        ]
        
        service = GroqService(api_key="test_key")
        result = service.generate_completion("test prompt", max_retries=3)
        
        assert result is not None
        assert mock_client.chat.completions.create.call_count == 3
    
    @patch('app.services.groq_service.Groq')
    def test_generate_completion_all_retries_fail(self, mock_groq_class):
        """Test that all retries failing raises exception."""
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        # All calls fail
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        
        service = GroqService(api_key="test_key")
        
        with pytest.raises(Exception) as exc_info:
            service.generate_completion("test prompt", max_retries=2)
        
        assert "Failed to generate completion" in str(exc_info.value)
        assert mock_client.chat.completions.create.call_count == 2
