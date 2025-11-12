"""Initial database schema

Revision ID: e9c6f0b96cc4
Revises: 
Create Date: 2025-11-12 16:08:30.573920

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9c6f0b96cc4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create ingredients table
    op.create_table(
        'ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('synonyms', sa.ARRAY(sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_ingredients_id'), 'ingredients', ['id'], unique=False)
    op.create_index(op.f('ix_ingredients_name'), 'ingredients', ['name'], unique=True)

    # Create dietary_tags table
    op.create_table(
        'dietary_tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_dietary_tags_id'), 'dietary_tags', ['id'], unique=False)

    # Create recipes table
    op.create_table(
        'recipes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('instructions', sa.JSON(), nullable=False),
        sa.Column('cooking_time_minutes', sa.Integer(), nullable=False),
        sa.Column('difficulty', sa.String(length=20), nullable=False),
        sa.Column('serving_size', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('nutritional_info', sa.JSON(), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=True),
        sa.Column('cache_key', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recipes_cache_key'), 'recipes', ['cache_key'], unique=False)
    op.create_index(op.f('ix_recipes_cooking_time_minutes'), 'recipes', ['cooking_time_minutes'], unique=False)
    op.create_index(op.f('ix_recipes_id'), 'recipes', ['id'], unique=False)

    # Create recipe_ingredients table
    op.create_table(
        'recipe_ingredients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.String(length=50), nullable=True),
        sa.Column('unit', sa.String(length=50), nullable=True),
        sa.Column('is_optional', sa.Boolean(), nullable=True),
        sa.CheckConstraint('ingredient_id IS NOT NULL', name='ingredient_id_not_null'),
        sa.CheckConstraint('recipe_id IS NOT NULL', name='recipe_id_not_null'),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recipe_ingredients_id'), 'recipe_ingredients', ['id'], unique=False)
    op.create_index(op.f('ix_recipe_ingredients_ingredient_id'), 'recipe_ingredients', ['ingredient_id'], unique=False)
    op.create_index(op.f('ix_recipe_ingredients_recipe_id'), 'recipe_ingredients', ['recipe_id'], unique=False)

    # Create recipe_dietary_tags table
    op.create_table(
        'recipe_dietary_tags',
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['dietary_tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('recipe_id', 'tag_id')
    )

    # Create user_favorites table
    op.create_table(
        'user_favorites',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'recipe_id')
    )
    op.create_index(op.f('ix_user_favorites_user_id'), 'user_favorites', ['user_id'], unique=False)

    # Create shopping_list_items table
    op.create_table(
        'shopping_list_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('ingredient_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.String(length=50), nullable=True),
        sa.Column('unit', sa.String(length=50), nullable=True),
        sa.Column('is_purchased', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shopping_list_items_id'), 'shopping_list_items', ['id'], unique=False)
    op.create_index(op.f('ix_shopping_list_items_user_id'), 'shopping_list_items', ['user_id'], unique=False)

    # Create recipe_ratings table
    op.create_table(
        'recipe_ratings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range_check'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'recipe_id')
    )
    op.create_index(op.f('ix_recipe_ratings_id'), 'recipe_ratings', ['id'], unique=False)
    op.create_index(op.f('ix_recipe_ratings_recipe_id'), 'recipe_ratings', ['recipe_id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_recipe_ratings_recipe_id'), table_name='recipe_ratings')
    op.drop_index(op.f('ix_recipe_ratings_id'), table_name='recipe_ratings')
    op.drop_table('recipe_ratings')
    
    op.drop_index(op.f('ix_shopping_list_items_user_id'), table_name='shopping_list_items')
    op.drop_index(op.f('ix_shopping_list_items_id'), table_name='shopping_list_items')
    op.drop_table('shopping_list_items')
    
    op.drop_index(op.f('ix_user_favorites_user_id'), table_name='user_favorites')
    op.drop_table('user_favorites')
    
    op.drop_table('recipe_dietary_tags')
    
    op.drop_index(op.f('ix_recipe_ingredients_recipe_id'), table_name='recipe_ingredients')
    op.drop_index(op.f('ix_recipe_ingredients_ingredient_id'), table_name='recipe_ingredients')
    op.drop_index(op.f('ix_recipe_ingredients_id'), table_name='recipe_ingredients')
    op.drop_table('recipe_ingredients')
    
    op.drop_index(op.f('ix_recipes_id'), table_name='recipes')
    op.drop_index(op.f('ix_recipes_cooking_time_minutes'), table_name='recipes')
    op.drop_index(op.f('ix_recipes_cache_key'), table_name='recipes')
    op.drop_table('recipes')
    
    op.drop_index(op.f('ix_dietary_tags_id'), table_name='dietary_tags')
    op.drop_table('dietary_tags')
    
    op.drop_index(op.f('ix_ingredients_name'), table_name='ingredients')
    op.drop_index(op.f('ix_ingredients_id'), table_name='ingredients')
    op.drop_table('ingredients')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
