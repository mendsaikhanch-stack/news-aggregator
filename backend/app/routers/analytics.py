from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
from app.database import get_db
from app.models.analytics import PageView, DailyStat
from app.auth import get_current_admin

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _detect_device(user_agent: str) -> str:
    ua = user_agent.lower()
    if any(m in ua for m in ["iphone", "android", "mobile", "phone"]):
        return "mobile"
    if any(t in ua for t in ["ipad", "tablet"]):
        return "tablet"
    return "desktop"


@router.post("/track")
def track_pageview(request: Request, db: Session = Depends(get_db)):
    """Хуудасны хандалт бүртгэх (frontend-ээс дуудна)."""
    body = {}
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Sync context
            pass
    except:
        pass

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    ua = request.headers.get("user-agent", "")
    referrer = request.headers.get("referer", "")
    path = request.query_params.get("path", "/")

    device = _detect_device(ua)

    # PageView бүртгэх
    pv = PageView(
        path=path,
        ip=ip.split(",")[0].strip(),
        user_agent=ua[:500],
        device=device,
        referrer=referrer[:500],
    )
    db.add(pv)

    # DailyStat шинэчлэх
    today = date.today()
    stat = db.query(DailyStat).filter(DailyStat.date == today).first()
    if not stat:
        stat = DailyStat(date=today, views=0, unique_visitors=0, mobile_views=0, desktop_views=0)
        db.add(stat)
        db.flush()

    stat.views += 1
    if device == "mobile":
        stat.mobile_views += 1
    else:
        stat.desktop_views += 1

    # Unique visitor тоолох (IP-ээр)
    existing_today = db.query(PageView).filter(
        PageView.ip == pv.ip,
        func.date(PageView.created_at) == today,
        PageView.id != pv.id,
    ).first()
    if not existing_today:
        stat.unique_visitors += 1

    db.commit()
    return {"ok": True}


@router.get("/dashboard")
def get_dashboard(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Хандалтын dashboard мэдээлэл (админ)."""
    today = date.today()

    # Өнөөдрийн статистик
    today_stat = db.query(DailyStat).filter(DailyStat.date == today).first()

    # Сүүлийн 30 хоногийн статистик
    thirty_days_ago = today - timedelta(days=30)
    daily_stats = db.query(DailyStat).filter(
        DailyStat.date >= thirty_days_ago
    ).order_by(DailyStat.date).all()

    # Нийт тоо
    total_views = db.query(func.count(PageView.id)).scalar()
    total_unique = db.query(func.count(func.distinct(PageView.ip))).scalar()

    # Төхөөрөмжийн хуваарилалт
    device_stats = db.query(
        PageView.device, func.count(PageView.id)
    ).group_by(PageView.device).all()

    # Хамгийн их хандалттай хуудсууд
    top_pages = db.query(
        PageView.path, func.count(PageView.id).label("count")
    ).group_by(PageView.path).order_by(desc("count")).limit(10).all()

    # Сүүлийн 24 цагийн хандалт (цагаар)
    hourly = db.query(
        func.strftime("%H", PageView.created_at).label("hour"),
        func.count(PageView.id).label("count"),
    ).filter(
        PageView.created_at >= func.datetime("now", "-24 hours")
    ).group_by("hour").all()

    return {
        "today": {
            "views": today_stat.views if today_stat else 0,
            "unique_visitors": today_stat.unique_visitors if today_stat else 0,
            "mobile": today_stat.mobile_views if today_stat else 0,
            "desktop": today_stat.desktop_views if today_stat else 0,
        },
        "totals": {
            "all_time_views": total_views,
            "all_time_unique": total_unique,
        },
        "daily": [
            {
                "date": str(s.date),
                "views": s.views,
                "unique": s.unique_visitors,
                "mobile": s.mobile_views,
                "desktop": s.desktop_views,
            }
            for s in daily_stats
        ],
        "devices": {d: c for d, c in device_stats},
        "top_pages": [{"path": p, "views": c} for p, c in top_pages],
        "hourly": {h: c for h, c in hourly},
    }
