import logging
import threading
from threading import Thread
from contextlib import asynccontextmanager

logger = logging.getLogger("geregnews")
logging.basicConfig(level=logging.INFO, format="%(message)s")
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
    """Мэдээ татаж, гарчиг+хураангуйг шууд орчуулах (1 цаг тутам).

    Алгоритм:
    1. Бүх эх сурвалжаас мэдээ татах
    2. URL давхардал шалгаж, шинэ мэдээг хадгалах
    3. Англи мэдээг орчуулах оролдлого (амжилтгүй бол англиар хадгалаад batch-д үлдээх)
    4. Мэдээ тус бүрийг нэг нэгээр commit хийх (нэг алдаа бүгдэд нөлөөлөхгүй)
    """
    if not _fetch_lock.acquire(blocking=False):
        logger.info("[Auto] Already running, skipping...")
        return
    try:
        db = SessionLocal()
        try:
            raw_articles = fetch_all_feeds()
            new_count = 0
            skip_count = 0
            error_count = 0
            mn_sources = {"iKon.mn", "GoGo.mn", "News.mn", "Montsame", "24tsag.mn", "Shuud.mn", "Eagle News", "MNB", "TV9 Mongolia"}

            # URL давхардал хурдан шалгах
            existing_urls = set(
                row[0] for row in db.query(Article.url).filter(
                    Article.url.in_([d["url"] for d in raw_articles])
                ).all()
            )

            for data in raw_articles:
                if data["url"] in existing_urls:
                    skip_count += 1
                    continue

                try:
                    summary_raw = data.get("summary", "")
                    is_mn = data["source"] in mn_sources
                    lang = "mn" if is_mn else "en"
                    category = classify_article(data["title"], summary_raw)

                    # Монгол бол шууд хадгалах
                    if is_mn:
                        title_mn = data["title"]
                        summary_mn = summary_raw
                        ai_summary_mn = summary_raw
                    else:
                        # Орчуулга оролдох, амжилтгүй бол англиар хадгалах
                        try:
                            structured = translate_article_structured(data["title"], summary_raw)
                        except Exception:
                            structured = None

                        if structured:
                            title_mn = structured.get("TITLE", data["title"])
                            summary_mn = structured.get("SUMMARY", "")
                            parts = []
                            if structured.get("FULL_TEXT"):
                                parts.append(structured["FULL_TEXT"])
                            if structured.get("KEY_POINTS"):
                                parts.append("\n\nГол санаанууд:\n" + structured["KEY_POINTS"])
                            if structured.get("MONGOLIA_IMPACT"):
                                parts.append("\n\nМонголд үзүүлэх нөлөө:\n" + structured["MONGOLIA_IMPACT"])
                            ai_summary_mn = "\n".join(parts) if parts else summary_mn
                        else:
                            # Англиар хадгалаад batch translate-д үлдээнэ
                            title_mn = data["title"]
                            summary_mn = summary_raw
                            ai_summary_mn = summary_raw

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
                    db.commit()
                    existing_urls.add(data["url"])
                    new_count += 1

                except Exception as e:
                    db.rollback()
                    error_count += 1
                    if error_count <= 5:
                        logger.info(f"[Auto] Error ({data.get('source', '?')}): {e}")
                    continue

            logger.info(f"[Auto] Done: +{new_count} new, {skip_count} skipped, {error_count} errors")

            # Push notification
            if new_count > 0:
                try:
                    from app.routers.push import send_push_notifications
                    send_push_notifications(
                        db,
                        title="GeregNews",
                        body=f"{new_count} shine medee nemegdlee!",
                        url="/",
                    )
                except Exception:
                    pass
        except Exception as e:
            logger.info(f"[Auto] Fatal: {e}")
        finally:
            db.close()
    finally:
        _fetch_lock.release()


def batch_translate_articles():
    """Орчуулга байхгүй англи мэдээнүүдийг бүтэн агуулгаар орчуулах (30 мин тутам)."""
    if not _fetch_lock.acquire(blocking=False):
        logger.info("[Batch] Already running, skipping...")
        return
    try:
        import time
        db = SessionLocal()
        try:
            # Орчуулга байхгүй англи мэдээг авах
            articles = (
                db.query(Article)
                .filter(Article.lang == "en", Article.translated_content.is_(None))
                .order_by(Article.id.desc())
                .limit(50)
                .all()
            )

            if not articles:
                logger.info("[Batch] No articles to translate")
                return

            logger.info(f"[Batch] Translating {len(articles)} articles...")
            translated_count = 0
            fail_count = 0

            for article in articles:
                try:
                    content = fetch_article_content(article.url)
                    if not content:
                        # Content татах амжилтгүй — хоосон орчуулга тэмдэглэх
                        article.translated_content = ""
                        db.commit()
                        continue

                    structured = translate_article_structured(article.title, content[:3000])
                    if structured:
                        parts = []
                        if structured.get("FULL_TEXT"):
                            parts.append(structured["FULL_TEXT"])
                        if structured.get("KEY_POINTS"):
                            parts.append("\n\nГол санаанууд:\n" + structured["KEY_POINTS"])
                        if structured.get("MONGOLIA_IMPACT"):
                            parts.append("\n\nМонголд үзүүлэх нөлөө:\n" + structured["MONGOLIA_IMPACT"])
                        article.translated_content = "\n".join(parts) if parts else content[:3000]
                        article.title = structured.get("TITLE", article.title)
                        article.ai_summary = structured.get("SUMMARY", article.ai_summary)
                    else:
                        # Fallback: энгийн орчуулга
                        translated = translate_to_mongolian(content[:3000])
                        if translated:
                            article.translated_content = translated
                        else:
                            article.translated_content = ""

                    db.commit()
                    translated_count += 1
                    time.sleep(1)

                except Exception as e:
                    db.rollback()
                    fail_count += 1
                    if fail_count <= 3:
                        logger.info(f"[Batch] Error: {e}")
                    continue

            logger.info(f"[Batch] Done: {translated_count} translated, {fail_count} failed")

        except Exception as e:
            logger.info(f"[Batch] Fatal: {e}")
        finally:
            db.close()
    finally:
        _fetch_lock.release()


# Scheduler тохиргоо
scheduler = BackgroundScheduler()
scheduler.add_job(auto_fetch_and_translate, "interval", hours=1, id="auto_fetch_translate",
                  max_instances=1, replace_existing=True)
scheduler.add_job(batch_translate_articles, "interval", minutes=30, id="batch_translate",
                  max_instances=1, replace_existing=True)

_startup_done = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _startup_done
    scheduler.start()
    logger.info("[Scheduler] Auto-fetch every 1 hour, batch translate every 30 min")

    # Startup дээр шууд fetch эхлүүлэх (background thread-ээр)
    if not _startup_done:
        _startup_done = True
        logger.info("[Startup] Fetching articles on startup...")
        Thread(target=_safe_startup_fetch, daemon=True).start()

    yield
    scheduler.shutdown()


def _safe_startup_fetch():
    """Startup дээр алдаа гарсан ч сервер унахгүйгээр fetch хийх."""
    import time
    time.sleep(5)  # DB бэлэн болтол хүлээх
    try:
        auto_fetch_and_translate()
    except Exception as e:
        logger.info(f"[Startup] Fetch error (will retry on schedule): {e}")
    # Орчуулаагүй мэдээг мөн шууд орчуулах
    try:
        time.sleep(10)
        batch_translate_articles()
    except Exception as e:
        logger.info(f"[Startup] Batch translate error: {e}")


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
