"use client";

import { useState, useCallback } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

const SYMBOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

type Card = { symbol: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  return shuffle([...SYMBOLS, ...SYMBOLS]).map((symbol) => ({
    symbol,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryMatchPage() {
  const [state, setState] = useState<Card[]>(() => buildDeck());
  const [first, setFirst] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const reset = () => {
    setState(buildDeck());
    setFirst(null);
    setMoves(0);
    setLock(false);
  };

  const matchedCount = state.filter((c) => c.matched).length;
  const won = matchedCount === state.length && state.length > 0;

  const flip = useCallback(
    (idx: number) => {
      if (lock || state[idx].matched || state[idx].flipped) return;
      const next = state.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
      setState(next);
      if (first === null) {
        setFirst(idx);
        return;
      }
      setMoves((m) => m + 1);
      setLock(true);
      const a = first;
      setFirst(null);
      if (next[a].symbol === next[idx].symbol) {
        setState((s) =>
          s.map((c, i) => (i === a || i === idx ? { ...c, matched: true, flipped: true } : c)),
        );
        setLock(false);
      } else {
        setTimeout(() => {
          setState((s) => s.map((c, i) => (i === a || i === idx ? { ...c, flipped: false } : c)));
          setLock(false);
        }, 600);
      }
    },
    [first, lock, state],
  );

  return (
    <EntertainmentGameShell
      title="Memory Match"
      subtitle="Flip two cards at a time. Match all pairs."
      accent="#EE6A2B"
    >
      <div className="mb-4 flex items-center justify-between text-sm text-stone-600">
        <span>Moves: {moves}</span>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-stone-200 px-3 py-1.5 font-medium text-stone-800 hover:bg-stone-300"
        >
          New game
        </button>
      </div>
      {won && (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-center font-semibold text-emerald-900">
          You won in {moves} moves.
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {state.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => flip(i)}
            disabled={lock || c.matched}
            className={`flex aspect-square items-center justify-center rounded-xl text-2xl font-bold shadow-inner transition ${
              c.matched
                ? "bg-emerald-200 text-emerald-900"
                : c.flipped
                  ? "bg-white text-stone-900 ring-2 ring-teal-400"
                  : "bg-teal-700 text-transparent hover:bg-teal-600"
            }`}
          >
            {c.flipped || c.matched ? c.symbol : "?"}
          </button>
        ))}
      </div>
    </EntertainmentGameShell>
  );
}
