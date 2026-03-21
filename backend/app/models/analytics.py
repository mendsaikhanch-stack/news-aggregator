from sqlalchemy import Column, Integer, String, DateTime, Date
from datetime import datetime, timezone
from app.database import Base


class PageView(Base):
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(500))
    ip = Column(String(100))
    user_agent = Column(String(500))
    device = Column(String(50))  # mobile, desktop, tablet
    country = Column(String(100))
    referrer = Column(String(500))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True)
    views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    mobile_views = Column(Integer, default=0)
    desktop_views = Column(Integer, default=0)
