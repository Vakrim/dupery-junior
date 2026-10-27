import { ACCESSORIES, COLOURS, SPECIES } from './data';
import { pick } from './random';
import type { AccessoryType, Board, Cell, ColourId, PlaceType, Property, SpeciesId, Statement } from './types';

const ACCESSORY_CHANCE = 0.4;

export const ACCESSORY_TYPES = Object.keys(ACCESSORIES) as AccessoryType[];

export const speciesById = (speciesId: SpeciesId) => SPECIES.find((species) => species.id === speciesId)!;
export const colourById = (colourId: ColourId) => COLOURS.find((colour) => colour.id === colourId)!;

export function randomBoard(cols: number, rows: number): Board {
  const cells: Cell[] = [];
  for (let index = 0; index < cols * rows; index++) {
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

interface Position { row: number; column: number }

const positionOf = (cellIndex: number, board: Board): Position => ({ row: Math.floor(cellIndex / board.cols), column: cellIndex % board.cols });

// Each test answers: is the cell `cell` in this place, as seen from the speaker `speaker`?
const PLACE_TESTS: Record<PlaceType, (cell: Position, speaker: Position, board: Board) => boolean> = {
  beside: (cell, speaker) => Math.abs(cell.row - speaker.row) + Math.abs(cell.column - speaker.column) === 1,
  above: (cell, speaker) => cell.column === speaker.column && cell.row === speaker.row - 1,
  below: (cell, speaker) => cell.column === speaker.column && cell.row === speaker.row + 1,
  top: (cell) => cell.row === 0,
  bottom: (cell, _speaker, board) => cell.row === board.rows - 1,
  left: (cell) => cell.column === 0,
  right: (cell, _speaker, board) => cell.column === board.cols - 1,
};

/** Does cell `cellIndex` match property `prop`, as seen by the speaker `speaker`? */
export function matches(prop: Property, speaker: number, cellIndex: number, board: Board): boolean {
  const cell = board.cells[cellIndex];
  switch (prop.type) {
    case 'species': return cell.species === prop.value;
    case 'colour': return cell.colour === prop.value;
    case 'hat':
    case 'glasses':
    case 'scarf': return cell[prop.type];
    default: return PLACE_TESTS[prop.type](positionOf(cellIndex, board), positionOf(speaker, board), board);
  }
}

export const matchingCells = (statement: Statement, speaker: number, board: Board): number[] =>
  board.cells.map((_, index) => index).filter((cellIndex) => matches(statement.prop, speaker, cellIndex, board));

/** Positive statement: exactly one thief matches. Negative statement: no thief matches. */
export function holds(statement: Statement, speaker: number, thieves: readonly number[], board: Board): boolean {
  const matchCount = thieves.filter((thief) => matches(statement.prop, speaker, thief, board)).length;
  return statement.negated ? matchCount === 0 : matchCount === 1;
}
