import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../utils/apiError';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    // Token is handled via httpOnly cookies, but we can add other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
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

export default api;
