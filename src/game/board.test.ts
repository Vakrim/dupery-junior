import { describe, expect, it } from 'vitest';
import { holds, matches, matchingCells, randomBoard } from './board';
import type { Board, Cell } from './types';

const plain: Cell = { species: 'pies', colour: 'red', hat: false, glasses: false, scarf: false };

/** 3x3 board of plain red dogs. Cells are numbered 0..8, row by row. */
const board = (patch: Record<number, Partial<Cell>> = {}): Board => ({
  cols: 3,
  rows: 3,
  cells: Array.from({ length: 9 }, (_, index) => ({ ...plain, ...patch[index] })),
});

describe('randomBoard', () => {
  it('makes cols * rows cells', () => {
    const random = randomBoard(4, 3);
    expect(random).toMatchObject({ cols: 4, rows: 3 });
    expect(random.cells).toHaveLength(12);
  });
});

describe('matches', () => {
  const testBoard = board({ 4: { species: 'sowa', colour: 'blue', hat: true } });

  it('checks species, colour and accessories', () => {
    expect(matches({ type: 'species', value: 'sowa' }, 0, 4, testBoard)).toBe(true);
    expect(matches({ type: 'species', value: 'sowa' }, 0, 3, testBoard)).toBe(false);
    expect(matches({ type: 'colour', value: 'blue' }, 0, 4, testBoard)).toBe(true);
    expect(matches({ type: 'hat' }, 0, 4, testBoard)).toBe(true);
    expect(matches({ type: 'scarf' }, 0, 4, testBoard)).toBe(false);
  });

  it('sees places from the speaker', () => {
    const speaker = 4; // centre
    const cellsAt = (type: 'beside' | 'above' | 'below') => [...Array(9).keys()].filter((cellIndex) => matches({ type }, speaker, cellIndex, testBoard));
    expect(cellsAt('beside')).toEqual([1, 3, 5, 7]);
    expect(cellsAt('above')).toEqual([1]);
    expect(cellsAt('below')).toEqual([7]);
  });

  it('knows the edges of the board', () => {
    const cellsAt = (type: 'top' | 'bottom' | 'left' | 'right') => [...Array(9).keys()].filter((cellIndex) => matches({ type }, 4, cellIndex, testBoard));
    expect(cellsAt('top')).toEqual([0, 1, 2]);
    expect(cellsAt('bottom')).toEqual([6, 7, 8]);
    expect(cellsAt('left')).toEqual([0, 3, 6]);
    expect(cellsAt('right')).toEqual([2, 5, 8]);
  });

  it('has nothing above a speaker in the top row', () => {
    expect(matchingCells({ prop: { type: 'above' }, negated: false }, 1, testBoard)).toEqual([]);
  });
});

describe('holds', () => {
  const testBoard = board({ 0: { hat: true }, 1: { hat: true } });
  const hat = { type: 'hat' } as const;

  it('needs exactly one matching thief for a positive statement', () => {
    expect(holds({ prop: hat, negated: false }, 8, [0, 5], testBoard)).toBe(true);
    expect(holds({ prop: hat, negated: false }, 8, [0, 1], testBoard)).toBe(false); // two match
    expect(holds({ prop: hat, negated: false }, 8, [5, 6], testBoard)).toBe(false); // none match
  });

  it('needs no matching thief for a negative statement', () => {
    expect(holds({ prop: hat, negated: true }, 8, [5, 6], testBoard)).toBe(true);
    expect(holds({ prop: hat, negated: true }, 8, [0, 5], testBoard)).toBe(false);
  });
});
