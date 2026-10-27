import { ACCESSORIES, PLACES, SYLLABLES } from './data';
import { colourById, speciesById } from './board';
import type { Property, Statement } from './types';

const isPlace = (prop: Property): prop is Extract<Property, { type: keyof typeof PLACES }> => prop.type in PLACES;

/** The verb and the end of the sentence, without the subject. */
function predicate({ prop, negated }: Statement): { verb: string; tail: readonly string[] } {
  switch (prop.type) {
    case 'species': return { verb: 'jest', tail: [speciesById(prop.value).instrumental] };
    case 'colour': return { verb: 'jest', tail: ['na', colourById(prop.value).locative] };
    case 'hat':
    case 'glasses':
    case 'scarf': return { verb: 'ma', tail: [ACCESSORIES[prop.type][negated ? 'no' : 'yes']] };
    default: return { verb: 'jest', tail: PLACES[prop.type].tail };
  }
}

/** The sentence as a list of 3 to 5 words. `thiefCount` is the number of thieves. */
export function words(statement: Statement, thiefCount: number): string[] {
  const { verb, tail } = predicate(statement);
  if (thiefCount === 1) return ['Złodziej', ...(statement.negated ? ['nie'] : []), verb, ...tail];
  if (!statement.negated) return ['Jeden', 'złodziej', verb, ...tail];
  if (isPlace(statement.prop)) return ['Złodziei', 'nie', 'ma', ...tail];
  return ['Żaden', 'złodziej', 'nie', verb, ...tail];
}

export const sentence = (statement: Statement, thiefCount: number): string => `${words(statement, thiefCount).join(' ')}.`;

export const syllables = (word: string): readonly string[] => SYLLABLES[word.toLowerCase()] ?? [word];

/** Arrow hint for a positive statement about a place. */
export const arrowOf = (statement: Statement): string => (isPlace(statement.prop) && !statement.negated ? PLACES[statement.prop.type].arrow : '');
