import type { ACCESSORIES, COLOURS, PLACES, SIZES, SPECIES } from './data';

export type SpeciesId = (typeof SPECIES)[number]['id'];
export type ColourId = (typeof COLOURS)[number]['id'];
export type AccessoryType = keyof typeof ACCESSORIES;
export type PlaceType = keyof typeof PLACES;
export type SizeId = keyof typeof SIZES;

export type Cell = { species: SpeciesId; colour: ColourId } & Record<AccessoryType, boolean>;

export interface Board {
  cols: number;
  rows: number;
  cells: Cell[];
}

/** A fact about a cell, as seen from the cell of the speaker. */
export type Property =
  | { type: 'species'; value: SpeciesId }
  | { type: 'colour'; value: ColourId }
  | { type: AccessoryType }
  | { type: PlaceType };

export interface Statement {
  prop: Property;
  /** Negative: "no thief matches". Positive: "exactly one thief matches". */
  negated: boolean;
}

export interface Settings {
  size: SizeId;
  /** Number of thieves. */
  thiefCount: number;
  liars: boolean;
  /** Help options: arrows and colours, syllables. */
  hints: boolean;
  syllables: boolean;
  lives: number;
}

export interface Case {
  board: Board;
  thieves: number[];
  /** One statement per cell, indexed by cell. */
  statements: Statement[];
  thiefCount: number;
  liars: boolean;
}
