import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../utils/apiError';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Ingredient,
  Recipe,
  RecipeSearchRequest,
  ShoppingListItem,
} from '../types';

/**
 * Centralized API Client Service
 * 
 * This module provides a centralized API client with the following features:
 * 
 * 1. **Base Configuration**: Axios instance configured with base URL from environment variable
 * 2. **Request Interceptor**: Handles authentication tokens (via httpOnly cookies)
 * 3. **Response Interceptor**: Converts all errors to ApiError for consistent error handling
 * 4. **Typed API Methods**: All backend endpoints are exposed as typed methods in apiClient
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from './services/api';
 * 
 * // Direct usage
 * const recipes = await apiClient.searchRecipes({ ingredients: ['chicken', 'rice'] });
 * 
 * // Or through service wrappers
 * import { recipeService } from './services';
 * const recipes = await recipeService.searchRecipes({ ingredients: ['chicken', 'rice'] });
 * ```
 */

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

// Request interceptor for adding authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    // Token is handled via httpOnly cookies, but we can add other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Convert axios error to ApiError for consistent error handling
    const apiError = ApiError.fromAxiosError(error);
    
    // Log errors for debugging
    console.error('API Error:', {
      message: apiError.message,
      status: apiError.status,
      data: apiError.data,
    });
    
    return Promise.reject(apiError);
  }
);

/**
 * Centralized API client with typed methods for all endpoints
 */
export const apiClient = {
  // ==================== Authentication Endpoints ====================
  
  /**
   * Register a new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    // If backend has logout endpoint, call it here
    // For now, just clear local state (handled in auth context)
  },

  // ==================== Ingredient Endpoints ====================
  
  /**
   * Get all ingredients
   */
  getAllIngredients: async (): Promise<{ ingredients: Ingredient[] }> => {
    const response = await axiosInstance.get<{ ingredients: Ingredient[] }>('/api/ingredients');
    return response.data;
  },

  /**
   * Get autocomplete suggestions for ingredients
   */
  getIngredientAutocomplete: async (query: string, limit: number = 10): Promise<{ suggestions: Ingredient[] }> => {
    const response = await axiosInstance.get<{ suggestions: Ingredient[] }>('/api/ingredients/autocomplete', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // ==================== Recipe Endpoints ====================
  
  /**
   * Search for recipes based on ingredients and filters
   */
  searchRecipes: async (searchRequest: RecipeSearchRequest): Promise<{ recipes: Recipe[]; total: number }> => {
    const response = await axiosInstance.post<{ recipes: Recipe[]; total: number }>('/api/recipes/search', searchRequest);
    return response.data;
  },

  /**
   * Get recipe details by ID
   */
  getRecipeById: async (recipeId: number): Promise<Recipe> => {
    const response = await axiosInstance.get<Recipe>(`/api/recipes/${recipeId}`);
    return response.data;
  },

  /**
   * Get popular recipes
   */
  getPopularRecipes: async (limit: number = 6): Promise<{ recipes: Recipe[] }> => {
    const response = await axiosInstance.get<{ recipes: Recipe[] }>('/api/recipes/popular', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Submit a rating for a recipe
   */
  rateRecipe: async (recipeId: number, rating: number): Promise<{ success: boolean; averageRating: number }> => {
    const response = await axiosInstance.post<{ success: boolean; averageRating: number }>(
      `/api/recipes/${recipeId}/ratings`,
      { rating }
    );
    return response.data;
  },

  /**
   * Get ratings for a recipe
   */
  getRecipeRatings: async (recipeId: number): Promise<{ averageRating: number; totalRatings: number; userRating?: number }> => {
    const response = await axiosInstance.get<{ averageRating: number; totalRatings: number; userRating?: number }>(
      `/api/recipes/${recipeId}/ratings`
    );
    return response.data;
  },

  // ==================== User Favorites Endpoints ====================
  
  /**
   * Add a recipe to favorites
   */
  addFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post<{ success: boolean }>(`/api/users/favorites/${recipeId}`);
    return response.data;
  },

  /**
   * Get user's favorite recipes
   */
  getFavorites: async (): Promise<{ recipes: Recipe[] }> => {
    const response = await axiosInstance.get<{ recipes: Recipe[] }>('/api/users/favorites');
    return response.data;
  },

  /**
   * Remove a recipe from favorites
   */
  removeFavorite: async (recipeId: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/api/users/favorites/${recipeId}`);
    return response.data;
  },

  // ==================== Shopping List Endpoints ====================
  
  /**
   * Add ingredients to shopping list
   */
  addToShoppingList: async (ingredients: string[]): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post<{ success: boolean }>('/api/users/shopping-list', { ingredients });
    return response.data;
  },

  /**
   * Get user's shopping list
   */
  getShoppingList: async (): Promise<{ items: ShoppingListItem[] }> => {
    const response = await axiosInstance.get<{ items: ShoppingListItem[] }>('/api/users/shopping-list');
    return response.data;
  },

  /**
   * Remove an item from shopping list
   */
  removeFromShoppingList: async (itemId: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/api/users/shopping-list/${itemId}`);
    return response.data;
  },
};

// Export the axios instance for backward compatibility
export default axiosInstance;
