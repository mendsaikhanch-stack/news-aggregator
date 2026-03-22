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
    is_video: int = Query(None),
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
    if is_video is not None:
        query = query.filter(Article.is_video == is_video)

    articles = query.order_by(desc(Article.published_at)).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}")
def get_article(article_id: int, db: Session = Depends(get_db)):
    """Нэг мэдээний дэлгэрэнгүй авах."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Мэдээ олдсонгүй")
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
