import {
  AlertTriangle,
  Sparkles,
  MessageCircle,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { SocialMention } from "../data/mockData";
import { socialMentions } from "../data/mockData";

const platformIcons: Record<string, string> = {
  Twitter: "𝕏",
  Reddit: "◉",
  LinkedIn: "in",
  Instagram: "◎",
  YouTube: "▶",
};

const platformColors: Record<string, string> = {
  Twitter: "bg-gray-900 text-white",
  Reddit: "bg-orange-500 text-white",
  LinkedIn: "bg-blue-600 text-white",
  Instagram: "bg-pink-500 text-white",
  YouTube: "bg-red-600 text-white",
};

function getBorderColor(priority: SocialMention["priority"]): string {
  switch (priority) {
    case "CRITICAL ALERT":
      return "border-l-red-500";
    case "HIGH PRIORITY":
      return "border-l-amber-500";
    case "MARKETING GOLD":
      return "border-l-emerald-500";
    default:
      return "border-l-gray-200";
  }
}

function getBadge(priority: SocialMention["priority"]) {
  switch (priority) {
    case "CRITICAL ALERT":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3 w-3" />
          CRITICAL ALERT
        </span>
      );
    case "HIGH PRIORITY":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          HIGH PRIORITY
        </span>
      );
    case "MARKETING GOLD":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <Sparkles className="h-3 w-3" />
          MARKETING GOLD
        </span>
      );
    default:
      return null;
  }
}

function timeAgo(timestamp: string): string {
  const now = new Date("2026-02-11T12:00:00Z");
  const then = new Date(timestamp);
  const diffHours = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60)
  );
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function AlertCard({ mention }: { mention: SocialMention }) {
  return (
    <div
      className={cn(
        "card-hover rounded-xl border border-gray-100 border-l-4 bg-white p-5 shadow-sm",
        getBorderColor(mention.priority)
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
              platformColors[mention.platform]
            )}
          >
            {platformIcons[mention.platform]}
          </span>
          <div>
            <span className="text-sm font-semibold text-gray-900">
              {mention.author}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {mention.platform} · {timeAgo(mention.timestamp)}
            </span>
          </div>
        </div>
        {getBadge(mention.priority)}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        {mention.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {mention.engagement.likes.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3.5 w-3.5" />
            {mention.engagement.shares}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {mention.engagement.comments}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sentiment bar */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  "h-full rounded-full",
                  mention.sentiment_score > 0 ? "bg-emerald-500" : "bg-red-500"
                )}
                style={{
                  width: `${Math.abs(mention.sentiment_score) * 100}%`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                mention.sentiment_score > 0
                  ? "text-emerald-600"
                  : "text-red-600"
              )}
            >
              {mention.sentiment_score > 0 ? "+" : ""}
              {(mention.sentiment_score * 100).toFixed(0)}%
            </span>
          </div>
          <button className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-50 hover:text-gray-500">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PriorityTriage() {
  // Sort: CRITICAL → HIGH → MARKETING GOLD → NEUTRAL
  const priorityOrder: Record<string, number> = {
    "CRITICAL ALERT": 0,
    "HIGH PRIORITY": 1,
    "MARKETING GOLD": 2,
    NEUTRAL: 3,
  };

  const sorted = [...socialMentions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Priority Triage Feed
        </h2>
        <span className="text-xs text-gray-400">
          {socialMentions.length} active mentions
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {sorted.map((mention) => (
          <AlertCard key={mention.id} mention={mention} />
        ))}
      </div>
    </section>
  );
}
