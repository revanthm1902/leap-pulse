import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  SocialMention,
  SentimentBreakdownData,
  PlatformBreakdownData,
  TrendingTopic,
} from "../data/mockData";
import {
  socialMentions as mockMentions,
  sentimentBreakdown as mockSentiment,
  platformBreakdown as mockPlatforms,
  trendingTopics as mockTopics,
  netSentimentScore as mockSentimentScore,
  sentimentChange as mockChange,
  totalMentions as mockTotal,
  avgEngagement as mockEngagement,
  weeklyTrend as mockWeekly,
} from "../data/mockData";

export type DataSource = "mock" | "live";

interface DashboardMetrics {
  netSentiment: number;
  sentimentChange: number;
  totalMentions: number;
  avgEngagement: number;
}

interface DashboardData {
  mentions: SocialMention[];
  sentimentBreakdown: SentimentBreakdownData[];
  platformBreakdown: PlatformBreakdownData[];
  trendingTopics: TrendingTopic[];
  metrics: DashboardMetrics;
  weeklyTrend: { day: string; score: number }[];
  dataSource: DataSource;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  toggleDataSource: () => void;
}

// Color palettes
const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#94a3b8",
};
const PLATFORM_COLORS: Record<string, string> = {
  Reddit: "#ff4500",
  Twitter: "#1d9bf0",
  LinkedIn: "#0a66c2",
  YouTube: "#ff0000",
  GoogleNews: "#4285f4",
  Instagram: "#e1306c",
};

// Empty-state defaults for live mode (visually distinct from mock)
const EMPTY_METRICS: DashboardMetrics = {
  netSentiment: 0,
  sentimentChange: 0,
  totalMentions: 0,
  avgEngagement: 0,
};
const EMPTY_TREND: { day: string; score: number }[] = [
  { day: "Mon", score: 0 }, { day: "Tue", score: 0 }, { day: "Wed", score: 0 },
  { day: "Thu", score: 0 }, { day: "Fri", score: 0 }, { day: "Sat", score: 0 },
  { day: "Sun", score: 0 },
];

// Map a raw API mention to our SocialMention interface
function mapApiMention(row: Record<string, unknown>, index: number): SocialMention {
  return {
    id: (row.id as string) ?? `api-${index}`,
    platform: (row.platform as SocialMention["platform"]) ?? "Twitter",
    content: (row.content as string) ?? "",
    sentiment_score: (row.sentiment_score as number) ?? 0,
    engagement: {
      likes: (row.likes as number) ?? 0,
      shares: (row.shares as number) ?? 0,
      comments: (row.comments as number) ?? 0,
    },
    author: (row.author as string) ?? "Unknown",
    timestamp: (row.created_at as string) ?? new Date().toISOString(),
    source_url: (row.source_url as string) ?? undefined,
    priority: (row.priority as SocialMention["priority"]) ?? "NEUTRAL",
  };
}

// Map a Supabase row to our SocialMention interface
function mapDbMention(row: Record<string, unknown>): SocialMention {
  return {
    id: row.id as string,
    platform: row.platform as SocialMention["platform"],
    content: row.content as string,
    sentiment_score: row.sentiment_score as number,
    engagement: {
      likes: (row.likes as number) ?? 0,
      shares: (row.shares as number) ?? 0,
      comments: (row.comments as number) ?? 0,
    },
    author: row.author as string,
    timestamp: row.created_at as string,
    source_url: (row.source_url as string) ?? undefined,
    priority: row.priority as SocialMention["priority"],
  };
}

