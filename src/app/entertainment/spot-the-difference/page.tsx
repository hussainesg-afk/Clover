"use client";

import { useState } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

const TOTAL = 5;

export default function SpotTheDifferencePage() {
  const [hit, setHit] = useState<Set<number>>(() => new Set());

  const Panel = ({ side }: { side: "left" | "right" }) => (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-stone-300 bg-sky-100 ${
        side === "right" ? "ring-2 ring-amber-400/50" : ""
      }`}
    >
      <svg viewBox="0 0 200 150" className="h-full w-full">
        <rect x="20" y="40" width="80" height="60" fill="#93c5fd" rx="4" />
        <circle cx="100" cy="70" r="25" fill="#fbbf24" />
        <rect x="130" y="90" width="40" height="35" fill="#34d399" rx="2" />
        {side === "right" && (
          <>
            <circle cx="45" cy="55" r="4" fill="#ef4444" />
            <rect x="140" y="50" width="12" height="12" fill="#a78bfa" />
          </>
        )}
      </svg>
      {side === "left" &&
        [0, 1, 2, 3, 4].map((i) => {
          const pos = [
            { l: "18%", t: "32%" },
            { l: "48%", t: "38%" },
            { l: "72%", t: "55%" },
            { l: "30%", t: "72%" },
            { l: "58%", t: "68%" },
          ][i];
          return (
            <button
              key={i}
              type="button"
              style={{ left: pos.l, top: pos.t }}
              className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/80 ${
                hit.has(i) ? "bg-emerald-400/80" : "bg-white/10 hover:bg-white/30"
              }`}
              onClick={() => setHit((s) => new Set(s).add(i))}
              aria-label={`Difference ${i + 1}`}
            />
          );
        })}
      {side === "right" &&
        [0, 1, 2, 3, 4].map((i) => {
          const pos = [
            { l: "22%", t: "35%" },
            { l: "50%", t: "40%" },
            { l: "70%", t: "58%" },
            { l: "28%", t: "70%" },
            { l: "60%", t: "65%" },
          ][i];
          return (
            <button
              key={i}
              type="button"
              style={{ left: pos.l, top: pos.t }}
              className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/80 ${
                hit.has(i) ? "bg-emerald-400/80" : "bg-white/10 hover:bg-white/30"
              }`}
              onClick={() => setHit((s) => new Set(s).add(i))}
              aria-label={`Difference ${i + 1}`}
            />
          );
        })}
    </div>
  );

  return (
    <EntertainmentGameShell
      title="Spot the Difference"
      subtitle="Tap each difference on both panels. Five in total."
      accent="#A6CC00"
    >
      <p className="mb-2 text-center text-sm text-stone-600">
        Found {hit.size} / {TOTAL}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-center text-xs font-semibold text-stone-500">Scene A</p>
          <Panel side="left" />
        </div>
        <div>
          <p className="mb-1 text-center text-xs font-semibold text-stone-500">Scene B</p>
          <Panel side="right" />
        </div>
      </div>
      {hit.size >= TOTAL && (
        <p className="mt-4 text-center font-semibold text-emerald-700">You found them all.</p>
      )}
    </EntertainmentGameShell>
  );
}
