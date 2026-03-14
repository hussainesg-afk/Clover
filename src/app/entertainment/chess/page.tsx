"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type Color = "w" | "b";

interface Piece {
  type: PieceType;
  color: Color;
}

type Board = (Piece | null)[][];

const PIECE_SYMBOLS: Record<string, string> = {
  wK: "\u2654",
  wQ: "\u2655",
  wR: "\u2656",
  wB: "\u2657",
  wN: "\u2658",
  wP: "\u2659",
  bK: "\u265A",
  bQ: "\u265B",
  bR: "\u265C",
  bB: "\u265D",
  bN: "\u265E",
  bP: "\u265F",
};

function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRank: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: "b" };
    board[1][col] = { type: "P", color: "b" };
    board[6][col] = { type: "P", color: "w" };
    board[7][col] = { type: backRank[col], color: "w" };
  }
  return board;
}

function getValidMoves(
  board: Board,
  row: number,
  col: number
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const isWhite = piece.color === "w";
  const dir = isWhite ? -1 : 1;

  const inBounds = (r: number, c: number) =>
    r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEmpty = (r: number, c: number) => !board[r][c];
  const isEnemy = (r: number, c: number) =>
    board[r][c] && board[r][c]!.color !== piece.color;
  const canMove = (r: number, c: number) =>
    inBounds(r, c) && (isEmpty(r, c) || isEnemy(r, c));

  const addRay = (dr: number, dc: number) => {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      if (isEmpty(r, c)) {
        moves.push([r, c]);
      } else if (isEnemy(r, c)) {
        moves.push([r, c]);
        break;
      } else break;
      r += dr;
      c += dc;
    }
  };

  switch (piece.type) {
    case "P": {
      if (inBounds(row + dir, col) && isEmpty(row + dir, col)) {
        moves.push([row + dir, col]);
        const startRow = isWhite ? 6 : 1;
        if (row === startRow && isEmpty(row + 2 * dir, col)) {
          moves.push([row + 2 * dir, col]);
        }
      }
      for (const dc of [-1, 1]) {
        if (inBounds(row + dir, col + dc) && isEnemy(row + dir, col + dc)) {
          moves.push([row + dir, col + dc]);
        }
      }
      break;
    }
    case "R":
      addRay(1, 0);
      addRay(-1, 0);
      addRay(0, 1);
      addRay(0, -1);
      break;
    case "B":
      addRay(1, 1);
      addRay(1, -1);
      addRay(-1, 1);
      addRay(-1, -1);
      break;
    case "N": {
      const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        const r = row + dr;
        const c = col + dc;
        if (canMove(r, c)) moves.push([r, c]);
      }
      break;
    }
    case "Q":
      addRay(1, 0);
      addRay(-1, 0);
      addRay(0, 1);
      addRay(0, -1);
      addRay(1, 1);
      addRay(1, -1);
      addRay(-1, 1);
      addRay(-1, -1);
      break;
    case "K": {
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if ((dr !== 0 || dc !== 0) && canMove(row + dr, col + dc)) {
            moves.push([row + dr, col + dc]);
          }
        }
      }
      break;
    }
  }

  return moves.filter(([r, c]) => {
    const newBoard = board.map((row) => row.map((p) => (p ? { ...p } : null)));
    newBoard[r][c] = newBoard[row][col];
    newBoard[row][col] = null;
    return !isInCheck(newBoard, piece.color);
  });
}

