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
    for (let thiefCount = 1; thiefCount <= maxThieves(size); thiefCount++) {
      for (const liars of [false, true]) {
        it(`makes a case with one solution: ${size}, ${thiefCount} thief/thieves, liars ${liars}`, () => {
          for (let round = 0; round < 10; round++) {
            const generated = generateCase({ cols, rows, thiefCount, liars })!;
            expect(generated).not.toBeNull();
            expect(generated.thieves).toHaveLength(thiefCount);
            expect(generated.statements).toHaveLength(cols * rows);

            // Brute force, independent of the generator: only the real thieves fit every statement.
            const fits = combos(cols * rows, thiefCount).filter((thiefSet) =>
              generated.statements.every((statement, speaker) => holds(statement, speaker, thiefSet, generated.board) === (liars ? !thiefSet.includes(speaker) : true)));
            expect(fits).toEqual([generated.thieves]);
          }
        });
      }
    }
  }

  it('writes sentences of 3 to 5 words, all with known syllables', () => {
    for (const thiefCount of [1, 2, 3]) {
      const generated = generateCase({ cols: 4, rows: 4, thiefCount, liars: true })!;
      for (const statement of generated.statements) {
        const wordList = words(statement, thiefCount);
        expect(wordList.length, sentence(statement, thiefCount)).toBeGreaterThanOrEqual(3);
        expect(wordList.length, sentence(statement, thiefCount)).toBeLessThanOrEqual(5);
        for (const word of wordList) expect(syllables(word).join(''), word).toBe(word.toLowerCase());
      }
    }
  });

  it('returns null when it cannot make a case', () => {
    expect(generateCase({ cols: 3, rows: 3, thiefCount: 1, liars: false }, 0)).toBeNull();
  });
});
