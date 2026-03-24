"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { TriviaQuestion } from "@/lib/entertainment/trivia-daily";
import { pickDailyQuestions, getDateSeed } from "@/lib/entertainment/trivia-daily";
import rawPool from "@/data/entertainment/trivia.json";
import EntertainmentGameShell from "./EntertainmentGameShell";

const pool = rawPool as TriviaQuestion[];

type Mode = "daily" | "duel";

interface TriviaGameProps {
  mode: Mode;
  title: string;
  accent: string;
}

export default function TriviaGame({ mode, title, accent }: TriviaGameProps) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const dateSeed = getDateSeed();
  const questionSeed = mode === "daily" ? dateSeed : `duel-${dateSeed}`;
  const questions = useMemo(
    () => pickDailyQuestions(pool, questionSeed, mode === "daily" ? 5 : 8),
    [questionSeed, mode],
  );

  const q = questions[index];
  const isLast = index >= questions.length - 1;

  useEffect(() => {
    if (mode !== "duel" || !started || locked) return;
    setTimeLeft(20);
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setLocked(true);
          setSelected(-1);
          setStreak(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, started, index, locked]);

  const handlePick = useCallback(
    (opt: number) => {
      if (locked || !q) return;
      setSelected(opt);
      setLocked(true);
      const correct = opt === q.correct;
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setStreak(0);
      }
    },
    [locked, q],
  );

  const next = () => {
    if (isLast) {
      setStarted(false);
      setIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setSelected(null);
      setLocked(false);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setLocked(false);
  };

  return (
    <EntertainmentGameShell
      title={title}
      subtitle={
        mode === "daily"
          ? `Same five questions for everyone on ${dateSeed}.`
          : "Fast rounds. Build your streak."
      }
      accent={accent}
    >
      {!started ? (
        <div className="text-center">
          <p className="mb-4 text-stone-600">
            {mode === "daily"
              ? "Answer five questions. Come back tomorrow for a new set."
              : "Eight questions, 20 seconds each. How high can your streak go?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setStarted(true);
              setIndex(0);
              setScore(0);
              setStreak(0);
              setBestStreak(0);
              setSelected(null);
              setLocked(false);
              setTimeLeft(20);
            }}
            className="rounded-xl bg-teal-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-teal-700"
          >
            {mode === "daily" ? "Start daily quiz" : "Start duel"}
          </button>
        </div>
      ) : q ? (
        <div className="space-y-4" key={q.id}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
            <span>
              Question {index + 1} / {questions.length}
            </span>
            {mode === "duel" && !locked && (
              <span
                className={`font-mono font-bold ${timeLeft <= 5 ? "text-rose-600" : "text-stone-800"}`}
              >
                {timeLeft}s
              </span>
            )}
            <span>
              Score: {score}
              {mode === "duel" && (
                <span className="ml-2 text-teal-700">
                  Streak: {streak} (best {bestStreak})
                </span>
              )}
            </span>
          </div>
          <p className="text-lg font-medium text-stone-900">{q.q}</p>
          <div className="grid gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSel = selected === i;
              let btn =
                "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ";
              if (locked) {
                if (isCorrect) btn += "border-emerald-500 bg-emerald-50 text-emerald-900";
                else if (isSel && i !== -1) btn += "border-rose-400 bg-rose-50 text-rose-900";
                else btn += "border-stone-200 bg-stone-50 text-stone-500";
              } else {
                btn +=
                  "border-stone-200 bg-white text-stone-800 hover:border-teal-400 hover:bg-teal-50/50";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={locked}
                  className={btn}
                  onClick={() => handlePick(i)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {locked && (
            <button
              type="button"
              onClick={next}
              className="w-full rounded-xl bg-stone-900 py-3 font-semibold text-white shadow-md transition hover:bg-stone-800"
            >
              {isLast ? "Finish" : "Next question"}
            </button>
          )}
        </div>
      ) : (
        <p className="text-stone-500">Loading...</p>
      )}
    </EntertainmentGameShell>
  );
}
