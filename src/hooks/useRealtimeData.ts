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
  const [dataSource, setDataSource] = useState<DataSource>(
    isSupabaseConfigured ? "live" : "mock"
  );
  const [mentions, setMentions] = useState<SocialMention[]>(mockMentions);
  const [sentimentBreakdown, setSentimentBreakdown] =
    useState<SentimentBreakdownData[]>(mockSentiment);
  const [platformBreakdown, setPlatformBreakdown] =
    useState<PlatformBreakdownData[]>(mockPlatforms);
  const [trendingTopics, setTrendingTopics] =
    useState<TrendingTopic[]>(mockTopics);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    netSentiment: mockSentimentScore,
    sentimentChange: mockChange,
    totalMentions: mockTotal,
    avgEngagement: mockEngagement,
  });
  const [weeklyTrend, setWeeklyTrend] = useState(mockWeekly);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<
    NonNullable<typeof supabase>["channel"]
  > | null>(null);

  const toggleDataSource = useCallback(() => {
    setDataSource((prev) => (prev === "mock" ? "live" : "mock"));
  }, []);

  // Fetch all data from Supabase
  const fetchLiveData = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all tables in parallel
      const [mentionsRes, sentimentRes, platformRes, topicsRes, metricsRes, trendRes] =
        await Promise.all([
          supabase
            .from("social_mentions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("sentiment_distribution")
            .select("*")
            .order("recorded_at", { ascending: false })
            .limit(3),
          supabase
            .from("platform_breakdown")
            .select("*")
            .order("recorded_at", { ascending: false })
            .limit(10),
          supabase
            .from("trending_topics")
            .select("*")
            .order("mentions", { ascending: false }),
          supabase
            .from("dashboard_metrics")
            .select("*")
            .order("recorded_at", { ascending: false })
            .limit(1),
          supabase.from("weekly_trend").select("*"),
        ]);

      // Log any query errors for debugging
      const errors = [
        mentionsRes.error && `mentions: ${mentionsRes.error.message}`,
        sentimentRes.error && `sentiment: ${sentimentRes.error.message}`,
        platformRes.error && `platforms: ${platformRes.error.message}`,
        topicsRes.error && `topics: ${topicsRes.error.message}`,
        metricsRes.error && `metrics: ${metricsRes.error.message}`,
        trendRes.error && `trend: ${trendRes.error.message}`,
      ].filter(Boolean);

      if (errors.length) {
        console.error("Supabase query errors:", errors);
        setError(errors.join("; "));
      }

      // Update mentions (use empty array if no data, don't fallback to mock)
      setMentions(
        mentionsRes.data?.length
          ? mentionsRes.data.map(mapDbMention)
          : []
      );

      // Update sentiment breakdown
      setSentimentBreakdown(
        sentimentRes.data?.length
          ? sentimentRes.data.map(
              (r: Record<string, unknown>) => ({
                label: r.label as string,
                value: r.value as number,
                count: r.count as number,
                color: SENTIMENT_COLORS[r.label as string] ?? "#94a3b8",
              })
            )
          : []
      );

      // Update platform breakdown
      setPlatformBreakdown(
        platformRes.data?.length
          ? platformRes.data.map(
              (r: Record<string, unknown>) => ({
                platform: r.platform as string,
                value: r.percentage as number,
                count: r.mention_count as number,
                color: PLATFORM_COLORS[r.platform as string] ?? "#6366f1",
              })
            )
          : []
      );

      // Update trending topics
      setTrendingTopics(
        topicsRes.data?.length
          ? topicsRes.data.map((r: Record<string, unknown>) => ({
              tag: r.tag as string,
              mentions: r.mentions as number,
              trend: r.trend as TrendingTopic["trend"],
            }))
          : []
      );

      // Update dashboard metrics
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

      // Update weekly trend
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
      console.error("Failed to fetch live data:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    if (dataSource !== "live" || !supabase) {
      // Clean up existing channel
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
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

    // Initial fetch
    fetchLiveData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("leappulse-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "social_mentions" },
        () => fetchLiveData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dashboard_metrics" },
        () => fetchLiveData()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase?.removeChannel(channel);
      channelRef.current = null;
    };
  }, [dataSource, fetchLiveData]);

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
