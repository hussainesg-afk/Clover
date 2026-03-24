"use client";

import { useState, useCallback, useMemo } from "react";
import EntertainmentGameShell from "@/components/entertainment/EntertainmentGameShell";

type Cell = null | "b" | "w";

function initBoard(): Cell[][] {
  const b: Cell[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = "b";
        if (r > 4) b[r][c] = "w";
      }
    }
  }
  return b;
}

type Move = { to: [number, number]; capture?: [number, number] };

function legalMovesFor(
  board: Cell[][],
  r: number,
  c: number,
  turn: "b" | "w",
): Move[] {
  const piece = board[r][c];
  if (piece !== turn) return [];
  const dirs =
    turn === "b"
      ? [
          [1, -1],
          [1, 1],
        ]
      : [
          [-1, -1],
          [-1, 1],
        ];
  const opp: Cell = turn === "b" ? "w" : "b";
  const moves: Move[] = [];
  for (const [dr, dc] of dirs) {
    const r2 = r + dr;
    const c2 = c + dc;
    if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && board[r2][c2] === null) {
      moves.push({ to: [r2, c2] });
    }
    const r3 = r + 2 * dr;
    const c3 = c + 2 * dc;
    if (
      r3 >= 0 &&
      r3 < 8 &&
      c3 >= 0 &&
      c3 < 8 &&
      board[r2]?.[c2] === opp &&
      board[r3][c3] === null
    ) {
      moves.push({ to: [r3, c3], capture: [r2, c2] });
    }
  }
  return moves;
}

function countPieces(board: Cell[][], color: "b" | "w"): number {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === color) n++;
    }
  }
  return n;
}

export default function CheckersPage() {
  const [board, setBoard] = useState<Cell[][]>(() => initBoard());
  const [turn, setTurn] = useState<"b" | "w">("b");
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const movesForSelected = useMemo(() => {
    if (!selected) return [];
    return legalMovesFor(board, selected[0], selected[1], turn);
  }, [board, selected, turn]);

  const anyLegalForTurn = useMemo(() => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === turn && legalMovesFor(board, r, c, turn).length > 0) {
          return true;
        }
      }
    }
    return false;
  }, [board, turn]);

  const blackLeft = useMemo(() => countPieces(board, "b"), [board]);
  const whiteLeft = useMemo(() => countPieces(board, "w"), [board]);

  const winner = useMemo(() => {
    if (blackLeft === 0) return "w" as const;
    if (whiteLeft === 0) return "b" as const;
    if (!anyLegalForTurn) return turn === "b" ? ("w" as const) : ("b" as const);
    return null;
  }, [blackLeft, whiteLeft, anyLegalForTurn, turn]);

  const reset = () => {
    setBoard(initBoard());
    setTurn("b");
    setSelected(null);
  };

  const tryMove = useCallback(
    (toR: number, toC: number) => {
      if (winner) return;
      const m = movesForSelected.find((mv) => mv.to[0] === toR && mv.to[1] === toC);
      if (!m || !selected) return;
      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        const [fr, fc] = selected;
        next[toR][toC] = next[fr][fc];
        next[fr][fc] = null;
        if (m.capture) {
          const [cr, cc] = m.capture;
          next[cr][cc] = null;
        }
        return next;
      });
      setSelected(null);
      setTurn((t) => (t === "b" ? "w" : "b"));
    },
    [movesForSelected, selected, winner],
  );

  const clickCell = (r: number, c: number) => {
    if (winner) return;
    const cell = board[r][c];
    if (cell === turn) {
      setSelected([r, c]);
      return;
    }
    if (selected) {
      tryMove(r, c);
    }
  };

  return (
    <EntertainmentGameShell
      title="Checkers"
      subtitle="Two players on one device. Black moves down first. Diagonal moves; jump to capture."
      accent="#3333FF"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-stone-600">
          Black: <strong>{blackLeft}</strong> White: <strong>{whiteLeft}</strong>
        </span>
        <span className="font-semibold text-stone-800">
          Turn: {turn === "b" ? "Black" : "White"}
        </span>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-300"
        >
          New game
        </button>
      </div>
      {winner && (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-center font-semibold text-emerald-900">
          {winner === "b" ? "Black wins." : "White wins."}
        </p>
      )}
      <div className="mx-auto grid max-w-md grid-cols-8 gap-0.5 rounded-lg border-2 border-stone-800 bg-amber-900 p-1">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const canLand = movesForSelected.some((mv) => mv.to[0] === r && mv.to[1] === c);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => clickCell(r, c)}
                className={`relative flex aspect-square items-center justify-center ${
                  dark ? "bg-amber-800" : "bg-amber-200"
                } ${canLand ? "ring-2 ring-emerald-400 ring-inset" : ""}`}
                aria-label={`cell ${r},${c}`}
              >
                {cell && (
                  <span
                    className={`h-3/4 w-3/4 rounded-full border-2 border-stone-900 shadow-md ${
                      cell === "b" ? "bg-stone-900" : "bg-stone-100"
                    } ${isSel ? "ring-4 ring-yellow-300" : ""}`}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </EntertainmentGameShell>
  );
}
