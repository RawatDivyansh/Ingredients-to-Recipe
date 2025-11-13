"""
Groq API service for recipe generation.
Handles API client setup, rate limiting, and error handling.
"""
import os
import time
from typing import Optional
from groq import Groq
from groq.types.chat import ChatCompletion
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Simple rate limiter to stay within Groq API free tier limits.
    Free tier: 30 requests/minute, 14,400 requests/day
    """
    
    def __init__(self, max_requests_per_minute: int = 30):
        self.max_requests = max_requests_per_minute
        self.requests = []
        self.window_seconds = 60
    
    def wait_if_needed(self):
        """
        Wait if necessary to stay within rate limits.
        """
        now = time.time()
        
        # Remove requests older than the time window
        self.requests = [req_time for req_time in self.requests 
                        if now - req_time < self.window_seconds]
        
        # If we've hit the limit, wait until the oldest request expires
        if len(self.requests) >= self.max_requests:
            oldest_request = min(self.requests)
            wait_time = self.window_seconds - (now - oldest_request)
            if wait_time > 0:
                logger.info(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
                # Clean up again after waiting
                now = time.time()
                self.requests = [req_time for req_time in self.requests 
                               if now - req_time < self.window_seconds]
        
        # Record this request
        self.requests.append(now)


class GroqService:
    """
    Service for interacting with Groq API.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Groq service with API key and rate limiter.
        
        Args:
            api_key: Groq API key. If not provided, reads from GROQ_API_KEY env variable.
        
        Raises:
            ValueError: If API key is not provided and not found in environment.
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Groq API key not found. Please set GROQ_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        self.client = Groq(api_key=self.api_key)
        self.rate_limiter = RateLimiter(max_requests_per_minute=30)
        self.model = "llama-3.3-70b-versatile"
    
    def generate_completion(
        self,
        prompt: str,
        system_message: str = "You are a professional chef assistant.",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        max_retries: int = 3
    ) -> Optional[ChatCompletion]:
        """
        Generate a completion from Groq API with rate limiting and retry logic.
        
        Args:
            prompt: User prompt for recipe generation
            system_message: System message to set context
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            max_retries: Maximum number of retry attempts for transient failures
        
        Returns:
            ChatCompletion object if successful, None otherwise
        
        Raises:
            Exception: If all retry attempts fail
        """
        last_error = None
        
        for attempt in range(max_retries):
            try:
                # Apply rate limiting
                self.rate_limiter.wait_if_needed()
                
                # Make API call
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": system_message
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"}
                )
                
                logger.info(f"Successfully generated completion on attempt {attempt + 1}")
                return response
                
            except Exception as e:
                last_error = e
                logger.warning(
                    f"Groq API call failed on attempt {attempt + 1}/{max_retries}: {str(e)}"
                )
                
                # Wait before retrying (exponential backoff)
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
        
        # All retries failed
        logger.error(f"All {max_retries} attempts failed. Last error: {str(last_error)}")
        raise Exception(f"Failed to generate completion after {max_retries} attempts: {str(last_error)}")


# Global instance for reuse
_groq_service_instance: Optional[GroqService] = None


def get_groq_service() -> GroqService:
    """
    Get or create a singleton GroqService instance.
    
    Returns:
        GroqService instance
    """
    global _groq_service_instance
    
    if _groq_service_instance is None:
        _groq_service_instance = GroqService()
    
    return _groq_service_instance
