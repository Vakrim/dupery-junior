import { describe, expect, it } from 'vitest';
import { holds } from './board';
import { SIZES } from './data';
import { combos, generateCase } from './generate';
import { sentence, syllables, words } from './sentences';
import { maxThieves } from './stamps';
import type { SizeId } from './types';

describe('combos', () => {
  it('lists the subsets in order', () => {
    expect(combos(4, 2)).toEqual([[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]);
    expect(combos(3, 0)).toEqual([[]]);
    expect(combos(2, 3)).toEqual([]);
  });
});

describe('generateCase', () => {
  const sizes = Object.keys(SIZES) as SizeId[];

  for (const size of sizes) {
    const [cols, rows] = SIZES[size];
    for (let k = 1; k <= maxThieves(size); k++) {
      for (const liars of [false, true]) {
        it(`makes a case with one solution: ${size}, ${k} thief/thieves, liars ${liars}`, () => {
          for (let n = 0; n < 10; n++) {
            const c = generateCase({ cols, rows, k, liars })!;
            expect(c).not.toBeNull();
            expect(c.thieves).toHaveLength(k);
            expect(c.statements).toHaveLength(cols * rows);

            // Brute force, independent of the generator: only the real thieves fit every statement.
            const fits = combos(cols * rows, k).filter((set) =>
              c.statements.every((s, speaker) => holds(s, speaker, set, c.board) === (liars ? !set.includes(speaker) : true)));
            expect(fits).toEqual([c.thieves]);
          }
        });
      }
    }
  }

  it('writes sentences of 3 to 5 words, all with known syllables', () => {
    for (const k of [1, 2, 3]) {
      const c = generateCase({ cols: 4, rows: 4, k, liars: true })!;
      for (const s of c.statements) {
        const ws = words(s, k);
        expect(ws.length, sentence(s, k)).toBeGreaterThanOrEqual(3);
        expect(ws.length, sentence(s, k)).toBeLessThanOrEqual(5);
        for (const w of ws) expect(syllables(w).join(''), w).toBe(w.toLowerCase());
      }
    }
  });

  it('returns null when it cannot make a case', () => {
    expect(generateCase({ cols: 3, rows: 3, k: 1, liars: false }, 0)).toBeNull();
  });
});
