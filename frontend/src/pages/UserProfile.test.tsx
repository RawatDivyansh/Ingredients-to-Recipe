import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from './UserProfile';
import { AuthProvider } from '../contexts';
import { userService } from '../services/userService';

// Mock the api module first
jest.mock('../services/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

jest.mock('../services/userService');

const mockedUserService = userService as jest.Mocked<typeof userService>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderUserProfile = () => {
  // Set up a mock user in localStorage
  const mockUser = { id: 1, email: 'test@example.com' };
  localStorage.setItem('user', JSON.stringify(mockUser));

  return render(
    <BrowserRouter>
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render user profile with email', () => {
    renderUserProfile();

    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render tabs for Favorites and Shopping List', () => {
    renderUserProfile();

    expect(screen.getByRole('button', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shopping list/i })).toBeInTheDocument();
  });

  it('should display favorites by default', async () => {
    const mockRecipes = {
      recipes: [
        {
          id: 1,
          name: 'Chicken Pasta',
          description: 'Delicious pasta',
          instructions: ['Step 1', 'Step 2'],
          cooking_time_minutes: 30,
          difficulty: 'easy',
          serving_size: 4,
          ingredients: [],
          dietary_tags: [],
          total_ratings: 5,
          average_rating: 4.5,
        },
      ],
    };

    mockedUserService.getFavorites.mockResolvedValue(mockRecipes);

    renderUserProfile();

    await waitFor(() => {
      expect(mockedUserService.getFavorites).toHaveBeenCalled();
      expect(screen.getByText('Chicken Pasta')).toBeInTheDocument();
    });
  });

  it('should display empty state when no favorites', async () => {
    mockedUserService.getFavorites.mockResolvedValue({ recipes: [] });

    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(/no favorite recipes yet/i)).toBeInTheDocument();
    });
  });

  it('should switch to shopping list tab', async () => {
    mockedUserService.getFavorites.mockResolvedValue({ recipes: [] });
    mockedUserService.getShoppingList.mockResolvedValue({ items: [] });

    renderUserProfile();

    const shoppingListTab = screen.getByRole('button', { name: /shopping list/i });
    fireEvent.click(shoppingListTab);

    await waitFor(() => {
      expect(mockedUserService.getShoppingList).toHaveBeenCalled();
      expect(screen.getByText(/your shopping list is empty/i)).toBeInTheDocument();
    });
  });

  it('should display shopping list items', async () => {
    const mockItems = {
      items: [
        {
          id: 1,
          ingredient_name: 'tomato',
          quantity: '2',
          unit: 'pieces',
          is_purchased: false,
        },
        {
          id: 2,
          ingredient_name: 'onion',
          quantity: '1',
          unit: 'piece',
          is_purchased: false,
        },
      ],
    };

    mockedUserService.getFavorites.mockResolvedValue({ recipes: [] });
    mockedUserService.getShoppingList.mockResolvedValue(mockItems);

    renderUserProfile();

    const shoppingListTab = screen.getByRole('button', { name: /shopping list/i });
    fireEvent.click(shoppingListTab);

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
      expect(screen.getByText('onion')).toBeInTheDocument();
      expect(screen.getByText('2 pieces')).toBeInTheDocument();
      expect(screen.getByText('1 piece')).toBeInTheDocument();
    });
  });

  it('should remove item from shopping list', async () => {
    const mockItems = {
      items: [
        {
          id: 1,
          ingredient_name: 'tomato',
          quantity: '2',
          unit: 'pieces',
          is_purchased: false,
        },
      ],
    };

    mockedUserService.getFavorites.mockResolvedValue({ recipes: [] });
    mockedUserService.getShoppingList.mockResolvedValue(mockItems);
    mockedUserService.removeFromShoppingList.mockResolvedValue({ success: true });

    renderUserProfile();

    const shoppingListTab = screen.getByRole('button', { name: /shopping list/i });
    fireEvent.click(shoppingListTab);

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText(/remove tomato/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockedUserService.removeFromShoppingList).toHaveBeenCalledWith(1);
      expect(screen.queryByText('tomato')).not.toBeInTheDocument();
    });
  });

  it('should handle favorites fetch error', async () => {
    mockedUserService.getFavorites.mockRejectedValue(new Error('Network error'));

    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(/failed to load your favorite recipes/i)).toBeInTheDocument();
    });
  });

  it('should handle shopping list fetch error', async () => {
    mockedUserService.getFavorites.mockResolvedValue({ recipes: [] });
    mockedUserService.getShoppingList.mockRejectedValue(new Error('Network error'));

    renderUserProfile();

    const shoppingListTab = screen.getByRole('button', { name: /shopping list/i });
    fireEvent.click(shoppingListTab);

    await waitFor(() => {
      expect(screen.getByText(/failed to load your shopping list/i)).toBeInTheDocument();
    });
  });
});
