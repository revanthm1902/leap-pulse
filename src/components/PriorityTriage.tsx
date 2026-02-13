import {
  AlertTriangle,
  Sparkles,
  MessageCircle,
  Heart,
  Share2,
  ExternalLink,
  CircleAlert,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { SocialMention } from "../data/mockData";

const platformConfig: Record<
  string,
  { icon: string; bg: string; ring: string }
> = {
  Twitter: { icon: "𝕏", bg: "bg-gray-900 text-white", ring: "ring-gray-900/10" },
  Reddit: { icon: "◉", bg: "bg-orange-500 text-white", ring: "ring-orange-500/10" },
  LinkedIn: { icon: "in", bg: "bg-blue-600 text-white", ring: "ring-blue-600/10" },
  Instagram: { icon: "◎", bg: "bg-gradient-to-br from-purple-500 to-pink-500 text-white", ring: "ring-pink-500/10" },
  YouTube: { icon: "▶", bg: "bg-red-600 text-white", ring: "ring-red-600/10" },
  GoogleNews: { icon: "G", bg: "bg-blue-500 text-white", ring: "ring-blue-500/10" },
};

function getPriorityStyle(priority: SocialMention["priority"]) {
  switch (priority) {
    case "CRITICAL ALERT":
      return {
        border: "border-l-red-500",
        badgeBg: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
        icon: <CircleAlert className="h-3 w-3" />,
        label: "CRITICAL",
        glow: "shadow-red-500/5",
      };
    case "HIGH PRIORITY":
      return {
        border: "border-l-amber-400",
        badgeBg: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
        icon: <AlertTriangle className="h-3 w-3" />,
        label: "HIGH",
        glow: "shadow-amber-500/5",
      };
    case "MARKETING GOLD":
      return {
        border: "border-l-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
        icon: <Sparkles className="h-3 w-3" />,
        label: "GOLD",
        glow: "shadow-emerald-500/5",
      };
    default:
      return {
        border: "border-l-slate-300",
        badgeBg: "bg-slate-500/10 text-slate-400",
        icon: null,
        label: "",
        glow: "",
      };
  }
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffHours = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60)
  );
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function SentimentMeter({ score }: { score: number }) {
  const isPositive = score > 0;
  const width = Math.abs(score) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "var(--bar-track)" }}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isPositive
              ? "bg-linear-to-r from-emerald-400 to-emerald-500"
              : "bg-linear-to-r from-red-400 to-red-500"
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={cn(
          "min-w-12 text-right text-xs font-semibold tabular-nums",
          isPositive ? "text-emerald-500" : "text-red-500"
        )}
      >
        {isPositive ? "+" : ""}
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function AlertCard({
  mention,
  index,
}: {
  mention: SocialMention;
  index: number;
}) {
  const style = getPriorityStyle(mention.priority);
  const platform = platformConfig[mention.platform];

  return (
    <div
      className={cn(
        "solid-card animate-slide-in group rounded-2xl border-l-[3px] p-4 sm:p-5",
        style.border,
        style.glow
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top row: platform + author + badge */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-2",
              platform.bg,
              platform.ring
            )}
          >
            {platform.icon}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
              {mention.author}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {mention.platform} · {timeAgo(mention.timestamp)}
            </span>
          </div>
        </div>
        {style.label && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold tracking-wide uppercase",
              style.badgeBg
            )}
          >
            {style.icon}
            {style.label}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="mb-4 text-[13px] leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
        {mention.content}
      </p>

      {/* Bottom row: engagement + sentiment */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1 rounded-md px-2 py-1" style={{ background: "var(--overlay)" }}>
            <Heart className="h-3 w-3 text-pink-400" />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {mention.engagement.likes.toLocaleString()}
            </span>
          </span>
          <span className="flex items-center gap-1 rounded-md px-2 py-1" style={{ background: "var(--overlay)" }}>
            <Share2 className="h-3 w-3 text-blue-400" />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {mention.engagement.shares}
            </span>
          </span>
          <span className="hidden items-center gap-1 rounded-md px-2 py-1 sm:flex" style={{ background: "var(--overlay)" }}>
            <MessageCircle className="h-3 w-3 text-indigo-400" />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {mention.engagement.comments}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SentimentMeter score={mention.sentiment_score} />
          {mention.source_url && (
            <a
              href={mention.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-indigo-400 transition-all hover:bg-indigo-500/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PriorityTriage({ mentions }: { mentions: SocialMention[] }) {
  const priorityOrder: Record<string, number> = {
    "CRITICAL ALERT": 0,
    "HIGH PRIORITY": 1,
    "MARKETING GOLD": 2,
    NEUTRAL: 3,
  };

  const sorted = [...mentions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const criticalCount = sorted.filter(
    (m) => m.priority === "CRITICAL ALERT"
  ).length;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold sm:text-lg" style={{ color: "var(--text-heading)" }}>
            Priority Triage
          </h2>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 ring-1 ring-red-500/20">
              <CircleAlert className="h-3 w-3" />
              {criticalCount} critical
            </span>
          )}
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-medium" style={{ background: "var(--overlay)", color: "var(--text-secondary)" }}>
          {mentions.length} mentions
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-12 text-center">
            <MessageCircle className="mb-3 h-8 w-8" style={{ color: "var(--text-faint)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No mentions found</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>Run the scraper or switch to Mock Data</p>
          </div>
        ) : (
          sorted.map((mention, i) => (
            <AlertCard key={mention.id} mention={mention} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
