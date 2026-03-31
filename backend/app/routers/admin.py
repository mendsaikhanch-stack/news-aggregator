from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.article import Article
from app.auth import verify_password, create_access_token, get_current_admin
from app.services.ai_summary import get_translator_stats
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])
limiter = Limiter(key_func=get_remote_address)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
def admin_login(request: Request, login_data: LoginRequest):
    """Админ нэвтрэх."""
    if login_data.username != settings.ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Нэвтрэх нэр эсвэл нууц үг буруу")
    if not verify_password(login_data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Нэвтрэх нэр эсвэл нууц үг буруу")

    token = create_access_token(data={"sub": login_data.username})
    return LoginResponse(access_token=token)


@router.get("/stats")
def get_stats(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Мэдээний статистик (админ эрхтэй)."""
    total = db.query(func.count(Article.id)).scalar()
    by_source = db.query(Article.source, func.count(Article.id)).group_by(Article.source).all()
    by_category = db.query(Article.category, func.count(Article.id)).group_by(Article.category).all()
    by_region = db.query(Article.region, func.count(Article.id)).group_by(Article.region).all()
    by_lang = db.query(Article.lang, func.count(Article.id)).group_by(Article.lang).all()

    # Орчуулга/агуулгын бүрхэлт
    translated = db.query(func.count(Article.id)).filter(Article.translated_content.isnot(None)).scalar()
    untranslated = db.query(func.count(Article.id)).filter(
        Article.lang == "en", Article.translated_content.is_(None)
    ).scalar()
    with_image = db.query(func.count(Article.id)).filter(
        Article.image_url.isnot(None), Article.image_url != ""
    ).scalar()

    # Сүүлийн 24 цагт нэмэгдсэн
    day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent = db.query(func.count(Article.id)).filter(Article.created_at >= day_ago).scalar()

    # Хамгийн сүүлийн мэдээний огноо
    latest = db.query(func.max(Article.published_at)).scalar()

    return {
        "total_articles": total,
        "translated": translated,
        "untranslated_en": untranslated,
        "with_image": with_image,
        "added_last_24h": recent,
        "latest_article": str(latest) if latest else None,
        "by_source": {s: c for s, c in by_source},
        "by_category": {s: c for s, c in by_category},
        "by_region": {s: c for s, c in by_region},
        "by_language": {s: c for s, c in by_lang},
        "translator_stats": get_translator_stats(),
    }
