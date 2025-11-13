export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static fromAxiosError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.detail || data?.message || ApiError.getDefaultMessage(status);
      return new ApiError(message, status, data);
    } else if (error.request) {
      // Request made but no response received
      return new ApiError('Network error. Please check your internet connection.', 0);
    } else {
      // Something else happened
      return new ApiError('An unexpected error occurred. Please try again.', -1);
    }
  }

  static getDefaultMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You need to be logged in to perform this action.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  getUserFriendlyMessage(): string {
    return this.message;
  }
}
