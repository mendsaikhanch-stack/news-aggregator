from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.database import Base


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    image_url = Column(String(1000))
    link_url = Column(String(1000))
    # Байрлал: header, sidebar, between_articles, footer
    position = Column(String(50), nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
