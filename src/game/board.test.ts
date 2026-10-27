import { describe, expect, it } from 'vitest';
import { holds, matches, matchingCells, randomBoard } from './board';
import type { Board, Cell } from './types';

const plain: Cell = { species: 'pies', colour: 'red', hat: false, glasses: false, scarf: false };

/** 3x3 board of plain red dogs. Cells are numbered 0..8, row by row. */
const board = (patch: Record<number, Partial<Cell>> = {}): Board => ({
  cols: 3,
  rows: 3,
  cells: Array.from({ length: 9 }, (_, i) => ({ ...plain, ...patch[i] })),
});

describe('randomBoard', () => {
  it('makes cols * rows cells', () => {
    const b = randomBoard(4, 3);
    expect(b).toMatchObject({ cols: 4, rows: 3 });
    expect(b.cells).toHaveLength(12);
  });
});

describe('matches', () => {
  const b = board({ 4: { species: 'sowa', colour: 'blue', hat: true } });

  it('checks species, colour and accessories', () => {
    expect(matches({ type: 'species', val: 'sowa' }, 0, 4, b)).toBe(true);
    expect(matches({ type: 'species', val: 'sowa' }, 0, 3, b)).toBe(false);
    expect(matches({ type: 'colour', val: 'blue' }, 0, 4, b)).toBe(true);
    expect(matches({ type: 'hat' }, 0, 4, b)).toBe(true);
    expect(matches({ type: 'scarf' }, 0, 4, b)).toBe(false);
  });

  it('sees places from the speaker', () => {
    const speaker = 4; // centre
    const at = (type: 'beside' | 'above' | 'below') => [...Array(9).keys()].filter((c) => matches({ type }, speaker, c, b));
    expect(at('beside')).toEqual([1, 3, 5, 7]);
    expect(at('above')).toEqual([1]);
    expect(at('below')).toEqual([7]);
  });

  it('knows the edges of the board', () => {
    const at = (type: 'top' | 'bottom' | 'left' | 'right') => [...Array(9).keys()].filter((c) => matches({ type }, 4, c, b));
    expect(at('top')).toEqual([0, 1, 2]);
    expect(at('bottom')).toEqual([6, 7, 8]);
    expect(at('left')).toEqual([0, 3, 6]);
    expect(at('right')).toEqual([2, 5, 8]);
  });

  it('has nothing above a speaker in the top row', () => {
    expect(matchingCells({ prop: { type: 'above' }, neg: false }, 1, b)).toEqual([]);
  });
});

describe('holds', () => {
  const b = board({ 0: { hat: true }, 1: { hat: true } });
  const hat = { type: 'hat' } as const;

  it('needs exactly one matching thief for a positive statement', () => {
    expect(holds({ prop: hat, neg: false }, 8, [0, 5], b)).toBe(true);
    expect(holds({ prop: hat, neg: false }, 8, [0, 1], b)).toBe(false); // two match
    expect(holds({ prop: hat, neg: false }, 8, [5, 6], b)).toBe(false); // none match
  });

  it('needs no matching thief for a negative statement', () => {
    expect(holds({ prop: hat, neg: true }, 8, [5, 6], b)).toBe(true);
    expect(holds({ prop: hat, neg: true }, 8, [0, 5], b)).toBe(false);
  });
});
