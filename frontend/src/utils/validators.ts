// Utility functions for validation

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export const validateIngredients = (ingredients: string[]): string | null => {
  if (!ingredients || ingredients.length === 0) {
    return 'Please add at least one ingredient to search for recipes';
  }
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (!rating) {
    return 'Please select a rating';
  }
  if (!isValidRating(rating)) {
    return 'Rating must be between 1 and 5';
  }
  return null;
};
