import { ArrowUpRight, Eye, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "../hooks/useTheme";

interface HeroMetricProps {
  netSentimentScore: number;
  sentimentChange: number;
  weeklyTrend: { day: string; score: number }[];
  totalMentions: number;
  avgEngagement: number;
}

function SentimentGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d="M 25 110 A 85 85 0 0 1 195 110"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ stroke: "var(--gauge-track)" }}
        />
        {/* Progress */}
        <path
          d="M 25 110 A 85 85 0 0 1 195 110"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="animate-gauge"
          filter="url(#glow)"
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (tick / 100) * Math.PI;
          const x1 = 110 + 95 * Math.cos(angle);
          const y1 = 110 - 95 * Math.sin(angle);
          const x2 = 110 + 88 * Math.cos(angle);
          const y2 = 110 - 88 * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              strokeWidth="1.5" strokeLinecap="round"
              style={{ stroke: "var(--gauge-tick)" }}
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center animate-fade-up">
        <span className="text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-heading)" }}>
          {score}
        </span>
        <span className="text-xs font-medium tracking-wider" style={{ color: "var(--text-muted)" }}>OUT OF 100</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="glass-card group flex items-start gap-4 rounded-2xl p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="section-label">{label}</span>
        <span className="mt-1 text-2xl font-bold leading-none" style={{ color: "var(--text-heading)" }}>{value}</span>
        <span className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{sub}</span>
      </div>
    </div>
  );
}

export default function HeroMetric({
  netSentimentScore,
  sentimentChange,
  weeklyTrend,
  totalMentions,
  avgEngagement,
}: HeroMetricProps) {
  const { theme } = useTheme();

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--tooltip-border)",
    background: "var(--tooltip-bg)",
    color: "var(--tooltip-text)",
    fontSize: "13px",
    boxShadow: "var(--tooltip-shadow)",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* Sentiment Gauge */}
      <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-6 pb-4 md:col-span-1">
        <span className="section-label mb-2">Net Sentiment Score</span>
        <SentimentGauge score={netSentimentScore} />
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {sentimentChange}% from last week
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass-card flex flex-col rounded-2xl p-5 md:col-span-1">
        <span className="section-label mb-3">7-Day Trend</span>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={weeklyTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sentGradientV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={theme === "dark" ? 0.25 : 0.12} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: theme === "dark" ? "#64748b" : "#94a3b8", fontWeight: 500 }}
                dy={8}
              />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: "#4338ca", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#sentGradientV2)"
                dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#4f46e5", strokeWidth: 2, stroke: theme === "dark" ? "#fff" : "#f8fafc" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat cards */}
      <StatCard
        label="Total Mentions"
        value={totalMentions.toLocaleString()}
        sub="Last 7 days"
        icon={<Eye className="h-5 w-5 text-indigo-400" />}
        accent="bg-indigo-500/15"
      />
      <StatCard
        label="Avg. Engagement"
        value={`${avgEngagement}K`}
        sub="Per mention"
        icon={<Users className="h-5 w-5 text-violet-400" />}
        accent="bg-violet-500/15"
      />
    </div>
  );
}
