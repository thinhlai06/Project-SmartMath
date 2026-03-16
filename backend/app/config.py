from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    APP_NAME: str = "Smart-MathAI API"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key"
    
    # Database
    DATABASE_URL: str = "sqlite:///./smart_mathai.db"
    
    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # LMStudio AI Configuration
    LMSTUDIO_API_BASE: str = "http://localhost:1234/v1"
    LMSTUDIO_TEXT_MODEL: str = "qwen2.5-1.5b-instruct"
    LMSTUDIO_VISION_MODEL: str = "PaddleOCR-VL-1.5-GGUF"
    LMSTUDIO_TIMEOUT: int = 120
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
