import { apiClient } from './api';
import { Recipe, ShoppingListItem } from '../types';
import { ApiError } from '../utils/apiError';

export const userService = {
  // Favorites
  addFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    try {
      return await apiClient.addFavorite(recipeId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to add favorite. Please try again.', -1);
    }
  },

  getFavorites: async (): Promise<{ recipes: Recipe[] }> => {
    try {
      return await apiClient.getFavorites();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load favorites. Please try again.', -1);
    }
  },

  removeFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    try {
      return await apiClient.removeFavorite(recipeId);
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
      return await apiClient.addToShoppingList(ingredients);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to add to shopping list. Please try again.', -1);
    }
  },

  getShoppingList: async (): Promise<{ items: ShoppingListItem[] }> => {
    try {
      return await apiClient.getShoppingList();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load shopping list. Please try again.', -1);
    }
  },

  removeFromShoppingList: async (itemId: number): Promise<{ success: boolean }> => {
    try {
      return await apiClient.removeFromShoppingList(itemId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to remove from shopping list. Please try again.', -1);
    }
  },
};
