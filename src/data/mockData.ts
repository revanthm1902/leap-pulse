export interface SocialMention {
  id: string;
  platform: "Twitter" | "Reddit" | "LinkedIn" | "Instagram" | "YouTube" | "GoogleNews";
  content: string;
  sentiment_score: number; // -1 to 1
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  author: string;
  timestamp: string;
  source_url?: string;
  priority: "CRITICAL ALERT" | "HIGH PRIORITY" | "MARKETING GOLD" | "NEUTRAL";
}

export interface SentimentBreakdownData {
  label: string;
  value: number;
  count: number;
  color: string;
}

export interface PlatformBreakdownData {
  platform: string;
  value: number;
  count: number;
  color: string;
}

export interface TrendingTopic {
  tag: string;
  mentions: number;
  trend: "up" | "down" | "stable";
}

// Priority classification aligned with backend sentiment.py
function computePriority(
  sentiment: number,
  likes: number
): SocialMention["priority"] {
  if (sentiment < -0.5 && likes > 50) return "CRITICAL ALERT";
  if (sentiment < -0.3) return "HIGH PRIORITY";
  if (sentiment > 0.6) return "MARKETING GOLD";
  return "NEUTRAL";
}

const rawMentions: Omit<SocialMention, "priority">[] = [
  {
    id: "1",
    platform: "Twitter",
    content:
      "Terrible experience with LeapScholar's visa support. Been waiting 3 weeks with zero updates. Absolutely frustrated! #disappointed",
    sentiment_score: -0.85,
    engagement: { likes: 342, shares: 89, comments: 56 },
    author: "@AnkitMehta_",
    timestamp: "2026-02-11T09:23:00Z",
    source_url: "https://x.com/AnkitMehta_/status/1",
  },
  {
    id: "2",
    platform: "Reddit",
    content:
      "The new IELTS prep module by LeapScholar is genuinely game-changing. Scored 8.0 on my first attempt after using it for just 3 weeks!",
    sentiment_score: 0.92,
    engagement: { likes: 578, shares: 134, comments: 91 },
    author: "u/StudyAbroad2026",
    timestamp: "2026-02-11T07:45:00Z",
    source_url: "https://reddit.com/r/IELTS/comments/example2",
  },
  {
    id: "3",
    platform: "LinkedIn",
    content:
      "LeapScholar's counselor team has been mediocre at best. Missed two scheduled calls and gave outdated university info. Not impressed.",
    sentiment_score: -0.62,
    engagement: { likes: 67, shares: 12, comments: 23 },
    author: "Priya Sharma",
    timestamp: "2026-02-10T18:30:00Z",
    source_url: "https://linkedin.com/posts/example3",
  },
  {
    id: "4",
    platform: "Instagram",
    content:
      "Just got my acceptance letter from University of Melbourne through LeapScholar! 🎉 The entire process was seamless. Highly recommend!",
    sentiment_score: 0.88,
    engagement: { likes: 1243, shares: 201, comments: 167 },
    author: "@rohit.dreams",
    timestamp: "2026-02-10T14:12:00Z",
    source_url: "https://instagram.com/p/example4",
  },
  {
    id: "5",
    platform: "YouTube",
    content:
      "Comparing study abroad consultants — LeapScholar vs Yocket vs IDP. LeapScholar's pricing is confusing and hidden fees are a concern.",
    sentiment_score: -0.45,
    engagement: { likes: 89, shares: 34, comments: 45 },
    author: "StudyVloggerIN",
    timestamp: "2026-02-09T21:00:00Z",
    source_url: "https://youtube.com/watch?v=example5",
  },
];

export const socialMentions: SocialMention[] = rawMentions.map((m) => ({
  ...m,
  priority: computePriority(m.sentiment_score, m.engagement.likes),
}));

export const sentimentBreakdown: SentimentBreakdownData[] = [
  { label: "Positive", value: 52, count: 26, color: "#22c55e" },
  { label: "Negative", value: 30, count: 15, color: "#ef4444" },
  { label: "Neutral", value: 18, count: 9, color: "#94a3b8" },
];

export const platformBreakdown: PlatformBreakdownData[] = [
  { platform: "Reddit", value: 36, count: 18, color: "#ff4500" },
  { platform: "Twitter", value: 24, count: 12, color: "#1d9bf0" },
  { platform: "LinkedIn", value: 16, count: 8, color: "#0a66c2" },
  { platform: "YouTube", value: 14, count: 7, color: "#ff0000" },
  { platform: "GoogleNews", value: 10, count: 5, color: "#4285f4" },
];

export const trendingTopics: TrendingTopic[] = [
  { tag: "#VisaUpdates", mentions: 2340, trend: "up" },
  { tag: "#IELTS", mentions: 1890, trend: "up" },
  { tag: "#StudyInAustralia", mentions: 1456, trend: "stable" },
  { tag: "#ScholarshipAlert", mentions: 1230, trend: "up" },
  { tag: "#UniversityRankings", mentions: 987, trend: "down" },
  { tag: "#StudentVisa", mentions: 876, trend: "up" },
  { tag: "#MastersAbroad", mentions: 754, trend: "stable" },
  { tag: "#IELTSPrep", mentions: 623, trend: "up" },
];

// Aggregate metrics
export const netSentimentScore = 78;
export const sentimentChange = 5;
export const totalMentions = 12_480;
export const avgEngagement = 4.2;

// Weekly sentiment trend data
export const weeklyTrend = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 74 },
  { day: "Thu", score: 71 },
  { day: "Fri", score: 76 },
  { day: "Sat", score: 80 },
  { day: "Sun", score: 78 },
];
