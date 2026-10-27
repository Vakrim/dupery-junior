import { SIZES } from './data';
import { generateCase } from './generate';
import { earned } from './stamps';
import type { Case, Settings } from './types';

export type Mark = 'ok' | '?';

/** One game in progress. The functions below change it in place. */
export interface GameState {
  c: Case;
  /** Copy of the settings at the start, so later changes do not affect this game. */
  s: Settings;
  marks: Record<number, Mark | null>;
  /** Cells whose sentence the player has opened. */
  revealed: number[];
  arrested: number[];
  lives: number;
  /** Number of whole sentences the player can still hear. */
  tokens: number;
  selected: number | null;
  over: 'win' | 'lose' | null;
  /** Stamp ids, set when the player wins. */
  earned: string[];
}

export const START_TOKENS = 2;

export function newGame(settings: Settings): GameState | null {
  const [cols, rows] = SIZES[settings.size];
  const c = generateCase({ cols, rows, k: settings.k, liars: settings.liars });
  if (!c) return null;
  return {
    c, s: { ...settings }, marks: {}, revealed: [], arrested: [],
    lives: settings.lives, tokens: START_TOKENS, selected: null, over: null, earned: [],
  };
}

/** The first click opens the sentence. Later clicks select or unselect the cell. */
export function clickCell(g: GameState, i: number): void {
  if (g.over) return;
  if (!g.revealed.includes(i)) g.revealed.push(i);
  else g.selected = g.selected === i ? null : i;
}

export function toggleMark(g: GameState, i: number, mark: Mark): void {
  g.marks[i] = g.marks[i] === mark ? null : mark;
}

/** Returns false when no token is left. */
export function spendToken(g: GameState): boolean {
  if (g.tokens <= 0) return false;
  g.tokens--;
  return true;
}

export function arrest(g: GameState, i: number): void {
  if (g.over) return;
  if (g.c.thieves.includes(i)) {
    g.arrested.push(i);
    if (g.arrested.length === g.c.k) {
      g.over = 'win';
      g.earned = earned(g.s);
    }
  } else {
    g.marks[i] = 'ok'; // the player now knows this animal is innocent
    g.lives--;
    if (g.lives <= 0) g.over = 'lose';
  }
  g.selected = null;
}
