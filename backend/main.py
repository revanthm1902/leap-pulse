"""
LeapPulse — Main Orchestrator
Runs all scrapers on a schedule and pushes data to Supabase.
Monitors only LeapScholar across all platforms.

Usage:
  python main.py              # Run once
  python main.py --schedule   # Run continuously on interval
"""

import sys
import time
from datetime import datetime

import schedule

from config import SCRAPE_INTERVAL, BRAND_NAME
from db import (
    upsert_mentions,
    upsert_platform_breakdown,
    upsert_sentiment_distribution,
    upsert_trending_topics,
    upsert_dashboard_metrics,
    upsert_weekly_trend,
)
from scrapers.reddit_scraper import scrape_reddit_all
from scrapers.twitter_scraper import scrape_twitter_brand
from scrapers.linkedin_scraper import scrape_linkedin_brand
from scrapers.google_news_scraper import scrape_news_brand
from scrapers.youtube_scraper import scrape_youtube_brand
from aggregator import (
    compute_sentiment_distribution,
    compute_platform_breakdown,
    extract_trending_topics,
    compute_dashboard_metrics,
    compute_weekly_trend,
)


def run_scrape_cycle():
    """Execute one full scrape → analyze → push cycle."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n{'='*60}")
    print(f"  LeapPulse Scrape Cycle — {timestamp}")
    print(f"  Monitoring: {BRAND_NAME}")
    print(f"{'='*60}\n")

    all_mentions: list[dict] = []

    # ── 1. Scrape all platforms for LeapScholar ──
    print("[1/5] Scraping Reddit...")
    all_mentions.extend(scrape_reddit_all(BRAND_NAME))

    print("\n[2/5] Scraping Twitter/X...")
    all_mentions.extend(scrape_twitter_brand(BRAND_NAME))

    print("\n[3/5] Scraping LinkedIn...")
    all_mentions.extend(scrape_linkedin_brand(BRAND_NAME))

    print("\n[4/5] Scraping Google News...")
    all_mentions.extend(scrape_news_brand(BRAND_NAME))

    print("\n[5/5] Scraping YouTube...")
    all_mentions.extend(scrape_youtube_brand(BRAND_NAME))

    print(f"\n{'─'*40}")
    print(f"  Total mentions scraped: {len(all_mentions)}")
    print(f"{'─'*40}\n")

    if not all_mentions:
        print("  ⚠ No mentions found — skipping database push")
        return

    # ── 2. Push raw mentions to Supabase ──
    print("[DB] Pushing mentions...")
    try:
        upsert_mentions(all_mentions)
    except Exception as e:
        print(f"  ✗ Error pushing mentions: {e}")

    # ── 3. Compute & push aggregates ──
    print("[DB] Computing Sentiment Distribution...")
    try:
        sentiment_dist = compute_sentiment_distribution(all_mentions)
        upsert_sentiment_distribution(sentiment_dist)
    except Exception as e:
        print(f"  ✗ Error with sentiment distribution: {e}")

    print("[DB] Computing Platform Breakdown...")
    try:
        platforms = compute_platform_breakdown(all_mentions)
        upsert_platform_breakdown(platforms)
    except Exception as e:
        print(f"  ✗ Error with platform breakdown: {e}")

    print("[DB] Extracting Trending Topics...")
    try:
        topics = extract_trending_topics(all_mentions)
        upsert_trending_topics(topics)
    except Exception as e:
        print(f"  ✗ Error with topics: {e}")

    print("[DB] Computing Dashboard Metrics...")
    try:
        metrics = compute_dashboard_metrics(all_mentions)
        upsert_dashboard_metrics(metrics)
    except Exception as e:
        print(f"  ✗ Error with metrics: {e}")

    print("[DB] Computing Weekly Trend...")
    try:
        trend = compute_weekly_trend(all_mentions)
        upsert_weekly_trend(trend)
    except Exception as e:
        print(f"  ✗ Error with weekly trend: {e}")

    # ── Summary ──
    critical = sum(1 for m in all_mentions if m["priority"] == "CRITICAL ALERT")
    gold = sum(1 for m in all_mentions if m["priority"] == "MARKETING GOLD")
    print(f"\n{'='*60}")
    print(f"  ✓ Cycle complete!")
    print(f"    Mentions: {len(all_mentions)} | Critical: {critical} | Gold: {gold}")
    print(f"{'='*60}\n")


def main():
    if "--schedule" in sys.argv:
        print(f"Starting scheduled scraping every {SCRAPE_INTERVAL} minutes...")
        print("Press Ctrl+C to stop.\n")

        # Run immediately on start
        run_scrape_cycle()

        # Schedule recurring runs
        schedule.every(SCRAPE_INTERVAL).minutes.do(run_scrape_cycle)

        while True:
            schedule.run_pending()
            time.sleep(30)
    else:
        # Single run
        run_scrape_cycle()


if __name__ == "__main__":
    main()
