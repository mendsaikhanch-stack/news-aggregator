import re
from deep_translator import GoogleTranslator


def translate_to_mongolian(text: str) -> str | None:
    """Google Translate ашиглан текстийг монгол хэл рүү орчуулах."""
    if not text or not text.strip():
        return text

    try:
        clean_text = re.sub(r"<[^>]*>", "", text)[:4000]
        translated = GoogleTranslator(source="en", target="mn").translate(clean_text)
        return translated
    except Exception as e:
        print(f"Translate error: {e}")
        return text


def generate_summary(article_text: str) -> str | None:
    """Мэдээний хураангуйг орчуулж гаргах."""
    if not article_text or not article_text.strip():
        return None

    try:
        clean = re.sub(r"<[^>]*>", "", article_text)[:2000]
        translated = GoogleTranslator(source="en", target="mn").translate(clean)
        return translated
    except Exception as e:
        print(f"Summary error: {e}")
        return None
