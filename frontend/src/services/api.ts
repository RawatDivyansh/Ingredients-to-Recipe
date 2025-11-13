import axios, { AxiosInstance, AxiosError } from 'axios';

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
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - redirect to login or clear auth state
        console.error('Unauthorized access - please login');
      } else if (status === 403) {
        console.error('Forbidden - insufficient permissions');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error - please try again later');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default api;
