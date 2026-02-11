"""
LeapPulse — Mock Data Seeder
Seeds Supabase with the same mock data used in the frontend,
useful for testing the Supabase → React pipeline without real scraping.

Usage:
  python seed_mock_data.py
"""

from db import (
    upsert_mentions,
    upsert_sentiment_distribution,
    upsert_platform_breakdown,
    upsert_trending_topics,
    upsert_dashboard_metrics,
    upsert_weekly_trend,
)


def seed():
    print("Seeding Supabase with mock data...\n")

    # ── Mentions ──
    mentions = [
        {
            "platform": "Twitter",
            "content": "Terrible experience with LeapScholar's visa support. Been waiting 3 weeks with zero updates. Absolutely frustrated! #disappointed",
            "sentiment_score": -0.85,
            "likes": 342,
            "shares": 89,
            "comments": 56,
            "author": "@AnkitMehta_",
            "source_url": "https://twitter.com/AnkitMehta_/status/example1",
            "priority": "CRITICAL ALERT",
        },
        {
            "platform": "Reddit",
            "content": "The new IELTS prep module by LeapScholar is genuinely game-changing. Scored 8.0 on my first attempt after using it for just 3 weeks!",
            "sentiment_score": 0.92,
            "likes": 578,
            "shares": 134,
            "comments": 91,
            "author": "u/StudyAbroad2026",
            "source_url": "https://reddit.com/r/IELTS/comments/example2",
            "priority": "MARKETING GOLD",
        },
        {
            "platform": "LinkedIn",
            "content": "LeapScholar's counselor team has been mediocre at best. Missed two scheduled calls and gave outdated university info. Not impressed.",
            "sentiment_score": -0.62,
            "likes": 67,
            "shares": 12,
            "comments": 23,
            "author": "Priya Sharma",
            "source_url": "https://linkedin.com/posts/example3",
            "priority": "CRITICAL ALERT",
        },
        {
            "platform": "Instagram",
            "content": "Just got my acceptance letter from University of Melbourne through LeapScholar! 🎉 The entire process was seamless. Highly recommend!",
            "sentiment_score": 0.88,
            "likes": 1243,
            "shares": 201,
            "comments": 167,
            "author": "@rohit.dreams",
            "source_url": "https://instagram.com/p/example4",
            "priority": "MARKETING GOLD",
        },
        {
            "platform": "YouTube",
            "content": "Comparing study abroad consultants — LeapScholar vs Yocket vs IDP. LeapScholar's pricing is confusing and hidden fees are a concern.",
            "sentiment_score": -0.45,
            "likes": 89,
            "shares": 34,
            "comments": 45,
            "author": "StudyVloggerIN",
            "source_url": "https://youtube.com/watch?v=example5",
            "priority": "HIGH PRIORITY",
        },
    ]
    upsert_mentions(mentions)

    # ── Sentiment Distribution ──
    sentiment_dist = [
        {"label": "Positive", "value": 52.0, "count": 26},
        {"label": "Negative", "value": 30.0, "count": 15},
        {"label": "Neutral", "value": 18.0, "count": 9},
    ]
    upsert_sentiment_distribution(sentiment_dist)

    # ── Platform Breakdown ──
    platform_data = [
        {"platform": "Reddit", "mention_count": 18, "percentage": 36.0},
        {"platform": "Twitter", "mention_count": 12, "percentage": 24.0},
        {"platform": "LinkedIn", "mention_count": 8, "percentage": 16.0},
        {"platform": "YouTube", "mention_count": 7, "percentage": 14.0},
        {"platform": "GoogleNews", "mention_count": 5, "percentage": 10.0},
    ]
    upsert_platform_breakdown(platform_data)

    # ── Trending Topics ──
    topics = [
        {"tag": "#VisaUpdates", "mentions": 2340, "trend": "up"},
        {"tag": "#IELTS", "mentions": 1890, "trend": "up"},
        {"tag": "#StudyInAustralia", "mentions": 1456, "trend": "stable"},
        {"tag": "#ScholarshipAlert", "mentions": 1230, "trend": "up"},
        {"tag": "#UniversityRankings", "mentions": 987, "trend": "down"},
        {"tag": "#StudentVisa", "mentions": 876, "trend": "up"},
        {"tag": "#MastersAbroad", "mentions": 754, "trend": "stable"},
        {"tag": "#IELTSPrep", "mentions": 623, "trend": "up"},
    ]
    upsert_trending_topics(topics)

    # ── Dashboard Metrics ──
    metrics = {
        "net_sentiment": 78,
        "sentiment_change": 5.0,
        "total_mentions": 12480,
        "avg_engagement": 4.2,
    }
    upsert_dashboard_metrics(metrics)

    # ── Weekly Trend ──
    weekly = [
        {"day_label": "Mon", "score": 72},
        {"day_label": "Tue", "score": 68},
        {"day_label": "Wed", "score": 74},
        {"day_label": "Thu", "score": 71},
        {"day_label": "Fri", "score": 76},
        {"day_label": "Sat", "score": 80},
        {"day_label": "Sun", "score": 78},
    ]
    upsert_weekly_trend(weekly)

    print("\n✓ Mock data seeded successfully!")
    print("  Your React dashboard should now show real-time data from Supabase.")


if __name__ == "__main__":
    seed()
