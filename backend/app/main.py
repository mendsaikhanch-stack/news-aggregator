from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine, Base
from app.routers import articles, admin, ads

# Хүснэгтүүд үүсгэх
Base.metadata.create_all(bind=engine)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title=settings.PROJECT_NAME, docs_url=None, redoc_url=None)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Хэт олон хүсэлт. Түр хүлээнэ үү."},
    )


# CORS тохиргоо
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(articles.router)
app.include_router(admin.router)
app.include_router(ads.router)


@app.get("/")
@limiter.limit("30/minute")
def root(request: Request):
    return {"message": "News Aggregator API ажиллаж байна!"}
