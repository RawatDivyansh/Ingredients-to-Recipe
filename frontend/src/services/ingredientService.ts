import api from './api';
import { Ingredient } from '../types';

export const ingredientService = {
  // Get all ingredients
  getAllIngredients: async (): Promise<{ ingredients: Ingredient[] }> => {
    const response = await api.get('/api/ingredients');
    return response.data;
  },

  // Get autocomplete suggestions for ingredients
  getAutocompleteSuggestions: async (query: string, limit: number = 10): Promise<{ suggestions: Ingredient[] }> => {
    const response = await api.get('/api/ingredients/autocomplete', {
      params: { q: query, limit },
    });
    return response.data;
  },
};
