# Error Handling and User Feedback Guide

This guide explains how to use the error handling and user feedback components implemented in the application.

## Components

### 1. ErrorMessage Component

Displays inline error messages with an optional dismiss button.

**Usage:**
```tsx
import { ErrorMessage } from '../components';

<ErrorMessage 
  message="Please enter a valid email address" 
  onDismiss={() => setError(null)} 
/>
```

**Props:**
- `message` (string): The error message to display
- `onDismiss` (optional function): Callback when user dismisses the error

### 2. Toast/Notification System

Displays temporary notification messages that auto-dismiss.

**Setup:**
Wrap your app with `ToastProvider`:
```tsx
import { ToastProvider } from './components';

<ToastProvider>
  <App />
</ToastProvider>
```

**Usage:**
```tsx
import { useToast } from '../components';

const MyComponent = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const handleSuccess = () => {
    showSuccess('Recipe added to favorites!');
  };

  const handleError = () => {
    showError('Failed to load recipes. Please try again.');
  };

  return <button onClick={handleSuccess}>Add to Favorites</button>;
};
```

**Available Methods:**
- `showSuccess(message, duration?)` - Green success toast (default 3s)
- `showError(message, duration?)` - Red error toast (default 5s)
- `showInfo(message, duration?)` - Blue info toast (default 3s)
- `showWarning(message, duration?)` - Yellow warning toast (default 4s)
- `showToast(message, type, duration?)` - Generic toast with custom type

### 3. ErrorBoundary Component

Catches React errors and displays a fallback UI.

**Usage:**
```tsx
import { ErrorBoundary } from './components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## API Error Handling

### ApiError Class

Custom error class for consistent API error handling.

**Features:**
- Converts Axios errors to user-friendly messages
- Provides status codes and error data
- Handles network errors gracefully

**Usage:**
```tsx
import { ApiError } from '../utils';

try {
  await recipeService.searchRecipes(request);
} catch (error) {
  if (error instanceof ApiError) {
    showError(error.getUserFriendlyMessage());
  }
}
```

### Service Layer Error Handling

All API services now include try-catch blocks and throw ApiError instances:

```tsx
// Example from recipeService
searchRecipes: async (searchRequest) => {
  try {
    const response = await api.post('/api/recipes/search', searchRequest);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to search recipes. Please try again.', -1);
  }
}
```

## Form Validation

### Validation Utilities

Located in `utils/validators.ts`:

**Available Validators:**
- `validateEmail(email)` - Returns error message or null
- `validatePassword(password)` - Returns error message or null
- `validateIngredients(ingredients)` - Returns error message or null
- `validateRating(rating)` - Returns error message or null

**Usage Example:**
```tsx
import { validateEmail, validatePassword } from '../utils/validators';

const handleSubmit = (e) => {
  e.preventDefault();
  
  const emailError = validateEmail(email);
  if (emailError) {
    setError(emailError);
    return;
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    setError(passwordError);
    return;
  }
  
  // Proceed with form submission
};
```

## Loading States

Forms now include loading states to prevent duplicate submissions:

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    await login({ email, password });
  } catch (err) {
    // Error handled
  } finally {
    setIsLoading(false);
  }
};

// In JSX
<button type="submit" disabled={isLoading}>
  {isLoading ? 'Logging in...' : 'Login'}
</button>
```

## Best Practices

1. **Always validate user input** before making API calls
2. **Use ErrorMessage** for inline form errors
3. **Use Toast notifications** for success messages and non-critical errors
4. **Wrap components with ErrorBoundary** to catch unexpected React errors
5. **Show loading states** during async operations
6. **Provide actionable error messages** that tell users what to do next
7. **Handle network errors gracefully** with user-friendly messages

## Error Message Guidelines

### Good Error Messages:
- ✅ "Please add at least one ingredient to search for recipes"
- ✅ "Failed to load recipes. Please check your connection and try again."
- ✅ "Password must be at least 6 characters long"

### Bad Error Messages:
- ❌ "Error 500"
- ❌ "Something went wrong"
- ❌ "Invalid input"

Always provide context and actionable guidance in error messages.
