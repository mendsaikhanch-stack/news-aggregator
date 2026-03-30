import os
import secrets
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "GeregNews API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./news.db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "")
    VAPID_PUBLIC_KEY: str = os.getenv("VAPID_PUBLIC_KEY", "")
    VAPID_PRIVATE_KEY: str = os.getenv("VAPID_PRIVATE_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    VAPID_EMAIL: str = os.getenv("VAPID_EMAIL", "admin@geregnews.mn")
    CORS_ORIGINS: list = [
        "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
        "http://frontend:3000",
        "https://*.ngrok-free.dev",
        os.getenv("SITE_URL", ""),
    ]


settings = Settings()
