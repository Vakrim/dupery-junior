import { describe, expect, it } from 'vitest';
import { arrest, clickCell, newGame, spendToken, START_TOKENS, toggleMark, type GameState } from './session';
import type { Settings } from './types';

const settings: Settings = { size: '3x3', k: 2, liars: false, read: true, hints: true, syl: true, lives: 2 };

function game(over: Partial<Settings> = {}): GameState {
  return newGame({ ...settings, ...over })!;
}
const innocent = (g: GameState) => [...Array(9).keys()].filter((i) => !g.c.thieves.includes(i));

describe('newGame', () => {
  it('starts with full lives and tokens', () => {
    const g = game();
    expect(g).toMatchObject({ lives: 2, tokens: START_TOKENS, over: null, arrested: [], selected: null });
    expect(g.c.board.cells).toHaveLength(9);
  });

  it('copies the settings', () => {
    const s = { ...settings };
    const g = newGame(s)!;
    s.lives = 1;
    expect(g.s.lives).toBe(2);
  });
});

describe('clickCell', () => {
  it('opens the sentence first, then selects, then unselects', () => {
    const g = game();
    clickCell(g, 3);
    expect(g.revealed).toEqual([3]);
    expect(g.selected).toBeNull();
    clickCell(g, 3);
    expect(g.selected).toBe(3);
    clickCell(g, 3);
    expect(g.selected).toBeNull();
  });

  it('does nothing when the game is over', () => {
    const g = game();
    g.over = 'lose';
    clickCell(g, 3);
    expect(g.revealed).toEqual([]);
  });
});

describe('toggleMark', () => {
  it('sets a mark and clears it on the second click', () => {
    const g = game();
    toggleMark(g, 1, '?');
    expect(g.marks[1]).toBe('?');
    toggleMark(g, 1, 'ok');
    expect(g.marks[1]).toBe('ok');
    toggleMark(g, 1, 'ok');
    expect(g.marks[1]).toBeNull();
  });
});

describe('spendToken', () => {
  it('stops at zero', () => {
    const g = game();
    expect(spendToken(g)).toBe(true);
    expect(spendToken(g)).toBe(true);
    expect(spendToken(g)).toBe(false);
    expect(g.tokens).toBe(0);
  });
});

describe('arrest', () => {
  it('wins after the last thief and sets the stamps', () => {
    const g = game();
    const [a, b] = g.c.thieves;
    arrest(g, a);
    expect(g.over).toBeNull();
    arrest(g, b);
    expect(g.over).toBe('win');
    expect(g.earned).toContain('case');
  });

  it('costs a life for an innocent animal and marks it', () => {
    const g = game();
    const i = innocent(g)[0];
    g.selected = i;
    arrest(g, i);
    expect(g.lives).toBe(1);
    expect(g.marks[i]).toBe('ok');
    expect(g.selected).toBeNull();
    expect(g.over).toBeNull();
  });

  it('loses at zero lives', () => {
    const g = game({ lives: 1 });
    arrest(g, innocent(g)[0]);
    expect(g.over).toBe('lose');
    expect(g.earned).toEqual([]);
  });

  it('does nothing after the game is over', () => {
    const g = game({ lives: 1 });
    arrest(g, innocent(g)[0]);
    arrest(g, innocent(g)[1]);
    expect(g.lives).toBe(0);
  });
});
