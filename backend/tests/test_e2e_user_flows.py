"""
End-to-end tests for complete user flows.
Tests the following flows:
1. Ingredient input → recipe search → recipe detail → add to favorites
2. Recipe detail → add missing ingredients to shopping list
3. User registration → login → rate recipe
4. Filter combinations with recipe search
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import User, Ingredient, Recipe, RecipeIngredient
import json

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_e2e_flows.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def seed_ingredients(db_session):
    """Seed test ingredients"""
    ingredients = [
        Ingredient(name="chicken", category="protein"),
        Ingredient(name="rice", category="grain"),
        Ingredient(name="tomato", category="vegetable"),
        Ingredient(name="onion", category="vegetable"),
        Ingredient(name="garlic", category="vegetable"),
    ]
    db_session.add_all(ingredients)
    db_session.commit()
    return ingredients


def test_complete_flow_ingredient_to_favorites(client, seed_ingredients):
    """
    Test Flow 1: ingredient input → recipe search → recipe detail → add to favorites
    Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 6.1, 6.3
    """
    # Step 1: Register a new user
    register_response = client.post(
        "/api/auth/register",
        json={"email": "testuser@example.com", "password": "TestPass123!"}
    )
    assert register_response.status_code == 200
    user_data = register_response.json()
    assert "id" in user_data
    
    # Step 2: Login
    login_response = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "TestPass123!"}
    )
    assert login_response.status_code == 200
    token = login_response.cookies.get("access_token")
    assert token is not None
    
    # Step 3: Get ingredient autocomplete suggestions
    autocomplete_response = client.get("/api/ingredients/autocomplete?q=chi")
    assert autocomplete_response.status_code == 200
    suggestions = autocomplete_response.json()
    assert len(suggestions) > 0
    assert any("chicken" in s["name"].lower() for s in suggestions)
    
    # Step 4: Search for recipes with ingredients
    search_response = client.post(
        "/api/recipes/search",
        json={"ingredients": ["chicken", "rice", "tomato"]}
    )
    assert search_response.status_code == 200
    recipes = search_response.json()
    assert len(recipes) > 0
    recipe_id = recipes[0]["id"]
    
    # Step 5: Get recipe detail
    detail_response = client.get(f"/api/recipes/{recipe_id}")
    assert detail_response.status_code == 200
    recipe_detail = detail_response.json()
    assert recipe_detail["id"] == recipe_id
    assert "ingredients" in recipe_detail
    assert "instructions" in recipe_detail
    
    # Step 6: Add recipe to favorites (authenticated)
    favorite_response = client.post(
        f"/api/users/favorites/{recipe_id}",
        cookies={"access_token": token}
    )
    assert favorite_response.status_code == 200
    
    # Step 7: Verify recipe is in favorites
    favorites_response = client.get(
        "/api/users/favorites",
        cookies={"access_token": token}
    )
    assert favorites_response.status_code == 200
    favorites = favorites_response.json()
    assert len(favorites) > 0
    assert any(f["id"] == recipe_id for f in favorites)


def test_shopping_list_flow(client, seed_ingredients):
    """
    Test Flow 2: recipe detail → add missing ingredients to shopping list
    Requirements: 3.1, 7.1, 7.2, 7.3
    """
    # Step 1: Register and login
    client.post(
        "/api/auth/register",
        json={"email": "shopper@example.com", "password": "TestPass123!"}
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "shopper@example.com", "password": "TestPass123!"}
    )
    token = login_response.cookies.get("access_token")
    
    # Step 2: Search for recipes
    search_response = client.post(
        "/api/recipes/search",
        json={"ingredients": ["chicken"]}
    )
    recipes = search_response.json()
    recipe_id = recipes[0]["id"]
    
    # Step 3: Get recipe detail to see missing ingredients
    detail_response = client.get(f"/api/recipes/{recipe_id}")
    recipe_detail = detail_response.json()
    
    # Find missing ingredients
    missing_ingredients = [
        ing["ingredient_name"] 
        for ing in recipe_detail["ingredients"] 
        if not ing.get("is_available", True)
    ]
    
    # Step 4: Add missing ingredients to shopping list
    if missing_ingredients:
        shopping_response = client.post(
            "/api/users/shopping-list",
            json={"ingredients": missing_ingredients},
            cookies={"access_token": token}
        )
        assert shopping_response.status_code == 200
        
        # Step 5: Verify shopping list
        list_response = client.get(
            "/api/users/shopping-list",
            cookies={"access_token": token}
        )
        assert list_response.status_code == 200
        shopping_list = list_response.json()
        assert len(shopping_list) > 0


def test_registration_login_rating_flow(client, seed_ingredients):
    """
    Test Flow 3: user registration → login → rate recipe
    Requirements: 6.1, 6.2, 10.1, 10.2, 10.3
    """
    # Step 1: Register new user
    register_response = client.post(
        "/api/auth/register",
        json={"email": "rater@example.com", "password": "SecurePass456!"}
    )
    assert register_response.status_code == 200
    assert "id" in register_response.json()
    
    # Step 2: Login with new credentials
    login_response = client.post(
        "/api/auth/login",
        json={"email": "rater@example.com", "password": "SecurePass456!"}
    )
    assert login_response.status_code == 200
    token = login_response.cookies.get("access_token")
    assert token is not None
    
    # Step 3: Get a recipe
    search_response = client.post(
        "/api/recipes/search",
        json={"ingredients": ["chicken", "rice"]}
    )
    recipes = search_response.json()
    recipe_id = recipes[0]["id"]
    
    # Step 4: Rate the recipe
    rating_response = client.post(
        f"/api/recipes/{recipe_id}/ratings",
        json={"rating": 5},
        cookies={"access_token": token}
    )
    assert rating_response.status_code == 200
    
    # Step 5: Verify rating was saved
    ratings_response = client.get(f"/api/recipes/{recipe_id}/ratings")
    assert ratings_response.status_code == 200
    ratings_data = ratings_response.json()
    assert ratings_data["average_rating"] == 5.0
    assert ratings_data["total_ratings"] == 1
    
    # Step 6: Update rating
    update_rating_response = client.post(
        f"/api/recipes/{recipe_id}/ratings",
        json={"rating": 4},
        cookies={"access_token": token}
    )
    assert update_rating_response.status_code == 200
    
    # Step 7: Verify updated rating
    updated_ratings = client.get(f"/api/recipes/{recipe_id}/ratings")
    updated_data = updated_ratings.json()
    assert updated_data["average_rating"] == 4.0
    assert updated_data["total_ratings"] == 1


def test_filter_combinations(client, seed_ingredients):
    """
    Test Flow 4: Filter combinations with recipe search
    Requirements: 5.1, 5.2, 5.3, 5.4
    """
    # Test with cooking time filter
    response1 = client.post(
        "/api/recipes/search",
        json={
            "ingredients": ["chicken", "rice"],
            "filters": {"max_cooking_time": 30}
        }
    )
    assert response1.status_code == 200
    recipes1 = response1.json()
    if recipes1:
        assert all(r["cooking_time_minutes"] <= 30 for r in recipes1)
    
    # Test with dietary preference filter
    response2 = client.post(
        "/api/recipes/search",
        json={
            "ingredients": ["rice", "tomato"],
            "filters": {"dietary_preferences": ["vegetarian"]}
        }
    )
    assert response2.status_code == 200
    recipes2 = response2.json()
    if recipes2:
        assert all("vegetarian" in r.get("dietary_tags", []) for r in recipes2)
    
    # Test with combined filters
    response3 = client.post(
        "/api/recipes/search",
        json={
            "ingredients": ["tomato", "onion", "garlic"],
            "filters": {
                "max_cooking_time": 45,
                "dietary_preferences": ["vegan"]
            }
        }
    )
    assert response3.status_code == 200
    recipes3 = response3.json()
    if recipes3:
        assert all(r["cooking_time_minutes"] <= 45 for r in recipes3)
        assert all("vegan" in r.get("dietary_tags", []) for r in recipes3)


def test_error_scenarios(client):
    """
    Test error scenarios and edge cases
    Requirements: 9.1, 9.2, 9.3, 9.4
    """
    # Test empty ingredient list
    response1 = client.post(
        "/api/recipes/search",
        json={"ingredients": []}
    )
    assert response1.status_code == 400
    
    # Test invalid rating value
    client.post(
        "/api/auth/register",
        json={"email": "error@example.com", "password": "TestPass123!"}
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "error@example.com", "password": "TestPass123!"}
    )
    token = login_response.cookies.get("access_token")
    
    # Get a recipe first
    search_response = client.post(
        "/api/recipes/search",
        json={"ingredients": ["chicken"]}
    )
    if search_response.json():
        recipe_id = search_response.json()[0]["id"]
        
        # Try invalid rating
        response2 = client.post(
            f"/api/recipes/{recipe_id}/ratings",
            json={"rating": 6},
            cookies={"access_token": token}
        )
        assert response2.status_code == 422
    
    # Test unauthorized access
    response3 = client.get("/api/users/favorites")
    assert response3.status_code == 401
    
    # Test duplicate registration
    client.post(
        "/api/auth/register",
        json={"email": "duplicate@example.com", "password": "TestPass123!"}
    )
    response4 = client.post(
        "/api/auth/register",
        json={"email": "duplicate@example.com", "password": "TestPass123!"}
    )
    assert response4.status_code == 400
