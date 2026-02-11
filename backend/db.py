"""
LeapPulse — Supabase Client
Thin wrapper around supabase-py for inserting scraped data.
"""

from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client


# ── Insert helpers ───────────────────────────────────────────

def upsert_mentions(mentions: list[dict]) -> None:
    """Insert new social mentions (dedupes on content hash)."""
    if not mentions:
        return
    client = get_client()
    client.table("social_mentions").insert(mentions).execute()
    print(f"  ✓ Inserted {len(mentions)} mentions")


def upsert_sentiment_distribution(data: list[dict]) -> None:
    client = get_client()
    client.table("sentiment_distribution").insert(data).execute()
    print(f"  ✓ Inserted {len(data)} sentiment distribution records")


def upsert_platform_breakdown(data: list[dict]) -> None:
    client = get_client()
    client.table("platform_breakdown").insert(data).execute()
    print(f"  ✓ Inserted {len(data)} platform breakdown records")


def upsert_trending_topics(topics: list[dict]) -> None:
    client = get_client()
    client.table("trending_topics").insert(topics).execute()
    print(f"  ✓ Inserted {len(topics)} trending topics")


def upsert_dashboard_metrics(metrics: dict) -> None:
    client = get_client()
    client.table("dashboard_metrics").insert(metrics).execute()
    print("  ✓ Updated dashboard metrics")


def upsert_weekly_trend(data: list[dict]) -> None:
    client = get_client()
    client.table("weekly_trend").insert(data).execute()
    print(f"  ✓ Inserted {len(data)} weekly trend points")
