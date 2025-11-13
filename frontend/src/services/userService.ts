import api from './api';
import { Recipe, ShoppingListItem } from '../types';

export const userService = {
  // Favorites
  addFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/api/users/favorites/${recipeId}`);
    return response.data;
  },

  getFavorites: async (): Promise<{ recipes: Recipe[] }> => {
    const response = await api.get('/api/users/favorites');
    return response.data;
  },

  removeFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/api/users/favorites/${recipeId}`);
    return response.data;
  },

  // Shopping List
  addToShoppingList: async (ingredients: string[]): Promise<{ success: boolean }> => {
    const response = await api.post('/api/users/shopping-list', { ingredients });
    return response.data;
  },

  getShoppingList: async (): Promise<{ items: ShoppingListItem[] }> => {
    const response = await api.get('/api/users/shopping-list');
    return response.data;
  },

  removeFromShoppingList: async (itemId: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/api/users/shopping-list/${itemId}`);
    return response.data;
  },
};
