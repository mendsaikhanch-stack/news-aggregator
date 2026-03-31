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
_translator_stats = {"groq": 0, "gemini": 0, "google": 0, "mymemory": 0, "lingva": 0, "claude": 0, "failed": 0}


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


# --- Орчуулагч: Groq (Llama 3.3 70B, free tier, 30 RPM) ---
def _groq_translate(text: str) -> str | None:
    if not settings.GROQ_API_KEY:
        return None
    _rate_limit()

    max_chunk = 4000
    if len(text) > max_chunk:
        chunks = _split_text(text, max_chunk)
        translated_parts = []
        for chunk in chunks:
            _rate_limit()
            result = _groq_translate_chunk(chunk)
            if result:
                translated_parts.append(result)
            else:
                translated_parts.append(chunk)
        if translated_parts:
            _translator_stats["groq"] += 1
            return "\n\n".join(translated_parts)
        return None

    return _groq_translate_chunk(text)


def _groq_translate_chunk(text: str) -> str | None:
    """Groq Llama 3.3 70B ашиглан текст орчуулах."""
    if not settings.GROQ_API_KEY:
        return None
    resp = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Чи мэргэжлийн англи-монгол мэдээний орчуулагч. "
                        "Байгалийн, уншихад ойлгомжтой монгол хэлээр орчуул. "
                        "Мэдээний албан ёсны хэв маягтай байх. "
                        "Нэр томьёог зөв орчуул, шаардлагатай бол англи нэрийг хаалтанд бич. "
                        "'~сан байна' биш '~жээ' хэрэглэ. Модон орчуулга хориглоно. "
                        "US=АНУ, UK=Их Британи, Russia=ОХУ, China=Хятад, EU=Европын холбоо, "
                        "South Korea=Өмнөд Солонгос, North Korea=Хойд Солонгос, UN=НҮБ, WHO=ДЭМБ. "
                        "Зөвхөн орчуулгыг бич, өөр тайлбар бүү нэм."
                    ),
                },
                {"role": "user", "content": text},
            ],
            "max_tokens": 4000,
            "temperature": 0.2,
        },
        timeout=30,
    )
    if resp.status_code == 200:
        data = resp.json()
        choices = data.get("choices", [])
        if choices:
            translated = choices[0].get("message", {}).get("content", "").strip()
            if translated:
                _translator_stats["groq"] += 1
                return translated
    else:
        print(f"[Groq] API error: {resp.status_code}")
    return None


# --- Орчуулагч: Google Gemini (free tier, 15 RPM) ---
def _gemini_translate(text: str) -> str | None:
    if not settings.GEMINI_API_KEY:
        return None
    _rate_limit()

    max_chunk = 4000
    if len(text) > max_chunk:
        chunks = _split_text(text, max_chunk)
        translated_parts = []
        for chunk in chunks:
            _rate_limit()
            result = _gemini_translate_chunk(chunk)
            if result:
                translated_parts.append(result)
            else:
                translated_parts.append(chunk)
        if translated_parts:
            _translator_stats["gemini"] += 1
            return "\n\n".join(translated_parts)
        return None

    return _gemini_translate_chunk(text)


def _gemini_translate_chunk(text: str) -> str | None:
    """Gemini Flash ашиглан текст орчуулах."""
    if not settings.GEMINI_API_KEY:
        return None
    resp = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}",
        headers={"content-type": "application/json"},
        json={
            "system_instruction": {
                "parts": [{
                    "text": (
                        "Чи мэргэжлийн англи-монгол мэдээний орчуулагч. "
                        "Байгалийн, уншихад ойлгомжтой монгол хэлээр орчуул. "
                        "Мэдээний албан ёсны хэв маягтай байх. "
                        "Нэр томьёог зөв орчуул, шаардлагатай бол англи нэрийг хаалтанд бич. "
                        "'~сан байна' биш '~жээ' хэрэглэ. Модон орчуулга хориглоно. "
                        "US=АНУ, UK=Их Британи, Russia=ОХУ, China=Хятад, EU=Европын холбоо, "
                        "South Korea=Өмнөд Солонгос, North Korea=Хойд Солонгос, UN=НҮБ, WHO=ДЭМБ. "
                        "Зөвхөн орчуулгыг бич, өөр тайлбар бүү нэм."
                    )
                }]
            },
            "contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 4000},
        },
        timeout=30,
    )
    if resp.status_code == 200:
        data = resp.json()
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                translated = parts[0].get("text", "").strip()
                if translated:
                    _translator_stats["gemini"] += 1
                    return translated
    else:
        print(f"[Gemini] API error: {resp.status_code} {resp.text[:200]}")
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

