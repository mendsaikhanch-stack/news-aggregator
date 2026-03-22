import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import articles, admin, ads, analytics, demo
from app.services.scraper import fetch_all_feeds, fetch_article_content
from app.services.ai_summary import translate_to_mongolian, classify_article
from app.models.article import Article

# Хүснэгтүүд үүсгэх
Base.metadata.create_all(bind=engine)

_fetch_lock = threading.Lock()


def auto_fetch_and_translate():
    """Мэдээ татаж, гарчиг+хураангуйг шууд орчуулах (1 цаг тутам)."""
    if not _fetch_lock.acquire(blocking=False):
        print("[Auto] Already running, skipping...")
        return
    try:
        db = SessionLocal()
        try:
            raw_articles = fetch_all_feeds()
            new_count = 0
            mn_sources = {"iKon.mn", "GoGo.mn", "News.mn", "Eagle News", "MNB", "TV9 Mongolia"}

            for data in raw_articles:
                try:
                    existing = db.query(Article).filter(Article.url == data["url"]).first()
                    if existing:
                        continue

                    summary_raw = data.get("summary", "")
                    is_mn = data["source"] in mn_sources
                    lang = "mn" if is_mn else "en"
                    category = classify_article(data["title"], summary_raw)

                    # Монгол бол шууд, англи бол гарчиг+хураангуй орчуулах
                    if is_mn:
                        title_mn = data["title"]
                        summary_mn = summary_raw
                    else:
                        title_mn = translate_to_mongolian(data["title"]) or data["title"]
                        summary_mn = translate_to_mongolian(summary_raw) or summary_raw if summary_raw else ""

                    article = Article(
                        title=title_mn,
                        url=data["url"],
                        source=data["source"],
                        summary=summary_mn,
                        ai_summary=summary_mn,
                        image_url=data.get("image_url"),
                        category=category,
                        lang=lang,
                        region=data.get("region", ""),
                        is_video=1 if data.get("is_video") else 0,
                        published_at=data.get("published_at"),
                    )
                    db.add(article)
                    new_count += 1

                    # 50 мэдээ тутам commit (алдаанаас хамгаалах)
                    if new_count % 50 == 0:
                        db.commit()
                        print(f"[Auto] {new_count} articles saved so far...")

                except Exception as e:
                    db.rollback()
                    print(f"[Auto] Article error ({data.get('source', '?')}): {e}")
                    continue

            db.commit()
            print(f"[Auto] {new_count} new articles added + translated")
        except Exception as e:
            print(f"[Auto] Error: {e}")
        finally:
            db.close()
    finally:
        _fetch_lock.release()


# Scheduler тохиргоо — 1 цаг тутам fetch + орчуулга
scheduler = BackgroundScheduler()
scheduler.add_job(auto_fetch_and_translate, "interval", hours=1, id="auto_fetch_translate",
                  max_instances=1, replace_existing=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    print("[Scheduler] Auto-fetch every 30 minutes")
    yield
    scheduler.shutdown()


# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title=settings.PROJECT_NAME, docs_url=None, redoc_url=None, lifespan=lifespan)
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
    allow_methods=["GET", "POST", "DELETE", "PUT"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(articles.router)
app.include_router(admin.router)
app.include_router(ads.router)
app.include_router(analytics.router)
app.include_router(demo.router)


@app.get("/")
@limiter.limit("30/minute")
def root(request: Request):
    return {"message": "News Aggregator API ажиллаж байна!"}
