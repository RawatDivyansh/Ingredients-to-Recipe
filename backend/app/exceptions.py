"""
Custom exceptions and exception handlers for the application.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import BaseModel
from typing import Optional, Any, Dict
import logging

logger = logging.getLogger(__name__)


class ErrorResponse(BaseModel):
    """Standardized error response format."""
    detail: str
    error_code: Optional[str] = None
    errors: Optional[Dict[str, Any]] = None


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    def __init__(self, detail: str, error_code: str = "AUTH_ERROR"):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)


class AuthorizationError(Exception):
    """Custom exception for authorization errors."""
    def __init__(self, detail: str, error_code: str = "AUTHORIZATION_ERROR"):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)


class ResourceNotFoundError(Exception):
    """Custom exception for resource not found errors."""
    def __init__(self, detail: str, error_code: str = "NOT_FOUND"):
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)


async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """
    Handle ValueError exceptions.
    
    Args:
        request: The incoming request
        exc: The ValueError exception
        
    Returns:
        JSONResponse with error details
    """
    logger.warning(f"ValueError at {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": str(exc),
            "error_code": "INVALID_VALUE"
        }
    )


async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """
    Handle SQLAlchemy database errors.
    
    Args:
        request: The incoming request
        exc: The SQLAlchemyError exception
        
    Returns:
        JSONResponse with error details
    """
    logger.error(f"Database error at {request.url.path}: {str(exc)}", exc_info=True)
    
    # Handle specific database errors
    if isinstance(exc, IntegrityError):
        # Extract meaningful error message for integrity violations
        error_msg = str(exc.orig) if hasattr(exc, 'orig') else str(exc)
        
        if "unique constraint" in error_msg.lower() or "duplicate" in error_msg.lower():
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "detail": "A record with this information already exists",
                    "error_code": "DUPLICATE_ENTRY"
                }
            )
    
    # Generic database error
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "A database error occurred. Please try again later.",
            "error_code": "DATABASE_ERROR"
        }
    )


async def authentication_error_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    """
    Handle authentication errors.
    
    Args:
        request: The incoming request
        exc: The AuthenticationError exception
        
    Returns:
        JSONResponse with error details
    """
    logger.warning(f"Authentication error at {request.url.path}: {exc.detail}")
    
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code
        },
        headers={"WWW-Authenticate": "Bearer"}
    )


async def authorization_error_handler(request: Request, exc: AuthorizationError) -> JSONResponse:
    """
    Handle authorization errors.
    
    Args:
        request: The incoming request
        exc: The AuthorizationError exception
        
    Returns:
        JSONResponse with error details
    """
    logger.warning(f"Authorization error at {request.url.path}: {exc.detail}")
    
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code
        }
    )


async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError) -> JSONResponse:
    """
    Handle resource not found errors.
    
    Args:
        request: The incoming request
        exc: The ResourceNotFoundError exception
        
    Returns:
        JSONResponse with error details
    """
    logger.info(f"Resource not found at {request.url.path}: {exc.detail}")
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code
        }
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors.
    
    Args:
        request: The incoming request
        exc: The RequestValidationError exception
        
    Returns:
        JSONResponse with validation error details
    """
    logger.warning(f"Validation error at {request.url.path}: {exc.errors()}")
    
    # Format validation errors for better readability
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors[field] = error["msg"]
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "error_code": "VALIDATION_ERROR",
            "errors": errors
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.
    
    Args:
        request: The incoming request
        exc: The Exception
        
    Returns:
        JSONResponse with generic error message
    """
    logger.error(f"Unexpected error at {request.url.path}: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_code": "INTERNAL_ERROR"
        }
    )
