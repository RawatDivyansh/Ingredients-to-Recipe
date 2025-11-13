"""
Integration tests for rating endpoints.
Tests rating submission and retrieval.
"""
import pytest
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, JSON, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.services.auth_service import hash_password, create_access_token

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_rating_endpoints.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a separate Base for testing
TestBase = declarative_base()


class User(TestBase):
    """Test User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    ratings = relationship("RecipeRating", back_populates="user")


class Recipe(TestBase):
    """Test Recipe model."""
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
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
    
    ratings = relationship("RecipeRating", back_populates="recipe")


class RecipeRating(TestBase):
    """Test RecipeRating model."""
    __tablename__ = "recipe_ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="ratings")
    recipe = relationship("Recipe", back_populates="ratings")


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    TestBase.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Add test user
    user = User(
        id=1,
        email="test@example.com",
        password_hash=hash_password("password123")
    )
    db.add(user)
    db.commit()
    
    # Add test recipe
    recipe = Recipe(
        id=1,
        name="Test Recipe",
        description="Test description",
        instructions=["Step 1", "Step 2"],
        cooking_time_minutes=30,
        difficulty="easy",
        serving_size=4
    )
    db.add(recipe)
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


@pytest.fixture
def auth_token():
    """Create an authentication token for testing."""
    return create_access_token({"sub": "1"})


class TestRatingEndpoints:
    """Test rating API endpoints."""
    
    def test_submit_rating_requires_authentication(self, client, db_session):
        """Test that submitting a rating requires authentication."""
        response = client.post(
            "/api/recipes/1/ratings",
            json={"rating": 5}
        )
        
        assert response.status_code == 401
    
    def test_submit_rating_success(self, client, db_session, auth_token):
        """Test successfully submitting a rating."""
        response = client.post(
            "/api/recipes/1/ratings",
            json={"rating": 5},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["average_rating"] == 5.0
        assert data["total_ratings"] == 1
        assert data["user_rating"] == 5
    
    def test_update_existing_rating(self, client, db_session, auth_token):
        """Test updating an existing rating."""
        # Submit initial rating
        client.post(
            "/api/recipes/1/ratings",
            json={"rating": 3},
            cookies={"access_token": auth_token}
        )
        
        # Update rating
        response = client.post(
            "/api/recipes/1/ratings",
            json={"rating": 5},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["average_rating"] == 5.0
        assert data["total_ratings"] == 1
        assert data["user_rating"] == 5
    
    def test_submit_rating_invalid_value(self, client, db_session, auth_token):
        """Test submitting invalid rating value."""
        response = client.post(
            "/api/recipes/1/ratings",
            json={"rating": 6},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_submit_rating_recipe_not_found(self, client, db_session, auth_token):
        """Test submitting rating for non-existent recipe."""
        response = client.post(
            "/api/recipes/999/ratings",
            json={"rating": 5},
            cookies={"access_token": auth_token}
        )
        
        assert response.status_code == 404
    
    def test_get_ratings_no_ratings(self, client, db_session):
        """Test getting ratings for recipe with no ratings."""
        response = client.get("/api/recipes/1/ratings")
        
        assert response.status_code == 200
        data = response.json()
        assert data["average_rating"] is None
        assert data["total_ratings"] == 0
        assert data["user_rating"] is None
    
    def test_get_ratings_with_ratings(self, client, db_session, auth_token):
        """Test getting ratings after submitting."""
        # Submit rating
        client.post(
            "/api/recipes/1/ratings",
            json={"rating": 4},
            cookies={"access_token": auth_token}
        )
        
        # Get ratings
        response = client.get("/api/recipes/1/ratings")
        
        assert response.status_code == 200
        data = response.json()
        assert data["average_rating"] == 4.0
        assert data["total_ratings"] == 1
    
    def test_get_ratings_recipe_not_found(self, client, db_session):
        """Test getting ratings for non-existent recipe."""
        response = client.get("/api/recipes/999/ratings")
        
        assert response.status_code == 404
