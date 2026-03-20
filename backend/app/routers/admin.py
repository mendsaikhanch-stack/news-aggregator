from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.article import Article
from app.auth import verify_password, create_access_token, get_current_admin
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
def admin_login(request: LoginRequest):
    """Админ нэвтрэх."""
    if request.username != settings.ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Нэвтрэх нэр эсвэл нууц үг буруу")
    if not verify_password(request.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Нэвтрэх нэр эсвэл нууц үг буруу")

    token = create_access_token(data={"sub": request.username})
    return LoginResponse(access_token=token)


@router.get("/stats")
def get_stats(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Мэдээний статистик (админ эрхтэй)."""
    total = db.query(func.count(Article.id)).scalar()
    by_source = db.query(Article.source, func.count(Article.id)).group_by(Article.source).all()
    by_category = db.query(Article.category, func.count(Article.id)).group_by(Article.category).all()
    by_region = db.query(Article.region, func.count(Article.id)).group_by(Article.region).all()
    by_lang = db.query(Article.lang, func.count(Article.id)).group_by(Article.lang).all()

    return {
        "total_articles": total,
        "by_source": {s: c for s, c in by_source},
        "by_category": {s: c for s, c in by_category},
        "by_region": {s: c for s, c in by_region},
        "by_language": {s: c for s, c in by_lang},
    }
