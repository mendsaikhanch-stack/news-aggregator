import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "News Aggregator API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./news.db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    CORS_ORIGINS: list = ["http://localhost:3000"]


settings = Settings()
