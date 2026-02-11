"""
LeapPulse — Reddit Scraper
Uses Reddit's public JSON API (no authentication required).
Searches subreddits for brand mentions with relevance filtering.
"""

import time
import requests
from bs4 import BeautifulSoup
from config import HEADERS, BRAND_NAME, get_search_queries, is_relevant_mention
from sentiment import analyze_sentiment, compute_priority_contextual

# Subreddits likely to discuss study-abroad brands
SUBREDDITS = [
    "StudyAbroad",
    "IELTS",
    "ImmigrationCanada",
    "AustralianVisa",
    "IntlStudents",
    "Indian_Academia",
]


def scrape_reddit(brand: str, limit: int = 10) -> list[dict]:
    """
    Scrape Reddit search results for a brand.
    Uses multiple search query variants and filters irrelevant results.
    """
    mentions: list[dict] = []
    search_url = f"https://www.reddit.com/search.json"
    seen_ids: set[str] = set()

    for query in get_search_queries(brand):
        params = {
            "q": query,
            "sort": "new",
            "limit": limit,
            "t": "week",
        }

        try:
            resp = requests.get(search_url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()

            posts = data.get("data", {}).get("children", [])
            for post in posts:
                d = post.get("data", {})
                post_id = d.get("id", "")
                if post_id in seen_ids:
                    continue
                seen_ids.add(post_id)

                title = d.get("title", "")
                selftext = d.get("selftext", "")
                content = f"{title}. {selftext}".strip()[:500]

                if not content or len(content) < 20:
                    continue

                # Filter out posts that don't actually mention the brand
                if not is_relevant_mention(content, brand):
                    continue

                likes = max(d.get("ups", 0), 0)
                comments = d.get("num_comments", 0)
                author = f"u/{d.get('author', 'anonymous')}"
                permalink = f"https://reddit.com{d.get('permalink', '')}"

                sentiment = analyze_sentiment(content)
                priority = compute_priority_contextual(sentiment, likes, content)

                mentions.append({
                    "platform": "Reddit",
                    "content": content,
                    "sentiment_score": sentiment,
                    "likes": likes,
                    "shares": 0,
                    "comments": comments,
                    "author": author,
                    "source_url": permalink,
                    "priority": priority,
                })

        except Exception as e:
            print(f"  ✗ Reddit scrape error for '{query}': {e}")

        time.sleep(1)  # Rate-limit between query variants

    return mentions


def scrape_subreddit(subreddit: str, brand: str, limit: int = 5) -> list[dict]:
    """Scrape a specific subreddit for brand mentions."""
    mentions: list[dict] = []
    seen_ids: set[str] = set()

    for query in get_search_queries(brand):
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params = {
            "q": query,
            "restrict_sr": "on",
            "sort": "new",
            "limit": limit,
            "t": "week",
        }

        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()

            posts = data.get("data", {}).get("children", [])
            for post in posts:
                d = post.get("data", {})
                post_id = d.get("id", "")
                if post_id in seen_ids:
                    continue
                seen_ids.add(post_id)

                title = d.get("title", "")
                selftext = d.get("selftext", "")
                content = f"{title}. {selftext}".strip()[:500]

                if not content or len(content) < 20:
                    continue

                if not is_relevant_mention(content, brand):
                    continue

                likes = max(d.get("ups", 0), 0)
                comments_count = d.get("num_comments", 0)
                author = f"u/{d.get('author', 'anonymous')}"
                permalink = f"https://reddit.com{d.get('permalink', '')}"

                sentiment = analyze_sentiment(content)
                priority = compute_priority_contextual(sentiment, likes, content)

                mentions.append({
                    "platform": "Reddit",
                    "content": content,
                    "sentiment_score": sentiment,
                    "likes": likes,
                    "shares": 0,
                    "comments": comments_count,
                    "author": author,
                    "source_url": permalink,
                    "priority": priority,
                })

        except Exception as e:
            print(f"  ✗ Reddit r/{subreddit} error for '{query}': {e}")

        time.sleep(1)

    return mentions


def scrape_reddit_all(brand: str | None = None) -> list[dict]:
    """Run Reddit scraper for the brand across global search + subreddits."""
    brand = brand or BRAND_NAME
    all_mentions: list[dict] = []

    print(f"  → Reddit global search: {brand}")
    all_mentions.extend(scrape_reddit(brand, limit=10))
    time.sleep(2)

    for sub in SUBREDDITS:
        print(f"  → Reddit r/{sub}: {brand}")
        all_mentions.extend(scrape_subreddit(sub, brand, limit=5))
        time.sleep(2)

    return all_mentions
