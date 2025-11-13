# API Documentation

Complete API reference for the Ingredients-to-Recipe backend service.

## Base URL

```
http://localhost:8000
```

## Authentication

Most endpoints require JWT authentication. After logging in, the JWT token is stored in an httpOnly cookie named `access_token`.

### Authentication Flow

1. Register or login to receive JWT token
2. Token is automatically included in subsequent requests via cookie
3. Token expires after 7 days (configurable)

---

## Endpoints

### Authentication

#### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errors**:
- `400 Bad Request`: Email already registered
- `422 Unprocessable Entity`: Invalid email format or password

---

#### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Response Headers**:
```
Set-Cookie: access_token=<jwt_token>; HttpOnly; Path=/; SameSite=Lax
```

**Errors**:
- `401 Unauthorized`: Invalid credentials

---

#### Logout

Clear authentication session.

**Endpoint**: `POST /api/auth/logout`

**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

---

### Ingredients

#### Get All Ingredients

Retrieve list of all available ingredients.

**Endpoint**: `GET /api/ingredients`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "chicken",
    "category": "protein",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "rice",
    "category": "grain",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### Autocomplete Ingredients

Search ingredients with autocomplete suggestions.

**Endpoint**: `GET /api/ingredients/autocomplete`

**Query Parameters**:
- `q` (required): Search query (minimum 2 characters)
- `limit` (optional): Maximum results to return (default: 10)

**Example**: `GET /api/ingredients/autocomplete?q=chi&limit=5`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "chicken",
    "category": "protein"
  },
  {
    "id": 15,
    "name": "chickpeas",
    "category": "legume"
  }
]
```

**Errors**:
- `400 Bad Request`: Query too short (< 2 characters)

---

### Recipes

#### Search Recipes

Search for recipes based on ingredients and filters.

**Endpoint**: `POST /api/recipes/search`

**Request Body**:
```json
{
  "ingredients": ["chicken", "rice", "tomato"],
  "filters": {
    "max_cooking_time": 45,
    "dietary_preferences": ["gluten-free"]
  }
}
```

**Request Body Schema**:
- `ingredients` (required): Array of ingredient names
- `filters` (optional): Object with filter options
  - `max_cooking_time` (optional): Maximum cooking time in minutes
  - `dietary_preferences` (optional): Array of dietary tags

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Chicken Fried Rice",
    "description": "A quick and delicious Asian-inspired dish",
    "cooking_time_minutes": 30,
    "difficulty": "easy",
    "serving_size": 4,
    "image_url": "https://example.com/image.jpg",
    "dietary_tags": ["gluten-free"],
    "average_rating": 4.5,
    "total_ratings": 12,
    "match_percentage": 100,
    "ingredients": [
      {
        "ingredient_id": 1,
        "ingredient_name": "chicken",
        "quantity": "500",
        "unit": "g",
        "is_optional": false,
        "is_available": true
      },
      {
        "ingredient_id": 2,
        "ingredient_name": "rice",
        "quantity": "2",
        "unit": "cups",
        "is_optional": false,
        "is_available": true
      }
    ]
  }
]
```

**Errors**:
- `400 Bad Request`: Empty ingredients list
- `500 Internal Server Error`: Groq API error

---

#### Get Recipe Detail

Get detailed information about a specific recipe.

**Endpoint**: `GET /api/recipes/{recipe_id}`

**Path Parameters**:
- `recipe_id`: Recipe ID

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Chicken Fried Rice",
  "description": "A quick and delicious Asian-inspired dish",
  "instructions": [
    "Cook rice according to package instructions",
    "Cut chicken into bite-sized pieces",
    "Heat oil in a large pan or wok",
    "Cook chicken until golden brown",
    "Add vegetables and stir-fry for 3-4 minutes",
    "Add cooked rice and soy sauce",
    "Stir-fry for another 2-3 minutes",
    "Serve hot"
  ],
  "cooking_time_minutes": 30,
  "difficulty": "easy",
  "serving_size": 4,
  "image_url": "https://example.com/image.jpg",
  "nutritional_info": {
    "calories": 450,
    "protein": "35g",
    "carbs": "55g",
    "fat": "12g"
  },
  "ingredients": [
    {
      "ingredient_id": 1,
      "ingredient_name": "chicken",
      "quantity": "500",
      "unit": "g",
      "is_optional": false,
      "is_available": true
    }
  ],
  "dietary_tags": ["gluten-free"],
  "average_rating": 4.5,
  "total_ratings": 12,
  "view_count": 156,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errors**:
- `404 Not Found`: Recipe not found

---

#### Get Popular Recipes

Get list of popular recipes sorted by view count.

**Endpoint**: `GET /api/recipes/popular`

**Query Parameters**:
- `limit` (optional): Number of recipes to return (default: 6)

**Example**: `GET /api/recipes/popular?limit=10`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Chicken Fried Rice",
    "description": "A quick and delicious Asian-inspired dish",
    "cooking_time_minutes": 30,
    "image_url": "https://example.com/image.jpg",
    "average_rating": 4.5,
    "total_ratings": 12,
    "view_count": 156
  }
]
```

---

### User Favorites

#### Get User Favorites

Get list of user's favorite recipes.

**Endpoint**: `GET /api/users/favorites`

**Authentication**: Required

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Chicken Fried Rice",
    "description": "A quick and delicious Asian-inspired dish",
    "cooking_time_minutes": 30,
    "image_url": "https://example.com/image.jpg",
    "average_rating": 4.5,
    "total_ratings": 12
  }
]
```

**Errors**:
- `401 Unauthorized`: Not authenticated

