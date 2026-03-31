import feedparser
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from app.models.article import Article

# RSS feed-үүд
RSS_FEEDS = [
    # --- Америк ---
    {"url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "source": "NY Times", "lang": "en", "region": "america"},
    {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "source": "BBC News", "lang": "en", "region": "europe"},
    {"url": "https://www.theguardian.com/world/rss", "source": "The Guardian", "lang": "en", "region": "europe"},

    # --- Ази ---
    {"url": "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml", "source": "CNA", "lang": "en", "region": "asia"},
    {"url": "https://www.aljazeera.com/xml/rss/all.xml", "source": "Al Jazeera", "lang": "en", "region": "asia"},
    {"url": "https://www.scmp.com/rss/91/feed", "source": "SCMP", "lang": "en", "region": "asia"},
    {"url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", "source": "Times of India", "lang": "en", "region": "asia"},
    {"url": "https://en.yna.co.kr/RSS/news.xml", "source": "Yonhap", "lang": "en", "region": "asia"},
    {"url": "https://japantoday.com/feed", "source": "Japan Today", "lang": "en", "region": "asia"},
    {"url": "https://www.japantimes.co.jp/feed/", "source": "Japan Times", "lang": "en", "region": "asia"},
    {"url": "https://www.chinadaily.com.cn/rss/world_rss.xml", "source": "China Daily", "lang": "en", "region": "asia"},
    {"url": "https://www.globaltimes.cn/rss/outbrain.xml", "source": "Global Times", "lang": "en", "region": "asia"},
    {"url": "https://www.koreatimes.co.kr/www/rss/world.xml", "source": "Korea Times", "lang": "en", "region": "asia"},
    {"url": "https://www.bangkokpost.com/rss/data/topstories.xml", "source": "Bangkok Post", "lang": "en", "region": "asia"},

    # --- Европ ---
    {"url": "https://rss.dw.com/rdf/rss-en-all", "source": "DW", "lang": "en", "region": "europe"},
    {"url": "https://www.france24.com/en/rss", "source": "France 24", "lang": "en", "region": "europe"},
    {"url": "https://www.euronews.com/rss", "source": "Euronews", "lang": "en", "region": "europe"},
    {"url": "https://feeds.thelocal.com/rss/se", "source": "The Local", "lang": "en", "region": "europe"},
    {"url": "https://www.rte.ie/news/rss/news-headlines.xml", "source": "RTE", "lang": "en", "region": "europe"},
    {"url": "https://tass.com/rss/v2.xml", "source": "TASS", "lang": "en", "region": "europe"},
    {"url": "https://feeds.elpais.com/mrss-s/pages/ep/site/english.elpais.com/portada", "source": "El Pais", "lang": "en", "region": "europe"},
    {"url": "https://www.thelocal.es/feed/", "source": "The Local ES", "lang": "en", "region": "europe"},
    {"url": "https://www.turkishminute.com/feed/", "source": "Turkish Minute", "lang": "en", "region": "europe"},

    # --- Ойрхи Дорнод ---
    {"url": "https://www.arabnews.com/rss.xml", "source": "Arab News", "lang": "en", "region": "middleeast"},

    # --- Латин Америк ---
    {"url": "https://www.batimes.com.ar/feed", "source": "Buenos Aires Times", "lang": "en", "region": "america"},

    # --- Google News (Top Stories) ---
    {"url": "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", "source": "Google News", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", "source": "Google Tech", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", "source": "Google Business", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREp0Y0RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", "source": "Google Sports", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", "source": "Google Science", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en", "source": "Google Health", "lang": "en", "region": "america"},
    {"url": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", "source": "Google Entertainment", "lang": "en", "region": "america"},

    # --- Монгол ---
    # --- Монгол ---
    {"url": "https://ikon.mn/rss", "source": "iKon.mn", "lang": "mn", "region": "mongolia"},
]

# Web scraping хийх Монгол сайтууд
MN_SCRAPE_SITES = [
    {
        "url": "https://gogo.mn",
        "source": "GoGo.mn",
        "link_prefix": "https://gogo.mn",
        "min_title_len": 15,
    },
    {
        "url": "https://news.mn",
        "source": "News.mn",
        "link_prefix": "",
        "min_title_len": 15,
    },
    {
        "url": "https://montsame.mn",
        "source": "Montsame",
        "link_prefix": "https://montsame.mn",
        "min_title_len": 20,
    },
    {
        "url": "https://www.24tsag.mn",
        "source": "24tsag.mn",
        "link_prefix": "https://www.24tsag.mn",
        "min_title_len": 15,
    },
    {
        "url": "https://shuud.mn",
        "source": "Shuud.mn",
        "link_prefix": "https://shuud.mn",
        "min_title_len": 15,
    },
]

# YouTube ТВ сувгууд
YOUTUBE_CHANNELS = [
    {"channel_id": "UCfy5XACuOkUOqEG4puHPRIw", "source": "Eagle News"},
    {"channel_id": "UCwtT_d7LZ8BJpiDXHV5RaAw", "source": "MNB"},
    {"channel_id": "UC6_E6ybGvlfFq8t9Jp-V6lA", "source": "TV9 Mongolia"},
]


def parse_feed(feed_url: str, source: str, region: str = "") -> list[dict]:
    """RSS feed-ээс мэдээнүүдийг задлах."""
    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:10]:
        published = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published = datetime(*entry.published_parsed[:6])

        # HTML tag-ийг цэвэрлэх
        summary_raw = entry.get("summary", "")

        image_url = None
        if hasattr(entry, "media_content") and entry.media_content:
            image_url = entry.media_content[0].get("url")
        elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            image_url = entry.media_thumbnail[0].get("url")
        # HTML summary дотроос зураг хайх (Google News гэх мэт)
        if not image_url and summary_raw:
            img_soup = BeautifulSoup(summary_raw, "html.parser")
            img_tag = img_soup.find("img")
            if img_tag and img_tag.get("src"):
                image_url = img_tag["src"]
        # enclosure-с зураг авах
        if not image_url and hasattr(entry, "enclosures") and entry.enclosures:
            for enc in entry.enclosures:
                if enc.get("type", "").startswith("image"):
                    image_url = enc.get("href") or enc.get("url")
                    break
        summary_clean = BeautifulSoup(summary_raw, "html.parser").get_text(strip=True)

        articles.append({
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "source": source,
            "summary": summary_clean[:500],
            "image_url": image_url,
            "published_at": published,
            "region": region,
        })

    return articles


def scrape_mongolian_site(site_config: dict) -> list[dict]:
    """Монгол мэдээний сайтаас web scraping хийх (универсал)."""
    articles = []
    try:
        resp = httpx.get(site_config["url"], timeout=15, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        soup = BeautifulSoup(resp.text, "html.parser")
        prefix = site_config.get("link_prefix", "")
        min_len = site_config.get("min_title_len", 15)
        seen_urls = set()

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            title = a_tag.get_text(strip=True)

            # Шүүлт
            if not title or len(title) < min_len or len(title) > 300:
                continue
            if href == "#" or "javascript:" in href:
                continue

            # URL бүрдүүлэх
            if href.startswith("/"):
                href = prefix + href
            elif not href.startswith("http"):
                continue

            if href in seen_urls:
                continue
            seen_urls.add(href)

            # Зураг олох
            img = a_tag.find("img")
            image_url = None
            if img:
                image_url = img.get("src") or img.get("data-src")

            articles.append({
                "title": title[:300],
                "url": href,
                "source": site_config["source"],
                "summary": "",
                "image_url": image_url,
                "published_at": datetime.now(),
                "region": "mongolia",
            })

            if len(articles) >= 15:
                break

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
                    "region": "mongolia",
                })

        except Exception as e:
            print(f"YouTube алдаа ({channel['source']}): {e}")

    return articles


def fetch_article_content(url: str) -> str | None:
    """Мэдээний бүтэн агуулгыг татаж авах."""
    try:
        resp = httpx.get(url, timeout=15, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        # Шаардлагагүй элементүүдийг устгах
        for tag in soup.find_all(["script", "style", "nav", "footer", "header", "aside", "iframe", "form", "noscript"]):
            tag.decompose()

        # Мэдээний агуулгыг олох (нийтлэг selector-ууд)
        content = None
        selectors = [
            "article", "[itemprop='articleBody']", ".article-body",
            ".post-content", ".entry-content", ".story-body",
            ".article-content", ".content-body", "main",
        ]
        for sel in selectors:
            el = soup.select_one(sel)
            if el:
                # Зөвхөн <p> tag-уудын текстийг авах
                paragraphs = el.find_all("p")
                if paragraphs:
                    content = "\n\n".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20)
                    break

        if not content:
            # Fallback: бүх <p> tag-уудыг авах
            paragraphs = soup.find_all("p")
            texts = [p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30]
            if texts:
                content = "\n\n".join(texts[:20])

        if content and len(content) > 100:
            return content[:10000]
        return None

    except Exception as e:
        print(f"Content татах алдаа ({url}): {e}")
        return None


def fetch_all_feeds() -> list[dict]:
    """Бүх эх сурвалжаас мэдээ цуглуулах. Алдаа бүрийг лог хийж, үргэлжлүүлнэ."""
    all_articles = []
    success_sources = []
    failed_sources = []

    # RSS feeds
    for feed in RSS_FEEDS:
        try:
            articles = parse_feed(feed["url"], feed["source"], feed.get("region", ""))
            all_articles.extend(articles)
            if articles:
                success_sources.append(f"{feed['source']}({len(articles)})")
        except Exception as e:
            failed_sources.append(feed["source"])
            print(f"[RSS FAIL] {feed['source']}: {e}")

    # Монгол сайтуудаас scraping (retry 1 удаа)
    for site in MN_SCRAPE_SITES:
        try:
            articles = scrape_mongolian_site(site)
            if not articles:
                # Retry 1 удаа
                import time
                time.sleep(2)
                articles = scrape_mongolian_site(site)
            all_articles.extend(articles)
            if articles:
                success_sources.append(f"{site['source']}({len(articles)})")
            else:
                failed_sources.append(site["source"])
                print(f"[MN SCRAPE FAIL] {site['source']}: 0 articles after retry")
        except Exception as e:
            failed_sources.append(site["source"])
            print(f"[MN SCRAPE FAIL] {site['source']}: {e}")

    # YouTube ТВ бичлэгүүд
    try:
        videos = fetch_youtube_videos()
        all_articles.extend(videos)
        if videos:
            success_sources.append(f"YouTube({len(videos)})")
        else:
            failed_sources.append("YouTube")
    except Exception as e:
        failed_sources.append("YouTube")
        print(f"[YT FAIL] {e}")

    print(f"[Fetch] OK: {len(success_sources)} sources, {len(all_articles)} articles")
    if failed_sources:
        print(f"[Fetch] FAILED: {', '.join(failed_sources)}")

    return all_articles
