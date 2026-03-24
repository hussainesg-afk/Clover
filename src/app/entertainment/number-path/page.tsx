"use client";

import { useState, useCallback, useMemo } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

const N = 4;
const TOTAL = N * N;

/** Single valid snake path through 4x4 (row-major indices) */
const SOLUTION = [
  0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12,
];

export default function NumberPathPage() {
  const [path, setPath] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const won = useMemo(() => path.length === TOTAL, [path]);

  const click = useCallback(
    (idx: number) => {
      if (won) return;
      const expected = SOLUTION[path.length];
      if (idx !== expected) {
        setWrong(idx);
        setTimeout(() => setWrong(null), 400);
        return;
      }
      setPath((p) => [...p, idx]);
    },
    [path.length, won],
  );

  const reset = () => {
    setPath([]);
  };

  return (
    <EntertainmentGameShell
      title="Number Path"
      subtitle={`Tap cells in order from 1 to ${TOTAL}. Follow the hidden path.`}
      accent="#1D8075"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-stone-600">
          Next: <strong>{path.length + 1}</strong>
        </span>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-300"
        >
          Reset
        </button>
      </div>
      {won && (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-center font-semibold text-emerald-900">
          Perfect path.
        </p>
      )}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: TOTAL }, (_, idx) => {
          const order = path.indexOf(idx) + 1;
          const isOnPath = order > 0;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => click(idx)}
              className={`flex aspect-square items-center justify-center rounded-lg text-lg font-bold transition ${
                wrong === idx
                  ? "bg-rose-300 text-rose-900"
                  : isOnPath
                    ? "bg-teal-500 text-white ring-2 ring-teal-700"
                    : "bg-stone-200 text-stone-500 hover:bg-stone-300"
              }`}
            >
              {isOnPath ? order : ""}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-stone-500">
        Hint: the path is continuous; each step touches the previous cell (edge or corner).
      </p>
    </EntertainmentGameShell>
  );
}
