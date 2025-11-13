# Ingredients-to-Recipe Web Application

A full-stack web application that helps users discover recipes based on ingredients they have available. Built with FastAPI, React, PostgreSQL, and powered by Groq AI for intelligent recipe generation.

## 🌟 Features

- 🔍 **Smart Ingredient Search**: Autocomplete ingredient input with synonym matching
- 🤖 **AI-Powered Recipe Generation**: Uses Groq's llama-3.3-70b-versatile model to generate creative recipes
- 👤 **User Authentication**: Secure JWT-based authentication with httpOnly cookies
- ⭐ **Recipe Ratings**: Rate recipes from 1-5 stars and see community ratings
- ❤️ **Favorites**: Save your favorite recipes for quick access
- 🛒 **Shopping List**: Add missing ingredients to your shopping list
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop (320px - 1920px)
- 🎯 **Smart Filters**: Filter by cooking time and dietary preferences (vegetarian, vegan, gluten-free)
- 🔥 **Popular Recipes**: Discover trending recipes on the homepage
- ⚡ **Performance**: Recipe caching and lazy loading for fast experience

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Database**: PostgreSQL
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Deployment**: Docker & Docker Compose

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended for quick start)
- **Python 3.10+** (for local development)
- **Node.js 16+** and **npm** (for frontend development)
- **PostgreSQL 14+** (if not using Docker)
- **Groq API Key** (free tier available at https://console.groq.com)

## 🚀 Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ingredients-to-recipe
   ```

2. **Set up environment variables**
   
   Create `.env` files for backend and frontend:
   
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```
   
   Edit `backend/.env` and add your Groq API key:
   ```env
   DATABASE_URL=postgresql://recipes_user:postgres@db:5432/recipes_db
   JWT_SECRET=your_secure_jwt_secret_change_in_production
   JWT_EXPIRATION_DAYS=7
   GROQ_API_KEY=your_groq_api_key_here
   CORS_ORIGINS=http://localhost:3000
   ```
   
   Edit `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```
   
   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 8000
   - Frontend application on port 3000

4. **Initialize the database**
   
   In a new terminal, run migrations and seed data:
   ```bash
   docker-compose exec backend alembic upgrade head
   docker-compose exec backend python seed_data.py
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **PostgreSQL**: localhost:5432 (user: recipes_user, password: postgres)

## 💻 Local Development Setup

### Backend Development

1. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb recipes_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE recipes_db;
   CREATE USER recipes_user WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE recipes_db TO recipes_user;
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local database URL and Groq API key
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Seed the database**
   ```bash
   python seed_data.py
   ```

7. **Start the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   The API will be available at http://localhost:8000

### Frontend Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env to point to your backend API
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open at http://localhost:3000

### Running Tests

**Backend Tests**
```bash
cd backend
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest tests/test_auth_service.py  # Run specific test file
pytest --cov=app               # Run with coverage
```

**Frontend Tests**
```bash
cd frontend
npm test                        # Run tests in watch mode
npm test -- --coverage         # Run with coverage
```

### Database Migrations

**Create a new migration**
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

**Apply migrations**
```bash
alembic upgrade head
```

**Rollback migration**
```bash
alembic downgrade -1
```

## Project Structure

```
ingredients-to-recipe/
├── backend/
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── schemas/      # Pydantic models
│   │   └── main.py       # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/recipes_db` | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | `your_secure_random_string_here` | Yes |
| `JWT_EXPIRATION_DAYS` | JWT token expiration in days | `7` | No (default: 7) |
| `GROQ_API_KEY` | Groq API key for recipe generation | `gsk_...` | Yes |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000` | Yes |

### Getting a Groq API Key

1. Visit https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note**: The free tier includes 30 requests/minute and 14,400 requests/day, which is sufficient for development and small-scale production use.

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive Swagger API documentation.

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout and clear session

#### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/autocomplete?q={query}` - Autocomplete ingredient search

#### Recipes
- `POST /api/recipes/search` - Search recipes by ingredients and filters
- `GET /api/recipes/{recipe_id}` - Get recipe details
- `GET /api/recipes/popular?limit={n}` - Get popular recipes

#### User Features (Authentication Required)
- `GET /api/users/favorites` - Get user's favorite recipes
- `POST /api/users/favorites/{recipe_id}` - Add recipe to favorites
- `DELETE /api/users/favorites/{recipe_id}` - Remove recipe from favorites
- `GET /api/users/shopping-list` - Get shopping list
- `POST /api/users/shopping-list` - Add ingredients to shopping list
- `DELETE /api/users/shopping-list/{item_id}` - Remove item from shopping list

#### Ratings
- `POST /api/recipes/{recipe_id}/ratings` - Rate a recipe (1-5 stars)
- `GET /api/recipes/{recipe_id}/ratings` - Get recipe ratings

For detailed request/response schemas, see the Swagger documentation at `/docs`.

## 🏗️ Architecture

### System Overview

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│   React     │ ◄─────────────────► │   FastAPI    │
│  Frontend   │                     │   Backend    │
└─────────────┘                     └──────────────┘
                                           │
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  PostgreSQL  │
                                    │   Database   │
                                    └──────────────┘
                                           ▲
                                           │
                                    ┌──────────────┐
                                    │   Groq API   │
                                    │  (AI Model)  │
                                    └──────────────┘
```

### Key Design Decisions

1. **AI-Powered Recipe Generation**: Uses Groq's llama-3.3-70b-versatile model to generate recipes dynamically based on user ingredients
2. **Recipe Caching**: Generated recipes are cached in PostgreSQL for 7 days to improve performance and reduce API calls
3. **JWT Authentication**: Secure authentication using JWT tokens stored in httpOnly cookies
4. **Responsive Design**: Mobile-first CSS approach with breakpoints for mobile, tablet, and desktop
5. **Error Handling**: Comprehensive error handling with user-friendly messages and detailed logging

## 🎯 Usage Guide

### For Users

1. **Getting Started**
   - Visit the homepage
   - Optionally register/login for full features (favorites, shopping list, ratings)

2. **Finding Recipes**
   - Type ingredients you have in the search box
   - Select from autocomplete suggestions
   - Add multiple ingredients
   - Click "Get Recipes" to see suggestions

3. **Filtering Results**
   - Use cooking time filter to find quick recipes
   - Select dietary preferences (vegetarian, vegan, gluten-free)
   - Clear filters to see all results

4. **Viewing Recipe Details**
   - Click on any recipe card
   - See full ingredient list with available/missing indicators
   - Follow step-by-step instructions
   - View cooking time, difficulty, and serving size

5. **Saving Favorites** (requires login)
   - Click the heart icon on any recipe
   - Access favorites from your profile

6. **Managing Shopping List** (requires login)
   - On recipe detail page, click "Add to Shopping List"
   - View and manage your list from your profile

7. **Rating Recipes** (requires login)
   - Click stars to rate a recipe 1-5
   - See average ratings from all users

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check PostgreSQL is running: `systemctl status postgresql`
- Verify database credentials in `.env`
- Ensure Groq API key is valid
- Check port 8000 is not in use: `lsof -i :8000`

**Frontend won't start**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is not in use: `lsof -i :3000`
- Verify `REACT_APP_API_URL` in `.env`

**Database connection errors**
- Verify PostgreSQL is running
- Check database exists: `psql -l`
- Verify user permissions
- Check `DATABASE_URL` format

**Groq API errors**
- Verify API key is correct
- Check rate limits (30 req/min on free tier)
- Ensure internet connectivity

**CORS errors**
- Verify `CORS_ORIGINS` in backend `.env` matches frontend URL
- Check frontend is running on expected port

## 🧪 Testing

### Manual Testing

A comprehensive testing checklist is available in `TESTING_CHECKLIST.md`. This includes:
- Complete user flow testing
- Requirements verification
- Mobile responsiveness testing
- Error scenario testing

### Automated Testing

**Backend Tests**
- Unit tests for services and utilities
- Integration tests for API endpoints
- Authentication flow tests
- Database operation tests

**Frontend Tests**
- Component unit tests
- Integration tests for user flows
- Authentication context tests

Run all tests:
```bash
# Backend
cd backend && pytest --cov=app

# Frontend
cd frontend && npm test -- --coverage
```

## 📊 Performance

### Optimization Strategies

1. **Recipe Caching**: AI-generated recipes cached for 7 days
2. **Database Indexing**: Optimized indexes on frequently queried columns
3. **Lazy Loading**: Images and components loaded on demand
4. **Debouncing**: Autocomplete requests debounced by 300ms
5. **Code Splitting**: React routes split for faster initial load
6. **Skeleton Screens**: Loading states improve perceived performance

### Expected Performance

- Recipe search: < 3 seconds (first time), < 500ms (cached)
- Autocomplete: < 300ms
- Page load: < 2 seconds on broadband, < 5 seconds on 3G
- API response time: < 200ms (database queries)

## 🔒 Security

### Implemented Security Measures

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token generation with expiration
3. **httpOnly Cookies**: Prevents XSS attacks
4. **CORS Configuration**: Restricts API access to allowed origins
5. **SQL Injection Prevention**: SQLAlchemy parameterized queries
6. **Input Validation**: Pydantic models validate all inputs
7. **Rate Limiting**: Authentication endpoints rate-limited
8. **Environment Variables**: Sensitive data in environment variables

### Security Best Practices for Production

- Use HTTPS/TLS for all connections
- Rotate JWT secrets regularly
- Implement rate limiting on all endpoints
- Set up database backups
- Use secrets management (e.g., AWS Secrets Manager)
- Enable database connection encryption
- Implement logging and monitoring
- Regular security audits

## 🚀 Deployment

### Docker Deployment

The application is containerized and ready for deployment:

```bash
docker-compose up -d
```

### Production Considerations

1. **Environment Variables**: Use production values for all secrets
2. **Database**: Use managed PostgreSQL service (e.g., AWS RDS)
3. **Reverse Proxy**: Use Nginx or similar for SSL termination
4. **Monitoring**: Set up APM tools (e.g., New Relic, Datadog)
5. **Logging**: Centralized logging (e.g., ELK stack)
6. **Backups**: Automated database backups
7. **CDN**: Use CDN for static assets
8. **Scaling**: Consider horizontal scaling for backend

### Deployment Platforms

- **AWS**: ECS/EKS for containers, RDS for PostgreSQL
- **Google Cloud**: Cloud Run, Cloud SQL
- **Azure**: Container Instances, Azure Database for PostgreSQL
- **Heroku**: Easy deployment with Heroku Postgres
- **DigitalOcean**: App Platform or Droplets with managed database

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all new frontend code
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## 🙏 Acknowledgments

- **Groq** for providing free AI API access
- **FastAPI** for the excellent Python web framework
- **React** team for the frontend library
- All open-source contributors

---

**Built with ❤️ using FastAPI, React, PostgreSQL, and Groq AI**
