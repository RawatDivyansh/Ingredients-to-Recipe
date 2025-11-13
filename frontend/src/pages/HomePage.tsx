import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientInput from '../components/IngredientInput';
import SelectedIngredientsList from '../components/SelectedIngredientsList';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleIngredientSelect = (ingredient: string) => {
    // Avoid duplicates
    if (!selectedIngredients.includes(ingredient.toLowerCase())) {
      setSelectedIngredients([...selectedIngredients, ingredient.toLowerCase()]);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((item) => item !== ingredient));
  };

  const handleGetRecipes = () => {
    if (selectedIngredients.length === 0) {
      alert('Please add at least one ingredient to search for recipes.');
      return;
    }

    // Navigate to recipe results page with ingredients as state
    navigate('/recipes', { state: { ingredients: selectedIngredients } });
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Find Recipes from Your Ingredients</h1>
        <p>Enter the ingredients you have and discover delicious recipes!</p>
      </div>

      <div className="ingredient-section">
        <IngredientInput onIngredientSelect={handleIngredientSelect} />
        
        <SelectedIngredientsList
          ingredients={selectedIngredients}
          onRemoveIngredient={handleRemoveIngredient}
        />

        {selectedIngredients.length > 0 && (
          <div className="get-recipes-section">
            <button className="btn-get-recipes" onClick={handleGetRecipes}>
              Get Recipes ({selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''})
            </button>
          </div>
        )}
      </div>

      {/* PopularRecipes component will be added in task 16 */}
    </div>
  );
};

export default HomePage;
