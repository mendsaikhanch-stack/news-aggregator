import re
from deep_translator import GoogleTranslator

# Keyword-д суурилсан ангилал
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


import time

_translator = None
_last_call = 0


def _get_translator():
    global _translator
    if _translator is None:
        _translator = GoogleTranslator(source="en", target="mn")
    return _translator


def _safe_translate(text: str) -> str | None:
    """Rate-limited орчуулга — хүсэлт бүрийн хооронд завсарлага."""
    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < 0.3:
        time.sleep(0.3 - elapsed)
    _last_call = time.time()

    clean = re.sub(r"<[^>]*>", "", text)[:2000]
    return _get_translator().translate(clean)


def translate_to_mongolian(text: str) -> str | None:
    """Google Translate ашиглан текстийг монгол хэл рүү орчуулах."""
    if not text or not text.strip():
        return text

    try:
        return _safe_translate(text)
    except Exception as e:
        print(f"Translate error: {e}")
        return text


def generate_summary(article_text: str) -> str | None:
    """Мэдээний хураангуйг орчуулж гаргах."""
    if not article_text or not article_text.strip():
        return None

    try:
        return _safe_translate(article_text)
    except Exception as e:
        print(f"Summary error: {e}")
        return None
