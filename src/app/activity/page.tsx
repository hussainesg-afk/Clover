"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startOfWeek, endOfWeek, getDay } from "date-fns";
import { db } from "@/lib/db";
import { normalizeEvent } from "@/lib/event-normalizer";
import { filterEventsWithDebug } from "@/lib/filter-events";
import { getCalendarEventIds } from "@/lib/calendar-events";
import { parseEventDateTime } from "@/lib/parse-event-date";
import { classifyActivityType } from "@/lib/activity-classifier";
import AuthGate from "@/components/AuthGate";
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
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
