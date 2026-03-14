"use client";

import Link from "next/link";

export interface WeeklyGoalCardProps {
  score: number;
  message: string;
}

export default function WeeklyGoalCard({ score, message }: WeeklyGoalCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-stone-100">
          <span className="text-2xl font-bold text-teal-600">{score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-stone-900">Weekly health goal on track</h3>
          <p className="mt-3 text-sm text-stone-600">{message}</p>
          <Link
            href="/for-you/top-picks"
            className="mt-4 inline-block font-semibold text-teal-600 hover:text-teal-700"
          >
            Find something for today →
          </Link>
        </div>
      </div>
    </div>
  );
}
