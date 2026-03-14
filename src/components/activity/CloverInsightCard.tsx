"use client";

export interface CloverInsightCardProps {
  insight: string;
}

const SOURCES = "Sources: NIH (National Institute for Health), Age UK, Harvard School of Public Health.";

export default function CloverInsightCard({ insight }: CloverInsightCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-emerald-50/80 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-800">Your Clover Insight</h3>
      <p className="mt-3 text-sm leading-relaxed text-emerald-900/90">{insight}</p>
      <p className="mt-4 text-xs italic text-stone-500">{SOURCES}</p>
    </div>
  );
}
