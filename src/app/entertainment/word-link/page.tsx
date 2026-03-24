"use client";

import { useState, useMemo } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";
import { WORD_SET } from "@/data/entertainment/words";

const START_WORDS = ["apple", "tiger", "ocean", "night", "eagle", "ember"];

export default function WordLinkPage() {
  const [seed] = useState(() => START_WORDS[Math.floor(Math.random() * START_WORDS.length)]);
  const [chain, setChain] = useState<string[]>([seed]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const lastLetter = useMemo(() => chain[chain.length - 1].slice(-1).toLowerCase(), [chain]);

  const submit = () => {
    const w = input.trim().toLowerCase();
    setMsg(null);
    if (w.length < 3) {
      setMsg("Word must be at least 3 letters.");
      return;
    }
    if (!/^[a-z]+$/.test(w)) {
      setMsg("Letters only.");
      return;
    }
    if (chain.includes(w)) {
      setMsg("Already used that word.");
      return;
    }
    if (w[0] !== lastLetter) {
      setMsg(`Word must start with "${lastLetter.toUpperCase()}".`);
      return;
    }
    if (!WORD_SET.has(w)) {
      setMsg("Not in our dictionary for this game. Try another word.");
      return;
    }
    setChain((c) => [...c, w]);
    setInput("");
  };

  return (
    <EntertainmentGameShell
      title="Word Link"
      subtitle="Each new word must start with the last letter of the previous word."
      accent="#8A4CB5"
    >
      <p className="mb-2 text-sm text-stone-600">
        Chain length: <strong>{chain.length}</strong>. Next word must start with{" "}
        <strong className="text-teal-700">{lastLetter.toUpperCase()}</strong>.
      </p>
      <div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-stone-100 p-3">
        {chain.map((w, i) => (
          <span key={`${w}-${i}`} className="rounded-lg bg-white px-2 py-1 font-medium text-stone-800 shadow-sm">
            {w}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type your word..."
          className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Add word
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-rose-600">{msg}</p>}
      <button
        type="button"
        onClick={() => {
          const s = START_WORDS[Math.floor(Math.random() * START_WORDS.length)];
          setChain([s]);
          setInput("");
          setMsg(null);
        }}
        className="mt-6 text-sm font-medium text-stone-500 underline hover:text-stone-800"
      >
        New chain
      </button>
    </EntertainmentGameShell>
  );
}
