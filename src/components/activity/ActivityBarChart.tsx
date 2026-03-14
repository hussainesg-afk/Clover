"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface DayData {
  day: string;
  physical: number;
  mental: number;
  social: number;
}

const PHYSICAL_COLOR = "#22c55e";
const MENTAL_COLOR = "#8b5cf6";
const SOCIAL_COLOR = "#3b82f6";

export interface ActivityBarChartProps {
  data: DayData[];
}

export default function ActivityBarChart({ data }: ActivityBarChartProps) {
  const hasData = data.some((d) => d.physical > 0 || d.mental > 0 || d.social > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-bold text-stone-900">Activity this week</h3>
        <p className="text-sm text-stone-500">Mon - Sun</p>
        <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-stone-50 text-stone-500">
          No activity data yet. Add events to see your weekly breakdown.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900">Activity this week</h3>
        <p className="text-sm text-stone-500">Mon - Sun</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: PHYSICAL_COLOR }}
          />
          <span className="text-sm text-stone-600">Physical</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: MENTAL_COLOR }}
          />
          <span className="text-sm text-stone-600">Mental</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: SOCIAL_COLOR }}
          />
          <span className="text-sm text-stone-600">Social</span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#78716c" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e7e5e4",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [value, ""]}
            />
            <Legend
              wrapperStyle={{ display: "none" }}
              formatter={() => null}
            />
            <Bar dataKey="physical" stackId="a" fill={PHYSICAL_COLOR} radius={[0, 0, 0, 0]} />
            <Bar dataKey="mental" stackId="a" fill={MENTAL_COLOR} radius={[0, 0, 0, 0]} />
            <Bar dataKey="social" stackId="a" fill={SOCIAL_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