function isInCheck(board: Board, color: Color): boolean {
  let kingPos: [number, number] | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "K" && p.color === color) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return false;

  const [kr, kc] = kingPos;
  const enemyColor = color === "w" ? "b" : "w";

  const checkRay = (dr: number, dc: number, types: PieceType[]) => {
    let r = kr + dr;
    let c = kc + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p) {
        return p.color === enemyColor && types.includes(p.type);
      }
      r += dr;
      c += dc;
    }
    return false;
  };

  if (checkRay(1, 0, ["R", "Q"]) || checkRay(-1, 0, ["R", "Q"])) return true;
  if (checkRay(0, 1, ["R", "Q"]) || checkRay(0, -1, ["R", "Q"])) return true;
  if (checkRay(1, 1, ["B", "Q"]) || checkRay(1, -1, ["B", "Q"])) return true;
  if (checkRay(-1, 1, ["B", "Q"]) || checkRay(-1, -1, ["B", "Q"])) return true;

  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  for (const [dr, dc] of knightMoves) {
    const r = kr + dr;
    const c = kc + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p && p.color === enemyColor && p.type === "N") return true;
    }
  }

  const pawnDir = color === "w" ? -1 : 1;
  for (const dc of [-1, 1]) {
    const r = kr + pawnDir;
    const c = kc + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p && p.color === enemyColor && p.type === "P") return true;
    }
  }

  return false;
}

function hasValidMove(board: Board, color: Color): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && getValidMoves(board, r, c).length > 0) {
        return true;
      }
    }
  }
  return false;
}

type Move = { from: [number, number]; to: [number, number] };

function getAllMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        for (const [tr, tc] of getValidMoves(board, r, c)) {
          moves.push({ from: [r, c], to: [tr, tc] });
        }
      }
    }
  }
  return moves;
}

function applyMove(board: Board, move: Move): Board {
  const newBoard = board.map((row) =>
    row.map((p) => (p ? { ...p } : null))
  );
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = newBoard[fr][fc]!;
  newBoard[tr][tc] = piece;
  newBoard[fr][fc] = null;
  if (piece.type === "P" && (tr === 0 || tr === 7)) {
    newBoard[tr][tc] = { type: "Q", color: piece.color };
  }
  return newBoard;
}

