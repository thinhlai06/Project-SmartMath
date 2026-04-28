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
    AUTH_COOKIE_NAME: str = "access_token"
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_DOMAIN: str | None = None
    
    # Ollama AI Configuration
    OLLAMA_API_BASE: str = "http://localhost:11434/api"
    OLLAMA_TEXT_MODEL: str = "qwen2.5:3b"
    OLLAMA_TIMEOUT: int = 300
    OLLAMA_KEEP_ALIVE: str = "30m"

    # Ollama Cloud OCR Configuration
    OLLAMA_CLOUD_API_BASE: str = "https://ollama.com/api"
    OLLAMA_CLOUD_API_KEY: str = ""
    OLLAMA_CLOUD_VISION_MODEL: str = "gemma4:31b"
    OLLAMA_CLOUD_TIMEOUT: int = 180

    # AI generation controls (single mode: new pipeline only)
    AI_GEN_ENABLE_TEMPLATE_FILTER: bool = True
    AI_GEN_ENABLE_DIFFICULTY_VALIDATOR: bool = True
    AI_GEN_MAX_REPAIR_ROUNDS: int = 2

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
