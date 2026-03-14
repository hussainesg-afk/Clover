"use client";

import { format } from "date-fns";
import { startOfWeek, endOfWeek } from "date-fns";

export interface WeeklySummaryHeroProps {
  firstName: string;
  activityCount: number;
  movementScore: number;
  enrichmentScore: number;
  wellbeingScore: number;
  movementVs: number;
  enrichmentVs: number;
  wellbeingVs: number;
}

function getDateRange() {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return {
    start: format(start, "d"),
    end: format(end, "d"),
    month: format(start, "MMMM"),
  };
}

export default function WeeklySummaryHero({
  firstName,
  activityCount,
  movementScore,
  enrichmentScore,
  wellbeingScore,
  movementVs,
  enrichmentVs,
  wellbeingVs,
}: WeeklySummaryHeroProps) {
  const { start, end, month } = getDateRange();

  const headline =
    activityCount > 0
      ? `A genuinely healthy week, ${firstName}.`
      : `Get started this week, ${firstName}.`;

  const summary =
    activityCount > 0
      ? `You completed ${activityCount} ${activityCount === 1 ? "activity" : "activities"}. Here's the real impact that's had on your health.`
      : "Add activities from Discover to see your health impact.";

  const metrics = [
    { label: "MOVEMENT", score: movementScore, vs: movementVs },
    { label: "ENRICHMENT", score: enrichmentScore, vs: enrichmentVs },
    { label: "WELLBEING", score: wellbeingScore, vs: wellbeingVs },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 to-teal-800 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
        This week - {start} - {end} {month}
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{headline}</h2>
      <p className="mt-3 text-sm text-white/95 sm:text-base">{summary}</p>

      <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex-1 min-w-[100px] rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm"
          >
            <p className="text-2xl font-bold">{m.score}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {m.label}
            </p>
            {m.vs !== 0 && (
              <p className="mt-1 text-xs text-emerald-200">
                {m.vs > 0 ? "+" : ""}
                {m.vs} vs last week
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
