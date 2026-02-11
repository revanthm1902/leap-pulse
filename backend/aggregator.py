"""
LeapPulse — Aggregation Engine
Computes derived metrics from raw mentions:
  - Sentiment distribution (positive / negative / neutral %)
  - Platform breakdown (where mentions come from)
  - Trending topics extraction (deduplicated)
  - Net Sentiment Score
  - Weekly trend snapshots
"""

import re
from collections import Counter
from config import BRAND_NAME


def compute_sentiment_distribution(mentions: list[dict]) -> list[dict]:
    """
    Compute positive / negative / neutral percentage breakdown.
    """
    if not mentions:
        return [
            {"label": "Positive", "value": 0, "count": 0},
            {"label": "Negative", "value": 0, "count": 0},
            {"label": "Neutral", "value": 0, "count": 0},
        ]

    positive = sum(1 for m in mentions if m["sentiment_score"] > 0.15)
    negative = sum(1 for m in mentions if m["sentiment_score"] < -0.15)
    neutral = len(mentions) - positive - negative
    total = len(mentions)

    return [
        {"label": "Positive", "value": round(positive / total * 100, 1), "count": positive},
        {"label": "Negative", "value": round(negative / total * 100, 1), "count": negative},
        {"label": "Neutral", "value": round(neutral / total * 100, 1), "count": neutral},
    ]


def compute_platform_breakdown(mentions: list[dict]) -> list[dict]:
    """
    Count mentions per platform and return percentage breakdown.
    """
    if not mentions:
        return []

    platform_counts: Counter[str] = Counter()
    for m in mentions:
        platform_counts[m.get("platform", "Unknown")] += 1

    total = sum(platform_counts.values())
    return [
        {
            "platform": platform,
            "mention_count": count,
            "percentage": round((count / total) * 100, 1),
        }
        for platform, count in platform_counts.most_common()
    ]


def extract_trending_topics(mentions: list[dict], top_n: int = 8) -> list[dict]:
    """
    Extract hashtags and high-frequency keywords from mentions.
    Returns top_n trending topics, deduplicated.
    """
    tag_counter: Counter[str] = Counter()

    for m in mentions:
        content = m.get("content", "")
        # Extract explicit hashtags
        tags = re.findall(r"#(\w{3,30})", content)
        for tag in tags:
            tag_counter[f"#{tag.lower()}"] += 1

    # Also scan for common study-abroad domain keywords
    domain_keywords = {
        "#visaupdates": ["visa update", "visa delay", "visa approved", "visa reject"],
        "#ielts": ["ielts"],
        "#studyabroad": ["study abroad"],
        "#scholarship": ["scholarship"],
        "#studentvisa": ["student visa"],
        "#mastersabroad": ["masters abroad", "ms abroad"],
        "#universityranking": ["university ranking", "qs ranking"],
        "#ieltsprep": ["ielts prep", "ielts preparation"],
    }

    for tag, keywords in domain_keywords.items():
        count = sum(
            1 for m in mentions
            if any(kw in m.get("content", "").lower() for kw in keywords)
        )
        if count > 0:
            tag_counter[tag] += count

    # Deduplicate: normalize all tags to lowercase, pick best casing
    seen: dict[str, int] = {}
    for tag, count in tag_counter.items():
        key = tag.lower()
        seen[key] = seen.get(key, 0) + count

    topics = sorted(seen.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [
        {
            "tag": tag,
            "mentions": count,
            "trend": "up" if count > 3 else ("stable" if count > 1 else "down"),
        }
        for tag, count in topics
    ]


def compute_dashboard_metrics(mentions: list[dict]) -> dict:
    """
    Compute aggregate metrics for the dashboard hero section.
    All mentions are LeapScholar-only (no competitors).
    """
    if not mentions:
        return {
            "net_sentiment": 50,
            "sentiment_change": 0.0,
            "total_mentions": 0,
            "avg_engagement": 0.0,
        }

    # Net Sentiment Score: map [-1, 1] → [0, 100]
    avg_sentiment = sum(m["sentiment_score"] for m in mentions) / len(mentions)
    net_sentiment = int(round((avg_sentiment + 1) * 50))  # 0-100 scale
    net_sentiment = max(0, min(100, net_sentiment))

    # Total engagement
    total_engagement = sum(
        m.get("likes", 0) + m.get("shares", 0) + m.get("comments", 0)
        for m in mentions
    )
    avg_engagement = round(total_engagement / len(mentions) / 1000, 1) if mentions else 0

    return {
        "net_sentiment": net_sentiment,
        "sentiment_change": round((avg_sentiment + 0.05) * 10, 1),  # Simulated weekly delta
        "total_mentions": len(mentions),
        "avg_engagement": avg_engagement,
    }


def compute_weekly_trend(mentions: list[dict]) -> list[dict]:
    """
    Generates a 7-day trend based on sentiment of recent mentions.
    For a real system, you'd query historical data from Supabase.
    """
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    chunk_size = max(1, len(mentions) // 7)

    trend = []
    for i, day in enumerate(days):
        chunk = mentions[i * chunk_size : (i + 1) * chunk_size]
        if chunk:
            avg = sum(m["sentiment_score"] for m in chunk) / len(chunk)
            score = int(round((avg + 1) * 50))
        else:
            score = 50
        trend.append({"day_label": day, "score": max(0, min(100, score))})

    return trend
