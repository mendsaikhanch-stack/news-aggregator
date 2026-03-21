import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "GeregNews API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./news.db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-use-random-key")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "")
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3002", "http://localhost:3001", "https://*.ngrok-free.dev"]


settings = Settings()
