"""
LeapPulse — YouTube Scraper
Scrapes YouTube search results for brand mention videos.
Uses YouTube's public search page (no API key required).
"""

import time
import re
import json
import requests
from bs4 import BeautifulSoup
from config import HEADERS, BRAND_NAME, get_search_queries, is_relevant_mention
from sentiment import analyze_sentiment, compute_priority_contextual


def scrape_youtube(brand: str, limit: int = 8) -> list[dict]:
    """
    Scrape YouTube search for videos mentioning the brand.
    Uses search query variants and filters irrelevant results.
    """
    mentions: list[dict] = []
    seen_ids: set[str] = set()

    for query in get_search_queries(brand):
        url = f"https://www.youtube.com/results"
        params = {"search_query": f"{query} review experience", "sp": "CAI%253D"}

        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
            resp.raise_for_status()

            # YouTube embeds JSON data in the HTML
            match = re.search(r"var ytInitialData = ({.*?});", resp.text)
            if not match:
                print(f"  ✗ YouTube: Could not find initial data for '{query}'")
                continue

            data = json.loads(match.group(1))

            # Navigate JSON to find video renderers
            contents = (
                data.get("contents", {})
                .get("twoColumnSearchResultsRenderer", {})
                .get("primaryContents", {})
                .get("sectionListRenderer", {})
                .get("contents", [])
            )

            videos_found = 0
            for section in contents:
                items = (
                    section.get("itemSectionRenderer", {}).get("contents", [])
                )
                for item in items:
                    renderer = item.get("videoRenderer")
                    if not renderer:
                        continue
                    if videos_found >= limit:
                        break

                    title = ""
                    title_runs = renderer.get("title", {}).get("runs", [])
                    if title_runs:
                        title = title_runs[0].get("text", "")

                    video_id = renderer.get("videoId", "")
                    if video_id in seen_ids:
                        continue

                    channel = (
                        renderer.get("ownerText", {})
                        .get("runs", [{}])[0]
                        .get("text", "YouTuber")
                    )

                    # View count
                    view_text = renderer.get("viewCountText", {}).get("simpleText", "0 views")
                    likes = _parse_views(view_text)

                    content = title[:500]
                    if len(content) < 10:
                        continue

                    if not is_relevant_mention(content, brand):
                        continue

                    seen_ids.add(video_id)

                    sentiment = analyze_sentiment(content)
                    priority = compute_priority_contextual(sentiment, likes, content)

                    mentions.append({
                        "platform": "YouTube",
                        "content": content,
                        "sentiment_score": sentiment,
                        "likes": likes,
                        "shares": 0,
                        "comments": 0,
                        "author": channel,
                        "source_url": f"https://youtube.com/watch?v={video_id}",
                        "priority": priority,
                    })
                    videos_found += 1

        except Exception as e:
            print(f"  ✗ YouTube scrape error for '{query}': {e}")

        time.sleep(1)

    return mentions


def _parse_views(text: str) -> int:
    """Parse '1,234 views' or '12K views' into int."""
    text = text.lower().replace("views", "").replace(",", "").strip()
    if not text:
        return 0
    try:
        if "k" in text:
            return int(float(text.replace("k", "")) * 1000)
        if "m" in text:
            return int(float(text.replace("m", "")) * 1_000_000)
        return int(text)
    except (ValueError, TypeError):
        return 0


def scrape_youtube_brand(brand: str | None = None) -> list[dict]:
    """Run YouTube scraper for a single brand."""
    brand = brand or BRAND_NAME
    print(f"  → YouTube: {brand}")
    return scrape_youtube(brand, limit=8)
