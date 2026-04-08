from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "traffic-defense-ai"
    APP_ENV: str = "development"
    SECRET_KEY: str
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    REDIS_URL: str
    
    # Qdrant
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION: str = "legal_precedents"
    
    # LLM
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    
    # JWT Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
