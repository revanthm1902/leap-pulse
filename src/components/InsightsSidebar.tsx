import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
import { cn } from "../lib/utils";
import {
  shareOfVoiceData,
  trendingTopics,
  type TrendingTopic,
} from "../data/mockData";

function TrendIcon({ trend }: { trend: TrendingTopic["trend"] }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    case "down":
      return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-gray-300" />;
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
      fontSize={13}
      fontWeight={600}
    >
      {`${(pct * 100).toFixed(0)}%`}
    </text>
  );
}

export default function InsightsSidebar() {
  return (
    <aside className="flex flex-col gap-6">
      {/* Share of Voice */}
      <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium tracking-wide text-gray-400 uppercase">
          Share of Voice
        </h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={shareOfVoiceData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {shareOfVoiceData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-2 flex flex-col gap-2.5">
          {shareOfVoiceData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium tracking-wide text-gray-400 uppercase">
          Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <span
              key={topic.tag}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                topic.trend === "up"
                  ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : topic.trend === "down"
                    ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              <Hash className="h-3 w-3" />
              {topic.tag.replace("#", "")}
              <TrendIcon trend={topic.trend} />
            </span>
          ))}
        </div>

        {/* Top mentions list */}
        <div className="mt-5 flex flex-col gap-3">
          {trendingTopics.slice(0, 4).map((topic) => (
            <div
              key={topic.tag}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">{topic.tag}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {topic.mentions.toLocaleString()}
                </span>
                <TrendIcon trend={topic.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
