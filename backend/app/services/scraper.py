import feedparser
from datetime import datetime
from app.models.article import Article

# MVP: Зөвхөн RSS feed-ээс мэдээ татах
DEFAULT_FEEDS = [
    {"url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "source": "NY Times"},
    {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "source": "BBC News"},
    {"url": "https://www.theguardian.com/world/rss", "source": "The Guardian"},
]


def parse_feed(feed_url: str, source: str) -> list[dict]:
    """RSS feed-ээс мэдээнүүдийг задлах."""
    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:10]:  # Нэг feed-ээс 10 мэдээ
        published = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])

        image_url = None
        if hasattr(entry, "media_content") and entry.media_content:
            image_url = entry.media_content[0].get("url")
        elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            image_url = entry.media_thumbnail[0].get("url")

        articles.append({
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "source": source,
            "summary": entry.get("summary", ""),
            "image_url": image_url,
            "published_at": published,
        })

    return articles


def fetch_all_feeds() -> list[dict]:
    """Бүх RSS feed-үүдээс мэдээ цуглуулах."""
    all_articles = []
    for feed in DEFAULT_FEEDS:
        try:
            articles = parse_feed(feed["url"], feed["source"])
            all_articles.extend(articles)
        except Exception as e:
            print(f"Feed алдаа ({feed['source']}): {e}")
    return all_articles
