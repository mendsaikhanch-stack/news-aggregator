from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.article import Article
from xml.etree.ElementTree import Element, SubElement, tostring
from datetime import datetime, timezone

router = APIRouter(tags=["rss"])
limiter = Limiter(key_func=get_remote_address)


def escape_xml(text: str) -> str:
    if not text:
        return ""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


@router.get("/api/rss")
@limiter.limit("30/minute")
def rss_feed(
    request: Request,
    category: str = Query(None),
    lang: str = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
):
    """RSS feed - мэдээнүүдийг XML форматаар авах."""
    query = db.query(Article)
    if category:
        query = query.filter(Article.category == category)
    if lang:
        query = query.filter(Article.lang == lang)

    articles = query.order_by(desc(Article.published_at)).limit(limit).all()

    rss = Element("rss", version="2.0")
    rss.set("xmlns:atom", "http://www.w3.org/2005/Atom")
    channel = SubElement(rss, "channel")

    SubElement(channel, "title").text = "GEREGNEWS.MN"
    SubElement(channel, "link").text = "https://geregnews.mn"
    SubElement(channel, "description").text = "Дэлхийн мэдээ — Нэг дороос, Монголоор"
    SubElement(channel, "language").text = "mn"
    SubElement(channel, "lastBuildDate").text = datetime.now(timezone.utc).strftime(
        "%a, %d %b %Y %H:%M:%S +0000"
    )

    atom_link = SubElement(channel, "atom:link")
    atom_link.set("href", str(request.url))
    atom_link.set("rel", "self")
    atom_link.set("type", "application/rss+xml")

    for article in articles:
        item = SubElement(channel, "item")
        SubElement(item, "title").text = escape_xml(article.title)
        SubElement(item, "link").text = article.url
        SubElement(item, "guid").text = article.url

        desc_text = article.ai_summary or article.summary or ""
        SubElement(item, "description").text = escape_xml(desc_text)

        if article.source:
            SubElement(item, "source").text = article.source
        if article.category:
            SubElement(item, "category").text = article.category

        if article.published_at:
            SubElement(item, "pubDate").text = article.published_at.strftime(
                "%a, %d %b %Y %H:%M:%S +0000"
            )

        if article.image_url:
            enclosure = SubElement(item, "enclosure")
            enclosure.set("url", article.image_url)
            enclosure.set("type", "image/jpeg")
            enclosure.set("length", "0")

    xml_bytes = b'<?xml version="1.0" encoding="UTF-8"?>\n' + tostring(rss, encoding="unicode").encode("utf-8")
    return Response(content=xml_bytes, media_type="application/rss+xml; charset=utf-8")
