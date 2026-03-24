from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models.bookmark import Bookmark
from app.models.article import Article
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


@router.get("/")
def get_bookmarks(
    skip: int = 0,
    limit: int = Query(20, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Хэрэглэгчийн хадгалсан мэдээнүүд."""
    query = (
        db.query(Article)
        .join(Bookmark, Bookmark.article_id == Article.id)
        .filter(Bookmark.user_id == user.id)
        .order_by(desc(Bookmark.created_at))
    )
    total = query.count()
    bookmarks = query.offset(skip).limit(limit).all()
    return {"items": bookmarks, "total": total, "skip": skip, "limit": limit}


@router.get("/ids")
def get_bookmark_ids(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Хэрэглэгчийн хадгалсан мэдээний ID-нүүд."""
    ids = (
        db.query(Bookmark.article_id)
        .filter(Bookmark.user_id == user.id)
        .all()
    )
    return [id[0] for id in ids]


@router.post("/{article_id}")
def add_bookmark(article_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Мэдээ хадгалах."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Мэдээ олдсонгүй")

    existing = db.query(Bookmark).filter(
        Bookmark.user_id == user.id, Bookmark.article_id == article_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Аль хэдийн хадгалсан")

    bookmark = Bookmark(user_id=user.id, article_id=article_id)
    db.add(bookmark)
    db.commit()
    return {"message": "Хадгалагдлаа", "article_id": article_id}


@router.delete("/{article_id}")
def remove_bookmark(article_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Хадгалсан мэдээ устгах."""
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == user.id, Bookmark.article_id == article_id
    ).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Хадгалаагүй байна")

    db.delete(bookmark)
    db.commit()
    return {"message": "Устгагдлаа", "article_id": article_id}
