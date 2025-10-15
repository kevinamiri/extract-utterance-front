// similarity utils

/**
 * Calculates the Levenshtein distance between two arrays of words.
 */
export function levenshtein_distance(a: string[], b: string[]): number { // distance
  const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0)); // matrix
  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i; // init row
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j; // init col
  for (let j = 1; j <= b.length; j += 1) { // rows
    for (let i = 1; i <= a.length; i += 1) { // cols
      const sub = a[i - 1] === b[j - 1] ? 0 : 1; // cost
      matrix[j][i] = Math.min( // pick min
        matrix[j][i - 1] + 1, // del
        matrix[j - 1][i] + 1, // ins
        matrix[j - 1][i - 1] + sub // sub
      );
    }
  }
  return matrix[b.length][a.length]; // distance
}

/**
 * Example:
 * best_match('all-right', ['can-opener','all-right-thats-it']) -> {idx:1,dist:2,norm:0.33}
 */
export function best_match(target_tokens: string[], candidates: string[][]): { idx: number; dist: number; norm: number; } | null { // best match
  if (!candidates.length) return null; // guard
  let best = { idx: -1, dist: Infinity, norm: Infinity }; // init
  for (let i = 0; i < candidates.length; i++) { // loop
    const dist = levenshtein_distance(target_tokens, candidates[i]); // dist
    const denom = Math.max(target_tokens.length, candidates[i].length, 1); // denom
    const norm = dist / denom; // normalized
    if (norm < best.norm) best = { idx: i, dist, norm }; // update
  }
  return best.idx >= 0 ? best : null; // result
}