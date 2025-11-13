// Core data types for the application

export interface Ingredient {
  id: number;
  name: string;
  category: string;
}

export interface RecipeIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  is_available: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions: string[];
  cooking_time_minutes: number;
  difficulty: string;
  serving_size: number;
  image_url?: string;
  nutritional_info?: Record<string, any>;
  ingredients: RecipeIngredient[];
  dietary_tags: string[];
  average_rating?: number;
  total_ratings: number;
  match_percentage?: number;
}

export interface FilterOptions {
  cooking_time_range?: [number, number];
  dietary_preferences?: string[];
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ShoppingListItem {
  id: number;
  ingredient_name: string;
  quantity: string;
  unit: string;
  is_purchased: boolean;
}

export interface RecipeSearchRequest {
  ingredients: string[];
  filters?: FilterOptions;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface RatingData {
  rating: number;
}

export interface RatingResponse {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}
