import re
import time
import httpx
from deep_translator import GoogleTranslator
from app.config import settings

# ============================================================
# Орчуулгын Fallback Chain
# 1. Google Translate (free, хурдан, заримдаа block хийдэг)
# 2. MyMemory API (free, өдөрт 5000 үг)
# 3. Lingva Translate (free, Google-ийн proxy)
# 4. Claude AI (Anthropic API key шаардлагатай, чанар хамгийн сайн)
# ============================================================

_last_call = 0
_translator_stats = {"google": 0, "mymemory": 0, "lingva": 0, "claude": 0, "failed": 0}


def _rate_limit():
    """Хүсэлт хоорондын завсарлага."""
    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < 0.3:
        time.sleep(0.3 - elapsed)
    _last_call = time.time()


def _clean_text(text: str, max_len: int = 2000) -> str:
    """HTML tag цэвэрлэх."""
    return re.sub(r"<[^>]*>", "", text)[:max_len].strip()


# --- Орчуулагч 1: Google Translate (free) ---
def _google_translate(text: str) -> str | None:
    _rate_limit()
    result = GoogleTranslator(source="en", target="mn").translate(text)
    if result and result != text:
        _translator_stats["google"] += 1
        return result
    return None


# --- Орчуулагч 2: MyMemory API (free, 5000 үг/өдөр) ---
def _mymemory_translate(text: str) -> str | None:
    _rate_limit()
    resp = httpx.get(
        "https://api.mymemory.translated.net/get",
        params={"q": text[:500], "langpair": "en|mn"},
        timeout=10,
    )
    if resp.status_code == 200:
        data = resp.json()
        translated = data.get("responseData", {}).get("translatedText", "")
        if translated and translated != text and "MYMEMORY" not in translated.upper():
            _translator_stats["mymemory"] += 1
            return translated
    return None


# --- Орчуулагч 3: Lingva Translate (free Google proxy) ---
def _lingva_translate(text: str) -> str | None:
    _rate_limit()
    resp = httpx.get(
        f"https://lingva.ml/api/v1/en/mn/{httpx.QueryParams({'q': text[:1000]})}",
        timeout=10,
    )
    if resp.status_code == 200:
        data = resp.json()
        translated = data.get("translation", "")
        if translated and translated != text:
            _translator_stats["lingva"] += 1
            return translated
    return None


# --- Орчуулагч 4: Claude AI (Anthropic API) ---
def _claude_translate(text: str) -> str | None:
    if not settings.ANTHROPIC_API_KEY:
        return None
    _rate_limit()
    resp = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": f"Translate this English news text to Mongolian. Return ONLY the Mongolian translation, nothing else:\n\n{text[:1500]}",
                }
            ],
        },
        timeout=15,
    )
    if resp.status_code == 200:
        data = resp.json()
        content = data.get("content", [])
        if content:
            translated = content[0].get("text", "").strip()
            if translated:
                _translator_stats["claude"] += 1
                return translated
    return None


# --- Fallback Chain ---
TRANSLATORS = [
    ("google", _google_translate),
    ("mymemory", _mymemory_translate),
    ("claude", _claude_translate),
]


def translate_to_mongolian(text: str) -> str | None:
    """Fallback chain ашиглан текстийг монгол хэл рүү орчуулах."""
    if not text or not text.strip():
        return text

    clean = _clean_text(text)
    if not clean:
        return text

    for name, translator_fn in TRANSLATORS:
        try:
            result = translator_fn(clean)
            if result:
                return result
        except Exception as e:
            print(f"[{name}] орчуулга алдаа: {e}")
            continue

    _translator_stats["failed"] += 1
    return text


def generate_summary(article_text: str) -> str | None:
    """Мэдээний хураангуйг орчуулж гаргах."""
    if not article_text or not article_text.strip():
        return None
    return translate_to_mongolian(article_text)


def get_translator_stats() -> dict:
    """Орчуулагчдын статистик."""
    return dict(_translator_stats)


# ============================================================
# Keyword-д суурилсан ангилал
# ============================================================

CATEGORY_KEYWORDS = {
    "politics": [
        "president", "minister", "parliament", "election", "vote", "government",
        "senate", "congress", "democrat", "republican", "diplomacy", "ambassador",
        "sanctions", "treaty", "legislation", "law", "policy", "campaign",
        "ерөнхийлөгч", "сайд", "засгийн газар", "сонгуу|", "хууль", "улс төр",
        "парламент", "их хурал", "нам", "бодлого",
    ],
    "business": [
        "economy", "market", "stock", "trade", "inflation", "gdp", "bank",
        "investment", "startup", "revenue", "profit", "company", "corporate",
        "bitcoin", "crypto", "finance", "dollar", "yuan", "currency", "tax",
        "эдийн засаг", "зах зээл", "хөрөнгө", "банк", "бизнес", "компани",
        "худалдаа", "татвар", "валют", "арилжаа",
    ],
    "tech": [
        "ai", "artificial intelligence", "software", "google", "apple", "microsoft",
        "robot", "chip", "semiconductor", "cyber", "hack", "data", "algorithm",
        "smartphone", "app", "tesla", "spacex", "satellite", "5g", "quantum",
        "технологи", "програм", "хиймэл оюун", "робот", "чип",
    ],
    "sports": [
        "football", "soccer", "basketball", "tennis", "olympic", "fifa", "nba",
        "champion", "league", "match", "tournament", "athlete", "medal", "goal",
        "cricket", "rugby", "boxing", "racing", "f1", "world cup",
        "спорт", "тэмцээн", "аварга", "тоглолт", "медаль", "хөл бөмбөг",
    ],
    "science": [
        "research", "study", "scientist", "discovery", "space", "nasa", "climate",
        "environment", "species", "fossil", "physics", "chemistry", "biology",
        "earthquake", "volcano", "ocean", "carbon", "emission", "renewable",
        "судалгаа", "шинжлэх ухаан", "сансар", "уур амьсгал", "байгаль орчин",
    ],
    "health": [
        "health", "vaccine", "virus", "disease", "hospital", "doctor", "patient",
        "cancer", "mental health", "who", "pandemic", "epidemic", "medicine",
        "drug", "treatment", "surgery", "outbreak", "covid", "flu",
        "эрүүл мэнд", "вакцин", "өвчин", "эмнэлэг", "эмч", "эм",
    ],
    "entertainment": [
        "movie", "film", "music", "concert", "celebrity", "oscar", "grammy",
        "netflix", "series", "actor", "singer", "album", "festival", "art",
        "fashion", "disney", "hollywood", "bollywood", "game", "gaming",
        "кино", "дуу", "урлаг", "жүжигчин", "тоглоом", "соёл",
    ],
}


def classify_article(title: str, summary: str) -> str:
    """Гарчиг болон хураангуйд суурилан мэдээг ангилах."""
    text = f"{title} {summary}".lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[category] = score
    if scores:
        return max(scores, key=scores.get)
    return "world"
