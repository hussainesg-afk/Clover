"use client";

import { useState, useCallback, useMemo } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";
import { BOGGLE_SET } from "@/data/entertainment/words";
import { wordExistsInGrid } from "@/lib/entertainment/boggle-path";

const LETTERS: string[][] = [
  ["R", "A", "T", "S"],
  ["E", "A", "T", "E"],
  ["A", "R", "E", "A"],
  ["S", "T", "A", "R"],
];

export default function WordBattlePage() {
  const [input, setInput] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const score = useMemo(
    () => found.reduce((s, w) => s + w.length, 0),
    [found],
  );

  const submit = useCallback(() => {
    const w = input.trim().toLowerCase();
    setMessage(null);
    if (w.length < 3) {
      setMessage("Use at least 3 letters.");
      return;
    }
    if (!BOGGLE_SET.has(w)) {
      setMessage("Not in the word list for this grid.");
      return;
    }
    if (!wordExistsInGrid(LETTERS, w)) {
      setMessage("That path is not on the board.");
      return;
    }
    if (found.includes(w)) {
      setMessage("Already found.");
      return;
    }
    setFound((f) => [...f, w].sort());
    setInput("");
    setMessage(`+${w.length} points`);
  }, [input, found]);

  return (
    <EntertainmentGameShell
      title="Word Battle"
      subtitle="Form words from adjacent letters (including diagonals). Words must be 3+ letters and in the puzzle dictionary."
      accent="#6A0DAD"
    >
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-violet-100 p-3">
        {LETTERS.flat().map((ch, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-white text-xl font-bold text-violet-900 shadow"
          >
            {ch}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a word"
          className="flex-1 rounded-xl border border-stone-300 px-4 py-2 text-stone-900"
          autoCapitalize="characters"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-500"
        >
          Submit
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm text-stone-600">{message}</p>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-stone-700">
        <span>
          Score: <strong>{score}</strong>
        </span>
        <span>{found.length} words</span>
      </div>
      {found.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {found.map((w) => (
            <li
              key={w}
              className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-800"
            >
              {w}
            </li>
          ))}
        </ul>
      )}
    </EntertainmentGameShell>
  );
}
