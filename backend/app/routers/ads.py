from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ad import Ad
from app.auth import get_current_admin

router = APIRouter(prefix="/api/ads", tags=["ads"])


class AdCreate(BaseModel):
    title: str
    image_url: str = ""
    link_url: str = ""
    position: str  # header, sidebar, between_articles, footer


class AdUpdate(BaseModel):
    title: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    position: str | None = None
    is_active: int | None = None


@router.get("/")
def get_ads(position: str = None, db: Session = Depends(get_db)):
    """Идэвхтэй зарууд (frontend-д харуулах)."""
    query = db.query(Ad).filter(Ad.is_active == 1)
    if position:
        query = query.filter(Ad.position == position)
    return query.all()


@router.get("/all")
def get_all_ads(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Бүх зарууд (админ)."""
    return db.query(Ad).order_by(Ad.id.desc()).all()


@router.post("/")
def create_ad(ad: AdCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Шинэ зар нэмэх (админ)."""
    new_ad = Ad(
        title=ad.title,
        image_url=ad.image_url,
        link_url=ad.link_url,
        position=ad.position,
    )
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)
    return new_ad


@router.put("/{ad_id}")
def update_ad(ad_id: int, ad: AdUpdate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Зар засах (админ)."""
    existing = db.query(Ad).filter(Ad.id == ad_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Зар олдсонгүй")
    if ad.title is not None:
        existing.title = ad.title
    if ad.image_url is not None:
        existing.image_url = ad.image_url
    if ad.link_url is not None:
        existing.link_url = ad.link_url
    if ad.position is not None:
        existing.position = ad.position
    if ad.is_active is not None:
        existing.is_active = ad.is_active
    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/{ad_id}")
def delete_ad(ad_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Зар устгах (админ)."""
    existing = db.query(Ad).filter(Ad.id == ad_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Зар олдсонгүй")
    db.delete(existing)
    db.commit()
    return {"message": "Зар устгагдлаа"}
