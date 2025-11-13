import { apiClient } from './api';
import { Ingredient } from '../types';
import { ApiError } from '../utils/apiError';

export const ingredientService = {
  // Get all ingredients
  getAllIngredients: async (): Promise<{ ingredients: Ingredient[] }> => {
    try {
      return await apiClient.getAllIngredients();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load ingredients. Please try again.', -1);
    }
  },

  // Get autocomplete suggestions for ingredients
  getAutocompleteSuggestions: async (query: string, limit: number = 10): Promise<{ suggestions: Ingredient[] }> => {
    try {
      return await apiClient.getIngredientAutocomplete(query, limit);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load ingredient suggestions. Please try again.', -1);
    }
  },
};
