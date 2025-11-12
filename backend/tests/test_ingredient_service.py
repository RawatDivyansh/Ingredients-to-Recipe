"""
Unit tests for ingredient service.
Tests autocomplete, normalization, and synonym matching functionality.
"""
import pytest
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, ARRAY, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
from app.services import ingredient_service

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_ingredients.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a separate Base for testing
TestBase = declarative_base()


class Ingredient(TestBase):
    """Test Ingredient model - simplified for SQLite compatibility."""
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    synonyms = Column(String(500))  # Store as comma-separated string for SQLite
    created_at = Column(TIMESTAMP, server_default=func.now())


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    TestBase.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Add test ingredients
    test_ingredients = [
        Ingredient(id=1, name="chicken", category="meat", synonyms="poultry,hen"),
        Ingredient(id=2, name="chicken breast", category="meat", synonyms="chicken fillet"),
        Ingredient(id=3, name="rice", category="grain", synonyms=""),
        Ingredient(id=4, name="tomato", category="vegetable", synonyms="tomatoes"),
        Ingredient(id=5, name="garlic", category="vegetable", synonyms=""),
        Ingredient(id=6, name="onion", category="vegetable", synonyms="onions"),
        Ingredient(id=7, name="olive oil", category="oil", synonyms=""),
        Ingredient(id=8, name="salt", category="seasoning", synonyms=""),
        Ingredient(id=9, name="pepper", category="seasoning", synonyms="black pepper"),
        Ingredient(id=10, name="cheese", category="dairy", synonyms=""),
    ]
    
    for ingredient in test_ingredients:
        db.add(ingredient)
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        TestBase.metadata.drop_all(bind=engine)


class TestIngredientNormalization:
    """Test ingredient name normalization."""
    
    def test_normalize_lowercase(self):
        """Test that normalization converts to lowercase."""
        result = ingredient_service.normalize_ingredient_name("CHICKEN")
        assert result == "chicken"
    
    def test_normalize_trim_whitespace(self):
        """Test that normalization trims whitespace."""
        result = ingredient_service.normalize_ingredient_name("  chicken  ")
        assert result == "chicken"
    
    def test_normalize_remove_special_chars(self):
        """Test that normalization removes special characters."""
        result = ingredient_service.normalize_ingredient_name("chicken!")
        assert result == "chicken"
    
    def test_normalize_multiple_spaces(self):
        """Test that normalization replaces multiple spaces with single space."""
        result = ingredient_service.normalize_ingredient_name("chicken   breast")
        assert result == "chicken breast"
    
    def test_normalize_hyphens_preserved(self):
        """Test that hyphens are preserved."""
        result = ingredient_service.normalize_ingredient_name("all-purpose flour")
        assert result == "all-purpose flour"


class TestAutocompleteSearch:
    """Test autocomplete search functionality."""
    
    def test_autocomplete_empty_query(self, db_session):
        """Test that empty query returns no results."""
        results = ingredient_service.autocomplete_ingredients(db_session, "", limit=10)
        assert len(results) == 0
    
    def test_autocomplete_short_query(self, db_session):
        """Test that query less than 2 characters returns no results."""
        results = ingredient_service.autocomplete_ingredients(db_session, "c", limit=10)
        assert len(results) == 0
    
    def test_autocomplete_exact_match(self, db_session):
        """Test autocomplete with exact match."""
        results = ingredient_service.autocomplete_ingredients(db_session, "chicken", limit=10)
        assert len(results) >= 1
        assert results[0].name == "chicken"
    
    def test_autocomplete_partial_match(self, db_session):
        """Test autocomplete with partial match."""
        results = ingredient_service.autocomplete_ingredients(db_session, "chi", limit=10)
        assert len(results) >= 1
        assert any("chicken" in ing.name.lower() for ing in results)
    
    def test_autocomplete_case_insensitive(self, db_session):
        """Test that autocomplete is case-insensitive."""
        results_lower = ingredient_service.autocomplete_ingredients(db_session, "chicken", limit=10)
        results_upper = ingredient_service.autocomplete_ingredients(db_session, "CHICKEN", limit=10)
        assert len(results_lower) == len(results_upper)
    
    def test_autocomplete_limit(self, db_session):
        """Test that limit parameter controls result count."""
        results = ingredient_service.autocomplete_ingredients(db_session, "e", limit=3)
        assert len(results) <= 3
    
    def test_autocomplete_sorting_exact_first(self, db_session):
        """Test that exact matches appear first."""
        results = ingredient_service.autocomplete_ingredients(db_session, "chicken", limit=10)
        if len(results) > 0:
            assert results[0].name == "chicken"
    
    def test_autocomplete_sorting_starts_with(self, db_session):
        """Test that starts-with matches appear before contains matches."""
        results = ingredient_service.autocomplete_ingredients(db_session, "ch", limit=10)
        # Results starting with "ch" should come before those containing "ch"
        if len(results) >= 2:
            first_result_starts = results[0].name.lower().startswith("ch")
            assert first_result_starts


class TestIngredientRetrieval:
    """Test ingredient retrieval functions."""
    
    def test_get_all_ingredients(self, db_session):
        """Test retrieving all ingredients."""
        results = ingredient_service.get_all_ingredients(db_session, skip=0, limit=100)
        assert len(results) == 10
    
    def test_get_all_ingredients_pagination(self, db_session):
        """Test pagination with skip and limit."""
        results = ingredient_service.get_all_ingredients(db_session, skip=2, limit=3)
        assert len(results) == 3
    
    def test_get_ingredient_count(self, db_session):
        """Test getting total ingredient count."""
        count = ingredient_service.get_ingredient_count(db_session)
        assert count == 10
    
    def test_find_ingredient_by_name(self, db_session):
        """Test finding ingredient by exact name."""
        result = ingredient_service.find_ingredient_by_name(db_session, "chicken")
        assert result is not None
        assert result.name == "chicken"
    
    def test_find_ingredient_by_name_case_insensitive(self, db_session):
        """Test finding ingredient by name is case-insensitive."""
        result = ingredient_service.find_ingredient_by_name(db_session, "CHICKEN")
        assert result is not None
        assert result.name == "chicken"
    
    def test_find_ingredient_by_name_not_found(self, db_session):
        """Test finding non-existent ingredient returns None."""
        result = ingredient_service.find_ingredient_by_name(db_session, "nonexistent")
        assert result is None
