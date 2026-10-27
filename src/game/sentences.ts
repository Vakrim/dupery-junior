import { ACCESSORIES, PLACES, SYLLABLES } from './data';
import { colourById, speciesById } from './board';
import type { Property, Statement } from './types';

const isPlace = (prop: Property): prop is Extract<Property, { type: keyof typeof PLACES }> => prop.type in PLACES;

/** The verb and the end of the sentence, without the subject. */
function predicate({ prop, neg }: Statement): { verb: string; tail: readonly string[] } {
  switch (prop.type) {
    case 'species': return { verb: 'jest', tail: [speciesById(prop.val).ins] };
    case 'colour': return { verb: 'jest', tail: ['na', colourById(prop.val).loc] };
    case 'hat':
    case 'glasses':
    case 'scarf': return { verb: 'ma', tail: [ACCESSORIES[prop.type][neg ? 'no' : 'yes']] };
    default: return { verb: 'jest', tail: PLACES[prop.type].tail };
  }
}

/** The sentence as a list of 3 to 5 words. `k` is the number of thieves. */
export function words(s: Statement, k: number): string[] {
  const { verb, tail } = predicate(s);
  if (k === 1) return ['Złodziej', ...(s.neg ? ['nie'] : []), verb, ...tail];
  if (!s.neg) return ['Jeden', 'złodziej', verb, ...tail];
  if (isPlace(s.prop)) return ['Złodziei', 'nie', 'ma', ...tail];
  return ['Żaden', 'złodziej', 'nie', verb, ...tail];
}

export const sentence = (s: Statement, k: number): string => `${words(s, k).join(' ')}.`;

export const syllables = (word: string): readonly string[] => SYLLABLES[word.toLowerCase()] ?? [word];

/** Arrow hint for a positive statement about a place. */
export const arrowOf = (s: Statement): string => (isPlace(s.prop) && !s.neg ? PLACES[s.prop.type].arrow : '');
