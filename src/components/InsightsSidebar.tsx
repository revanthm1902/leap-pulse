import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { TrendingUp, TrendingDown, Minus, Hash, PieChartIcon, Globe } from "lucide-react";
import { cn } from "../lib/utils";
import type {
  SentimentBreakdownData,
  PlatformBreakdownData,
  TrendingTopic,
} from "../data/mockData";

interface InsightsSidebarProps {
  sentimentBreakdown: SentimentBreakdownData[];
  platformBreakdown: PlatformBreakdownData[];
  trendingTopics: TrendingTopic[];
}

function TrendIcon({ trend }: { trend: TrendingTopic["trend"] }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    case "down":
      return <TrendingDown className="h-3 w-3 text-red-400" />;
    default:
      return <Minus className="h-3 w-3 text-gray-300" />;
  }
}

const RADIAN = Math.PI / 180;

function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const cxNum = Number(cx);
  const cyNum = Number(cy);
  const innerR = Number(innerRadius);
  const outerR = Number(outerRadius);
  const angle = Number(midAngle);
  const pct = Number(percent);
  const radius = innerR + (outerR - innerR) * 0.5;
  const x = cxNum + radius * Math.cos(-angle * RADIAN);
  const y = cyNum + radius * Math.sin(-angle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(pct * 100).toFixed(0)}%`}
    </text>
  );
}

export default function InsightsSidebar({ sentimentBreakdown, platformBreakdown, trendingTopics }: InsightsSidebarProps) {
  return (
    <aside className="flex flex-col gap-5">
      {/* Sentiment Distribution */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-indigo-500" />
          <span className="section-label">Sentiment Distribution</span>
        </div>

        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={sentimentBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="label"
                labelLine={false}
                label={renderCustomLabel}
                cornerRadius={4}
              >
                {sentimentBreakdown.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-col gap-2">
          {sentimentBreakdown.map((entry) => (
            <div
              key={entry.label}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {entry.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{entry.count}</span>
                <span className="text-sm font-bold tabular-nums text-gray-900">
                  {entry.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="section-label">Platform Breakdown</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {platformBreakdown.map((entry) => (
            <div key={entry.platform} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {entry.platform === "GoogleNews" ? "Google News" : entry.platform}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{entry.count}</span>
                  <span className="text-xs font-bold tabular-nums text-gray-900">
                    {entry.value}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${entry.value}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Hash className="h-4 w-4 text-violet-500" />
          <span className="section-label">Trending Topics</span>
        </div>

        {/* Tag cloud */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {trendingTopics.map((topic) => (
            <button
              key={topic.tag}
              className={cn(
                "group inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                topic.trend === "up"
                  ? "bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 hover:shadow-sm"
                  : topic.trend === "down"
                    ? "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              {topic.tag.replace("#", "")}
              <TrendIcon trend={topic.trend} />
            </button>
          ))}
        </div>

        {/* Mentions ranking */}
        <div className="flex flex-col gap-1">
          {trendingTopics.slice(0, 5).map((topic, idx) => {
            const maxMentions = trendingTopics[0].mentions;
            const barWidth = (topic.mentions / maxMentions) * 100;
            return (
              <div
                key={topic.tag}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
              >
                <span className="w-4 text-right text-[10px] font-bold text-gray-300">
                  {idx + 1}
                </span>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium text-gray-700">
                      {topic.tag}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-bold tabular-nums text-gray-900">
                        {topic.mentions.toLocaleString()}
                      </span>
                      <TrendIcon trend={topic.trend} />
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-indigo-400 to-violet-400 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
