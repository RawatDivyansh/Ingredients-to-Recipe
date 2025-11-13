"""
Authentication middleware and dependencies for protected routes.
"""
from fastapi import Depends, Cookie
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import auth_service
from app.models import User
from app.exceptions import AuthenticationError


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
        AuthenticationError: If token is invalid or user not found
    """
    if not access_token:
        raise AuthenticationError(
            detail="Could not validate credentials",
            error_code="MISSING_TOKEN"
        )
    
    # Verify token
    payload = auth_service.verify_token(access_token)
    if payload is None:
        raise AuthenticationError(
            detail="Invalid or expired token",
            error_code="INVALID_TOKEN"
        )
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise AuthenticationError(
            detail="Invalid token payload",
            error_code="INVALID_TOKEN_PAYLOAD"
        )
    
    # Get user from database
    user = auth_service.get_user_by_id(db, int(user_id))
    if user is None:
        raise AuthenticationError(
            detail="User not found",
            error_code="USER_NOT_FOUND"
        )
    
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
