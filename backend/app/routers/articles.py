from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.article import Article
from app.services.scraper import fetch_all_feeds
from app.services.ai_summary import generate_summary, translate_to_mongolian

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("/")
def get_articles(
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None),
    category: str = Query(None),
    db: Session = Depends(get_db),
):
    """Мэдээнүүдийн жагсаалт авах."""
    query = db.query(Article)

    if search:
        query = query.filter(Article.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(Article.category == category)

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
def clear_articles(db: Session = Depends(get_db)):
    """Бүх мэдээг устгах (дахин монголоор татахад ашиглана)."""
    count = db.query(Article).count()
    db.query(Article).delete()
    db.commit()
    return {"message": f"{count} мэдээ устгагдлаа"}


@router.post("/fetch")
def fetch_articles(db: Session = Depends(get_db)):
    """RSS feed-үүдээс шинэ мэдээ татах."""
    raw_articles = fetch_all_feeds()
    new_count = 0

    for data in raw_articles:
        existing = db.query(Article).filter(Article.url == data["url"]).first()
        if existing:
            continue

        # Гарчиг, агуулгыг монголоор орчуулах
        title_mn = translate_to_mongolian(data["title"]) or data["title"]
        summary_raw = data.get("summary", "")
        summary_mn = translate_to_mongolian(summary_raw) or summary_raw
        ai_summary = generate_summary(summary_raw)

        article = Article(
            title=title_mn,
            url=data["url"],
            source=data["source"],
            summary=summary_mn,
            ai_summary=ai_summary,
            image_url=data.get("image_url"),
            published_at=data.get("published_at"),
        )
        db.add(article)
        new_count += 1

    db.commit()
    return {"message": f"{new_count} шинэ мэдээ нэмэгдлээ"}
