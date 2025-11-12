"""
Database seed script for populating initial data.
Run this script after running migrations to populate the database with sample data.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal, engine

# Import models directly from models.py file
import importlib.util
import os

models_path = os.path.join(os.path.dirname(__file__), 'app', 'models.py')
spec = importlib.util.spec_from_file_location("models_module", models_path)
models_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(models_module)

Ingredient = models_module.Ingredient
DietaryTag = models_module.DietaryTag


def seed_ingredients(db):
    """Seed common ingredients into the database."""
    ingredients_data = [
        # Proteins
        {"name": "chicken breast", "category": "protein", "synonyms": ["chicken", "chicken breasts"]},
        {"name": "ground beef", "category": "protein", "synonyms": ["beef", "minced beef"]},
        {"name": "salmon", "category": "protein", "synonyms": ["salmon fillet"]},
        {"name": "eggs", "category": "protein", "synonyms": ["egg"]},
        {"name": "tofu", "category": "protein", "synonyms": ["bean curd"]},
        {"name": "shrimp", "category": "protein", "synonyms": ["prawns", "shrimps"]},
        {"name": "pork chops", "category": "protein", "synonyms": ["pork"]},
        {"name": "turkey", "category": "protein", "synonyms": ["turkey breast"]},
        {"name": "bacon", "category": "protein", "synonyms": []},
        {"name": "chickpeas", "category": "protein", "synonyms": ["garbanzo beans"]},
        
        # Vegetables
        {"name": "tomato", "category": "vegetable", "synonyms": ["tomatoes"]},
        {"name": "onion", "category": "vegetable", "synonyms": ["onions"]},
        {"name": "garlic", "category": "vegetable", "synonyms": ["garlic cloves"]},
        {"name": "bell pepper", "category": "vegetable", "synonyms": ["peppers", "capsicum"]},
        {"name": "carrot", "category": "vegetable", "synonyms": ["carrots"]},
        {"name": "broccoli", "category": "vegetable", "synonyms": []},
        {"name": "spinach", "category": "vegetable", "synonyms": []},
        {"name": "potato", "category": "vegetable", "synonyms": ["potatoes"]},
        {"name": "mushroom", "category": "vegetable", "synonyms": ["mushrooms"]},
        {"name": "zucchini", "category": "vegetable", "synonyms": ["courgette"]},
        {"name": "cucumber", "category": "vegetable", "synonyms": []},
        {"name": "lettuce", "category": "vegetable", "synonyms": []},
        {"name": "celery", "category": "vegetable", "synonyms": []},
        {"name": "cauliflower", "category": "vegetable", "synonyms": []},
        {"name": "green beans", "category": "vegetable", "synonyms": ["string beans"]},
        
        # Grains & Carbs
        {"name": "rice", "category": "grain", "synonyms": ["white rice", "long grain rice"]},
        {"name": "pasta", "category": "grain", "synonyms": ["spaghetti", "noodles"]},
        {"name": "bread", "category": "grain", "synonyms": ["loaf"]},
        {"name": "quinoa", "category": "grain", "synonyms": []},
        {"name": "oats", "category": "grain", "synonyms": ["oatmeal"]},
        {"name": "flour", "category": "grain", "synonyms": ["all-purpose flour"]},
        {"name": "tortillas", "category": "grain", "synonyms": ["wraps"]},
        
        # Dairy
        {"name": "milk", "category": "dairy", "synonyms": []},
        {"name": "cheese", "category": "dairy", "synonyms": ["cheddar", "mozzarella"]},
        {"name": "butter", "category": "dairy", "synonyms": []},
        {"name": "yogurt", "category": "dairy", "synonyms": ["greek yogurt"]},
        {"name": "cream", "category": "dairy", "synonyms": ["heavy cream"]},
        {"name": "parmesan", "category": "dairy", "synonyms": ["parmesan cheese"]},
        
        # Herbs & Spices
        {"name": "salt", "category": "spice", "synonyms": []},
        {"name": "black pepper", "category": "spice", "synonyms": ["pepper"]},
        {"name": "olive oil", "category": "oil", "synonyms": ["extra virgin olive oil"]},
        {"name": "vegetable oil", "category": "oil", "synonyms": ["cooking oil"]},
        {"name": "basil", "category": "herb", "synonyms": ["fresh basil"]},
        {"name": "oregano", "category": "herb", "synonyms": []},
        {"name": "thyme", "category": "herb", "synonyms": []},
        {"name": "rosemary", "category": "herb", "synonyms": []},
        {"name": "parsley", "category": "herb", "synonyms": []},
        {"name": "cilantro", "category": "herb", "synonyms": ["coriander"]},
        {"name": "cumin", "category": "spice", "synonyms": []},
        {"name": "paprika", "category": "spice", "synonyms": []},
        {"name": "chili powder", "category": "spice", "synonyms": []},
        {"name": "ginger", "category": "spice", "synonyms": ["fresh ginger"]},
        
        # Condiments & Sauces
        {"name": "soy sauce", "category": "condiment", "synonyms": []},
        {"name": "tomato sauce", "category": "condiment", "synonyms": ["marinara"]},
        {"name": "ketchup", "category": "condiment", "synonyms": []},
        {"name": "mustard", "category": "condiment", "synonyms": []},
        {"name": "mayonnaise", "category": "condiment", "synonyms": ["mayo"]},
        {"name": "vinegar", "category": "condiment", "synonyms": ["white vinegar"]},
        {"name": "honey", "category": "condiment", "synonyms": []},
        {"name": "lemon juice", "category": "condiment", "synonyms": ["lemon"]},
        
        # Legumes & Beans
        {"name": "black beans", "category": "legume", "synonyms": []},
        {"name": "kidney beans", "category": "legume", "synonyms": []},
        {"name": "lentils", "category": "legume", "synonyms": []},
        
        # Fruits
        {"name": "apple", "category": "fruit", "synonyms": ["apples"]},
        {"name": "banana", "category": "fruit", "synonyms": ["bananas"]},
        {"name": "orange", "category": "fruit", "synonyms": ["oranges"]},
        {"name": "lemon", "category": "fruit", "synonyms": ["lemons"]},
        {"name": "lime", "category": "fruit", "synonyms": ["limes"]},
        {"name": "avocado", "category": "fruit", "synonyms": ["avocados"]},
    ]
    
    print("Seeding ingredients...")
    for ingredient_data in ingredients_data:
        # Check if ingredient already exists
        existing = db.query(Ingredient).filter(Ingredient.name == ingredient_data["name"]).first()
        if not existing:
            ingredient = Ingredient(**ingredient_data)
            db.add(ingredient)
    
    db.commit()
    print(f"✓ Seeded {len(ingredients_data)} ingredients")


def seed_dietary_tags(db):
    """Seed dietary tags into the database."""
    tags_data = [
        {"name": "vegetarian"},
        {"name": "vegan"},
        {"name": "gluten-free"},
        {"name": "dairy-free"},
        {"name": "low-carb"},
        {"name": "keto"},
        {"name": "paleo"},
        {"name": "pescatarian"},
        {"name": "nut-free"},
        {"name": "soy-free"},
    ]
    
    print("Seeding dietary tags...")
    for tag_data in tags_data:
        # Check if tag already exists
        existing = db.query(DietaryTag).filter(DietaryTag.name == tag_data["name"]).first()
        if not existing:
            tag = DietaryTag(**tag_data)
            db.add(tag)
    
    db.commit()
    print(f"✓ Seeded {len(tags_data)} dietary tags")


def main():
    """Main function to run all seed operations."""
    print("Starting database seeding...")
    print("=" * 50)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Seed data
        seed_ingredients(db)
        seed_dietary_tags(db)
        
        print("=" * 50)
        print("✓ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"✗ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
