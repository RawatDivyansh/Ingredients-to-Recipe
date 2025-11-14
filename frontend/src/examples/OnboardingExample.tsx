/**
 * Example: How to integrate the Onboarding System
 * 
 * This file demonstrates how to use the onboarding system in your application.
 * You can integrate this into your App.tsx or specific pages.
 */

import React from 'react';
import { OnboardingProvider, CELEBRATIONS } from '../components';

// Define your onboarding steps
const homePageOnboardingSteps = [
  {
    message: 'Welcome to Recipe Finder! 👋 Start by adding ingredients you have at home.',
    targetElement: '#ingredient-input'
  },
  {
    message: 'Your selected ingredients will appear here. You can remove them anytime!',
    targetElement: '#selected-ingredients'
  },
  {
    message: 'Click here to generate personalized recipes based on your ingredients! 🍳',
    targetElement: '#generate-recipes-button'
  },
  {
    message: 'Explore popular recipes for inspiration! ⭐',
    targetElement: '#popular-recipes'
  }
];

/**
 * Wrap your app or specific pages with OnboardingProvider
 */
export function AppWithOnboarding({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider 
      steps={homePageOnboardingSteps}
      enableOnboarding={true}
    >
      {children}
    </OnboardingProvider>
  );
}

/**
 * Example: Using celebrations in a component
 */
import { useOnboardingContext } from '../components';

export function IngredientInputExample() {
  const { checkFirstTime, checkMilestone } = useOnboardingContext();
  const [ingredients, setIngredients] = React.useState<string[]>([]);

  const handleAddIngredient = (ingredient: string) => {
    const newIngredients = [...ingredients, ingredient];
    setIngredients(newIngredients);

    // Celebrate first ingredient
    checkFirstTime('add-ingredient', CELEBRATIONS.FIRST_INGREDIENT);

    // Check for milestone achievements
    checkMilestone('ingredients-count', newIngredients.length, [
      {
        key: 'five-ingredients',
        threshold: 5,
        celebration: CELEBRATIONS.FIVE_INGREDIENTS
      },
      {
        key: 'ten-ingredients',
        threshold: 10,
        celebration: {
          type: 'trophy',
          message: '🏆 Ingredient Master! 10 ingredients selected!',
          duration: 3000
        }
      }
    ]);
  };

  return (
    <div>
      <input 
        id="ingredient-input"
        onChange={(e) => handleAddIngredient(e.target.value)} 
        placeholder="Add ingredient..."
      />
      <div id="selected-ingredients">
        {ingredients.map(ing => <span key={ing}>{ing}</span>)}
      </div>
    </div>
  );
}

/**
 * Example: Celebrating recipe generation
 */
export function RecipeGeneratorExample() {
  const { checkFirstTime, celebrate } = useOnboardingContext();

  const handleGenerateRecipes = async () => {
    // Celebrate first search
    checkFirstTime('generate-recipes', CELEBRATIONS.FIRST_SEARCH);

    // Generate recipes...
    const recipes = await fetchRecipes();

    // Celebrate if perfect match found
    const perfectMatch = recipes.find((r: any) => r.matchScore === 100);
    if (perfectMatch) {
      celebrate(CELEBRATIONS.PERFECT_MATCH);
    }
  };

  return (
    <button 
      id="generate-recipes-button"
      onClick={handleGenerateRecipes}
    >
      Generate Recipes
    </button>
  );
}

/**
 * Example: Celebrating user interactions
 */
export function RecipeCardExample({ recipe }: { recipe: any }) {
  const { checkFirstTime } = useOnboardingContext();

  const handleFavorite = () => {
    // Celebrate first favorite
    checkFirstTime('favorite-recipe', CELEBRATIONS.FIRST_FAVORITE);
    // Add to favorites...
  };

  const handleRate = (rating: number) => {
    // Celebrate first rating
    checkFirstTime('rate-recipe', CELEBRATIONS.FIRST_RATING);
    // Submit rating...
  };

  return (
    <div>
      <h3>{recipe.name}</h3>
      <button onClick={handleFavorite}>❤️ Favorite</button>
      <button onClick={() => handleRate(5)}>⭐ Rate</button>
    </div>
  );
}

/**
 * Example: Manual onboarding control
 */
export function SettingsExample() {
  const { resetOnboarding, startOnboarding } = useOnboardingContext();

  return (
    <div>
      <h2>Settings</h2>
      <button onClick={startOnboarding}>
        Start Tutorial
      </button>
      <button onClick={resetOnboarding}>
        Reset Tutorial
      </button>
    </div>
  );
}

// Dummy function for example
async function fetchRecipes() {
  return [];
}
