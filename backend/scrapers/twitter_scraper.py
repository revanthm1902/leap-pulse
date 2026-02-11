"""
LeapPulse — Twitter/X Scraper
Scrapes Nitter (open-source Twitter frontend) for brand mentions.
Nitter instances don't require API keys.

NOTE: Nitter instances change frequently. Update NITTER_INSTANCES
      with currently-working mirrors.
"""

import time
import requests
from bs4 import BeautifulSoup
from config import HEADERS, BRAND_NAME, get_search_queries, is_relevant_mention
from sentiment import analyze_sentiment, compute_priority_contextual

# Public Nitter instances — update if any go down
NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.woodland.cafe",
]


def _get_working_instance() -> str | None:
    """Find a responsive Nitter instance."""
    for instance in NITTER_INSTANCES:
        try:
            r = requests.get(instance, timeout=5, headers=HEADERS)
            if r.status_code == 200:
                return instance
        except Exception:
            continue
    return None


def scrape_twitter(brand: str, limit: int = 10) -> list[dict]:
    """
    Scrape Twitter/X mentions via Nitter search.
    Uses multiple query variants and filters irrelevant results.
    """
    mentions: list[dict] = []
    instance = _get_working_instance()

    if not instance:
        print("  ✗ No working Nitter instance found — skipping Twitter")
        return mentions

    seen_urls: set[str] = set()

    for query in get_search_queries(brand):
        search_url = f"{instance}/search"
        params = {"f": "tweets", "q": query}

        try:
            resp = requests.get(search_url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            tweets = soup.select(".timeline-item")[:limit]

            for tweet in tweets:
                # Extract content
                content_el = tweet.select_one(".tweet-content")
                if not content_el:
                    continue
                content = content_el.get_text(strip=True)[:500]
                if len(content) < 15:
                    continue

                if not is_relevant_mention(content, brand):
                    continue

                # Extract author
                author_el = tweet.select_one(".username")
                author = author_el.get_text(strip=True) if author_el else "unknown"

                # Extract engagement stats
                stat_els = tweet.select(".tweet-stat .tweet-stat-count")
                likes = 0
                shares = 0
                comments = 0
                if len(stat_els) >= 1:
                    comments = _parse_count(stat_els[0].get_text(strip=True))
                if len(stat_els) >= 2:
                    shares = _parse_count(stat_els[1].get_text(strip=True))
                if len(stat_els) >= 3:
                    likes = _parse_count(stat_els[2].get_text(strip=True))

                # Extract link
                link_el = tweet.select_one(".tweet-link")
                source_url = ""
                if link_el and link_el.get("href"):
                    source_url = f"https://twitter.com{link_el['href'].replace(instance, '')}"

                if source_url in seen_urls:
                    continue
                seen_urls.add(source_url)

                sentiment = analyze_sentiment(content)
                priority = compute_priority_contextual(sentiment, likes, content)

                mentions.append({
                    "platform": "Twitter",
                    "content": content,
                    "sentiment_score": sentiment,
                    "likes": likes,
                    "shares": shares,
                    "comments": comments,
                    "author": author,
                    "source_url": source_url,
                    "priority": priority,
                })

        except Exception as e:
            print(f"  ✗ Twitter scrape error for '{query}': {e}")

        time.sleep(1)

    return mentions


def _parse_count(text: str) -> int:
    """Parse '1.2K' or '342' into an integer."""
    text = text.strip().replace(",", "")
    if not text:
        return 0
    try:
        if text.upper().endswith("K"):
            return int(float(text[:-1]) * 1000)
        if text.upper().endswith("M"):
            return int(float(text[:-1]) * 1_000_000)
        return int(text)
    except ValueError:
        return 0


def scrape_twitter_brand(brand: str | None = None) -> list[dict]:
    """Run Twitter scraper for a single brand."""
    brand = brand or BRAND_NAME
    print(f"  → Twitter/Nitter: {brand}")
    return scrape_twitter(brand, limit=10)

