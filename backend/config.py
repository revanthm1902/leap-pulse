"""
LeapPulse — Configuration
Loads environment variables and exposes them as typed constants.
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

BRAND_NAME: str = os.getenv("BRAND_NAME", "LeapScholar")

SCRAPE_INTERVAL: int = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "15"))

# User-Agent for polite scraping
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def get_search_queries(brand: str) -> list[str]:
    """
    Generate search query variants for a brand.
    For 'LeapScholar' → ['LeapScholar', 'leapscholar', 'leap scholar', 'Leap Scholar']
    For single-word brands like 'Yocket' → ['Yocket']
    """
    queries = [brand]
    lower = brand.lower()

    # Add lowercase variant
    if lower != brand:
        queries.append(lower)

    # Split camelCase / PascalCase into separate words
    words = re.sub(r'([a-z])([A-Z])', r'\1 \2', brand)
    if words != brand:
        queries.append(words)              # "Leap Scholar"
        queries.append(words.lower())      # "leap scholar"

    return list(dict.fromkeys(queries))  # dedupe preserving order


def is_relevant_mention(content: str, brand: str) -> bool:
    """
    Check if scraped content actually mentions the brand (not just a
    generic word like 'leap'). For compound brand names like 'LeapScholar',
    the content must contain 'leapscholar' or 'leap scholar' (case-insensitive).
    For single-word brands, a simple case-insensitive match suffices.
    """
    lower_content = content.lower()

    # Split camelCase to get individual words
    words = re.sub(r'([a-z])([A-Z])', r'\1 \2', brand).lower().split()

    if len(words) > 1:
        # Compound brand: must have full name together (with or without space)
        joined = "".join(words)        # "leapscholar"
        spaced = " ".join(words)       # "leap scholar"
        return joined in lower_content or spaced in lower_content
    else:
        # Single-word brand: direct match is fine
        return words[0] in lower_content
