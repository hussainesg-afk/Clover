"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startOfWeek, endOfWeek, getDay, format, addDays } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { db } from "@/lib/db";
import { normalizeEvent } from "@/lib/event-normalizer";
import { filterEventsWithDebug } from "@/lib/filter-events";
import { getCalendarEventIds } from "@/lib/calendar-events";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { classifyActivityType } from "@/lib/activity-classifier";
import { useHealthSummaries } from "@/lib/health-data";
import AuthGate from "@/components/AuthGate";
import LoadingScreen from "@/components/LoadingScreen";
import WeeklySummaryHero from "@/components/activity/WeeklySummaryHero";
import ActivityBarChart, { type DayData } from "@/components/activity/ActivityBarChart";
import HealthImpactCard from "@/components/activity/HealthImpactCard";
import CloverInsightCard from "@/components/activity/CloverInsightCard";
import WeeklyGoalCard from "@/components/activity/WeeklyGoalCard";
import type { Event } from "@/components/EventCard";

function getGreetingName(email: string | null | undefined): string {
  if (!email) return "";
  const part = email.split("@")[0];
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getMondayBasedDay(date: Date): number {
  return (getDay(date) + 6) % 7;
}

function computeWeeklyData(
  events: Event[],
  weekStart: Date,
  weekEnd: Date
): {
  weekEvents: Event[];
  dailyData: DayData[];
  physicalCount: number;
  mentalCount: number;
  socialCount: number;
} {
  const daily: Record<number, { physical: number; mental: number; social: number }> = {
    0: { physical: 0, mental: 0, social: 0 },
    1: { physical: 0, mental: 0, social: 0 },
    2: { physical: 0, mental: 0, social: 0 },
    3: { physical: 0, mental: 0, social: 0 },
    4: { physical: 0, mental: 0, social: 0 },
    5: { physical: 0, mental: 0, social: 0 },
    6: { physical: 0, mental: 0, social: 0 },
  };

  let physicalCount = 0;
  let mentalCount = 0;
  let socialCount = 0;

  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekEnd.getTime();

  for (const event of events) {
    const d = parseEventDateTime(event.startDateTime ?? "");
    if (!d) continue;
    const ms = d.getTime();
    if (ms < weekStartMs || ms > weekEndMs) continue;

    const type = classifyActivityType(event);
    const day = getMondayBasedDay(d);

    if (type === "physical") {
      daily[day].physical++;
      physicalCount++;
    } else if (type === "mental") {
      daily[day].mental++;
      mentalCount++;
    } else {
      daily[day].social++;
      socialCount++;
    }
  }

  const dailyData: DayData[] = DAY_LABELS.map((day, i) => ({
    day,
    physical: daily[i].physical,
    mental: daily[i].mental,
    social: daily[i].social,
  }));

  const weekEvents = events.filter((e) => {
    const d = parseEventDateTime(e.startDateTime ?? "");
    if (!d) return false;
    const ms = d.getTime();
    return ms >= weekStartMs && ms <= weekEndMs;
  });

  return {
    weekEvents,
    dailyData,
    physicalCount,
    mentalCount,
    socialCount,
  };
}

function computePillarScores(
  physicalCount: number,
  mentalCount: number,
  socialCount: number
): { movement: number; enrichment: number; wellbeing: number } {
  const movement = Math.min(99, 70 + physicalCount * 5);
  const enrichment = Math.min(99, 75 + mentalCount * 5);
  const wellbeing = Math.min(99, 80 + socialCount * 4);
  return { movement, enrichment, wellbeing };
}

function getInsightText(
  activityCount: number,
  physicalCount: number,
  mentalCount: number,
  socialCount: number
): string {
  if (activityCount === 0) {
    return "Complete activities from Discover to receive personalized insights about your health. Research shows that a mix of physical, creative, and social activity delivers compounding benefits greater than any single activity type alone.";
  }
  const parts: string[] = [];
  if (physicalCount > 0) parts.push("physical");
  if (mentalCount > 0) parts.push("creative");
  if (socialCount > 0) parts.push("social");
  const mix = parts.join(", ");
  return `This week you balanced ${mix} activity - a combination that research consistently shows delivers compounding health benefits greater than any single activity type alone. Sustaining this pattern over 8 weeks has been linked to meaningful improvements in sleep quality, mood stability, and long-term disease resistance.`;
}

function formatNum(n: number): string {
  return n.toLocaleString("en-GB");
}

function AppleHealthSection({
  userId,
}: {
  userId: string;
}) {
  const { summaries, isLoading } = useHealthSummaries(userId);

  const last30 = useMemo(() => {
    if (summaries.length === 0) return [];
    const now = new Date();
    const cutoff = format(addDays(now, -30), "yyyy-MM-dd");
    return summaries.filter((s) => s.date >= cutoff && (s.steps ?? 0) > 0);
  }, [summaries]);

  const weeklyAverages = useMemo(() => {
    if (last30.length === 0) return null;

    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weeks: { label: string; avgSteps: number }[] = [];

    for (let w = 3; w >= 0; w--) {
      const ws = addDays(currentWeekStart, -w * 7);
      const we = addDays(ws, 6);
      const wsKey = format(ws, "yyyy-MM-dd");
      const weKey = format(we, "yyyy-MM-dd");

      const weekDays = last30.filter(
        (s) => s.date >= wsKey && s.date <= weKey
      );
      if (weekDays.length === 0) continue;

      const avg = Math.round(
        weekDays.reduce((a, s) => a + (s.steps ?? 0), 0) / weekDays.length
      );
      weeks.push({
        label: w === 0 ? "This week" : format(ws, "d MMM"),
        avgSteps: avg,
      });
    }
    return weeks.length >= 2 ? weeks : null;
  }, [last30]);

  const thisWeekAvg = useMemo(() => {
    if (!weeklyAverages || weeklyAverages.length === 0) return 0;
    return weeklyAverages[weeklyAverages.length - 1].avgSteps;
  }, [weeklyAverages]);

  const improvement = useMemo(() => {
    if (!weeklyAverages || weeklyAverages.length < 2) return null;
    const previous = weeklyAverages[weeklyAverages.length - 2].avgSteps;
    const current = weeklyAverages[weeklyAverages.length - 1].avgSteps;
    if (previous === 0) return null;
    const diff = current - previous;
    const pct = Math.round((diff / previous) * 100);
    return { diff, pct };
  }, [weeklyAverages]);

  if (isLoading) return null;
  if (summaries.length === 0) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
            <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-900">Apple Health</p>
            <p className="text-sm text-stone-500">See your real step data from your iPhone</p>
          </div>
        </div>
        <Link
          href="/settings/health"
          className="mt-4 flex w-full justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-teal-600 hover:to-cyan-600"
        >
          Connect Apple Health
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-stone-900">Your Steps</h2>
        <Link href="/settings/health" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition">
          Update
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
          This week
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="text-3xl font-bold text-stone-900">
            {formatNum(thisWeekAvg)}
          </p>
          <p className="text-sm text-stone-500">avg steps/day</p>
        </div>
        {improvement !== null && improvement.diff !== 0 && (
          <p
            className={`mt-2 text-sm font-semibold ${
              improvement.diff > 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {improvement.diff > 0 ? "+" : ""}
            {formatNum(Math.abs(improvement.diff))} steps/day vs last week ({improvement.pct > 0 ? "+" : ""}{improvement.pct}%)
          </p>
        )}
        <p className="mt-1 text-xs text-stone-400">Last 30 days of Apple Health data</p>
      </div>

      {weeklyAverages && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-stone-700">
            Avg steps per day by week
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyAverages} barCategoryGap="20%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#78716c" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e7e5e4",
                  fontSize: 13,
                }}
                formatter={(value) => [
                  formatNum(Number(value ?? 0)),
                  "Avg steps/day",
                ]}
              />
              <Bar
                dataKey="avgSteps"
                fill="#14b8a6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function ActivityContent() {
  const router = useRouter();
  const { user } = db.useAuth();
  const userId = user?.id;

  const { isLoading, error, data } = db.useQuery({ events: {} });
  const { data: responsesData } = db.useQuery({ questionnaire_responses: {} });

  const curatedEvents = useMemo(() => {
    if (!userId) return [];
    const raw = (data?.events ?? []) as Event[];
    const responses = (responsesData?.questionnaire_responses ?? []) as {
      questionId: string;
      selectedOptionIds: string | string[];
      userId: string;
      createdAt?: number;
      lat?: number;
      lng?: number;
    }[];
    const myResponses = responses.filter((r) => r.userId === userId);
    if (myResponses.length === 0) return [];
    const result = filterEventsWithDebug(
      raw,
      myResponses.map((r) => ({
        questionId: r.questionId,
        selectedOptionIds: r.selectedOptionIds,
        createdAt: r.createdAt,
        lat: r.lat,
        lng: r.lng,
      }))
    );
    return result.events;
  }, [userId, responsesData?.questionnaire_responses, data?.events]);

  const rawEvents = data?.events ?? [];
  const events = rawEvents.map((raw: Record<string, unknown>) => normalizeEvent(raw));

  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => setSavedEventIds(getCalendarEventIds());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const myEvents = useMemo(() => {
    const ids = savedEventIds.length > 0 ? savedEventIds : curatedEvents.map((e) => e.id);
    return events.filter((e) => ids.includes(e.id));
  }, [events, savedEventIds, curatedEvents]);

  const { weekEvents, dailyData, physicalCount, mentalCount, socialCount } = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return computeWeeklyData(myEvents, weekStart, weekEnd);
  }, [myEvents]);

  const activityCount = Math.min(weekEvents.length, 7);
  const { movement, enrichment, wellbeing } = computePillarScores(
    physicalCount,
    mentalCount,
    socialCount
  );

  const firstName = getGreetingName(user?.email ?? null);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-red-700 shadow-sm">
        <p className="font-medium">Connection error</p>
        <p className="mt-1 text-sm">Unable to load your activity.</p>
      </div>
    );
  }

  const healthCards = [
    {
      title: "Cardiovascular Health",
      status: "Strong" as const,
      accentColor: "#ec4899",
      description:
        activityCount > 0
          ? `Your ${physicalCount} physical ${physicalCount === 1 ? "activity" : "activities"} this week elevated your heart rate into a beneficial zone. Consistent moderate activity like this lowers resting blood pressure and strengthens the heart muscle over time.`
          : "Add physical activities to see your cardiovascular impact.",
      metrics: [
        {
          value: "~35%",
          label: "Reduced risk of heart disease with your week activity pattern.",
        },
        {
          value: "-8bpm",
          label: "Estimated resting heart rate improvement over 8 weeks.",
        },
      ],
      goalLabel: "Weekly cardio goal",
      goalCurrent: Math.min(physicalCount, 4),
      goalTotal: 4,
    },
    {
      title: "Cognitive & Mental Health",
      status: "Excellent" as const,
      accentColor: "#8b5cf6",
      description:
        activityCount > 0 && mentalCount > 0
          ? "Creative and cultural engagement actively stimulated new neural pathways. Creative and cultural engagement is one of the most evidence-backed ways to delay cognitive decline and reduce anxiety symptoms."
          : "Add creative or learning activities to support cognitive health.",
      metrics: [
        {
          value: "-20%",
          label: "Lower risk of cognitive decline with regular enriching activity",
        },
        {
          value: "-31%",
          label: "Reduction in anxiety reported after consistent creative engagement",
        },
      ],
      goalLabel: "Enrichment Goal",
      goalCurrent: Math.min(mentalCount, 4),
      goalTotal: 4,
    },
    {
      title: "Social Connection",
      status: "Good" as const,
      accentColor: "#3b82f6",
      description:
        activityCount > 0 && socialCount > 0
          ? `You attended ${socialCount} group ${socialCount === 1 ? "activity" : "activities"} this week. Strong social ties are as protective for longevity as quitting smoking - reducing feelings of isolation and supporting immune function through lower cortisol levels.`
          : "Add social activities to strengthen connections.",
      metrics: [
        {
          value: "+26%",
          label: "Higher likelihood of longevity with regular social activity",
        },
        {
          value: "-29%",
          label: "Lower mortality risk linked to regular meaningful social contact",
        },
      ],
      goalLabel: "Social Goal",
      goalCurrent: Math.min(socialCount, 3),
      goalTotal: 3,
    },
    {
      title: "Physical Resilience",
      status: "Strong" as const,
      accentColor: "#22c55e",
      description:
        activityCount > 0 && physicalCount > 0
          ? "Regular movement improved muscular endurance and joint mobility. Regular movement like this builds the physical reserves that prevent injury and support independent living as you age."
          : "Add strength and balance activities to build resilience.",
      metrics: [
        {
          value: "+18%",
          label: "Improvement in flexibility markers after 6 weeks of consistent yoga",
        },
        {
          value: "-40%",
          label: "Fall risk reduction with weekly strength and balance activity",
        },
      ],
      goalLabel: "Strength Goal",
      goalCurrent: Math.min(physicalCount, 3),
      goalTotal: 3,
    },
  ];

  const goalScore = Math.min(99, 60 + activityCount * 5);
  const goalMessage =
    activityCount >= 6
      ? "You are in the top 15% of Clover users this week. Keep it up."
      : "One more activity puts you in the top 15% of Clover users this week.";

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Activity</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-200 hover:text-stone-700"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="space-y-8">
        <WeeklySummaryHero
          firstName={firstName}
          activityCount={activityCount}
          movementScore={movement}
          enrichmentScore={enrichment}
          wellbeingScore={wellbeing}
          movementVs={6}
          enrichmentVs={11}
          wellbeingVs={4}
        />

        <ActivityBarChart data={dailyData} />

        <section>
          <h2 className="mb-4 text-xl font-bold text-stone-900">Health Impact Breakdown</h2>
          <div className="space-y-4">
            {healthCards.map((card) => (
              <HealthImpactCard
                key={card.title}
                title={card.title}
                status={card.status}
                accentColor={card.accentColor}
                description={card.description}
                metrics={card.metrics}
                goalLabel={card.goalLabel}
                goalCurrent={card.goalCurrent}
                goalTotal={card.goalTotal}
              />
            ))}
          </div>
        </section>

        {userId && <AppleHealthSection userId={userId} />}

        <CloverInsightCard insight={getInsightText(activityCount, physicalCount, mentalCount, socialCount)} />

        <WeeklyGoalCard score={goalScore} message={goalMessage} />
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <AuthGate>
      <ActivityContent />
    </AuthGate>
  );
}
