"""
LeapPulse — FastAPI Server
Expose real-time scraped data via REST endpoints.
The frontend fetches from these endpoints for live data.

Usage:
  uvicorn server:app --reload --port 8000
"""

import logging
import os
import time
import threading
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import BRAND_NAME
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

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("leappulse")

# In-memory cache for scraped data
_cache: dict = {
    "mentions": [],
    "sentiment_distribution": [],
    "platform_breakdown": [],
    "trending_topics": [],
    "dashboard_metrics": {},
    "weekly_trend": [],
    "last_scraped": None,
    "is_scraping": False,
    "brand": BRAND_NAME,
}
_lock = threading.Lock()

# Cache TTL: 10 minutes (configurable via env)
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL", "600"))


def _needs_refresh() -> bool:
    if _cache["last_scraped"] is None:
        return True
    elapsed = (datetime.now() - _cache["last_scraped"]).total_seconds()
    return elapsed > CACHE_TTL_SECONDS


def _run_scrape():
    """Execute scrapers and update the cache."""
    with _lock:
        if _cache["is_scraping"]:
            return
        _cache["is_scraping"] = True

    try:
        brand = BRAND_NAME
        all_mentions: list[dict] = []

        log.info("Scraping '%s' across all platforms…", brand)

        for label, scraper in [
            ("Reddit", lambda: scrape_reddit_all(brand)),
            ("Twitter", lambda: scrape_twitter_brand(brand)),
            ("LinkedIn", lambda: scrape_linkedin_brand(brand)),
            ("Google News", lambda: scrape_news_brand(brand)),
            ("YouTube", lambda: scrape_youtube_brand(brand)),
        ]:
            try:
                results = scraper()
                all_mentions.extend(results)
                log.info("  %-12s %d mentions", label, len(results))
            except Exception as e:
                log.warning("  %-12s FAILED: %s", label, e)

        log.info("  Total: %d mentions", len(all_mentions))

        # Compute aggregates
        sentiment_dist = compute_sentiment_distribution(all_mentions)
        platform_brkdn = compute_platform_breakdown(all_mentions)
        topics = extract_trending_topics(all_mentions)
        metrics = compute_dashboard_metrics(all_mentions)
        weekly = compute_weekly_trend(all_mentions)

        # Assign unique IDs and inject created_at
        ts = int(time.time())
        for i, m in enumerate(all_mentions):
            m["id"] = f"live-{i}-{ts}"
            m["created_at"] = datetime.now().isoformat()

        with _lock:
            _cache["mentions"] = all_mentions
            _cache["sentiment_distribution"] = sentiment_dist
            _cache["platform_breakdown"] = platform_brkdn
            _cache["trending_topics"] = topics
            _cache["dashboard_metrics"] = metrics
            _cache["weekly_trend"] = weekly
            _cache["last_scraped"] = datetime.now()

        log.info("Scrape complete — cache refreshed.")

    except Exception as exc:
        log.exception("Unexpected error during scrape: %s", exc)

    finally:
        with _lock:
            _cache["is_scraping"] = False


def _ensure_data():
    """Trigger a background scrape if cache is stale."""
    if _needs_refresh() and not _cache["is_scraping"]:
        t = threading.Thread(target=_run_scrape, daemon=True)
        t.start()
        # Wait up to 90s for first scrape to complete
        if _cache["last_scraped"] is None:
            t.join(timeout=90)


# ── App lifecycle ──

@asynccontextmanager
async def lifespan(application: FastAPI):
    """Kick off initial scrape on startup."""
    log.info("LeapPulse API starting for brand: %s", BRAND_NAME)
    threading.Thread(target=_run_scrape, daemon=True).start()
    yield
    log.info("LeapPulse API shutting down.")


app = FastAPI(
    title="LeapPulse API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the frontend dev server and any production origin
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "brand": BRAND_NAME,
        "last_scraped": _cache["last_scraped"].isoformat() if _cache["last_scraped"] else None,
        "mention_count": len(_cache["mentions"]),
    }


@app.get("/api/mentions")
def get_mentions():
    _ensure_data()
    return _cache["mentions"]


@app.get("/api/sentiment")
def get_sentiment():
    _ensure_data()
    return _cache["sentiment_distribution"]


@app.get("/api/platforms")
def get_platforms():
    _ensure_data()
    return _cache["platform_breakdown"]


@app.get("/api/topics")
def get_topics():
    _ensure_data()
    return _cache["trending_topics"]


@app.get("/api/metrics")
def get_metrics():
    _ensure_data()
    return _cache["dashboard_metrics"]


@app.get("/api/trend")
def get_trend():
    _ensure_data()
    return _cache["weekly_trend"]


@app.get("/api/all")
def get_all():
    """Single endpoint returning the full dashboard payload."""
    _ensure_data()
    return {
        "mentions": _cache["mentions"],
        "sentiment_distribution": _cache["sentiment_distribution"],
        "platform_breakdown": _cache["platform_breakdown"],
        "trending_topics": _cache["trending_topics"],
        "dashboard_metrics": _cache["dashboard_metrics"],
        "weekly_trend": _cache["weekly_trend"],
        "last_scraped": _cache["last_scraped"].isoformat() if _cache["last_scraped"] else None,
        "brand": BRAND_NAME,
    }


@app.post("/api/refresh")
def refresh_data():
    """Force a fresh scrape."""
    _run_scrape()
    return {"status": "refreshed", "mention_count": len(_cache["mentions"])}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    log.info("Starting on port %d for brand: %s", port, BRAND_NAME)
    uvicorn.run(app, host="0.0.0.0", port=port)
