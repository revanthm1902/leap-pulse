export interface SocialMention {
  id: string;
  platform: "Twitter" | "Reddit" | "LinkedIn" | "Instagram" | "YouTube";
  content: string;
  sentiment_score: number; // -1 to 1
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  author: string;
  timestamp: string;
  priority: "CRITICAL ALERT" | "HIGH PRIORITY" | "MARKETING GOLD" | "NEUTRAL";
}

export interface ShareOfVoiceData {
  name: string;
  value: number;
  color: string;
}

export interface TrendingTopic {
  tag: string;
  mentions: number;
  trend: "up" | "down" | "stable";
}

// Priority Rule: sentiment < -0.5 AND likes > 50 → CRITICAL ALERT
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
  },
];

export const socialMentions: SocialMention[] = rawMentions.map((m) => ({
  ...m,
  priority: computePriority(m.sentiment_score, m.engagement.likes),
}));

export const shareOfVoiceData: ShareOfVoiceData[] = [
  { name: "LeapScholar", value: 48, color: "#6366f1" },
  { name: "Yocket", value: 31, color: "#818cf8" },
  { name: "IDP", value: 21, color: "#c7d2fe" },
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
