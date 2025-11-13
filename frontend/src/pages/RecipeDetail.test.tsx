import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecipeDetail from './RecipeDetail';
import { recipeService } from '../services/recipeService';
import { userService } from '../services/userService';
import { AuthProvider } from '../contexts/AuthContext';

// Mock services
jest.mock('../services/recipeService');
jest.mock('../services/userService');

const mockGetRecipeById = recipeService.getRecipeById as jest.Mock;
const mockRateRecipe = recipeService.rateRecipe as jest.Mock;
const mockGetRecipeRatings = recipeService.getRecipeRatings as jest.Mock;
const mockAddFavorite = userService.addFavorite as jest.Mock;
const mockRemoveFavorite = userService.removeFavorite as jest.Mock;
const mockGetFavorites = userService.getFavorites as jest.Mock;
const mockAddToShoppingList = userService.addToShoppingList as jest.Mock;

const mockRecipe = {
  id: 1,
  name: 'Chicken Pasta',
  description: 'Delicious pasta with chicken',
  instructions: ['Boil water', 'Cook pasta', 'Add chicken', 'Serve hot'],
  cooking_time_minutes: 30,
  difficulty: 'easy',
  serving_size: 4,
  image_url: 'https://example.com/chicken-pasta.jpg',
  ingredients: [
    {
      ingredient_id: 1,
      ingredient_name: 'chicken',
      quantity: '500',
      unit: 'g',
      is_optional: false,
      is_available: true,
    },
    {
      ingredient_id: 2,
      ingredient_name: 'pasta',
      quantity: '300',
      unit: 'g',
      is_optional: false,
      is_available: false,
    },
    {
      ingredient_id: 3,
      ingredient_name: 'tomato sauce',
      quantity: '200',
      unit: 'ml',
      is_optional: false,
      is_available: false,
    },
  ],
  dietary_tags: ['gluten-free'],
  average_rating: 4.5,
  total_ratings: 10,
  nutritional_info: {
    calories: '450 kcal',
    protein: '35g',
    carbs: '50g',
    fat: '12g',
  },
};

const renderWithAuth = (component: React.ReactElement, isAuthenticated = false) => {
  if (isAuthenticated) {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com' }));
  } else {
    localStorage.removeItem('user');
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={component} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('RecipeDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockGetRecipeRatings.mockResolvedValue({
      averageRating: 4.5,
      totalRatings: 10,
      userRating: undefined,
    });
    mockGetFavorites.mockResolvedValue({ recipes: [] });
  });

  test('displays loading state while fetching recipe', () => {
    mockGetRecipeById.mockImplementation(() => new Promise(() => {}));

    renderWithAuth(<RecipeDetail />);

    expect(screen.getByText(/loading recipe/i)).toBeInTheDocument();
  });

  test('displays recipe details after successful fetch', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);

    renderWithAuth(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
      expect(screen.getByText('Delicious pasta with chicken')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  test('displays ingredients with available and missing indicators', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);

    renderWithAuth(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText(/500 g chicken/i)).toBeInTheDocument();
      expect(screen.getByText(/300 g pasta/i)).toBeInTheDocument();
      expect(screen.getByText(/200 ml tomato sauce/i)).toBeInTheDocument();
    });

    // Check for available and missing sections
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  test('displays step-by-step instructions', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);

    renderWithAuth(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText('Boil water')).toBeInTheDocument();
      expect(screen.getByText('Cook pasta')).toBeInTheDocument();
      expect(screen.getByText('Add chicken')).toBeInTheDocument();
      expect(screen.getByText('Serve hot')).toBeInTheDocument();
    });
  });

  test('displays nutritional information', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);

    renderWithAuth(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText('Nutritional Information')).toBeInTheDocument();
      expect(screen.getByText(/450 kcal/i)).toBeInTheDocument();
      expect(screen.getByText(/35g/i)).toBeInTheDocument();
    });
  });

  test('allows authenticated user to submit rating', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);
    mockRateRecipe.mockResolvedValue({ success: true, averageRating: 4.6 });

    renderWithAuth(<RecipeDetail />, true);

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });

    // Find and click on a star to rate
    const stars = screen.getAllByText('☆');
    fireEvent.click(stars[4]); // Click 5th star for 5-star rating

    await waitFor(() => {
      expect(mockRateRecipe).toHaveBeenCalledWith(1, 5);
      expect(screen.getByText(/rating submitted/i)).toBeInTheDocument();
    });
  });

  test('allows authenticated user to add missing ingredients to shopping list', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);
    mockAddToShoppingList.mockResolvedValue({ success: true });

    renderWithAuth(<RecipeDetail />, true);

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });

    const shoppingListButton = screen.getByText(/add missing ingredients to shopping list/i);
    fireEvent.click(shoppingListButton);

    await waitFor(() => {
      expect(mockAddToShoppingList).toHaveBeenCalledWith([
        '300 g pasta',
        '200 ml tomato sauce',
      ]);
      expect(screen.getByText(/added 2 ingredients to your shopping list/i)).toBeInTheDocument();
    });
  });

  test('allows authenticated user to favorite recipe', async () => {
    mockGetRecipeById.mockResolvedValue(mockRecipe);
    mockAddFavorite.mockResolvedValue({ success: true });

    renderWithAuth(<RecipeDetail />, true);

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText('Favorite');
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockAddFavorite).toHaveBeenCalledWith(1);
      expect(screen.getByText('Favorited')).toBeInTheDocument();
    });
  });

  test('displays error message when recipe fetch fails', async () => {
    mockGetRecipeById.mockRejectedValue({
      response: { data: { detail: 'Recipe not found' } },
    });

    renderWithAuth(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });
});
