export const randomInt = (limit: number): number => Math.floor(Math.random() * limit);

export const pick = <T>(items: readonly T[]): T => items[randomInt(items.length)];

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export const range = (length: number): number[] => Array.from({ length }, (_, index) => index);