_STRUCTURED_PROMPT = """Та олон улсын мэдээг Монгол хэл дээр алдаагүй, байгалийн, мэргэжлийн түвшинд орчуулдаг ахлах редактор юм.

Дараах мэдээг боловсруул:

{news_text}

=== ҮНДСЭН ЗОРИЛГО ===
Монгол уншигчид шууд ойлгохуйц, дүрмийн алдаагүй, байгалийн урсгалтай мэдээ гаргах.

=== ШААРДЛАГА ===

[1] ОРЧУУЛГА
- Үгчилж биш, утгаар нь орчуул
- Нэр томьёог зөв, тогтвортой хэрэглэ
- Хэрвээ шууд орчуулбал ойлгомжгүй бол тайлбарлан хөрвүүл

[2] НАЙРУУЛГА (REWRITE)
- Англи өгүүлбэрийн бүтцийг хуулж болохгүй
- Хэт урт өгүүлбэрийг 2-3 болгон задла
- "байна", "байжээ" гэх мэт давталтыг багасга
- Монгол хүний ярианы логик урсгал ашигла

[3] ДҮРЭМ
- Монгол хэлний зөв бичих дүрмийг ягштал мөрд
- Том, жижиг үсгийг зөв хэрэглэ
- Цэг, таслал, холбоос үгсийг зөв байрлуул
- Дүрмийн алдаа 0 байх ёстой

[4] ЧАНАРЫН ШАЛГАЛТ (ДОТООД)
Гаргахаасаа өмнө дараахийг дотроо шалга:
- Утга алдагдсан эсэх
- Модон орчуулга үлдсэн эсэх
- Хэт урт, ойлгомжгүй өгүүлбэр байгаа эсэх
- Дүрмийн алдаа байгаа эсэх
→ Хэрвээ байгаа бол зассаны дараа л гарга

[5] ХОРИГЛОХ ЗҮЙЛ
- Шууд үгчилсэн орчуулга
- Англи хэлний бүтэц
- Давхардсан үг, нуршуу өгүүлбэр
- Хэт албан, амьгүй хэллэг

[6] МОДОН ХЭЛЛЭГ ЗАСАХ (заавал мөрд)

Үйл үгийн давхардал:
- "~сан/сон байна" → "~жээ" (шийдвэр гаргасан байна → шийдвэр гаргажээ)
- "~сэн/сөн байна" → "~жээ" (хэлсэн байна → хэлжээ, мэдэгдсэн байна → мэдэгджээ)
- "байгаа байна" → "байна"
- "байсан байна" → "байжээ"
- "болох болно" → "болно"
- "үүсэх болно" → "үүснэ"

"Үзүүлж байна" давхардал:
- "өсөлт үзүүлж байна" → "өсөж байна"
- "бууралт үзүүлж байна" → "буурч байна"
- "удаашрал үзүүлж байна" → "удааширч байна"
- "сайжрал үзүүлж байна" → "сайжирч байна"
- "доройтол үзүүлж байна" → "доройтож байна"
- "нөлөөлөл/нөлөө/үр нөлөө үзүүлж байна" → "нөлөөлж байна"
- "үр дүн үзүүлж байна" → "үр дүн гаргаж байна"

Илүүдэл "байна" хасах:
- "асуудалтай байна" → "асуудалтай"
- "боломжтой байна" → "боломжтой"
- "чухал ач холбогдолтой байна" → "чухал"
- "хэрэгжих боломжтой байна" → "хэрэгжих боломжтой"
- "өсөлттэй байна" → "өссөн байна" (эсвэл "өссөн")
- "бууралттай байна" → "буурсан байна"
- "өөрчлөлттэй байна" → "өөрчлөгдсөн байна"

Байдал илэрхийлэх:
- "хэцүү байдалд байна" → "хүндрэлтэй байна"
- "сайн байдалд байна" → "сайжирсан байна"
- "муу байдалд байна" → "доройтсон байна"
- "тогтвортой байдалд байна" → "тогтвортой байна"
- "хөдөлгөөнд орж байна" → "хөдөлж эхэлж байна"

Хүчтэй илэрхийлэл:
- "хүчтэй өсөлттэй байна" → "огцом өссөн"
- "хүчтэй бууралттай байна" → "огцом буурсан"
- "хурдтайгаар өсөж байна" → "огцом өсөж байна"
- "хүчтэй байр суурь баримталж байна" → "хатуу байр суурь илэрхийлж байна"

Үг сонголт:
- "даралт дор байна" → "дарамт нэмэгдэж байна"
- "өсөлтийн даралт" → "өсөлтийн дарамт"

"Энэ нь" илүүдэл + мэдээний хэв маяг:
- "энэ нь ... гэсэн байна" → "... гэжээ"
- "энэ нь ... гэж хэлсэн" → "... гэж хэлжээ"
- "энэ нь ... гэж мэдэгдсэн" → "... гэж мэдэгджээ"
- "энэ нь ... гэж дурдсан байна" → "... гэж дурджээ"
- "энэ нь ... гэж тайлбарлаж байна" → "... гэж тайлбарлажээ"
- "энэ нь ... гэж онцолж байна" → "... гэж онцолжээ"
- "энэ нь ... гэж мэдээлж байна" → "... гэж мэдээлжээ"
- "энэ нь ... гэж хэлж байна" → "... гэж хэлжээ"
- "энэ нь ... байж магадгүй байна" → "... байж магадгүй"
- "энэ нь ... болж магадгүй байна" → "... болж магадгүй"
- "энэ нь ... болж эхэлж байна" → "... болж эхэлжээ"
- "энэ нь ... болсон байна" → "... болжээ"
- "энэ нь ... гэж үзэж болох юм" → "... гэж үзэж болно"
- "энэ нь ... гэж харж байна" → "... гэж үзэж байна"

Нэмэлт ~сан/сон → ~жээ жагсаалт:
- "өссөн байна" → "өсжээ", "буурсан байна" → "буурчээ"
- "хийсэн байна" → "хийжээ", "гаргасан байна" → "гаргажээ"
- "ирсэн байна" → "иржээ", "явсан байна" → "явжээ"
- "өгсөн байна" → "өгчээ", "авсан байна" → "авчээ"
- "гарсан байна" → "гарчээ", "үүссэн байна" → "үүсжээ"
- "хийгдсэн байна" → "хийгджээ", "нэмэгдсэн байна" → "нэмэгджээ"
- "хэрэглэсэн байна" → "хэрэглэжээ", "үзсэн байна" → "үзжээ"
- "болох байсан" → "болох байжээ", "хийх байсан" → "хийх байжээ"

Илүүдэл хасах (нэмэлт):
- "шаардлагатай байна" → "шаардлагатай"
- "хийх боломжтой байна" → "боломжтой"
- "болох боломжтой байна" → "боломжтой"
- "5 хувиар өссөн байна" → "5%-иар өсжээ"

[8] ЗӨВ БИЧИХ ДҮРЭМ

Том үсэг:
- Засгийн газар (бүх тохиолдолд)
- Европын холбоо, Америк, Хятад улс, Монгол Улс

Улс, бүс нутаг:
- US/U.S./USA/United States → АНУ
- UK/U.K./United Kingdom/Britain → Их Британи
- England → Англи (context шалгах)
- Russia/Russian Federation → ОХУ
- China → Хятад, PRC → БНХАУ
- South Korea → Өмнөд Солонгос (С.Солонгос биш)
- North Korea → Хойд Солонгос (Н.Солонгос биш)
- Japan → Япон, Germany → Герман, France → Франц
- Italy → Итали, Spain → Испани, India → Энэтхэг
- Turkey/Türkiye → Турк, Ukraine → Украин
- Israel → Израиль, Palestine → Палестин
- UAE/U.A.E → Нэгдсэн Арабын Эмират
- Saudi/KSA → Саудын Араб
- EU/European Union → Европын холбоо (эхний удаа), ЕХ (дараа нь)
- Asia → Ази, Europe → Европ, Africa → Африк
- Middle East → Ойрхи Дорнод
- North America → Хойд Америк, South America → Өмнөд Америк
- global/worldwide → дэлхий даяар, international → олон улсын

Олон улсын байгууллага:
- UN → Нэгдсэн Үндэстний Байгууллага (эхний удаа), НҮБ
- WHO → Дэлхийн эрүүл мэндийн байгууллага (ДЭМБ)
- IMF → Олон улсын валютын сан
- World Bank → Дэлхийн банк
- NATO → Хойд Атлантын гэрээний байгууллага (НАТО)
- OECD → Эдийн засгийн хамтын ажиллагаа, хөгжлийн байгууллага
- FBI → Холбооны мөрдөх товчоо, CIA → Тагнуулын төв газар
- EU Commission → Европын комисс, European Parliament → Европын парламент
- White House → Цагаан ордон, Pentagon → Пентагон

Компани, байгууллага:
- Apple Inc./Microsoft Corp./Google LLC/Meta/Amazon/Tesla → Англи нэрээр (Inc, Corp, LLC хас)
- tech giant → технологийн аварга компани
- startup company → стартап компани
- government agency → төрийн байгууллага
- private sector → хувийн хэвшил, public sector → төрийн сектор

Тоо, валют, хувь:
- percent/per cent → % (жишээ: 10 percent → 10%)
- 5 percent increase → 5%-ийн өсөлт
- USD/$ → ам.доллар, € → евро, ¥ → иен, ₮ → төгрөг
- $5 million → 5 сая ам.доллар, $2 billion → 2 тэрбум ам.доллар
- million → сая, billion → тэрбум, trillion → их наяд
- Тоо болон нэгжийн хооронд зай: "2024оны" → "2024 оны", "1сард" → "1-р сард"

Хугацаа:
- Q1/first quarter → 1-р улирал, Q2 → 2-р улирал, Q3 → 3-р улирал, Q4 → 4-р улирал
- fiscal year → санхүүгийн жил
- Jan→1-р сар, Feb→2-р сар, Mar→3-р сар, Apr→4-р сар, May→5-р сар, Jun→6-р сар
- Jul→7-р сар, Aug→8-р сар, Sep→9-р сар, Oct→10-р сар, Nov→11-р сар, Dec→12-р сар
- Monday→Даваа, Tuesday→Мягмар, Wednesday→Лхагва, Thursday→Пүрэв, Friday→Баасан
- year-on-year → өмнөх оноос, month-on-month → өмнөх сараас

Холбоос үг:
- currently → одоогоор, recently → саяхан, previously → өмнө нь
- in the future → ирээдүйд, at the same time → үүний зэрэгцээ
- as a result → үүний үр дүнд, in response → үүний хариуд
- according to → ...-ын мэдээлснээр, based on → ...-д үндэслэн
- it is expected → хүлээгдэж байна, it is likely → магадлалтай
- it is unclear → тодорхойгүй байна

[9] НЭР ТОМЬЁОНЫ ТОЛЬ (англи → монгол)

Эдийн засаг:
inflation=инфляц, interest rate=бодлогын хүү, central bank=төв банк, Federal Reserve=Холбооны нөөцийн сан, sanctions=хориг, GDP=ДНБ (дотоодын нийт бүтээгдэхүүн), unemployment=ажилгүйдэл, economic growth=эдийн засгийн өсөлт, recession=эдийн засгийн уналт, economic slowdown=эдийн засгийн сааралт, inflation rate=инфляцын түвшин, interest hike=хүүгийн өсөлт, interest cut=хүү бууруулалт, supply chain=нийлүүлэлтийн сүлжээ, demand=эрэлт, supply=нийлүүлэлт

Санхүү, бизнес:
stock market=хөрөнгийн зах зээл, shares=хувьцаа, bond=бонд, investment=хөрөнгө оруулалт, venture capital=венчур хөрөнгө оруулалт, revenue=орлого, profit=ашиг, loss=алдагдал, market share=зах зээлийн хувь, competition=өрсөлдөөн, regulation=зохицуулалт, acquisition=худалдан авалт, merger=нэгдэл, deal=хэлэлцээр, agreement=гэрээ, partnership=хамтын ажиллагаа

Технологи:
artificial intelligence=хиймэл оюун ухаан, machine learning=машин сургалт, cybersecurity=кибер аюулгүй байдал, data privacy=өгөгдлийн нууцлал, cryptocurrency=криптовалют, blockchain=блокчейн, startup=стартап, platform=платформ

Ерөнхий:
policy=бодлого, launch=танилцуулах, release=гаргах, update=шинэчлэлт, upgrade=сайжруулалт, feature=боломж, service=үйлчилгээ, government agency=төрийн байгууллага, private sector=хувийн хэвшил, public sector=төрийн сектор, tech giant=технологийн аварга компани

=== ГАРАЛТЫН ФОРМАТ ===

TITLE:
(1 өгүүлбэр, ойлгомжтой, сонирхол татахуйц)

SUMMARY:
(2 өгүүлбэр, товч бөгөөд утга тодорхой)

KEY_POINTS:
- (3-5 гол санаа, энгийн хэлээр)

FULL_TEXT:
(бүтэн сайжруулсан, дүрмийн алдаагүй, байгалийн орчуулга)

MONGOLIA_IMPACT:
(Монголд ямар нөлөөтэй байж болохыг 1-2 өгүүлбэрээр тайлбарла)

=== ЧАНАРЫН ШАЛГУУР ===
- Хүн бичсэн мэт уншигдах
- 1 удаа уншаад ойлгогдох
- Дүрмийн алдаа 0
- Модон хэллэг 0

Зөвхөн дээрх форматаар хариу өг."""


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
    Gemini → Claude fallback chain.

    Returns: {"TITLE": ..., "SUMMARY": ..., "KEY_POINTS": ..., "FULL_TEXT": ..., "MONGOLIA_IMPACT": ...}
    """
    news_text = f"Гарчиг: {title}"
    if summary:
        news_text += f"\n\nАгуулга: {summary}"

    prompt = _STRUCTURED_PROMPT.format(news_text=news_text)

    # 1. Groq оролдох (үнэгүй, хурдан)
    if settings.GROQ_API_KEY:
        result = _groq_structured(prompt)
        if result:
            return result

    # 2. Gemini оролдох
    if settings.GEMINI_API_KEY:
        result = _gemini_structured(prompt)
        if result:
            return result

    # 3. Claude fallback
    if settings.ANTHROPIC_API_KEY:
        result = _claude_structured(prompt)
        if result:
            return result

    return None


def _groq_structured(prompt: str) -> dict | None:
    """Groq Llama 3.3 70B ашиглан бүтэцтэй орчуулга."""
    _rate_limit()
    resp = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4000,
            "temperature": 0.3,
        },
        timeout=60,
    )
    if resp.status_code == 200:
        data = resp.json()
        choices = data.get("choices", [])
        if choices:
            raw = choices[0].get("message", {}).get("content", "").strip()
            parsed = _parse_structured_response(raw)
            if parsed:
                _translator_stats["groq"] += 1
                return parsed
            print(f"[Groq Structured] Parse failed, raw: {raw[:200]}")
    else:
        print(f"[Groq Structured] API error: {resp.status_code}")
    return None


def _gemini_structured(prompt: str) -> dict | None:
    """Gemini Flash ашиглан бүтэцтэй орчуулга."""
    _rate_limit()
    resp = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}",
        headers={"content-type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4000},
        },
        timeout=60,
    )
    if resp.status_code == 200:
        data = resp.json()
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                raw = parts[0].get("text", "").strip()
                parsed = _parse_structured_response(raw)
                if parsed:
                    _translator_stats["gemini"] += 1
                    return parsed
                print(f"[Gemini Structured] Parse failed, raw: {raw[:200]}")
    else:
        print(f"[Gemini Structured] API error: {resp.status_code}")
    return None


def _claude_structured(prompt: str) -> dict | None:
    """Claude Haiku ашиглан бүтэцтэй орчуулга."""
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
            "messages": [{"role": "user", "content": prompt}],
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
# Groq анхдагч (үнэгүй + хурдан + чанартай), Gemini/Claude нөөц, Google Translate сүүлийн нөөц
TRANSLATORS = [
    ("groq", _groq_translate),
    ("gemini", _gemini_translate),
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

# (keyword, weight) — weight өндөр = илүү тодорхой
CATEGORY_KEYWORDS = {
    "politics": [
        ("president", 2), ("prime minister", 3), ("minister", 2), ("parliament", 3),
        ("election", 3), ("vote", 2), ("government", 1), ("senate", 3), ("congress", 3),
        ("democrat", 2), ("republican", 2), ("diplomacy", 2), ("ambassador", 2),
        ("sanctions", 2), ("treaty", 2), ("legislation", 2), ("political", 2), ("campaign", 1),
        ("coup", 3), ("impeach", 3), ("referendum", 3),
        ("ерөнхийлөгч", 3), ("сайд", 2), ("засгийн газар", 2), ("сонгууль", 3),
        ("хууль", 2), ("улс төр", 3), ("парламент", 3), ("их хурал", 3),
    ],
    "business": [
        ("economy", 2), ("stock market", 3), ("trade war", 3), ("inflation", 3),
        ("gdp", 3), ("central bank", 3), ("investment", 2), ("revenue", 2),
        ("profit", 2), ("corporate", 2), ("bitcoin", 2), ("crypto", 2),
        ("finance", 2), ("currency", 2), ("tax", 1), ("tariff", 3), ("recession", 3),
        ("эдийн засаг", 3), ("зах зээл", 2), ("хөрөнгө оруулалт", 3),
        ("банк", 2), ("бизнес", 2), ("худалдаа", 2), ("татвар", 2),
    ],
    "tech": [
        ("artificial intelligence", 3), ("machine learning", 3), ("software", 2),
        ("robot", 2), ("semiconductor", 3), ("cybersecurity", 3), ("algorithm", 2),
        ("smartphone", 2), ("spacex", 2), ("satellite", 1), ("5g", 2), ("quantum", 2),
        ("технологи", 3), ("програм", 2), ("хиймэл оюун", 3), ("робот", 2), ("чип", 2),
    ],
    "sports": [
        ("football", 2), ("soccer", 2), ("basketball", 2), ("tennis", 2),
        ("olympic", 3), ("fifa", 3), ("nba", 3), ("champion", 2), ("tournament", 2),
        ("athlete", 2), ("medal", 2), ("cricket", 2), ("rugby", 2), ("boxing", 2),
        ("world cup", 3), ("premier league", 3),
        ("спорт", 3), ("тэмцээн", 2), ("аварга", 2), ("тоглолт", 2), ("медаль", 2),
    ],
    "science": [
        ("research", 1), ("scientist", 2), ("discovery", 2), ("space", 1), ("nasa", 3),
        ("climate change", 3), ("species", 2), ("fossil", 2), ("physics", 2),
        ("earthquake", 2), ("volcano", 2), ("carbon emission", 3), ("renewable energy", 3),
        ("судалгаа", 2), ("шинжлэх ухаан", 3), ("сансар", 2), ("уур амьсгал", 3),
    ],
    "health": [
        ("vaccine", 3), ("virus", 2), ("disease", 2), ("hospital", 2), ("patient", 1),
        ("cancer", 3), ("mental health", 3), ("pandemic", 3), ("epidemic", 3),
        ("medicine", 2), ("surgery", 2), ("outbreak", 3), ("covid", 3),
        ("эрүүл мэнд", 3), ("вакцин", 3), ("өвчин", 2), ("эмнэлэг", 2),
    ],
    "entertainment": [
        ("movie", 2), ("film", 2), ("music", 2), ("concert", 2), ("celebrity", 2),
        ("oscar", 3), ("grammy", 3), ("netflix", 2), ("actor", 2), ("singer", 2),
        ("album", 2), ("festival", 1), ("hollywood", 3), ("bollywood", 3),
        ("кино", 3), ("дуу", 2), ("урлаг", 2), ("жүжигчин", 3), ("соёл", 2),
    ],
}


def classify_article(title: str, summary: str) -> str:
    """Гарчиг болон хураангуйд суурилан мэдээг ангилах (weight-тай keyword matching)."""
    text = f"{title} {summary}".lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for kw, weight in keywords:
            # Word boundary шалгах (хэт ерөнхий keyword-г зөв тааруулах)
            if f" {kw} " in f" {text} " or f" {kw}." in f" {text}" or f" {kw}," in f" {text}":
                score += weight
        if score > 0:
            scores[category] = score

    if scores:
        # Хамгийн өндөр оноотой категорийг авах, тэнцвэл politics > business > world
        return max(scores, key=scores.get)
    return "world"
