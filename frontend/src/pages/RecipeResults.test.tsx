import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the recipe service
jest.mock('../services/recipeService', () => ({
  recipeService: {
    searchRecipes: jest.fn(),
  },
}));

import RecipeResults from './RecipeResults';
import { recipeService } from '../services/recipeService';

const mockSearchRecipes = recipeService.searchRecipes as jest.Mock;

const mockRecipes = [
  {
    id: 1,
    name: 'Chicken Pasta',
    description: 'Delicious pasta with chicken',
    instructions: ['Step 1', 'Step 2'],
    cooking_time_minutes: 30,
    difficulty: 'easy',
    serving_size: 4,
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
        is_available: true,
      },
    ],
    dietary_tags: ['gluten-free'],
    average_rating: 4.5,
    total_ratings: 10,
    match_percentage: 90,
  },
  {
    id: 2,
    name: 'Vegetarian Stir Fry',
    description: 'Quick and healthy stir fry',
    instructions: ['Step 1', 'Step 2'],
    cooking_time_minutes: 20,
    difficulty: 'easy',
    serving_size: 2,
    ingredients: [
      {
        ingredient_id: 3,
        ingredient_name: 'vegetables',
        quantity: '400',
        unit: 'g',
        is_optional: false,
        is_available: true,
      },
    ],
    dietary_tags: ['vegetarian', 'vegan'],
    average_rating: 4.0,
    total_ratings: 5,
    match_percentage: 80,
  },
];

describe('RecipeResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state while fetching recipes', () => {
    mockSearchRecipes.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    expect(screen.getByText(/finding delicious recipes/i)).toBeInTheDocument();
  });

  test('displays recipes after successful fetch', async () => {
    mockSearchRecipes.mockResolvedValue({
      recipes: mockRecipes,
      total: 2,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken', 'pasta'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian Stir Fry')).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    mockSearchRecipes.mockRejectedValue({
      response: { data: { detail: 'Server error' } },
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('displays no results message when no recipes found', async () => {
    mockSearchRecipes.mockResolvedValue({
      recipes: [],
      total: 0,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
    });
  });

  test('filters recipes by cooking time', async () => {
    mockSearchRecipes.mockResolvedValue({
      recipes: mockRecipes,
      total: 2,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });

    // Apply filter for under 15 minutes
    const timeFilter = screen.getByLabelText(/under 15 minutes/i);
    fireEvent.click(timeFilter);

    await waitFor(() => {
      expect(screen.queryByText('Chicken Pasta')).not.toBeInTheDocument();
      expect(screen.queryByText('Vegetarian Stir Fry')).not.toBeInTheDocument();
    });
  });

  test('filters recipes by dietary preferences', async () => {
    mockSearchRecipes.mockResolvedValue({
      recipes: mockRecipes,
      total: 2,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian Stir Fry')).toBeInTheDocument();
    });

    // Apply vegetarian filter
    const vegetarianFilter = screen.getByLabelText(/vegetarian/i);
    fireEvent.click(vegetarianFilter);

    await waitFor(() => {
      expect(screen.queryByText('Chicken Pasta')).not.toBeInTheDocument();
      expect(screen.getByText('Vegetarian Stir Fry')).toBeInTheDocument();
    });
  });

  test('navigates to recipe detail when recipe card is clicked', async () => {
    mockSearchRecipes.mockResolvedValue({
      recipes: mockRecipes,
      total: 2,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/recipes', state: { ingredients: ['chicken'] } }]}>
        <RecipeResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });

    const recipeCard = screen.getByText('Chicken Pasta').closest('.recipe-card');
    fireEvent.click(recipeCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/recipes/1', {
      state: { availableIngredients: ['chicken'] },
    });
  });
});
