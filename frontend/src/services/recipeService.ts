import api from './api';
import { Recipe, RecipeSearchRequest } from '../types';

export const recipeService = {
  // Search for recipes based on ingredients and filters
  searchRecipes: async (searchRequest: RecipeSearchRequest): Promise<{ recipes: Recipe[]; total: number }> => {
    const response = await api.post('/api/recipes/search', searchRequest);
    return response.data;
  },

  // Get recipe details by ID
  getRecipeById: async (recipeId: number): Promise<Recipe> => {
    const response = await api.get(`/api/recipes/${recipeId}`);
    return response.data;
  },

  // Get popular recipes
  getPopularRecipes: async (limit: number = 6): Promise<{ recipes: Recipe[] }> => {
    const response = await api.get('/api/recipes/popular', {
      params: { limit },
    });
    return response.data;
  },

  // Submit a rating for a recipe
  rateRecipe: async (recipeId: number, rating: number): Promise<{ success: boolean; averageRating: number }> => {
    const response = await api.post(`/api/recipes/${recipeId}/ratings`, { rating });
    return response.data;
  },

  // Get ratings for a recipe
  getRecipeRatings: async (recipeId: number): Promise<{ averageRating: number; totalRatings: number; userRating?: number }> => {
    const response = await api.get(`/api/recipes/${recipeId}/ratings`);
    return response.data;
  },
};
