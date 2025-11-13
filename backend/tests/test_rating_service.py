"""
Unit tests for rating service.
Tests rating creation, update, average calculation, and validation.
"""
import pytest
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, ForeignKey, JSON, Boolean, CheckConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func

from app.services.rating_service import (
    create_or_update_rating,
    get_recipe_ratings,
    calculate_average_rating
)

# Use in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_rating.db"

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
    
    # Add test users
    user1 = User(id=1, email="user1@test.com", password_hash="hash1")
    user2 = User(id=2, email="user2@test.com", password_hash="hash2")
    user3 = User(id=3, email="user3@test.com", password_hash="hash3")
    
    db.add_all([user1, user2, user3])
    db.commit()
    
    # Add test recipes
    recipe1 = Recipe(
        id=1,
        name="Test Recipe 1",
        description="Test description",
        instructions=["Step 1", "Step 2"],
        cooking_time_minutes=30,
        difficulty="easy",
        serving_size=4
    )
    
    recipe2 = Recipe(
        id=2,
        name="Test Recipe 2",
        description="Another test",
        instructions=["Step 1"],
        cooking_time_minutes=20,
        difficulty="medium",
        serving_size=2
    )
    
    db.add_all([recipe1, recipe2])
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        TestBase.metadata.drop_all(bind=engine)


class TestCreateOrUpdateRating:
    """Test rating creation and update."""
    
    def test_create_new_rating(self, db_session):
        """Test creating a new rating."""
        rating = create_or_update_rating(
            db=db_session,
            user_id=1,
            recipe_id=1,
            rating_value=5
        )
        
        assert rating is not None
        assert rating.user_id == 1
        assert rating.recipe_id == 1
        assert rating.rating == 5
        
        # Verify it's in the database
        db_rating = db_session.query(RecipeRating).filter(
            RecipeRating.user_id == 1,
            RecipeRating.recipe_id == 1
        ).first()
        assert db_rating is not None
        assert db_rating.rating == 5
    
    def test_update_existing_rating(self, db_session):
        """Test updating an existing rating."""
        # Create initial rating
        create_or_update_rating(
            db=db_session,
            user_id=1,
            recipe_id=1,
            rating_value=3
        )
        
        # Update the rating
        updated_rating = create_or_update_rating(
            db=db_session,
            user_id=1,
            recipe_id=1,
            rating_value=5
        )
        
        assert updated_rating.rating == 5
        
        # Verify only one rating exists
        ratings_count = db_session.query(RecipeRating).filter(
            RecipeRating.user_id == 1,
            RecipeRating.recipe_id == 1
        ).count()
        assert ratings_count == 1
    
    def test_rating_validation_too_low(self, db_session):
        """Test that rating below 1 raises ValueError."""
        with pytest.raises(ValueError, match="Rating must be between 1 and 5"):
            create_or_update_rating(
                db=db_session,
                user_id=1,
                recipe_id=1,
                rating_value=0
            )
    
    def test_rating_validation_too_high(self, db_session):
        """Test that rating above 5 raises ValueError."""
        with pytest.raises(ValueError, match="Rating must be between 1 and 5"):
            create_or_update_rating(
                db=db_session,
                user_id=1,
                recipe_id=1,
                rating_value=6
            )
    
    def test_multiple_users_can_rate_same_recipe(self, db_session):
        """Test that multiple users can rate the same recipe."""
        # User 1 rates recipe
        create_or_update_rating(
            db=db_session,
            user_id=1,
            recipe_id=1,
            rating_value=5
        )
        
        # User 2 rates same recipe
        create_or_update_rating(
            db=db_session,
            user_id=2,
            recipe_id=1,
            rating_value=4
        )
        
        # Verify both ratings exist
        ratings_count = db_session.query(RecipeRating).filter(
            RecipeRating.recipe_id == 1
        ).count()
        assert ratings_count == 2


class TestGetRecipeRatings:
    """Test getting recipe rating information."""
    
    def test_get_ratings_no_ratings(self, db_session):
        """Test getting ratings for recipe with no ratings."""
        avg_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db_session,
            recipe_id=1,
            user_id=None
        )
        
        assert avg_rating is None
        assert total_ratings == 0
        assert user_rating is None
    
    def test_get_ratings_single_rating(self, db_session):
        """Test getting ratings with single rating."""
        # Create a rating
        create_or_update_rating(
            db=db_session,
            user_id=1,
            recipe_id=1,
            rating_value=4
        )
        
        avg_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db_session,
            recipe_id=1,
            user_id=None
        )
        
        assert avg_rating == 4.0
        assert total_ratings == 1
        assert user_rating is None
    
    def test_get_ratings_multiple_ratings(self, db_session):
        """Test average calculation with multiple ratings."""
        # Create multiple ratings
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=5)
        create_or_update_rating(db=db_session, user_id=2, recipe_id=1, rating_value=3)
        create_or_update_rating(db=db_session, user_id=3, recipe_id=1, rating_value=4)
        
        avg_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db_session,
            recipe_id=1,
            user_id=None
        )
        
        # Average should be (5 + 3 + 4) / 3 = 4.0
        assert avg_rating == 4.0
        assert total_ratings == 3
        assert user_rating is None
    
    def test_get_ratings_with_user_rating(self, db_session):
        """Test getting ratings including user's specific rating."""
        # Create ratings
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=5)
        create_or_update_rating(db=db_session, user_id=2, recipe_id=1, rating_value=3)
        
        avg_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db_session,
            recipe_id=1,
            user_id=1
        )
        
        assert avg_rating == 4.0  # (5 + 3) / 2
        assert total_ratings == 2
        assert user_rating == 5
    
    def test_get_ratings_user_has_not_rated(self, db_session):
        """Test getting ratings when user hasn't rated."""
        # Create rating from another user
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=5)
        
        avg_rating, total_ratings, user_rating = get_recipe_ratings(
            db=db_session,
            recipe_id=1,
            user_id=2
        )
        
        assert avg_rating == 5.0
        assert total_ratings == 1
        assert user_rating is None


class TestCalculateAverageRating:
    """Test average rating calculation."""
    
    def test_calculate_average_no_ratings(self, db_session):
        """Test calculating average with no ratings."""
        avg = calculate_average_rating(db=db_session, recipe_id=1)
        assert avg is None
    
    def test_calculate_average_single_rating(self, db_session):
        """Test calculating average with single rating."""
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=4)
        
        avg = calculate_average_rating(db=db_session, recipe_id=1)
        assert avg == 4.0
    
    def test_calculate_average_multiple_ratings(self, db_session):
        """Test calculating average with multiple ratings."""
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=5)
        create_or_update_rating(db=db_session, user_id=2, recipe_id=1, rating_value=4)
        create_or_update_rating(db=db_session, user_id=3, recipe_id=1, rating_value=3)
        
        avg = calculate_average_rating(db=db_session, recipe_id=1)
        assert avg == 4.0  # (5 + 4 + 3) / 3
    
    def test_calculate_average_different_recipes(self, db_session):
        """Test that average is calculated per recipe."""
        # Rate recipe 1
        create_or_update_rating(db=db_session, user_id=1, recipe_id=1, rating_value=5)
        
        # Rate recipe 2
        create_or_update_rating(db=db_session, user_id=1, recipe_id=2, rating_value=2)
        
        avg1 = calculate_average_rating(db=db_session, recipe_id=1)
        avg2 = calculate_average_rating(db=db_session, recipe_id=2)
        
        assert avg1 == 5.0
        assert avg2 == 2.0
