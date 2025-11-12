"""
Unit tests for authentication service.
"""
import pytest
from app.services import auth_service


class TestPasswordHashing:
    """Tests for password hashing and verification."""
    
    def test_hash_password(self):
        """Test that password hashing works correctly."""
        password = "testpassword123"
        hashed = auth_service.hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")  # bcrypt hash prefix
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "testpassword123"
        hashed = auth_service.hash_password(password)
        
        assert auth_service.verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = auth_service.hash_password(password)
        
        assert auth_service.verify_password(wrong_password, hashed) is False


class TestJWTTokens:
    """Tests for JWT token generation and validation."""
    
    def test_create_access_token(self):
        """Test JWT token creation."""
        data = {"sub": "123"}
        token = auth_service.create_access_token(data)
        
        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)
    
    def test_verify_token_valid(self):
        """Test token verification with valid token."""
        data = {"sub": "123"}
        token = auth_service.create_access_token(data)
        
        payload = auth_service.verify_token(token)
        
        assert payload is not None
        assert payload["sub"] == "123"
        assert "exp" in payload
    
    def test_verify_token_invalid(self):
        """Test token verification with invalid token."""
        invalid_token = "invalid.token.here"
        
        payload = auth_service.verify_token(invalid_token)
        
        assert payload is None


class TestUserRegistration:
    """Tests for user registration."""
    
    def test_register_user_success(self, db_session):
        """Test successful user registration."""
        email = "test@example.com"
        password = "password123"
        
        user = auth_service.register_user(db_session, email, password)
        
        assert user is not None
        assert user.id is not None
        assert user.email == email
        assert user.password_hash != password
        assert user.password_hash.startswith("$2b$")
    
    def test_register_user_duplicate_email(self, db_session):
        """Test registration with duplicate email raises ValueError."""
        email = "test@example.com"
        password = "password123"
        
        # Register first user
        auth_service.register_user(db_session, email, password)
        
        # Try to register with same email
        with pytest.raises(ValueError, match="Email already registered"):
            auth_service.register_user(db_session, email, password)


class TestUserAuthentication:
    """Tests for user authentication."""
    
    def test_authenticate_user_success(self, db_session):
        """Test successful user authentication."""
        email = "test@example.com"
        password = "password123"
        
        # Register user first
        registered_user = auth_service.register_user(db_session, email, password)
        
        # Authenticate user
        authenticated_user = auth_service.authenticate_user(db_session, email, password)
        
        assert authenticated_user is not None
        assert authenticated_user.id == registered_user.id
        assert authenticated_user.email == email
    
    def test_authenticate_user_wrong_password(self, db_session):
        """Test authentication with incorrect password."""
        email = "test@example.com"
        password = "password123"
        wrong_password = "wrongpassword"
        
        # Register user first
        auth_service.register_user(db_session, email, password)
        
        # Try to authenticate with wrong password
        authenticated_user = auth_service.authenticate_user(db_session, email, wrong_password)
        
        assert authenticated_user is None
    
    def test_authenticate_user_nonexistent_email(self, db_session):
        """Test authentication with non-existent email."""
        email = "nonexistent@example.com"
        password = "password123"
        
        authenticated_user = auth_service.authenticate_user(db_session, email, password)
        
        assert authenticated_user is None


class TestGetUserById:
    """Tests for getting user by ID."""
    
    def test_get_user_by_id_success(self, db_session):
        """Test getting user by ID successfully."""
        email = "test@example.com"
        password = "password123"
        
        # Register user first
        registered_user = auth_service.register_user(db_session, email, password)
        
        # Get user by ID
        user = auth_service.get_user_by_id(db_session, registered_user.id)
        
        assert user is not None
        assert user.id == registered_user.id
        assert user.email == email
    
    def test_get_user_by_id_not_found(self, db_session):
        """Test getting user by non-existent ID."""
        user = auth_service.get_user_by_id(db_session, 99999)
        
        assert user is None
