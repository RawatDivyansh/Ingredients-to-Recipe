import api from './api';
import { Recipe, ShoppingListItem } from '../types';
import { ApiError } from '../utils/apiError';

export const userService = {
  // Favorites
  addFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    try {
      const response = await api.post(`/api/users/favorites/${recipeId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to add favorite. Please try again.', -1);
    }
  },

  getFavorites: async (): Promise<{ recipes: Recipe[] }> => {
    try {
      const response = await api.get('/api/users/favorites');
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load favorites. Please try again.', -1);
    }
  },

  removeFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    try {
      const response = await api.delete(`/api/users/favorites/${recipeId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to remove favorite. Please try again.', -1);
    }
  },

  // Shopping List
  addToShoppingList: async (ingredients: string[]): Promise<{ success: boolean }> => {
    try {
      const response = await api.post('/api/users/shopping-list', { ingredients });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to add to shopping list. Please try again.', -1);
    }
  },

  getShoppingList: async (): Promise<{ items: ShoppingListItem[] }> => {
    try {
      const response = await api.get('/api/users/shopping-list');
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load shopping list. Please try again.', -1);
    }
  },

  removeFromShoppingList: async (itemId: number): Promise<{ success: boolean }> => {
    try {
      const response = await api.delete(`/api/users/shopping-list/${itemId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to remove from shopping list. Please try again.', -1);
    }
  },
};
