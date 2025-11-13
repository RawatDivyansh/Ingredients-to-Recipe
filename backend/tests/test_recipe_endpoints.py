"""
Integration tests for recipe endpoints.
Tests recipe search, detail retrieval, and popular recipes.
"""
import pytest
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, JSON, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.database import get_db

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_recipes.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a separate Base for testing
TestBase = declarative_base()


class Ingredient(TestBase):
    """Test Ingredient model."""
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    synonyms = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")


class Recipe(TestBase):
    """Test Recipe model."""
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
    instructions = Column(JSON, nullable=False)
    cooking_time_minutes = Column(Integer, nullable=False, index=True)
    difficulty = Column(String(20), nullable=False)
    serving_size = Column(Integer, nullable=False)
    image_url = Column(String(500))
    nutritional_info = Column(JSON)
    view_count = Column(Integer, default=0)
    source = Column(String(50), default='groq_ai')
    cache_key = Column(String(255), index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe")
    dietary_tags = relationship("RecipeDietaryTag", back_populates="recipe")
    ratings = relationship("RecipeRating", back_populates="recipe")


class RecipeIngredient(TestBase):
    """Test RecipeIngredient model."""
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(String(50))
    unit = Column(String(50))
    is_optional = Column(Boolean, default=False)
    
    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")


class DietaryTag(TestBase):
    """Test DietaryTag model."""
    __tablename__ = "dietary_tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    
    recipe_tags = relationship("RecipeDietaryTag", back_populates="tag")


class RecipeDietaryTag(TestBase):
    """Test RecipeDietaryTag model."""
    __tablename__ = "recipe_dietary_tags"

    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("dietary_tags.id", ondelete="CASCADE"), primary_key=True)
    
    recipe = relationship("Recipe", back_populates="dietary_tags")
    tag = relationship("DietaryTag", back_populates="recipe_tags")


class RecipeRating(TestBase):
    """Test RecipeRating model."""
    __tablename__ = "recipe_ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    recipe = relationship("Recipe", back_populates="ratings")


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    TestBase.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Add test ingredients
    chicken = Ingredient(id=1, name="chicken", category="meat", synonyms="")
    rice = Ingredient(id=2, name="rice", category="grain", synonyms="")
    tomato = Ingredient(id=3, name="tomato", category="vegetable", synonyms="")
    garlic = Ingredient(id=4, name="garlic", category="vegetable", synonyms="")
    
    db.add_all([chicken, rice, tomato, garlic])
    db.commit()
    
    # Add test dietary tags
    vegetarian_tag = DietaryTag(id=1, name="vegetarian")
    vegan_tag = DietaryTag(id=2, name="vegan")
    
    db.add_all([vegetarian_tag, vegan_tag])
    db.commit()
    
    # Add test recipes
    recipe1 = Recipe(
        id=1,
        name="Chicken Rice",
        description="Simple chicken and rice dish",
        instructions=["Cook rice", "Cook chicken", "Combine"],
        cooking_time_minutes=30,
        difficulty="easy",
        serving_size=4,
        view_count=10,
        cache_key="test_cache_key_1"
    )
    
    recipe2 = Recipe(
        id=2,
        name="Tomato Rice",
        description="Vegetarian tomato rice",
        instructions=["Cook rice", "Add tomatoes", "Season"],
        cooking_time_minutes=25,
        difficulty="easy",
        serving_size=2,
        view_count=5,
        cache_key="test_cache_key_2"
    )
    
    db.add_all([recipe1, recipe2])
    db.commit()
    
    # Add recipe ingredients
    ri1 = RecipeIngredient(recipe_id=1, ingredient_id=1, quantity="500", unit="g", is_optional=False)
    ri2 = RecipeIngredient(recipe_id=1, ingredient_id=2, quantity="2", unit="cups", is_optional=False)
    ri3 = RecipeIngredient(recipe_id=2, ingredient_id=2, quantity="1", unit="cup", is_optional=False)
    ri4 = RecipeIngredient(recipe_id=2, ingredient_id=3, quantity="3", unit="pieces", is_optional=False)
    
    db.add_all([ri1, ri2, ri3, ri4])
    db.commit()
    
    # Add dietary tags to recipe2
    rdt = RecipeDietaryTag(recipe_id=2, tag_id=1)
    db.add(rdt)
    db.commit()
    
    # Add ratings
    rating1 = RecipeRating(user_id=1, recipe_id=1, rating=5)
    rating2 = RecipeRating(user_id=2, recipe_id=1, rating=4)
    
    db.add_all([rating1, rating2])
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        TestBase.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