const PIECE_VALUES: Record<PieceType, number> = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000,
};

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const val = PIECE_VALUES[p.type];
        const mult = p.color === "w" ? 1 : -1;
        score += val * mult;
      }
    }
  }
  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  const color: Color = maximizing ? "b" : "w";
  const moves = getAllMoves(board, color);

  if (depth === 0 || moves.length === 0) {
    return evaluateBoard(board);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const nextColor: Color = "w";
      const inCheck = isInCheck(newBoard, nextColor);
      const hasMove = hasValidMove(newBoard, nextColor);
      if (inCheck && !hasMove) return 100000;
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const nextColor: Color = "b";
      const inCheck = isInCheck(newBoard, nextColor);
      const hasMove = hasValidMove(newBoard, nextColor);
      if (inCheck && !hasMove) return -100000;
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBotMove(board: Board): Move | null {
  const moves = getAllMoves(board, "b");
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestEval = -Infinity;
  const depth = 2;

  for (const move of moves) {
    const newBoard = applyMove(board, move);
    const eval_ = minimax(newBoard, depth - 1, -Infinity, Infinity, false);
    if (eval_ > bestEval) {
      bestEval = eval_;
      bestMove = move;
    }
  }
  return bestMove;
}

export default function ChessPage() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [botThinking, setBotThinking] = useState(false);

  const isWhiteTurn = turn === "w";

  useEffect(() => {
    if (gameOver || turn !== "b") return;
    setBotThinking(true);
    const timer = setTimeout(() => {
      const move = getBotMove(board);
      if (move) {
        const newBoard = applyMove(board, move);
        setBoard(newBoard);
        setTurn("w");
        const inCheck = isInCheck(newBoard, "w");
        const hasMove = hasValidMove(newBoard, "w");
        if (inCheck && !hasMove) {
          setGameOver("Black wins by checkmate!");
        } else if (!inCheck && !hasMove) {
          setGameOver("Stalemate!");
        }
      } else {
        setGameOver("Stalemate!");
      }
      setBotThinking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [turn, board, gameOver]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameOver || turn !== "w" || botThinking) return;

      const piece = board[row][col];

      if (selected) {
        const [sr, sc] = selected;
        const isMove = validMoves.some(([r, c]) => r === row && c === col);

        if (isMove) {
          const newBoard = board.map((r) => r.map((p) => (p ? { ...p } : null)));
          const movedPiece = newBoard[sr][sc]!;

          newBoard[row][col] = movedPiece;
          newBoard[sr][sc] = null;

          if (movedPiece.type === "P" && (row === 0 || row === 7)) {
            newBoard[row][col] = { type: "Q", color: movedPiece.color };
          }

          setBoard(newBoard);
          setSelected(null);
          setValidMoves([]);

          const nextTurn = turn === "w" ? "b" : "w";
          setTurn(nextTurn);

          const inCheck = isInCheck(newBoard, nextTurn);
          const hasMove = hasValidMove(newBoard, nextTurn);

          if (inCheck && !hasMove) {
            setGameOver(`${turn === "w" ? "White" : "Black"} wins by checkmate!`);
          } else if (!inCheck && !hasMove) {
            setGameOver("Stalemate!");
          }
        } else if (piece && piece.color === turn) {
          setSelected([row, col]);
          setValidMoves(getValidMoves(board, row, col));
        } else {
          setSelected(null);
          setValidMoves([]);
        }
      } else if (piece && piece.color === turn) {
        setSelected([row, col]);
        setValidMoves(getValidMoves(board, row, col));
      }
    },
    [board, selected, validMoves, turn, gameOver, botThinking]
  );

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn("w");
    setSelected(null);
    setValidMoves([]);
    setGameOver(null);
    setBotThinking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/entertainment"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200/80 text-stone-600 transition hover:bg-stone-300 hover:text-stone-800"
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
          <h1 className="text-xl font-bold text-stone-800">Chess</h1>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-lg bg-stone-200/80 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-300"
          >
            New Game
          </button>
        </div>

        {gameOver && (
          <div className="mb-4 rounded-xl bg-amber-100 px-4 py-3 text-center font-semibold text-amber-900">
            {gameOver}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between rounded-xl bg-stone-200/50 px-4 py-2">
          <span className="text-sm font-medium text-stone-600">
            {isWhiteTurn
              ? "Your move"
              : botThinking
                ? "Bot is thinking..."
                : "Black to move"}
          </span>
        </div>

        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-stone-300 shadow-xl ${
            turn !== "w" || botThinking ? "pointer-events-none opacity-90" : ""
          }`}
        >
          <div className="grid grid-cols-8">
            {board.map((row, rowIdx) =>
              row.map((piece, colIdx) => {
                const isLight = (rowIdx + colIdx) % 2 === 0;
                const isSelected =
                  selected &&
                  selected[0] === rowIdx &&
                  selected[1] === colIdx;
                const isValidTarget = validMoves.some(
                  ([r, c]) => r === rowIdx && c === colIdx
                );

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    type="button"
                    disabled={turn !== "w" || botThinking}
                    onClick={() => handleSquareClick(rowIdx, colIdx)}
                    className={`flex aspect-square items-center justify-center text-3xl transition sm:text-4xl disabled:cursor-not-allowed ${
                      isLight ? "bg-stone-100" : "bg-stone-300"
                    } ${isSelected ? "ring-2 ring-inset ring-amber-500" : ""} ${
                      isValidTarget
                        ? piece
                          ? "bg-red-200/80"
                          : "bg-emerald-200/60"
                        : ""
                    } hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-amber-400`}
                  >
                    {piece && (
                      <span
                        className={
                          piece.color === "w"
                            ? "text-stone-800"
                            : "text-stone-900"
                        }
                      >
                        {PIECE_SYMBOLS[`${piece.color}${piece.type}`]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-stone-500">
          You play as White. Click a piece to select, then click a highlighted
          square to move. The bot plays as Black.
        </p>
      </div>
    </div>
  );
}
