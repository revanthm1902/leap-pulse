"""
LeapPulse — Google News Scraper
Scrapes Google News RSS for brand mentions.
No API key needed — uses the public RSS feed.
"""

import time
import requests
from bs4 import BeautifulSoup
from config import HEADERS, BRAND_NAME, get_search_queries, is_relevant_mention
from sentiment import analyze_sentiment, compute_priority_contextual


def scrape_google_news(brand: str, limit: int = 10) -> list[dict]:
    """
    Fetch Google News RSS for a brand query.
    Uses exact-match queries and filters irrelevant results.
    """
    mentions: list[dict] = []
    rss_url = "https://news.google.com/rss/search"
    seen_urls: set[str] = set()

    for query in get_search_queries(brand):
        params = {"q": f'"{query}"', "hl": "en-IN", "gl": "IN", "ceid": "IN:en"}

        try:
            resp = requests.get(rss_url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, "lxml-xml")

            items = soup.find_all("item")[:limit]

            for item in items:
                title = item.title.get_text(strip=True) if item.title else ""
                description = ""
                if item.description:
                    desc_soup = BeautifulSoup(item.description.text, "lxml")
                    description = desc_soup.get_text(strip=True)

                content = f"{title}. {description}".strip()[:500]
                if len(content) < 20:
                    continue

                if not is_relevant_mention(content, brand):
                    continue

                link = item.link.get_text(strip=True) if item.link else ""
                source = item.source.get_text(strip=True) if item.source else "News"

                if link in seen_urls:
                    continue
                seen_urls.add(link)

                sentiment = analyze_sentiment(content)
                priority = compute_priority_contextual(sentiment, 20, content)

                mentions.append({
                    "platform": "GoogleNews",
                    "content": content,
                    "sentiment_score": sentiment,
                    "likes": 0,
                    "shares": 0,
                    "comments": 0,
                    "author": source,
                    "source_url": link,
                    "priority": priority,
                })

        except Exception as e:
            print(f"  ✗ Google News scrape error for '{query}': {e}")

        time.sleep(1)

    return mentions


def scrape_news_brand(brand: str | None = None) -> list[dict]:
    """Run Google News scraper for a single brand."""
    brand = brand or BRAND_NAME
    print(f"  → Google News: {brand}")
    return scrape_google_news(brand, limit=10)