class TestRecipeSearch:
    """Test recipe search endpoint."""
    
    def test_search_recipes_cache_hit(self, client, db_session):
        """Test recipe search with cache hit."""
        response = client.post(
            "/api/recipes/search",
            json={
                "ingredients": ["chicken", "rice"],
                "filters": {},
                "page": 1,
                "page_size": 20
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "recipes" in data
        assert "total" in data
        assert "page" in data
        assert data["page"] == 1
    
    @patch('app.routes.recipe_routes.generate_recipes')
    def test_search_recipes_cache_miss(self, mock_generate, client, db_session):
        """Test recipe search with cache miss generates new recipes."""
        # Get existing recipes from db to return as mock
        existing_recipes = db_session.query(Recipe).all()
        mock_generate.return_value = existing_recipes
        
        response = client.post(
            "/api/recipes/search",
            json={
                "ingredients": ["garlic", "onion"],
                "filters": {},
                "page": 1,
                "page_size": 20
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "recipes" in data
        # Verify generate_recipes was called
        mock_generate.assert_called_once()
    
    def test_search_recipes_pagination(self, client, db_session):
        """Test recipe search pagination."""
        response = client.post(
            "/api/recipes/search",
            json={
                "ingredients": ["rice"],
                "filters": {},
                "page": 1,
                "page_size": 1
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["page_size"] == 1
        assert data["total_pages"] >= 1


class TestRecipeDetail:
    """Test recipe detail endpoint."""
    
    def test_get_recipe_detail(self, client, db_session):
        """Test retrieving recipe detail."""
        response = client.get("/api/recipes/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == "Chicken Rice"
        assert "ingredients" in data
        assert "instructions" in data
        assert "average_rating" in data
        assert "total_ratings" in data
    
    def test_get_recipe_detail_increments_view_count(self, client, db_session):
        """Test that viewing recipe increments view count."""
        # Get initial view count
        recipe = db_session.query(Recipe).filter(Recipe.id == 1).first()
        initial_views = recipe.view_count
        
        # View recipe
        response = client.get("/api/recipes/1")
        assert response.status_code == 200
        
        # Check view count increased
        db_session.refresh(recipe)
        assert recipe.view_count == initial_views + 1
    
    def test_get_recipe_detail_not_found(self, client, db_session):
        """Test retrieving non-existent recipe returns 404."""
        response = client.get("/api/recipes/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestPopularRecipes:
    """Test popular recipes endpoint."""
    
    def test_get_popular_recipes(self, client, db_session):
        """Test retrieving popular recipes."""
        response = client.get("/api/recipes/popular?limit=6")
        
        assert response.status_code == 200
        data = response.json()
        assert "recipes" in data
        assert len(data["recipes"]) <= 6
    
    def test_popular_recipes_sorted_by_views(self, client, db_session):
        """Test that popular recipes are sorted by view count."""
        response = client.get("/api/recipes/popular?limit=10")
        
        assert response.status_code == 200
        data = response.json()
        recipes = data["recipes"]
        
        # Check that recipes are sorted by view count (descending)
        if len(recipes) >= 2:
            assert recipes[0]["view_count"] >= recipes[1]["view_count"]
    
    def test_popular_recipes_limit(self, client, db_session):
        """Test that limit parameter controls result count."""
        response = client.get("/api/recipes/popular?limit=1")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["recipes"]) <= 1
