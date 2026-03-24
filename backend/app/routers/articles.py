from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, distinct
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.article import Article
from app.services.scraper import fetch_all_feeds, fetch_article_content
from app.services.ai_summary import generate_summary, translate_to_mongolian, classify_article
from app.auth import get_current_admin

router = APIRouter(prefix="/api/articles", tags=["articles"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/sources")
@limiter.limit("30/minute")
def get_sources(request: Request, db: Session = Depends(get_db)):
    """Бүх эх сурвалжуудын жагсаалт."""
    sources = db.query(distinct(Article.source)).filter(Article.source.isnot(None)).all()
    return sorted([s[0] for s in sources if s[0]])


@router.get("/")
@limiter.limit("60/minute")
def get_articles(
    request: Request,
    skip: int = 0,
    limit: int = Query(20, le=200),
    search: str = Query(None),
    category: str = Query(None),
    lang: str = Query(None),
    region: str = Query(None),
    source: str = Query(None),
    is_video: int = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db),
):
    """Мэдээнүүдийн жагсаалт авах."""
    query = db.query(Article)

    if search:
        query = query.filter(Article.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(Article.category == category)
    if lang:
        query = query.filter(Article.lang == lang)
    if region:
        query = query.filter(Article.region == region)
    if source:
        query = query.filter(Article.source == source)
    if is_video is not None:
        query = query.filter(Article.is_video == is_video)
    if date_from:
        try:
            dt = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Article.published_at >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Article.published_at <= dt)
        except ValueError:
            pass

    articles = query.order_by(desc(Article.published_at)).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}")
def get_article(article_id: int, db: Session = Depends(get_db)):
    """Нэг мэдээний дэлгэрэнгүй авах. Агуулга байхгүй бол on-demand татаж орчуулна."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Мэдээ олдсонгүй")

    # Агуулга байхгүй бол on-demand татаж орчуулах
    if not article.translated_content and article.lang != "mn":
        try:
            from app.services.scraper import fetch_article_content
            from app.services.ai_summary import translate_article_structured, translate_to_mongolian

            full_content = fetch_article_content(article.url)
            if full_content:
                article.full_content = full_content

                structured = translate_article_structured(article.title, full_content[:3000])
                if structured:
                    parts = []
                    if structured.get("FULL_TEXT"):
                        parts.append(structured["FULL_TEXT"])
                    if structured.get("KEY_POINTS"):
                        parts.append("\n\nГол санаанууд:\n" + structured["KEY_POINTS"])
                    if structured.get("MONGOLIA_IMPACT"):
                        parts.append("\n\nМонголд үзүүлэх нөлөө:\n" + structured["MONGOLIA_IMPACT"])
                    article.translated_content = "\n".join(parts) if parts else None
                    # Гарчиг, хураангуйг шинэчлэх
                    if structured.get("TITLE"):
                        article.title = structured["TITLE"]
                    if structured.get("SUMMARY"):
                        article.ai_summary = structured["SUMMARY"]
                else:
                    # Fallback: энгийн орчуулга
                    translated = translate_to_mongolian(full_content[:3000])
                    if translated:
                        article.translated_content = translated

                db.commit()
                db.refresh(article)
        except Exception as e:
            print(f"[On-demand] Error: {e}")

    return article


@router.delete("/clear")
def clear_articles(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Бүх мэдээг устгах (дахин монголоор татахад ашиглана)."""
    count = db.query(Article).count()
    db.query(Article).delete()
    db.commit()
    return {"message": f"{count} мэдээ устгагдлаа"}


@router.post("/fetch")
def fetch_articles(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """RSS feed-үүдээс шинэ мэдээ татаж орчуулах."""
    from app.main import auto_fetch_and_translate
    from threading import Thread
    Thread(target=auto_fetch_and_translate, daemon=True).start()
    return {"message": "Мэдээ татаж + орчуулж эхэллээ (background)"}
