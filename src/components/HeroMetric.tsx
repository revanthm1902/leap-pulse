import { ArrowUpRight } from "lucide-react";
import {
  netSentimentScore,
  sentimentChange,
  weeklyTrend,
  totalMentions,
  avgEngagement,
} from "../data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function SentimentGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = Math.PI * radius; // semi-circle
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  // Color based on score
  const getColor = (s: number) => {
    if (s >= 70) return "#6366f1";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="animate-gauge"
        />
      </svg>
      {/* Score display */}
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-4xl font-bold text-gray-900">{score}</span>
        <span className="text-sm text-gray-400">/100</span>
      </div>
    </div>
  );
}

export default function HeroMetric() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Sentiment Gauge */}
      <div className="card-hover flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm lg:col-span-1">
        <h2 className="mb-1 text-sm font-medium tracking-wide text-gray-400 uppercase">
          Net Sentiment Score
        </h2>
        <SentimentGauge score={netSentimentScore} />
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600">
          <ArrowUpRight className="h-4 w-4" />
          <span>↑ {sentimentChange}% from last week</span>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card-hover flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
        <h2 className="mb-4 text-sm font-medium tracking-wide text-gray-400 uppercase">
          Sentiment Trend
        </h2>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                domain={[60, 90]}
                hide
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#sentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:col-span-1">
        <div className="card-hover flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
            Total Mentions
          </span>
          <span className="mt-2 text-3xl font-bold text-gray-900">
            {totalMentions.toLocaleString()}
          </span>
          <span className="mt-1 text-xs text-gray-400">Last 7 days</span>
        </div>
        <div className="card-hover flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <span className="text-sm font-medium tracking-wide text-gray-400 uppercase">
            Avg. Engagement
          </span>
          <span className="mt-2 text-3xl font-bold text-gray-900">
            {avgEngagement}K
          </span>
          <span className="mt-1 text-xs text-gray-400">Per mention</span>
        </div>
      </div>
    </div>
  );
}
