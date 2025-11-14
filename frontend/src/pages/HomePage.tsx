import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientInput from '../components/IngredientInput';
import SelectedIngredientsList from '../components/SelectedIngredientsList';
import PopularRecipes from '../components/PopularRecipes';
import HeroSection from '../components/HeroSection';
import { ErrorMessage } from '../components';
import { validateIngredients } from '../utils/validators';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleIngredientSelect = (ingredient: string) => {
    // Clear error when user adds ingredient
    setError(null);
    
    // Avoid duplicates
    if (!selectedIngredients.includes(ingredient.toLowerCase())) {
      setSelectedIngredients([...selectedIngredients, ingredient.toLowerCase()]);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((item) => item !== ingredient));
  };

  const handleGetRecipes = () => {
    // Validate ingredients
    const validationError = validateIngredients(selectedIngredients);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Navigate to recipe results page with ingredients as state
    navigate('/recipes', { state: { ingredients: selectedIngredients } });
  };

  return (
    <div className="home-page">
      <HeroSection 
        title="Find Recipes from Your Ingredients"
        subtitle="Enter the ingredients you have and discover delicious recipes!"
        animated={true}
      />

      <div className="ingredient-section">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        
        <IngredientInput onIngredientSelect={handleIngredientSelect} />
        
        <SelectedIngredientsList
          ingredients={selectedIngredients}
          onRemoveIngredient={handleRemoveIngredient}
        />

        <div className="get-recipes-section">
          <button className="btn-get-recipes" onClick={handleGetRecipes}>
            <span>
              Get Recipes {selectedIngredients.length > 0 && `(${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? 's' : ''})`}
            </span>
          </button>
        </div>
      </div>

      <PopularRecipes />
    </div>
  );
};

export default HomePage;
