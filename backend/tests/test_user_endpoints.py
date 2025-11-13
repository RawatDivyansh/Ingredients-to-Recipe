"""
Integration tests for user favorites and shopping list endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, JSON, ARRAY
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
from app.database import get_db
from app.main import app
from app.services import auth_service

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_user.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test models
TestBase = declarative_base()


class User(TestBase):
    """Test User model."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    shopping_list_items = relationship("ShoppingListItem", back_populates="user", cascade="all, delete-orphan")


class Ingredient(TestBase):
    """Test Ingredient model."""
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    synonyms = Column(Text, default="")
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    shopping_list_items = relationship("ShoppingListItem", back_populates="ingredient")


class Recipe(TestBase):
    """Test Recipe model."""
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    instructions = Column(JSON, nullable=False)
    cooking_time_minutes = Column(Integer, nullable=False)
    difficulty = Column(String(20), nullable=False)
    serving_size = Column(Integer, nullable=False)
    image_url = Column(String(500))
    nutritional_info = Column(JSON)
    view_count = Column(Integer, default=0)
    source = Column(String(50), default='groq_ai')
    cache_key = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    favorites = relationship("UserFavorite", back_populates="recipe", cascade="all, delete-orphan")


class UserFavorite(TestBase):
    """Test UserFavorite model."""
    __tablename__ = "user_favorites"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorites")


class ShoppingListItem(TestBase):
    """Test ShoppingListItem model."""
    __tablename__ = "shopping_list_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(String(50))
    unit = Column(String(50))
    is_purchased = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="shopping_list_items")
    ingredient = relationship("Ingredient", back_populates="shopping_list_items")


class RecipeRating(TestBase):
    """Test RecipeRating model for rating queries."""
    __tablename__ = "recipe_ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    TestBase.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
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


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = auth_service.register_user(db_session, "test@example.com", "password123")
    return user


@pytest.fixture
def auth_token(test_user):
    """Create an authentication token for test user."""
    token = auth_service.create_access_token(data={"sub": str(test_user.id)})
    return token


@pytest.fixture
def test_recipe(db_session):
    """Create a test recipe."""
    recipe = Recipe(
        name="Test Recipe",
        description="A test recipe",
        instructions=["Step 1", "Step 2"],
        cooking_time_minutes=30,
        difficulty="easy",
        serving_size=4
    )
    db_session.add(recipe)
    db_session.commit()
    db_session.refresh(recipe)
    return recipe


@pytest.fixture
def test_ingredients(db_session):
    """Create test ingredients."""
    ingredients = [
        Ingredient(name="chicken", category="protein"),
        Ingredient(name="rice", category="grain"),
        Ingredient(name="tomato", category="vegetable")
    ]
    for ingredient in ingredients:
        db_session.add(ingredient)
    db_session.commit()
    return ingredients