export function useRealtimeData(): DashboardData {
  const [dataSource, setDataSource] = useState<DataSource>("mock");
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [sentimentBreakdown, setSentimentBreakdown] =
    useState<SentimentBreakdownData[]>([]);
  const [platformBreakdown, setPlatformBreakdown] =
    useState<PlatformBreakdownData[]>([]);
  const [trendingTopics, setTrendingTopics] =
    useState<TrendingTopic[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [weeklyTrend, setWeeklyTrend] = useState(EMPTY_TREND);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<
    NonNullable<typeof supabase>["channel"]
  > | null>(null);

  const toggleDataSource = useCallback(() => {
    setDataSource((prev) => (prev === "mock" ? "live" : "mock"));
  }, []);

  // Fetch from the FastAPI backend (real scraped data)
  const fetchFromApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/all");
      if (!resp.ok) {
        throw new Error(`API returned ${resp.status}`);
      }
      const data = await resp.json();

      // Map mentions
      const apiMentions: SocialMention[] = (data.mentions ?? []).map(
        (m: Record<string, unknown>, i: number) => mapApiMention(m, i)
      );
      setMentions(apiMentions);

      // Sentiment distribution
      setSentimentBreakdown(
        (data.sentiment_distribution ?? []).map(
          (r: Record<string, unknown>) => ({
            label: r.label as string,
            value: r.value as number,
            count: r.count as number,
            color: SENTIMENT_COLORS[r.label as string] ?? "#94a3b8",
          })
        )
      );

      // Platform breakdown
      setPlatformBreakdown(
        (data.platform_breakdown ?? []).map(
          (r: Record<string, unknown>) => ({
            platform: r.platform as string,
            value: r.percentage as number,
            count: r.mention_count as number,
            color: PLATFORM_COLORS[r.platform as string] ?? "#6366f1",
          })
        )
      );

      // Trending topics
      setTrendingTopics(
        (data.trending_topics ?? []).map((r: Record<string, unknown>) => ({
          tag: r.tag as string,
          mentions: r.mentions as number,
          trend: r.trend as TrendingTopic["trend"],
        }))
      );

      // Dashboard metrics
      if (data.dashboard_metrics && Object.keys(data.dashboard_metrics).length > 0) {
        const m = data.dashboard_metrics as Record<string, unknown>;
        setMetrics({
          netSentiment: (m.net_sentiment as number) ?? 0,
          sentimentChange: (m.sentiment_change as number) ?? 0,
          totalMentions: (m.total_mentions as number) ?? 0,
          avgEngagement: (m.avg_engagement as number) ?? 0,
        });
      } else {
        setMetrics(EMPTY_METRICS);
      }

      // Weekly trend
      setWeeklyTrend(
        (data.weekly_trend ?? []).length > 0
          ? (data.weekly_trend as Record<string, unknown>[]).map(
              (r: Record<string, unknown>) => ({
                day: r.day_label as string,
                score: r.score as number,
              })
            )
          : EMPTY_TREND
      );

      setLastUpdated(new Date());
    } catch {
      // If API is unreachable, fall back to Supabase or show error
      if (isSupabaseConfigured && supabase) {
        try {
          await fetchFromSupabase();
          return;
        } catch {
          // continue to error
        }
      }
      setError("Backend unavailable — switch to Mock Data or start the server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch from Supabase (fallback)
  const fetchFromSupabase = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setError(null);

    try {
      const [mentionsRes, sentimentRes, platformRes, topicsRes, metricsRes, trendRes] =
        await Promise.all([
          supabase.from("social_mentions").select("*").order("created_at", { ascending: false }).limit(50),
          supabase.from("sentiment_distribution").select("*").order("recorded_at", { ascending: false }).limit(3),
          supabase.from("platform_breakdown").select("*").order("recorded_at", { ascending: false }).limit(10),
          supabase.from("trending_topics").select("*").order("mentions", { ascending: false }),
          supabase.from("dashboard_metrics").select("*").order("recorded_at", { ascending: false }).limit(1),
          supabase.from("weekly_trend").select("*"),
        ]);

      setMentions(mentionsRes.data?.length ? mentionsRes.data.map(mapDbMention) : []);

      setSentimentBreakdown(
        sentimentRes.data?.length
          ? sentimentRes.data.map((r: Record<string, unknown>) => ({
              label: r.label as string,
              value: r.value as number,
              count: r.count as number,
              color: SENTIMENT_COLORS[r.label as string] ?? "#94a3b8",
            }))
          : []
      );

      setPlatformBreakdown(
        platformRes.data?.length
          ? platformRes.data.map((r: Record<string, unknown>) => ({
              platform: r.platform as string,
              value: r.percentage as number,
              count: r.mention_count as number,
              color: PLATFORM_COLORS[r.platform as string] ?? "#6366f1",
            }))
          : []
      );

      setTrendingTopics(
        topicsRes.data?.length
          ? topicsRes.data.map((r: Record<string, unknown>) => ({
              tag: r.tag as string,
              mentions: r.mentions as number,
              trend: r.trend as TrendingTopic["trend"],
            }))
          : []
      );

      if (metricsRes.data?.length) {
        const m = metricsRes.data[0] as Record<string, unknown>;
        setMetrics({
          netSentiment: m.net_sentiment as number,
          sentimentChange: m.sentiment_change as number,
          totalMentions: m.total_mentions as number,
          avgEngagement: m.avg_engagement as number,
        });
      } else {
        setMetrics(EMPTY_METRICS);
      }

      setWeeklyTrend(
        trendRes.data?.length
          ? trendRes.data.map((r: Record<string, unknown>) => ({
              day: r.day_label as string,
              score: r.score as number,
            }))
          : EMPTY_TREND
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch from Supabase:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to data changes
  useEffect(() => {
    if (dataSource !== "live") {
      // Clean up existing channel
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Load mock data when switching to mock
      if (dataSource === "mock") {
        setMentions(mockMentions);
        setSentimentBreakdown(mockSentiment);
        setPlatformBreakdown(mockPlatforms);
        setTrendingTopics(mockTopics);
        setMetrics({
          netSentiment: mockSentimentScore,
          sentimentChange: mockChange,
          totalMentions: mockTotal,
          avgEngagement: mockEngagement,
        });
        setWeeklyTrend(mockWeekly);
        setLastUpdated(null);
        setError(null);
      }
      return;
    }

    // Primary: fetch from FastAPI backend (real scraped data)
    fetchFromApi();

    // Also subscribe to Supabase real-time if configured
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("leappulse-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "social_mentions" },
          () => fetchFromApi()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "dashboard_metrics" },
          () => fetchFromApi()
        )
        .subscribe();

      channelRef.current = channel;

      return () => {
        supabase?.removeChannel(channel);
        channelRef.current = null;
      };
    }
  }, [dataSource, fetchFromApi]);

  return {
    mentions,
    sentimentBreakdown,
    platformBreakdown,
    trendingTopics,
    metrics,
    weeklyTrend,
    dataSource,
    isLoading,
    error,
    lastUpdated,
    toggleDataSource,
  };
}