---

#### Add Recipe to Favorites

Add a recipe to user's favorites.

**Endpoint**: `POST /api/users/favorites/{recipe_id}`

**Authentication**: Required

**Path Parameters**:
- `recipe_id`: Recipe ID to favorite

**Response** (200 OK):
```json
{
  "message": "Recipe added to favorites",
  "recipe_id": 1
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Recipe not found
- `409 Conflict`: Recipe already in favorites

---

#### Remove Recipe from Favorites

Remove a recipe from user's favorites.

**Endpoint**: `DELETE /api/users/favorites/{recipe_id}`

**Authentication**: Required

**Path Parameters**:
- `recipe_id`: Recipe ID to unfavorite

**Response** (200 OK):
```json
{
  "message": "Recipe removed from favorites",
  "recipe_id": 1
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Recipe not in favorites

---

### Shopping List

#### Get Shopping List

Get user's shopping list.

**Endpoint**: `GET /api/users/shopping-list`

**Authentication**: Required

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "ingredient_name": "soy sauce",
    "quantity": "2",
    "unit": "tbsp",
    "is_purchased": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "ingredient_name": "ginger",
    "quantity": "1",
    "unit": "inch",
    "is_purchased": false,
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Not authenticated

---

#### Add Ingredients to Shopping List

Add ingredients to user's shopping list.

**Endpoint**: `POST /api/users/shopping-list`

**Authentication**: Required

**Request Body**:
```json
{
  "ingredients": ["soy sauce", "ginger", "garlic"]
}
```

**Response** (200 OK):
```json
{
  "message": "Ingredients added to shopping list",
  "added_count": 3
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Empty ingredients list

---

#### Remove Item from Shopping List

Remove an item from shopping list.

**Endpoint**: `DELETE /api/users/shopping-list/{item_id}`

**Authentication**: Required

**Path Parameters**:
- `item_id`: Shopping list item ID

**Response** (200 OK):
```json
{
  "message": "Item removed from shopping list",
  "item_id": 1
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Item not found

---

### Recipe Ratings

#### Rate a Recipe

Submit or update a rating for a recipe.

**Endpoint**: `POST /api/recipes/{recipe_id}/ratings`

**Authentication**: Required

**Path Parameters**:
- `recipe_id`: Recipe ID to rate

**Request Body**:
```json
{
  "rating": 5
}
```

**Request Body Schema**:
- `rating` (required): Integer between 1 and 5

**Response** (200 OK):
```json
{
  "message": "Rating submitted successfully",
  "recipe_id": 1,
  "rating": 5,
  "average_rating": 4.6,
  "total_ratings": 13
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Recipe not found
- `422 Unprocessable Entity`: Invalid rating value (must be 1-5)

---

#### Get Recipe Ratings

Get rating information for a recipe.

**Endpoint**: `GET /api/recipes/{recipe_id}/ratings`

**Path Parameters**:
- `recipe_id`: Recipe ID

**Response** (200 OK):
```json
{
  "recipe_id": 1,
  "average_rating": 4.6,
  "total_ratings": 13,
  "user_rating": 5
}
```

**Response Fields**:
- `user_rating`: Only included if user is authenticated and has rated the recipe

**Errors**:
- `404 Not Found`: Recipe not found

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Rate Limiting

### Groq API Limits (Free Tier)

- 30 requests per minute
- 14,400 requests per day

The application implements caching to minimize API calls. Recipes are cached for 7 days.

### Authentication Endpoints

Authentication endpoints are rate-limited to prevent brute force attacks:
- 5 attempts per 15 minutes per IP address

---

## Data Models

### User

```typescript
{
  id: number;
  email: string;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

### Ingredient

```typescript
{
  id: number;
  name: string;
  category: string;
  created_at: string;  // ISO 8601 datetime
}
```

### Recipe

```typescript
{
  id: number;
  name: string;
  description: string;
  instructions: string[];
  cooking_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  serving_size: number;
  image_url?: string;
  nutritional_info?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  ingredients: RecipeIngredient[];
  dietary_tags: string[];
  average_rating?: number;
  total_ratings: number;
  view_count: number;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

### RecipeIngredient

```typescript
{
  ingredient_id: number;
  ingredient_name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  is_available: boolean;
}
```

### ShoppingListItem

```typescript
{
  id: number;
  ingredient_name: string;
  quantity: string;
  unit: string;
  is_purchased: boolean;
  created_at: string;  // ISO 8601 datetime
}
```

---

## Interactive Documentation

For interactive API documentation with the ability to test endpoints directly:

**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

---

## Examples

### Complete User Flow Example

```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}' \
  -c cookies.txt

# 3. Search for recipes
curl -X POST http://localhost:8000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["chicken", "rice"]}' \
  -b cookies.txt

# 4. Get recipe details
curl -X GET http://localhost:8000/api/recipes/1 \
  -b cookies.txt

# 5. Rate the recipe
curl -X POST http://localhost:8000/api/recipes/1/ratings \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}' \
  -b cookies.txt

# 6. Add to favorites
curl -X POST http://localhost:8000/api/users/favorites/1 \
  -b cookies.txt

# 7. Add missing ingredients to shopping list
curl -X POST http://localhost:8000/api/users/shopping-list \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["soy sauce", "ginger"]}' \
  -b cookies.txt
```

---

## Changelog

### Version 1.0.0 (2024-01-15)

- Initial API release
- Authentication endpoints
- Recipe search with AI generation
- User favorites and shopping list
- Recipe ratings
- Popular recipes

---

For questions or issues, please refer to the main README.md or open an issue on GitHub.
