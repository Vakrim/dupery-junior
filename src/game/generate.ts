import { ACCESSORY_TYPES, holds, randomBoard } from './board';
import { COLOURS, PLACES, SPECIES } from './data';
import { pick, range, shuffle } from './random';
import type { Case, PlaceType, Property, Statement } from './types';

const DEFAULT_TRIES = 300;
/** How many random statements a speaker tries. The one that removes most suspects wins. */
const STATEMENT_SAMPLES = 4;

/** All k-element subsets of 0..n-1, in order. */
export function combos(n: number, k: number, start = 0, cur: number[] = [], out: number[][] = []): number[][] {
  if (cur.length === k) {
    out.push(cur.slice());
    return out;
  }
  for (let i = start; i < n; i++) {
    cur.push(i);
    combos(n, k, i + 1, cur, out);
    cur.pop();
  }
  return out;
}

function allStatements(): Statement[] {
  const props: Property[] = [
    ...SPECIES.map((x): Property => ({ type: 'species', val: x.id })),
    ...ACCESSORY_TYPES.map((type): Property => ({ type })),
    ...COLOURS.map((x): Property => ({ type: 'colour', val: x.id })),
    ...(Object.keys(PLACES) as PlaceType[]).map((type): Property => ({ type })),
  ];
  return props.flatMap((prop) => {
    const out: Statement[] = [{ prop, neg: false }];
    // "Złodziej nie jest na czerwonym" would need 6 words, so colours have no negative form.
    if (prop.type !== 'colour') out.push({ prop, neg: true });
    return out;
  });
}

const STATEMENTS = allStatements();

interface CaseOptions {
  cols: number;
  rows: number;
  k: number;
  liars: boolean;
}

/**
 * Makes a case with exactly one solution. Each cell says one statement.
 * Innocent speakers tell the truth. When `liars` is on, every thief says something false.
 * Returns null after too many failed tries.
 */
export function generateCase({ cols, rows, k, liars }: CaseOptions, tries = DEFAULT_TRIES): Case | null {
  const n = cols * rows;
  for (let t = 0; t < tries; t++) {
    const board = randomBoard(cols, rows);
    const thieves = shuffle(range(n)).slice(0, k).sort((a, b) => a - b);
    let alive = combos(n, k); // thief sets that still fit every statement so far
    const statements = Array<Statement>(n);
    let ok = true;
    for (const speaker of shuffle(range(n))) {
      // Is the speaker a thief in this candidate set? Then, with liars on, the statement must fail.
      const wanted = (set: readonly number[]) => (liars ? !set.includes(speaker) : true);
      const usable = STATEMENTS.filter((s) => holds(s, speaker, thieves, board) === wanted(thieves));
      if (!usable.length) { ok = false; break; }
      let best: { s: Statement; left: number[][] } | null = null;
      for (let i = 0; i < STATEMENT_SAMPLES; i++) {
        const s = pick(usable);
        const left = alive.filter((set) => holds(s, speaker, set, board) === wanted(set));
        if (!best || left.length < best.left.length) best = { s, left };
      }
      statements[speaker] = best!.s;
      alive = best!.left;
    }
    if (ok && alive.length === 1) return { board, thieves, statements, k, liars };
  }
  return null;
}
