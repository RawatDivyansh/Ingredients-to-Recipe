import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { ApiError } from '../utils/apiError';

export const authService = {
  // Register a new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/register', credentials);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to register. Please try again.', -1);
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to login. Please try again.', -1);
    }
  },

  // Logout user (if backend provides endpoint)
  logout: async (): Promise<void> => {
    try {
      // If backend has logout endpoint, call it here
      // For now, just clear local state (handled in auth context)
    } catch (error) {
      // Logout should not fail, but log error if it does
      console.error('Logout error:', error);
    }
  },
};
