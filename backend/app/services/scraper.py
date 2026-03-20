import feedparser
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from app.models.article import Article

# RSS feed-үүд
RSS_FEEDS = [
    # Гадаад
    {"url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "source": "NY Times", "lang": "en"},
    {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "source": "BBC News", "lang": "en"},
    {"url": "https://www.theguardian.com/world/rss", "source": "The Guardian", "lang": "en"},
    # Монгол
    {"url": "https://ikon.mn/rss", "source": "iKon.mn", "lang": "mn"},
]

# Web scraping хийх Монгол сайтууд
MN_SCRAPE_SITES = [
    {
        "url": "https://gogo.mn/r/1",
        "source": "GoGo.mn",
        "selectors": {
            "articles": "div.article-list a, div.news-list a, a.article-link",
            "title": "h2, h3, .title, span",
            "link_prefix": "https://gogo.mn",
        },
    },
    {
        "url": "https://news.mn",
        "source": "News.mn",
        "selectors": {
            "articles": "div.news-item a, article a, .post-title a",
            "title": "h2, h3, .title, span",
            "link_prefix": "",
        },
    },
]

# YouTube ТВ сувгууд
YOUTUBE_CHANNELS = [
    {"channel_id": "UCfy5XACuOkUOqEG4puHPRIw", "source": "Eagle News"},
    {"channel_id": "UCwtT_d7LZ8BJpiDXHV5RaAw", "source": "MNB"},
    {"channel_id": "UC6_E6ybGvlfFq8t9Jp-V6lA", "source": "TV9 Mongolia"},
]


def parse_feed(feed_url: str, source: str) -> list[dict]:
    """RSS feed-ээс мэдээнүүдийг задлах."""
    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:10]:
        published = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])

        image_url = None
        if hasattr(entry, "media_content") and entry.media_content:
            image_url = entry.media_content[0].get("url")
        elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            image_url = entry.media_thumbnail[0].get("url")

        # HTML tag-ийг цэвэрлэх
        summary_raw = entry.get("summary", "")
        summary_clean = BeautifulSoup(summary_raw, "html.parser").get_text(strip=True)

        articles.append({
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "source": source,
            "summary": summary_clean[:500],
            "image_url": image_url,
            "published_at": published,
        })

    return articles


def scrape_mongolian_site(site_config: dict) -> list[dict]:
    """Монгол мэдээний сайтаас web scraping хийх."""
    articles = []
    try:
        resp = httpx.get(site_config["url"], timeout=15, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        soup = BeautifulSoup(resp.text, "html.parser")
        selectors = site_config["selectors"]

        # Мэдээний линкүүдийг хайх
        links = soup.select(selectors["articles"])
        seen_urls = set()

        for link in links[:15]:
            href = link.get("href", "")
            if not href or href == "#" or href in seen_urls:
                continue

            # URL бүрдүүлэх
            if href.startswith("/"):
                href = selectors["link_prefix"] + href
            elif not href.startswith("http"):
                continue

            seen_urls.add(href)

            # Гарчиг олох
            title_el = link.select_one(selectors["title"])
            title = title_el.get_text(strip=True) if title_el else link.get_text(strip=True)

            if not title or len(title) < 5:
                continue

            articles.append({
                "title": title[:300],
                "url": href,
                "source": site_config["source"],
                "summary": "",
                "image_url": None,
                "published_at": datetime.now(),
            })

    except Exception as e:
        print(f"Scrape алдаа ({site_config['source']}): {e}")

    return articles


def fetch_youtube_videos() -> list[dict]:
    """YouTube ТВ сувгуудаас сүүлийн бичлэгүүдийг татах."""
    articles = []

    for channel in YOUTUBE_CHANNELS:
        try:
            # YouTube RSS feed ашиглах (API key шаардахгүй)
            feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel['channel_id']}"
            feed = feedparser.parse(feed_url)

            for entry in feed.entries[:5]:
                published = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    published = datetime(*entry.published_parsed[:6])

                # YouTube thumbnail
                video_id = entry.get("yt_videoid", "")
                thumbnail = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else None

                articles.append({
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "source": channel["source"],
                    "summary": entry.get("summary", "")[:500],
                    "image_url": thumbnail,
                    "published_at": published,
                    "is_video": True,
                })

        except Exception as e:
            print(f"YouTube алдаа ({channel['source']}): {e}")

    return articles


def fetch_all_feeds() -> list[dict]:
    """Бүх эх сурвалжаас мэдээ цуглуулах."""
    all_articles = []

    # RSS feeds
    for feed in RSS_FEEDS:
        try:
            articles = parse_feed(feed["url"], feed["source"])
            all_articles.extend(articles)
        except Exception as e:
            print(f"Feed алдаа ({feed['source']}): {e}")

    # Монгол сайтуудаас scraping
    for site in MN_SCRAPE_SITES:
        try:
            articles = scrape_mongolian_site(site)
            all_articles.extend(articles)
        except Exception as e:
            print(f"Scrape алдаа ({site['source']}): {e}")

    # YouTube ТВ бичлэгүүд
    try:
        videos = fetch_youtube_videos()
        all_articles.extend(videos)
    except Exception as e:
        print(f"YouTube алдаа: {e}")

    return all_articles
