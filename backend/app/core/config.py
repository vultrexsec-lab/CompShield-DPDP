from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "CompShield DPDP API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "compshield-dev-secret-change-in-production-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Default SQLite; override with PostgreSQL on Render
    DATABASE_URL: str = "sqlite:///./compshield.db"

    CORS_ORIGINS: str = "http://localhost:3000,https://compshield-dpdp.vercel.app"

    SEED_DEMO_USER: bool = True

    @property
    def database_url(self) -> str:
        """Normalized DB URL — never empty; fix postgres:// → postgresql://"""
        url = (self.DATABASE_URL or "").strip()
        if not url:
            return "sqlite:///./compshield.db"
        # Render sometimes gives postgres:// which SQLAlchemy 2 rejects
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
