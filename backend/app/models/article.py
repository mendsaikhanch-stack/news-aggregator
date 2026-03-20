from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), unique=True, nullable=False)
    source = Column(String(200))
    summary = Column(Text)
    ai_summary = Column(Text)
    image_url = Column(String(1000))
    category = Column(String(100))
    lang = Column(String(10), default="en")
    is_video = Column(Integer, default=0)
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
