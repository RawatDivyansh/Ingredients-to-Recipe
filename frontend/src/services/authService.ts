import { apiClient } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { ApiError } from '../utils/apiError';

export const authService = {
  // Register a new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      return await apiClient.register(credentials);
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
      return await apiClient.login(credentials);
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
      await apiClient.logout();
    } catch (error) {
      // Logout should not fail, but log error if it does
      console.error('Logout error:', error);
    }
  },
};
