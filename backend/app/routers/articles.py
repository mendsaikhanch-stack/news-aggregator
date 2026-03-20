from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.article import Article
from app.services.scraper import fetch_all_feeds
from app.services.ai_summary import generate_summary, translate_to_mongolian, classify_article
from app.auth import get_current_admin

router = APIRouter(prefix="/api/articles", tags=["articles"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit("60/minute")
def get_articles(
    request: Request,
    skip: int = 0,
    limit: int = 20,
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
        return {"error": "Мэдээ олдсонгүй"}
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
    """RSS feed-үүдээс шинэ мэдээ татах."""
    raw_articles = fetch_all_feeds()
    new_count = 0

    for data in raw_articles:
        try:
            existing = db.query(Article).filter(Article.url == data["url"]).first()
            if existing:
                continue

            summary_raw = data.get("summary", "")

            # Монгол эх сурвалжийг орчуулахгүй
            mn_sources = {"iKon.mn", "GoGo.mn", "News.mn", "Eagle News", "MNB", "TV9 Mongolia"}
            is_mn = data["source"] in mn_sources
            lang = "mn" if is_mn else "en"

            if not is_mn:
                title_mn = translate_to_mongolian(data["title"]) or data["title"]
                summary_mn = translate_to_mongolian(summary_raw) or summary_raw
            else:
                title_mn = data["title"]
                summary_mn = summary_raw

            ai_summary = summary_mn
            category = classify_article(data["title"], summary_raw)

            article = Article(
                title=title_mn,
                url=data["url"],
                source=data["source"],
                summary=summary_mn,
                ai_summary=ai_summary,
                image_url=data.get("image_url"),
                category=category,
                lang=lang,
                region=data.get("region", ""),
                is_video=1 if data.get("is_video") else 0,
                published_at=data.get("published_at"),
            )
            db.add(article)
            new_count += 1
        except Exception as e:
            print(f"Article хадгалах алдаа ({data.get('source', '?')}): {e}")
            continue

    db.commit()
    return {"message": f"{new_count} шинэ мэдээ нэмэгдлээ"}
