"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { DM_Serif_Display, DM_Mono } from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";
const DIFFICULTY_CELLS: Record<Difficulty, number> = {
  Easy: 30,
  Medium: 42,
  Hard: 52,
  Expert: 60,
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  function valid(row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) if (grid[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (grid[r][col] === num) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) if (grid[r][c] === num) return false;
    return true;
  }

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue;
        const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const n of candidates) {
          if (valid(r, c, n)) {
            grid[r][c] = n;
            if (solve()) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  solve();
  return grid;
}

function createPuzzle(
  solved: number[][],
  cellsToRemove: number
): { puzzle: number[][]; solution: number[][] } {
  const puzzle = solved.map((row) => row.map((n) => n));
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) positions.push([r, c]);
  const shuffled = shuffle(positions);
  for (let i = 0; i < cellsToRemove && i < shuffled.length; i++) {
    const [r, c] = shuffled[i];
    puzzle[r][c] = 0;
  }
  return { puzzle, solution: solved.map((row) => row.map((n) => n)) };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [userGrid, setUserGrid] = useState<number[][]>([]);
  const [notes, setNotes] = useState<Set<number>[][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => new Set<number>())
      )
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState<"lose" | null>(null);
  const [won, setWon] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const startNewGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const solved = generateSolvedGrid();
    const { puzzle: p, solution: s } = createPuzzle(
      solved,
      DIFFICULTY_CELLS[diff]
    );
    setPuzzle(p);
    setSolution(s);
    setUserGrid(p.map((row) => row.map((n) => n)));
    setNotes(
      Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(() => new Set<number>())
        )
    );
    setSelected(null);
    setNotesMode(false);
    setMistakes(0);
    setHintsUsed(0);
    setTimer(0);
    setGameOver(null);
    setWon(false);
  }, []);

  useEffect(() => {
    startNewGame("Medium");
  }, [startNewGame]);

  useEffect(() => {
    if (won || gameOver || puzzle.length === 0) return;
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [won, gameOver, puzzle.length]);

  const isGiven = useCallback(
    (r: number, c: number) => puzzle[r]?.[c] !== 0,
    [puzzle]
  );

  const isCorrect = useCallback(
    (r: number, c: number) => userGrid[r]?.[c] === solution[r]?.[c],
    [userGrid, solution]
  );

  const countPlaced = useCallback(
    (n: number) =>
      userGrid.flat().filter((v) => v === n).length,
    [userGrid]
  );

  const handleCellSelect = useCallback((r: number, c: number) => {
    if (gameOver || won) return;
    if (isGiven(r, c)) return;
    setSelected([r, c]);
  }, [gameOver, won, isGiven]);

  const handleNumberInput = useCallback(
    (n: number) => {
      if (gameOver || won || !selected) return;
      const [r, c] = selected;
      if (isGiven(r, c)) return;

      if (notesMode) {
        setNotes((prev) => {
          const next = prev.map((row, ri) =>
            row.map((cell, ci) => {
              if (ri !== r || ci !== c) return cell;
              const nextSet = new Set(cell);
              if (nextSet.has(n)) nextSet.delete(n);
              else nextSet.add(n);
              return nextSet;
            })
          );
          return next;
        });
        return;
      }

      if (solution[r][c] !== n) {
        setMistakes((m) => {
          const next = m + 1;
          if (next >= 3) setGameOver("lose");
          return next;
        });
        return;
      }

      setUserGrid((prev) =>
        prev.map((row, ri) =>
          row.map((val, ci) => (ri === r && ci === c ? n : val))
        )
      );
      setNotes((prev) =>
        prev.map((row, ri) =>
          row.map((cell, ci) => (ri === r && ci === c ? new Set<number>() : cell))
        )
      );
      setSelected(null);
    },
    [gameOver, won, selected, notesMode, solution, isGiven]
  );

  const handleErase = useCallback(() => {
    if (gameOver || won || !selected) return;
    const [r, c] = selected;
    if (isGiven(r, c)) return;
    setUserGrid((prev) =>
      prev.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? 0 : val))
      )
    );
    setNotes((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? new Set<number>() : cell))
      )
    );
  }, [gameOver, won, selected, isGiven]);

  const handleHint = useCallback(() => {
    if (gameOver || won || hintsUsed >= 3) return;
    const incorrectOrEmpty: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (isGiven(r, c)) continue;
        if (puzzle[r][c] === 0 && userGrid[r][c] !== solution[r][c])
          incorrectOrEmpty.push([r, c]);
      }
    }
    if (incorrectOrEmpty.length === 0) return;
    const [r, c] =
      incorrectOrEmpty[Math.floor(Math.random() * incorrectOrEmpty.length)];
    setUserGrid((prev) =>
      prev.map((row, ri) =>
        row.map((val, ci) =>
          ri === r && ci === c ? solution[r][c] : val
        )
      )
    );
    setNotes((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? new Set<number>() : cell))
      )
    );
    setHintsUsed((h) => h + 1);
    setSelected([r, c]);
  }, [gameOver, won, hintsUsed, userGrid, solution]);

  useEffect(() => {
    if (won || gameOver || puzzle.length === 0) return;
    const complete =
      userGrid.flat().every((v, i) => v !== 0) &&
      userGrid.every((row, r) =>
        row.every((v, c) => v === solution[r][c])
      );
    if (complete) setWon(true);
  }, [userGrid, solution, won, gameOver, puzzle.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || won) return;
      if (e.key === "n" || e.key === "N") {
        setNotesMode((m) => !m);
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleErase();
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key, 10));
        return;
      }
      if (!selected) return;
      const [r, c] = selected;
      if (e.key === "ArrowUp" && r > 0) setSelected([r - 1, c]);
      else if (e.key === "ArrowDown" && r < 8) setSelected([r + 1, c]);
      else if (e.key === "ArrowLeft" && c > 0) setSelected([r, c - 1]);
      else if (e.key === "ArrowRight" && c < 8) setSelected([r, c + 1]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, gameOver, won, handleErase, handleNumberInput]);

  const selectedRow = selected?.[0] ?? -1;
  const selectedCol = selected?.[1] ?? -1;
  const selectedNum = selected ? userGrid[selected[0]][selected[1]] : 0;

  const getCellHighlight = useCallback(
    (r: number, c: number) => {
      if (selectedRow < 0) return "";
      const sameRow = r === selectedRow;
      const sameCol = c === selectedCol;
      const sameBox =
        Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
        Math.floor(c / 3) === Math.floor(selectedCol / 3);
      const sameNumber =
        selectedNum !== 0 && userGrid[r][c] === selectedNum;
      if (sameRow || sameCol || sameBox) return "bg-amber-100/80";
      if (sameNumber) return "bg-amber-200/70";
      return "";
    },
    [selectedRow, selectedCol, selectedNum, userGrid]
  );

  if (puzzle.length === 0) {
    return (
      <div
        className={`min-h-screen ${dmSerif.variable} ${dmMono.variable}`}
        style={{ backgroundColor: "#f5f0e8" }}
      >
        <div className="flex min-h-screen items-center justify-center">
          <p className="font-mono text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${dmSerif.variable} ${dmMono.variable}`}
      style={{
        backgroundColor: "#f5f0e8",
        fontFamily: "var(--font-dm-mono), monospace",
      }}
    >
      <div
        className="relative mx-auto max-w-[520px] px-4 py-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
        style={{ fontFamily: "var(--font-dm-mono), monospace" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        <header className="relative mb-6 flex items-center justify-between">
          <Link
            href="/entertainment"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#1a1510] transition hover:bg-[#fffdf7]/80"
            style={{
              boxShadow: "2px 2px 0 #8b7355",
            }}
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="rounded-md px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: "#fffdf7",
                color: "#c8531a",
                boxShadow: "2px 2px 0 #8b7355",
              }}
            >
              {difficulty}
            </span>
            <span
              className="font-mono text-lg tabular-nums"
              style={{ color: "#1a1510", fontFamily: "var(--font-dm-mono)" }}
            >
              {formatTime(timer)}
            </span>
          </div>

          <div className="w-10" />
        </header>

        {gameOver === "lose" && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-center font-medium"
            style={{
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              boxShadow: "2px 2px 0 #8b7355",
            }}
          >
            Game over. 3 mistakes reached.
          </div>
        )}

        <div
          ref={gridRef}
          className="relative rounded-lg p-2"
          style={{
            backgroundColor: "#fffdf7",
            boxShadow: "4px 4px 0 #8b7355",
          }}
        >
          <div className="grid grid-cols-9 gap-0 border-2 border-[#1a1510]">
            {Array.from({ length: 81 }, (_, i) => {
              const r = Math.floor(i / 9);
              const c = i % 9;
              const given = isGiven(r, c);
              const val = userGrid[r][c];
              const noteSet = notes[r][c];
              const isSelected =
                selectedRow === r && selectedCol === c;
              const hasError = !given && val !== 0 && val !== solution[r][c];
              const highlight = getCellHighlight(r, c);

              const borderRight =
                c < 8
                  ? c === 2 || c === 5
                    ? "border-r-2 border-r-[#1a1510]"
                    : "border-r border-r-stone-300"
                  : "";
              const borderBottom =
                r < 8
                  ? r === 2 || r === 5
                    ? "border-b-2 border-b-[#1a1510]"
                    : "border-b border-b-stone-300"
                  : "";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCellSelect(r, c)}
                  disabled={given || gameOver !== null || won}
                  className={`flex aspect-square items-center justify-center text-center transition focus:outline-none focus:ring-2 focus:ring-[#c8531a] focus:ring-offset-1 disabled:cursor-default ${borderRight} ${borderBottom} ${highlight} ${
                    isSelected ? "ring-2 ring-inset ring-[#c8531a] bg-amber-100" : ""
                  } ${hasError ? "bg-red-100 text-red-700" : ""}`}
                  style={{
                    backgroundColor: isSelected ? undefined : hasError ? undefined : highlight || "transparent",
                  }}
                >
                  {val !== 0 ? (
                    <span
                      className="text-xl sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-dm-serif), serif",
                        color: given ? "#1a1510" : hasError ? undefined : "#1a1510",
                        fontWeight: given ? 600 : 500,
                      }}
                    >
                      {val}
                    </span>
                  ) : (
                    <div className="grid grid-cols-3 grid-rows-3 gap-0 text-[10px] leading-tight text-stone-500">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span
                          key={n}
                          className="flex items-center justify-center"
                          style={{ fontFamily: "var(--font-dm-mono)" }}
                        >
                          {noteSet.has(n) ? n : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {(["Easy", "Medium", "Hard", "Expert"] as Difficulty[]).map(
            (d) => (
              <button
                key={d}
                type="button"
                onClick={() => startNewGame(d)}
                disabled={gameOver !== null || won}
                className="rounded-md px-2 py-1.5 text-xs font-medium transition active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
                style={{
                  backgroundColor: difficulty === d ? "#c8531a" : "#fffdf7",
                  color: difficulty === d ? "#fffdf7" : "#1a1510",
                  boxShadow: "2px 2px 0 #8b7355",
                }}
              >
                {d}
              </button>
            )
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      i < mistakes ? "#dc2626" : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleHint}
              disabled={hintsUsed >= 3 || gameOver !== null || won}
              className="rounded-md px-2 py-1 text-xs font-medium transition active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40"
              style={{
                backgroundColor: "#fffdf7",
                color: "#1a1510",
                boxShadow: "2px 2px 0 #8b7355",
              }}
            >
              Hint ({3 - hintsUsed})
            </button>
            <button
              type="button"
              onClick={() => setNotesMode((m) => !m)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition active:translate-x-[1px] active:translate-y-[1px] ${
                notesMode ? "ring-2 ring-[#c8531a]" : ""
              }`}
              style={{
                backgroundColor: notesMode ? "#c8531a" : "#fffdf7",
                color: notesMode ? "#fffdf7" : "#1a1510",
                boxShadow: "2px 2px 0 #8b7355",
              }}
            >
              Notes (N)
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-9 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const placed = countPlaced(n);
            const disabled = placed >= 9 || gameOver !== null || won;
            return (
              <button
                key={n}
                type="button"
                onClick={() => handleNumberInput(n)}
                disabled={disabled}
                className="flex aspect-square items-center justify-center rounded-lg text-xl transition active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  backgroundColor: "#fffdf7",
                  color: disabled ? "#9ca3af" : "#1a1510",
                  boxShadow: "2px 2px 0 #8b7355",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleErase}
            className="rounded-lg px-4 py-2 text-sm font-medium transition active:translate-x-[1px] active:translate-y-[1px]"
            style={{
              backgroundColor: "#fffdf7",
              color: "#1a1510",
              boxShadow: "2px 2px 0 #8b7355",
            }}
          >
            Erase (Backspace)
          </button>
        </div>

        {won && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
            onClick={(e) => e.target === e.currentTarget && startNewGame(difficulty)}
          >
            <div
              className="w-full max-w-sm rounded-xl p-6 opacity-0 animate-[slideUp_0.3s_ease-out_forwards]"
              style={{
                backgroundColor: "#fffdf7",
                boxShadow: "6px 6px 0 #8b7355",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="mb-2 text-2xl font-semibold"
                style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  color: "#1a1510",
                }}
              >
                You solved it!
              </h2>
              <p
                className="mb-4 text-sm"
                style={{ color: "#1a1510", fontFamily: "var(--font-dm-mono)" }}
              >
                Time: {formatTime(timer)}
              </p>
              <button
                type="button"
                onClick={() => startNewGame(difficulty)}
                className="w-full rounded-lg py-3 font-medium transition active:translate-x-[1px] active:translate-y-[1px]"
                style={{
                  backgroundColor: "#c8531a",
                  color: "#fffdf7",
                  boxShadow: "2px 2px 0 #8b7355",
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