class TestFavoritesEndpoints:
    """Tests for favorites endpoints."""
    
    def test_add_favorite_success(self, client, test_user, test_recipe, auth_token):
        """Test adding a recipe to favorites."""
        response = client.post(
            f"/api/users/favorites/{test_recipe.id}",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "added to favorites" in data["message"].lower()
    
    def test_add_favorite_recipe_not_found(self, client, test_user, auth_token):
        """Test adding non-existent recipe to favorites."""
        response = client.post(
            "/api/users/favorites/99999",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_add_favorite_already_favorited(self, client, test_user, test_recipe, auth_token, db_session):
        """Test adding already favorited recipe."""
        # Add favorite first
        favorite = UserFavorite(user_id=test_user.id, recipe_id=test_recipe.id)
        db_session.add(favorite)
        db_session.commit()
        
        # Try to add again
        response = client.post(
            f"/api/users/favorites/{test_recipe.id}",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "already" in data["detail"].lower()
    
    def test_add_favorite_unauthenticated(self, client, test_recipe):
        """Test adding favorite without authentication."""
        response = client.post(f"/api/users/favorites/{test_recipe.id}")
        
        assert response.status_code == 401
    
    def test_get_favorites_empty(self, client, test_user, auth_token):
        """Test getting favorites when list is empty."""
        response = client.get(
            "/api/users/favorites",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["recipes"]) == 0
    
    def test_get_favorites_with_recipes(self, client, test_user, test_recipe, auth_token, db_session):
        """Test getting favorites with recipes."""
        # Add favorite
        favorite = UserFavorite(user_id=test_user.id, recipe_id=test_recipe.id)
        db_session.add(favorite)
        db_session.commit()
        
        response = client.get(
            "/api/users/favorites",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["recipes"]) == 1
        assert data["recipes"][0]["id"] == test_recipe.id
        assert data["recipes"][0]["name"] == test_recipe.name
        assert "favorited_at" in data["recipes"][0]
    
    def test_get_favorites_unauthenticated(self, client):
        """Test getting favorites without authentication."""
        response = client.get("/api/users/favorites")
        
        assert response.status_code == 401
    
    def test_remove_favorite_success(self, client, test_user, test_recipe, auth_token, db_session):
        """Test removing a recipe from favorites."""
        # Add favorite first
        favorite = UserFavorite(user_id=test_user.id, recipe_id=test_recipe.id)
        db_session.add(favorite)
        db_session.commit()
        
        response = client.delete(
            f"/api/users/favorites/{test_recipe.id}",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "removed" in data["message"].lower()
    
    def test_remove_favorite_not_found(self, client, test_user, test_recipe, auth_token):
        """Test removing recipe that is not in favorites."""
        response = client.delete(
            f"/api/users/favorites/{test_recipe.id}",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "not in favorites" in data["detail"].lower()
    
    def test_remove_favorite_unauthenticated(self, client, test_recipe):
        """Test removing favorite without authentication."""
        response = client.delete(f"/api/users/favorites/{test_recipe.id}")
        
        assert response.status_code == 401


class TestShoppingListEndpoints:
    """Tests for shopping list endpoints."""
    
    def test_add_to_shopping_list_success(self, client, test_user, test_ingredients, auth_token):
        """Test adding ingredients to shopping list."""
        response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": ["chicken", "rice"]},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "2" in data["message"] or "Added 2" in data["message"]
    
    def test_add_to_shopping_list_ingredient_not_found(self, client, test_user, test_ingredients, auth_token):
        """Test adding non-existent ingredient to shopping list."""
        response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": ["chicken", "nonexistent"]},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "not found" in data["message"].lower()
    
    def test_add_to_shopping_list_duplicate(self, client, test_user, test_ingredients, auth_token, db_session):
        """Test adding ingredient that's already in shopping list."""
        # Add item first
        item = ShoppingListItem(
            user_id=test_user.id,
            ingredient_id=test_ingredients[0].id
        )
        db_session.add(item)
        db_session.commit()
        
        # Try to add again
        response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": ["chicken"]},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        # Should skip duplicate
    
    def test_add_to_shopping_list_empty(self, client, test_user, auth_token):
        """Test adding empty ingredient list."""
        response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": []},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_add_to_shopping_list_unauthenticated(self, client):
        """Test adding to shopping list without authentication."""
        response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": ["chicken"]}
        )
        
        assert response.status_code == 401
    
    def test_get_shopping_list_empty(self, client, test_user, auth_token):
        """Test getting shopping list when empty."""
        response = client.get(
            "/api/users/shopping-list",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert len(data["items"]) == 0
    
    def test_get_shopping_list_with_items(self, client, test_user, test_ingredients, auth_token, db_session):
        """Test getting shopping list with items."""
        # Add items
        item1 = ShoppingListItem(
            user_id=test_user.id,
            ingredient_id=test_ingredients[0].id,
            quantity="1",
            unit="lb"
        )
        item2 = ShoppingListItem(
            user_id=test_user.id,
            ingredient_id=test_ingredients[1].id
        )
        db_session.add(item1)
        db_session.add(item2)
        db_session.commit()
        
        response = client.get(
            "/api/users/shopping-list",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        assert data["items"][0]["ingredient_name"] in ["chicken", "rice"]
    
    def test_get_shopping_list_unauthenticated(self, client):
        """Test getting shopping list without authentication."""
        response = client.get("/api/users/shopping-list")
        
        assert response.status_code == 401
    
    def test_remove_from_shopping_list_success(self, client, test_user, test_ingredients, auth_token, db_session):
        """Test removing item from shopping list."""
        # Add item first
        item = ShoppingListItem(
            user_id=test_user.id,
            ingredient_id=test_ingredients[0].id
        )
        db_session.add(item)
        db_session.commit()
        db_session.refresh(item)
        
        response = client.delete(
            f"/api/users/shopping-list/{item.id}",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "removed" in data["message"].lower()
    
    def test_remove_from_shopping_list_not_found(self, client, test_user, auth_token):
        """Test removing non-existent item from shopping list."""
        response = client.delete(
            "/api/users/shopping-list/99999",
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_remove_from_shopping_list_unauthenticated(self, client):
        """Test removing from shopping list without authentication."""
        response = client.delete("/api/users/shopping-list/1")
        
        assert response.status_code == 401
