import { id as instantId } from "@instantdb/react";
import { db } from "@/lib/db";
import type { DailySummary } from "@/lib/health-export-parser";

type HealthRow = DailySummary & { id: string; userId: string; createdAt: number };

export function useHealthSummaries(userId: string | undefined) {
  const { data, isLoading } = db.useQuery(
    userId ? { health_daily_summaries: {} } : null
  );

  const summaries = (data?.health_daily_summaries ?? []) as HealthRow[];
  const mine = userId
    ? summaries.filter((s) => s.userId === userId).sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return { summaries: mine, isLoading };
}

export async function saveHealthSummaries(
  userId: string,
  summaries: DailySummary[]
) {
  const BATCH_SIZE = 50;
  const now = Date.now();

  for (let i = 0; i < summaries.length; i += BATCH_SIZE) {
    const batch = summaries.slice(i, i + BATCH_SIZE);
    const txs = batch.map((s) =>
      db.tx.health_daily_summaries[instantId()].update({
        userId,
        date: s.date,
        steps: Math.round(s.steps),
        distanceKm: Math.round(s.distanceKm * 100) / 100,
        activeEnergyKcal: Math.round(s.activeEnergyKcal),
        exerciseMinutes: Math.round(s.exerciseMinutes),
        workoutCount: s.workoutCount,
        createdAt: now,
      })
    );
    await db.transact(txs);
  }
}

export async function deleteHealthData(userId: string) {
  const { data } = await db.queryOnce({ health_daily_summaries: {} });
  const rows = (data?.health_daily_summaries ?? []) as HealthRow[];
  const mine = rows.filter((r) => r.userId === userId);

  const BATCH_SIZE = 50;
  for (let i = 0; i < mine.length; i += BATCH_SIZE) {
    const batch = mine.slice(i, i + BATCH_SIZE);
    const txs = batch.map((r) => db.tx.health_daily_summaries[r.id].delete());
    await db.transact(txs);
  }
}
