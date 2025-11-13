"""
Authentication API routes for user registration and login.
"""
from fastapi import APIRouter, Depends, status, Response, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.schemas.auth_schemas import UserCreate, UserLogin, AuthResponse, UserResponse
from app.services import auth_service
from app.exceptions import AuthenticationError
import logging

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/15minutes")
async def register(request: Request, user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    """
    Register a new user with email and password.
    
    Args:
        user_data: User registration data (email and password)
        response: FastAPI response object for setting cookies
        db: Database session
        
    Returns:
        AuthResponse with user data and JWT token
        
    Raises:
        ValueError: If email already exists (handled by global exception handler)
    """
    logger.info(f"Registration attempt for email: {user_data.email}")
    
    # Register the user (ValueError will be caught by global handler)
    user = auth_service.register_user(db, user_data.email, user_data.password)
    
    logger.info(f"User registered successfully: {user.email} (ID: {user.id})")
    
    # Create JWT token
    token = auth_service.create_access_token(data={"sub": str(user.id)})
    
    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days in seconds
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/15minutes")
async def login(request: Request, user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate a user with email and password.
    
    Args:
        user_data: User login credentials (email and password)
        response: FastAPI response object for setting cookies
        db: Database session
        
    Returns:
        AuthResponse with user data and JWT token
        
    Raises:
        AuthenticationError: If credentials are invalid
    """
    logger.info(f"Login attempt for email: {user_data.email}")
    
    # Authenticate user
    user = auth_service.authenticate_user(db, user_data.email, user_data.password)
    
    if not user:
        logger.warning(f"Failed login attempt for email: {user_data.email}")
        raise AuthenticationError(
            detail="Invalid email or password",
            error_code="INVALID_CREDENTIALS"
        )
    
    logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")
    
    # Create JWT token
    token = auth_service.create_access_token(data={"sub": str(user.id)})
    
    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days in seconds
    )
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Logout user by clearing the authentication cookie.
    
    Args:
        response: FastAPI response object for clearing cookies
        
    Returns:
        Success message
    """
    logger.info("User logged out")
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}
