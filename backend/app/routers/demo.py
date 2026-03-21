from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, distinct
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.article import Article

router = APIRouter(prefix="/api/demo", tags=["demo"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/stats")
@limiter.limit("30/minute")
def get_public_stats(request: Request, db: Session = Depends(get_db)):
    """Демо хуудсанд зориулсан нийтийн статистик."""
    total = db.query(func.count(Article.id)).scalar()
    translated = db.query(func.count(Article.id)).filter(Article.translated_content.isnot(None)).scalar()
    sources = db.query(func.count(distinct(Article.source))).scalar()
    categories = db.query(func.count(distinct(Article.category))).filter(Article.category.isnot(None)).scalar()
    by_lang = dict(db.query(Article.lang, func.count(Article.id)).group_by(Article.lang).all())
    by_region = dict(db.query(Article.region, func.count(Article.id)).group_by(Article.region).filter(Article.region != "").all())
    latest = db.query(Article.created_at).order_by(desc(Article.created_at)).first()

    return {
        "total_articles": total,
        "translated_articles": translated,
        "total_sources": sources,
        "total_categories": categories,
        "by_language": by_lang,
        "by_region": by_region,
        "last_updated": latest[0].isoformat() if latest else None,
    }


@router.get("/sample-translation")
@limiter.limit("30/minute")
def get_sample_translation(request: Request, db: Session = Depends(get_db)):
    """Before/After орчуулгын жишээ - демо хуудсанд."""
    samples = (
        db.query(Article)
        .filter(
            Article.lang == "en",
            Article.full_content.isnot(None),
            Article.translated_content.isnot(None),
        )
        .order_by(desc(Article.published_at))
        .limit(3)
        .all()
    )
    return [
        {
            "source": a.source,
            "title_mn": a.title,
            "content_en": (a.full_content or "")[:500],
            "content_mn": (a.translated_content or "")[:500],
            "category": a.category,
            "image_url": a.image_url,
        }
        for a in samples
    ]
