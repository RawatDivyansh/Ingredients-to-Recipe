import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const authService = {
  // Register a new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Logout user (if backend provides endpoint)
  logout: async (): Promise<void> => {
    // If backend has logout endpoint, call it here
    // For now, just clear local state (handled in auth context)
  },
};
