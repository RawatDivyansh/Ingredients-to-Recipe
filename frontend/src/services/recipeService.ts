import api from './api';
import { Recipe, RecipeSearchRequest } from '../types';
import { ApiError } from '../utils/apiError';

export const recipeService = {
  // Search for recipes based on ingredients and filters
  searchRecipes: async (searchRequest: RecipeSearchRequest): Promise<{ recipes: Recipe[]; total: number }> => {
    try {
      const response = await api.post('/api/recipes/search', searchRequest);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to search recipes. Please try again.', -1);
    }
  },

  // Get recipe details by ID
  getRecipeById: async (recipeId: number): Promise<Recipe> => {
    try {
      const response = await api.get(`/api/recipes/${recipeId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load recipe details. Please try again.', -1);
    }
  },

  // Get popular recipes
  getPopularRecipes: async (limit: number = 6): Promise<{ recipes: Recipe[] }> => {
    try {
      const response = await api.get('/api/recipes/popular', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load popular recipes. Please try again.', -1);
    }
  },

  // Submit a rating for a recipe
  rateRecipe: async (recipeId: number, rating: number): Promise<{ success: boolean; averageRating: number }> => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/ratings`, { rating });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to submit rating. Please try again.', -1);
    }
  },

  // Get ratings for a recipe
  getRecipeRatings: async (recipeId: number): Promise<{ averageRating: number; totalRatings: number; userRating?: number }> => {
    try {
      const response = await api.get(`/api/recipes/${recipeId}/ratings`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load ratings. Please try again.', -1);
    }
  },
};
