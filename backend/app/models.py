from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, CheckConstraint, ARRAY, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    shopping_list_items = relationship("ShoppingListItem", back_populates="user", cascade="all, delete-orphan")
    ratings = relationship("RecipeRating", back_populates="user", cascade="all, delete-orphan")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    synonyms = Column(ARRAY(Text), default=[])
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")
    shopping_list_items = relationship("ShoppingListItem", back_populates="ingredient")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
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
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    dietary_tags = relationship("RecipeDietaryTag", back_populates="recipe", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="recipe", cascade="all, delete-orphan")
    ratings = relationship("RecipeRating", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(String(50))
    unit = Column(String(50))
    is_optional = Column(Boolean, default=False)

    # Relationships
    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")

    __table_args__ = (
        CheckConstraint('recipe_id IS NOT NULL', name='recipe_id_not_null'),
        CheckConstraint('ingredient_id IS NOT NULL', name='ingredient_id_not_null'),
    )


class DietaryTag(Base):
    __tablename__ = "dietary_tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    # Relationships
    recipe_tags = relationship("RecipeDietaryTag", back_populates="tag")


class RecipeDietaryTag(Base):
    __tablename__ = "recipe_dietary_tags"

    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("dietary_tags.id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    recipe = relationship("Recipe", back_populates="dietary_tags")
    tag = relationship("DietaryTag", back_populates="recipe_tags")


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorites")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(String(50))
    unit = Column(String(50))
    is_purchased = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="shopping_list_items")
    ingredient = relationship("Ingredient", back_populates="shopping_list_items")


class RecipeRating(Base):
    __tablename__ = "recipe_ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, CheckConstraint('rating >= 1 AND rating <= 5'), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="ratings")
    recipe = relationship("Recipe", back_populates="ratings")

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range_check'),
    )
