# Ingredients-to-Recipe Web Application

A full-stack web application that helps users discover recipes based on ingredients they have available. Built with FastAPI, React, PostgreSQL, and powered by Groq AI for intelligent recipe generation.

## Features

- 🔍 Ingredient-based recipe search with autocomplete
- 🤖 AI-powered recipe generation using Groq API
- 👤 User authentication and profiles
- ⭐ Recipe ratings and favorites
- 🛒 Shopping list for missing ingredients
- 📱 Responsive design for mobile and desktop
- 🎯 Filter recipes by cooking time and dietary preferences

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Database**: PostgreSQL
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Deployment**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Groq API key (free tier available at https://console.groq.com)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ingredients-to-recipe
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Groq API key and other configuration.

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
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

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GROQ_API_KEY`: Your Groq API key
- `CORS_ORIGINS`: Allowed CORS origins

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
