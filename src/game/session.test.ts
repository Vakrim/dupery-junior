import { describe, expect, it } from 'vitest';
import { arrest, clickCell, newGame, toggleMark, type GameState } from './session';
import type { Settings } from './types';

const settings: Settings = { size: '3x3', thiefCount: 2, liars: false, hints: true, syllables: true, lives: 2 };

function startGame(over: Partial<Settings> = {}): GameState {
  return newGame({ ...settings, ...over })!;
}
const innocent = (game: GameState) => [...Array(9).keys()].filter((cellIndex) => !game.puzzle.thieves.includes(cellIndex));

describe('newGame', () => {
  it('starts with full lives', () => {
    const game = startGame();
    expect(game).toMatchObject({ lives: 2, over: null, arrested: [], selected: null });
    expect(game.puzzle.board.cells).toHaveLength(9);
  });

  it('copies the settings', () => {
    const changed = { ...settings };
    const game = newGame(changed)!;
    changed.lives = 1;
    expect(game.settings.lives).toBe(2);
  });
});

describe('clickCell', () => {
  it('opens the sentence first, then selects, then unselects', () => {
    const game = startGame();
    clickCell(game, 3);
    expect(game.revealed).toEqual([3]);
    expect(game.selected).toBeNull();
    clickCell(game, 3);
    expect(game.selected).toBe(3);
    clickCell(game, 3);
    expect(game.selected).toBeNull();
  });

  it('does nothing when the game is over', () => {
    const game = startGame();
    game.over = 'lose';
    clickCell(game, 3);
    expect(game.revealed).toEqual([]);
  });
});

describe('toggleMark', () => {
  it('sets a mark and clears it on the second click', () => {
    const game = startGame();
    toggleMark(game, 1, '?');
    expect(game.marks[1]).toBe('?');
    toggleMark(game, 1, 'ok');
    expect(game.marks[1]).toBe('ok');
    toggleMark(game, 1, 'ok');
    expect(game.marks[1]).toBeNull();
  });
});

describe('arrest', () => {
  it('wins after the last thief and sets the stamps', () => {
    const game = startGame();
    const [first, second] = game.puzzle.thieves;
    arrest(game, first);
    expect(game.over).toBeNull();
    arrest(game, second);
    expect(game.over).toBe('win');
    expect(game.earned).toContain('case');
  });

  it('costs a life for an innocent animal and marks it', () => {
    const game = startGame();
    const cellIndex = innocent(game)[0];
    game.selected = cellIndex;
    arrest(game, cellIndex);
    expect(game.lives).toBe(1);
    expect(game.marks[cellIndex]).toBe('ok');
    expect(game.selected).toBeNull();
    expect(game.over).toBeNull();
  });

  it('loses at zero lives', () => {
    const game = startGame({ lives: 1 });
    arrest(game, innocent(game)[0]);
    expect(game.over).toBe('lose');
    expect(game.earned).toEqual([]);
  });

  it('does nothing after the game is over', () => {
    const game = startGame({ lives: 1 });
    arrest(game, innocent(game)[0]);
    arrest(game, innocent(game)[1]);
    expect(game.lives).toBe(0);
  });
});
