export const rnd = (n: number): number => Math.floor(Math.random() * n);

export const pick = <T>(items: readonly T[]): T => items[rnd(items.length)];

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
