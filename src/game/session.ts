import { SIZES } from './data';
import { generateCase } from './generate';
import { earned } from './stamps';
import type { Case, Settings } from './types';

export type Mark = 'ok' | '?';

/** One game in progress. The functions below change it in place. */
export interface GameState {
  puzzle: Case;
  /** Copy of the settings at the start, so later changes do not affect this game. */
  settings: Settings;
  marks: Record<number, Mark | null>;
  /** Cells whose sentence the player has opened. */
  revealed: number[];
  arrested: number[];
  lives: number;
  selected: number | null;
  over: 'win' | 'lose' | null;
  /** Stamp ids, set when the player wins. */
  earned: string[];
}

export function newGame(settings: Settings): GameState | null {
  const [cols, rows] = SIZES[settings.size];
  const generated = generateCase({ cols, rows, thiefCount: settings.thiefCount, liars: settings.liars });
  if (!generated) return null;
  return {
    puzzle: generated, settings: { ...settings }, marks: {}, revealed: [], arrested: [],
    lives: settings.lives, selected: null, over: null, earned: [],
  };
}

/** The first click opens the sentence. Later clicks select or unselect the cell. */
export function clickCell(game: GameState, cellIndex: number): void {
  if (game.over) return;
  if (!game.revealed.includes(cellIndex)) game.revealed.push(cellIndex);
  else game.selected = game.selected === cellIndex ? null : cellIndex;
}

export function toggleMark(game: GameState, cellIndex: number, mark: Mark): void {
  game.marks[cellIndex] = game.marks[cellIndex] === mark ? null : mark;
}

export function arrest(game: GameState, cellIndex: number): void {
  if (game.over) return;
  if (game.puzzle.thieves.includes(cellIndex)) {
    game.arrested.push(cellIndex);
    if (game.arrested.length === game.puzzle.thiefCount) {
      game.over = 'win';
      game.earned = earned(game.settings);
    }
  } else {
    game.marks[cellIndex] = 'ok'; // the player now knows this animal is innocent
    game.lives--;
    if (game.lives <= 0) game.over = 'lose';
  }
  game.selected = null;
}
