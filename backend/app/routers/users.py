from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.user import User
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])
limiter = Limiter(key_func=get_remote_address)


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserProfile(BaseModel):
    id: int
    username: str
    email: str


@router.post("/register", response_model=AuthResponse)
@limiter.limit("10/minute")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    """Шинэ хэрэглэгч бүртгэх."""
    if len(data.username) < 3:
        raise HTTPException(status_code=400, detail="Нэр хамгийн багадаа 3 тэмдэгт")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн багадаа 6 тэмдэгт")

    existing = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Нэр эсвэл имэйл бүртгэлтэй байна")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"user_id": user.id, "sub": user.username})
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "username": user.username, "email": user.email},
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    """Хэрэглэгч нэвтрэх."""
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Нэвтрэх нэр эсвэл нууц үг буруу")

    token = create_access_token(data={"user_id": user.id, "sub": user.username})
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "username": user.username, "email": user.email},
    )


@router.get("/me")
def get_profile(user: User = Depends(get_current_user)):
    """Хэрэглэгчийн мэдээлэл авах."""
    return {"id": user.id, "username": user.username, "email": user.email}
