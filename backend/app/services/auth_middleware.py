"""
Authentication middleware and dependencies for protected routes.
"""
from fastapi import Depends, HTTPException, status, Cookie
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import auth_service
from app.models import User


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token in cookie.
    
    Args:
        access_token: JWT token from httpOnly cookie
        db: Database session
        
    Returns:
        Current authenticated User object
        
    Raises:
        HTTPException: If token is invalid or user not found (401)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not access_token:
        raise credentials_exception
    
    # Verify token
    payload = auth_service.verify_token(access_token)
    if payload is None:
        raise credentials_exception
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = auth_service.get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_user_optional(
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to optionally get the current authenticated user.
    Returns None if not authenticated instead of raising an exception.
    
    Args:
        access_token: JWT token from httpOnly cookie
        db: Database session
        
    Returns:
        Current authenticated User object or None
    """
    if not access_token:
        return None
    
    # Verify token
    payload = auth_service.verify_token(access_token)
    if payload is None:
        return None
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    
    # Get user from database
    user = auth_service.get_user_by_id(db, int(user_id))
    return user
