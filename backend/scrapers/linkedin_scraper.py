"""
LeapPulse — LinkedIn Scraper
Scrapes Google search results scoped to linkedin.com for brand mentions.

Direct LinkedIn scraping is heavily restricted, so we use Google
to find public LinkedIn posts and articles mentioning the brand.
"""

import time
import requests
from bs4 import BeautifulSoup
from config import HEADERS, BRAND_NAME, get_search_queries, is_relevant_mention
from sentiment import analyze_sentiment, compute_priority_contextual


def scrape_linkedin_via_google(brand: str, limit: int = 8) -> list[dict]:
    """
    Search Google for LinkedIn posts mentioning the brand.
    Uses exact-match queries and filters irrelevant results.
    """
    mentions: list[dict] = []
    seen_urls: set[str] = set()

    for search_term in get_search_queries(brand):
        query = f'site:linkedin.com "{search_term}" (review OR experience OR opinion)'
        url = "https://www.google.com/search"
        params = {"q": query, "num": limit, "hl": "en"}

        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            results = soup.select("div.g")[:limit]

            for result in results:
                # Title
                title_el = result.select_one("h3")
                title = title_el.get_text(strip=True) if title_el else ""

                # Snippet
                snippet_el = result.select_one("div.VwiC3b, span.aCOpRe")
                snippet = snippet_el.get_text(strip=True) if snippet_el else ""

                content = f"{title}. {snippet}".strip()[:500]
                if len(content) < 20:
                    continue

                if not is_relevant_mention(content, brand):
                    continue

                # URL
                link_el = result.select_one("a")
                source_url = link_el["href"] if link_el and link_el.get("href") else ""

                if source_url in seen_urls:
                    continue
                seen_urls.add(source_url)

                # Try to extract author from title (LinkedIn posts show "Name - ")
                author = "LinkedIn User"
                if " - " in title:
                    author = title.split(" - ")[0].strip()

                sentiment = analyze_sentiment(content)
                priority = compute_priority_contextual(sentiment, 30, content)

                mentions.append({
                    "platform": "LinkedIn",
                    "content": content,
                    "sentiment_score": sentiment,
                    "likes": 0,
                    "shares": 0,
                    "comments": 0,
                    "author": author,
                    "source_url": source_url,
                    "priority": priority,
                })

        except Exception as e:
            print(f"  ✗ LinkedIn/Google scrape error for '{search_term}': {e}")

        time.sleep(2)  # Google rate-limit

    return mentions


def scrape_linkedin_brand(brand: str | None = None) -> list[dict]:
    """Run LinkedIn scraper for a single brand."""
    brand = brand or BRAND_NAME
    print(f"  → LinkedIn (via Google): {brand}")
    return scrape_linkedin_via_google(brand, limit=8)

