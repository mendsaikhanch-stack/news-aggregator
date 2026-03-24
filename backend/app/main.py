import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import articles, admin, ads, analytics, demo, users, bookmarks, push, rss
from app.services.scraper import fetch_all_feeds, fetch_article_content
from app.services.ai_summary import translate_to_mongolian, classify_article, translate_article_structured
from app.models.article import Article
from app.models.user import User
from app.models.bookmark import Bookmark
from app.models.push_subscription import PushSubscription

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

                    # Монгол бол шууд, англи бол бүтэцтэй prompt-р орчуулах
                    if is_mn:
                        title_mn = data["title"]
                        summary_mn = summary_raw
                        ai_summary_mn = summary_raw
                    else:
                        # Бүтэцтэй орчуулга оролдох
                        structured = translate_article_structured(data["title"], summary_raw)
                        if structured:
                            title_mn = structured.get("TITLE", data["title"])
                            summary_mn = structured.get("SUMMARY", "")
                            # KEY_POINTS + FULL_TEXT + MONGOLIA_IMPACT-г нэгтгэж ai_summary-д хадгалах
                            parts = []
                            if structured.get("FULL_TEXT"):
                                parts.append(structured["FULL_TEXT"])
                            if structured.get("KEY_POINTS"):
                                parts.append("\n\nГол санаанууд:\n" + structured["KEY_POINTS"])
                            if structured.get("MONGOLIA_IMPACT"):
                                parts.append("\n\nМонголд үзүүлэх нөлөө:\n" + structured["MONGOLIA_IMPACT"])
                            ai_summary_mn = "\n".join(parts) if parts else summary_mn
                        else:
                            # Fallback: хуучин аргаар орчуулах
                            title_mn = translate_to_mongolian(data["title"]) or data["title"]
                            summary_mn = translate_to_mongolian(summary_raw) or summary_raw if summary_raw else ""
                            ai_summary_mn = summary_mn

                    article = Article(
                        title=title_mn,
                        url=data["url"],
                        source=data["source"],
                        summary=summary_mn,
                        ai_summary=ai_summary_mn,
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

            # Push notification илгээх
            if new_count > 0:
                try:
                    from app.routers.push import send_push_notifications
                    send_push_notifications(
                        db,
                        title="GeregNews - Шинэ мэдээ",
                        body=f"{new_count} шинэ мэдээ нэмэгдлээ!",
                        url="/",
                    )
                except Exception as e:
                    print(f"[Push] Notification error: {e}")
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
    print("[Scheduler] Auto-fetch every 1 hour")
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


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
        return response


app.add_middleware(SecurityHeadersMiddleware)


app.include_router(articles.router)
app.include_router(admin.router)
app.include_router(ads.router)
app.include_router(analytics.router)
app.include_router(demo.router)
app.include_router(users.router)
app.include_router(bookmarks.router)
app.include_router(push.router)
app.include_router(rss.router)


@app.get("/")
@limiter.limit("30/minute")
def root(request: Request):
    return {"message": "News Aggregator API ажиллаж байна!"}
