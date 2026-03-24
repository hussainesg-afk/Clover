"use client";

import { useState, useCallback } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function canMove(board: number[], from: number): number | null {
  const empty = board.indexOf(0);
  const neighbors: Record<number, number[]> = {
    0: [1, 3],
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7],
  };
  const n = neighbors[empty];
  return n.includes(from) ? empty : null;
}

function shuffleBoard(): number[] {
  let b = [...SOLVED];
  for (let i = 0; i < 200; i++) {
    const empty = b.indexOf(0);
    const opts = [empty - 1, empty + 1, empty - 3, empty + 3].filter((x) => {
      if (x < 0 || x > 8) return false;
      const er = Math.floor(empty / 3);
      const ec = empty % 3;
      const xr = Math.floor(x / 3);
      const xc = x % 3;
      return Math.abs(er - xr) + Math.abs(ec - xc) === 1;
    });
    const j = opts[Math.floor(Math.random() * opts.length)];
    if (j === undefined) continue;
    [b[empty], b[j]] = [b[j], b[empty]];
  }
  return b;
}

export default function JigsawPage() {
  const [board, setBoard] = useState<number[]>(() => shuffleBoard());

  const won = board.every((v, i) => v === SOLVED[i]);

  const click = useCallback(
    (i: number) => {
      if (board[i] === 0) return;
      const emptyIdx = canMove(board, i);
      if (emptyIdx === null) return;
      const next = [...board];
      [next[i], next[emptyIdx]] = [next[emptyIdx], next[i]];
      setBoard(next);
    },
    [board],
  );

  return (
    <EntertainmentGameShell
      title="Sliding Puzzle"
      subtitle="Slide tiles until order is 1 to 8, empty bottom-right."
      accent="#33CCFF"
    >
      {won && (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-center font-semibold text-emerald-900">
          Solved.
        </p>
      )}
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-1">
        {board.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => click(i)}
            className={`flex aspect-square items-center justify-center rounded-lg text-2xl font-bold shadow-md transition ${
              n === 0
                ? "bg-stone-200"
                : "bg-gradient-to-br from-teal-500 to-cyan-600 text-white hover:from-teal-400 hover:to-cyan-500"
            }`}
          >
            {n === 0 ? "" : n}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setBoard(shuffleBoard())}
        className="mt-6 w-full rounded-xl border border-stone-300 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
      >
        Shuffle new puzzle
      </button>
    </EntertainmentGameShell>
  );
}
