"use client";

import { useState, useMemo } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

const ROWS = 10;
const COLS = 10;
const TARGET = ["CLOVER", "BRISTOL", "VOICE", "EVENT", "COMMUNITY", "HELLO"];

function buildGrid(): string[][] {
  const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  const place = (word: string, r: number, c: number, dr: number, dc: number) => {
    for (let i = 0; i < word.length; i++) {
      const rr = r + i * dr;
      const cc = c + i * dc;
      if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) return false;
      if (g[rr][cc] !== "." && g[rr][cc] !== word[i]) return false;
    }
    for (let i = 0; i < word.length; i++) {
      g[r + i * dr][c + i * dc] = word[i];
    }
    return true;
  };
  place("CLOVER", 0, 2, 0, 1);
  place("BRISTOL", 2, 0, 0, 1);
  place("VOICE", 4, 5, 0, 1);
  place("EVENT", 6, 1, 0, 1);
  place("COMMUNITY", 1, 9, 1, 0);
  place("HELLO", 8, 3, 0, 1);
  const fill = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let k = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (g[r][c] === ".") g[r][c] = fill[k++ % fill.length];
  return g;
}

export default function WordSearchPage() {
  const grid = useMemo(() => buildGrid(), []);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [draft, setDraft] = useState("");

  const tryWord = () => {
    const w = draft.toUpperCase().replace(/[^A-Z]/g, "");
    if (!w) return;
    if (!TARGET.includes(w)) {
      setDraft("");
      return;
    }
    if (found.has(w)) return;
    setFound((f) => new Set(f).add(w));
    setDraft("");
  };

  return (
    <EntertainmentGameShell
      title="Word Search"
      subtitle="Type a word from the list and press Check when you spot it in the grid."
      accent="#E6295C"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {TARGET.map((w) => (
          <span
            key={w}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              found.has(w) ? "bg-emerald-200 text-emerald-900 line-through" : "bg-stone-200 text-stone-700"
            }`}
          >
            {w}
          </span>
        ))}
      </div>
      <div
        className="mb-4 grid gap-px bg-stone-400 p-px"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {grid.flatMap((row, r) =>
          row.map((ch, c) => (
            <div
              key={`${r}-${c}`}
              className="flex aspect-square items-center justify-center bg-amber-50 text-xs font-bold text-stone-900 sm:text-sm"
            >
              {ch}
            </div>
          )),
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          placeholder="WORD"
          className="flex-1 rounded-xl border border-stone-300 px-3 py-2 font-mono text-sm uppercase"
        />
        <button
          type="button"
          onClick={tryWord}
          className="rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
        >
          Check
        </button>
      </div>
      {found.size === TARGET.length && (
        <p className="mt-4 text-center font-semibold text-emerald-700">All words found.</p>
      )}
    </EntertainmentGameShell>
  );
}
