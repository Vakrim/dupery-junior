import { ACCESSORY_TYPES, holds, randomBoard } from './board';
import { COLOURS, PLACES, SPECIES } from './data';
import { pick, range, shuffle } from './random';
import type { Case, PlaceType, Property, Statement } from './types';

const DEFAULT_TRIES = 300;
/** How many random statements a speaker tries. The one that removes most suspects wins. */
const STATEMENT_SAMPLES = 4;

/** All subsets with `size` elements of 0..count-1, in order. */
export function combos(count: number, size: number, start = 0, current: number[] = [], result: number[][] = []): number[][] {
  if (current.length === size) {
    result.push(current.slice());
    return result;
  }
  for (let index = start; index < count; index++) {
    current.push(index);
    combos(count, size, index + 1, current, result);
    current.pop();
  }
  return result;
}

function allStatements(): Statement[] {
  const props: Property[] = [
    ...SPECIES.map((species): Property => ({ type: 'species', value: species.id })),
    ...ACCESSORY_TYPES.map((type): Property => ({ type })),
    ...COLOURS.map((colour): Property => ({ type: 'colour', value: colour.id })),
    ...(Object.keys(PLACES) as PlaceType[]).map((type): Property => ({ type })),
  ];
  return props.flatMap((prop) => {
    const result: Statement[] = [{ prop, negated: false }];
    // "Złodziej nie jest na czerwonym" would need 6 words, so colours have no negative form.
    if (prop.type !== 'colour') result.push({ prop, negated: true });
    return result;
  });
}

const STATEMENTS = allStatements();

interface CaseOptions {
  cols: number;
  rows: number;
  thiefCount: number;
  liars: boolean;
}

/**
 * Makes a case with exactly one solution. Each cell says one statement.
 * Innocent speakers tell the truth. When `liars` is on, every thief says something false.
 * Returns null after too many failed tries.
 */
export function generateCase({ cols, rows, thiefCount, liars }: CaseOptions, tries = DEFAULT_TRIES): Case | null {
  const cellCount = cols * rows;
  for (let attempt = 0; attempt < tries; attempt++) {
    const board = randomBoard(cols, rows);
    const thieves = shuffle(range(cellCount)).slice(0, thiefCount).sort((first, second) => first - second);
    let alive = combos(cellCount, thiefCount); // thief sets that still fit every statement so far
    const statements = Array<Statement>(cellCount);
    let solvable = true;
    for (const speaker of shuffle(range(cellCount))) {
      // Is the speaker a thief in this candidate set? Then, with liars on, the statement must fail.
      const wanted = (thiefSet: readonly number[]) => (liars ? !thiefSet.includes(speaker) : true);
      const usable = STATEMENTS.filter((candidate) => holds(candidate, speaker, thieves, board) === wanted(thieves));
      if (!usable.length) { solvable = false; break; }
      let best: { statement: Statement; left: number[][] } | null = null;
      for (let sample = 0; sample < STATEMENT_SAMPLES; sample++) {
        const statement = pick(usable);
        const left = alive.filter((thiefSet) => holds(statement, speaker, thiefSet, board) === wanted(thiefSet));
        if (!best || left.length < best.left.length) best = { statement, left };
      }
      statements[speaker] = best!.statement;
      alive = best!.left;
    }
    if (solvable && alive.length === 1) return { board, thieves, statements, thiefCount, liars };
  }
  return null;
}
