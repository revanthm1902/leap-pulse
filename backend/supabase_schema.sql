-- ============================================================
-- LeapPulse — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- 1. Social Mentions table
CREATE TABLE IF NOT EXISTS social_mentions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform      TEXT NOT NULL CHECK (platform IN ('Twitter','Reddit','LinkedIn','Instagram','YouTube','GoogleNews')),
  content       TEXT NOT NULL,
  sentiment_score FLOAT NOT NULL DEFAULT 0,        -- -1.0 to 1.0
  likes         INT NOT NULL DEFAULT 0,
  shares        INT NOT NULL DEFAULT 0,
  comments      INT NOT NULL DEFAULT 0,
  author        TEXT NOT NULL DEFAULT 'unknown',
  source_url    TEXT,
  priority      TEXT NOT NULL DEFAULT 'NEUTRAL'
                  CHECK (priority IN ('CRITICAL ALERT','HIGH PRIORITY','MARKETING GOLD','NEUTRAL')),
  scraped_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Sentiment distribution snapshots (positive / negative / neutral %)
CREATE TABLE IF NOT EXISTS sentiment_distribution (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label         TEXT NOT NULL CHECK (label IN ('Positive','Negative','Neutral')),
  value         FLOAT NOT NULL DEFAULT 0,  -- percentage
  count         INT NOT NULL DEFAULT 0,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2b. Platform breakdown (mentions per platform %)
CREATE TABLE IF NOT EXISTS platform_breakdown (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform      TEXT NOT NULL,
  mention_count INT NOT NULL DEFAULT 0,
  percentage    FLOAT NOT NULL DEFAULT 0,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trending topics
CREATE TABLE IF NOT EXISTS trending_topics (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag           TEXT NOT NULL,
  mentions      INT NOT NULL DEFAULT 0,
  trend         TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up','down','stable')),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Aggregate metrics snapshot
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  net_sentiment     INT NOT NULL DEFAULT 0,
  sentiment_change  FLOAT NOT NULL DEFAULT 0,
  total_mentions    INT NOT NULL DEFAULT 0,
  avg_engagement    FLOAT NOT NULL DEFAULT 0,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Weekly trend data points
CREATE TABLE IF NOT EXISTS weekly_trend (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_label     TEXT NOT NULL,
  score         INT NOT NULL DEFAULT 0,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_mentions_scraped ON social_mentions (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_priority ON social_mentions (priority);
CREATE INDEX IF NOT EXISTS idx_sentiment_dist_recorded ON sentiment_distribution (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_break_recorded ON platform_breakdown (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_recorded ON trending_topics (recorded_at DESC);

-- ── Enable Realtime ──
-- Go to Supabase Dashboard → Database → Replication and enable
-- realtime for: social_mentions, dashboard_metrics
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE social_mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_metrics;

-- ── Row Level Security (open read for anon, write for service_role) ──
ALTER TABLE social_mentions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_breakdown     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_trend           ENABLE ROW LEVEL SECURITY;

-- Allow anon reads
CREATE POLICY "anon_read_mentions"   ON social_mentions        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_sentiment"  ON sentiment_distribution FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_platforms"  ON platform_breakdown     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_topics"     ON trending_topics        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_metrics"    ON dashboard_metrics      FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_weekly"     ON weekly_trend           FOR SELECT TO anon USING (true);

-- Allow service_role full access (scrapers use service key)
CREATE POLICY "service_all_mentions"   ON social_mentions        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_sentiment"  ON sentiment_distribution FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_platforms"  ON platform_breakdown     FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_topics"     ON trending_topics        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_metrics"    ON dashboard_metrics      FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_weekly"     ON weekly_trend           FOR ALL TO service_role USING (true);
