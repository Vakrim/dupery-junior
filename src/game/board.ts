import { ACCESSORIES, COLOURS, SPECIES } from './data';
import { pick } from './random';
import type { AccessoryType, Board, Cell, ColourId, PlaceType, Property, SpeciesId, Statement } from './types';

const ACCESSORY_CHANCE = 0.4;

export const ACCESSORY_TYPES = Object.keys(ACCESSORIES) as AccessoryType[];

export const speciesById = (id: SpeciesId) => SPECIES.find((x) => x.id === id)!;
export const colourById = (id: ColourId) => COLOURS.find((x) => x.id === id)!;

export function randomBoard(cols: number, rows: number): Board {
  const cells: Cell[] = [];
  for (let i = 0; i < cols * rows; i++) {
    cells.push({
      species: pick(SPECIES).id,
      colour: pick(COLOURS).id,
      hat: Math.random() < ACCESSORY_CHANCE,
      glasses: Math.random() < ACCESSORY_CHANCE,
      scarf: Math.random() < ACCESSORY_CHANCE,
    });
  }
  return { cols, rows, cells };
}

interface Pos { row: number; col: number }

const posOf = (i: number, board: Board): Pos => ({ row: Math.floor(i / board.cols), col: i % board.cols });

// Each test answers: is the cell `c` in this place, as seen from the speaker `sp`?
const PLACE_TESTS: Record<PlaceType, (c: Pos, sp: Pos, board: Board) => boolean> = {
  beside: (c, sp) => Math.abs(c.row - sp.row) + Math.abs(c.col - sp.col) === 1,
  above: (c, sp) => c.col === sp.col && c.row === sp.row - 1,
  below: (c, sp) => c.col === sp.col && c.row === sp.row + 1,
  top: (c) => c.row === 0,
  bottom: (c, _sp, board) => c.row === board.rows - 1,
  left: (c) => c.col === 0,
  right: (c, _sp, board) => c.col === board.cols - 1,
};

/** Does cell `c` match property `prop`, as seen by the speaker `speaker`? */
export function matches(prop: Property, speaker: number, c: number, board: Board): boolean {
  const cell = board.cells[c];
  switch (prop.type) {
    case 'species': return cell.species === prop.val;
    case 'colour': return cell.colour === prop.val;
    case 'hat':
    case 'glasses':
    case 'scarf': return cell[prop.type];
    default: return PLACE_TESTS[prop.type](posOf(c, board), posOf(speaker, board), board);
  }
}

export const matchingCells = (s: Statement, speaker: number, board: Board): number[] =>
  board.cells.map((_, c) => c).filter((c) => matches(s.prop, speaker, c, board));

/** Positive statement: exactly one thief matches. Negative statement: no thief matches. */
export function holds(s: Statement, speaker: number, thieves: readonly number[], board: Board): boolean {
  const n = thieves.filter((c) => matches(s.prop, speaker, c, board)).length;
  return s.neg ? n === 0 : n === 1;
}
