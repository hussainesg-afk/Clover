const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function wordExistsInGrid(grid: string[][], word: string): boolean {
  const w = word.toUpperCase();
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (!w) return false;

  function dfs(r: number, c: number, idx: number, visited: Set<string>): boolean {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const key = `${r},${c}`;
    if (visited.has(key)) return false;
    if (grid[r][c] !== w[idx]) return false;
    if (idx === w.length - 1) return true;
    visited.add(key);
    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc, idx + 1, visited)) return true;
    }
    visited.delete(key);
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0, new Set())) return true;
    }
  }
  return false;
}
