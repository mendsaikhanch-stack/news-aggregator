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


def _clean_text(text: str, max_len: int = 5000) -> str:
    """HTML tag цэвэрлэх."""
    return re.sub(r"<[^>]*>", "", text)[:max_len].strip()


# --- Орчуулагч 1: Google Translate (free) ---
def _google_translate(text: str) -> str | None:
    _rate_limit()
    # Google Translate нэг удаад ~5000 тэмдэгт хүлээж авдаг
    # Урт текстийг хэсэгчлэн орчуулах
    if len(text) > 4500:
        chunks = _split_text(text, 4500)
        translated_parts = []
        for chunk in chunks:
            _rate_limit()
            result = GoogleTranslator(source="en", target="mn").translate(chunk)
            if result:
                translated_parts.append(result)
            else:
                translated_parts.append(chunk)
        if translated_parts:
            _translator_stats["google"] += 1
            return "\n\n".join(translated_parts)
        return None
    result = GoogleTranslator(source="en", target="mn").translate(text)
    if result and result != text:
        _translator_stats["google"] += 1
        return result
    return None


def _split_text(text: str, max_len: int) -> list[str]:
    """Текстийг paragraph-аар хэсэгчлэх."""
    paragraphs = text.split("\n\n")
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 2 > max_len:
            if current:
                chunks.append(current.strip())
            current = p
        else:
            current = current + "\n\n" + p if current else p
    if current:
        chunks.append(current.strip())
    return chunks


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


# --- Орчуулагч: Claude AI (Anthropic API) - АНХДАГЧ (Haiku = хурдан + хямд) ---
def _claude_translate(text: str) -> str | None:
    if not settings.ANTHROPIC_API_KEY:
        return None
    _rate_limit()

    # Урт текстийг хэсэгчлэн орчуулах
    max_chunk = 3000
    if len(text) > max_chunk:
        chunks = _split_text(text, max_chunk)
        translated_parts = []
        for chunk in chunks:
            _rate_limit()
            result = _claude_translate_chunk(chunk)
            if result:
                translated_parts.append(result)
            else:
                translated_parts.append(chunk)
        if translated_parts:
            _translator_stats["claude"] += 1
            return "\n\n".join(translated_parts)
        return None

    return _claude_translate_chunk(text)


def _claude_translate_chunk(text: str) -> str | None:
    """Claude Haiku ашиглан нэг хэсэг текст орчуулах (хурдан, хямд, чанартай)."""
    if not settings.ANTHROPIC_API_KEY:
        return None
    resp = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 4000,
            "temperature": 0,
            "system": (
                "Чи мэргэжлийн англи-монгол мэдээний орчуулагч. "
                "Байгалийн, уншихад ойлгомжтой монгол хэлээр орчуул. "
                "Мэдээний албан ёсны хэв маягтай байх. "
                "Нэр томьёог зөв орчуул, шаардлагатай бол англи нэрийг хаалтанд бич. "
                "Зөвхөн орчуулгыг бич, өөр тайлбар бүү нэм."
            ),
            "messages": [
                {
                    "role": "user",
                    "content": text,
                }
            ],
        },
        timeout=30,
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


# ============================================================
# Бүтэцтэй орчуулга (structured translation)
# ============================================================

_STRUCTURED_PROMPT = """Та олон улсын мэдээг Монгол хэл дээр ойлгомжтой, байгалийн хэлээр тайлбарлан бичдэг туршлагатай редактор юм.

Дараах мэдээг боловсруул:

{news_text}

ШААРДЛАГА:
1. Мэдээг Монгол хэл рүү утгаар нь ойлгомжтой орчуул
2. Англи хэлний бүтцийг шууд хуулж болохгүй
3. Хэт урт өгүүлбэрийг задла
4. Модон, шууд орчуулсан хэллэгийг зас
5. Монгол хүний уншихад энгийн, байгалийн хэл ашигла
6. Давхардал, нуршуу хэсгийг багасга

ГАРАЛТЫГ ЗААВАЛ ДАРААХ ФОРМАТААР ӨГ:

TITLE:
(1 өгүүлбэр, сонирхол татахуйц гарчиг)

SUMMARY:
(2 өгүүлбэр, товч утга)

KEY_POINTS:
- (3–5 гол санаа)

FULL_TEXT:
(бүтэн сайжруулсан орчуулга)

MONGOLIA_IMPACT:
(Монголд ямар нөлөөтэй байж болохыг 1-2 өгүүлбэрээр тайлбарла)"""


def _parse_structured_response(text: str) -> dict | None:
    """Claude-ийн бүтэцтэй хариуг parse хийх."""
    sections = {}
    current_key = None
    current_lines = []

    for line in text.split("\n"):
        stripped = line.strip()
        # Шинэ section эхлэв үү?
        for key in ("TITLE:", "SUMMARY:", "KEY_POINTS:", "FULL_TEXT:", "MONGOLIA_IMPACT:"):
            if stripped == key or stripped.startswith(key):
                if current_key:
                    sections[current_key] = "\n".join(current_lines).strip()
                current_key = key.rstrip(":")
                # TITLE: Гарчиг гэж нэг мөрөнд бичсэн бол
                rest = stripped[len(key):].strip()
                current_lines = [rest] if rest else []
                break
        else:
            if current_key:
                current_lines.append(line)

    if current_key:
        sections[current_key] = "\n".join(current_lines).strip()

    if "TITLE" in sections and "SUMMARY" in sections:
        return sections
    return None


def translate_article_structured(title: str, summary: str) -> dict | None:
    """Мэдээг бүтэцтэй prompt-р орчуулж, parse хийсэн dict буцаана.

    Returns: {"TITLE": ..., "SUMMARY": ..., "KEY_POINTS": ..., "FULL_TEXT": ..., "MONGOLIA_IMPACT": ...}
    """
    if not settings.ANTHROPIC_API_KEY:
        return None

    news_text = f"Гарчиг: {title}"
    if summary:
        news_text += f"\n\nАгуулга: {summary}"

    prompt = _STRUCTURED_PROMPT.format(news_text=news_text)

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
            "max_tokens": 4000,
            "temperature": 0.3,
            "messages": [
                {"role": "user", "content": prompt},
            ],
        },
        timeout=60,
    )

    if resp.status_code == 200:
        data = resp.json()
        content = data.get("content", [])
        if content:
            raw = content[0].get("text", "").strip()
            parsed = _parse_structured_response(raw)
            if parsed:
                _translator_stats["claude"] += 1
                return parsed
            print(f"[Claude Structured] Parse failed, raw: {raw[:200]}")
    else:
        print(f"[Claude Structured] API error: {resp.status_code}")

    return None


# --- Fallback Chain ---
# Claude Haiku анхдагч (хурдан + хямд + чанартай), Google зөвхөн нөөц
TRANSLATORS = [
    ("claude", _claude_translate),
    ("google", _google_translate),
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
