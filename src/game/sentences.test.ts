import { describe, expect, it } from 'vitest';
import { arrowOf, sentence, syllables } from './sentences';
import type { Statement } from './types';

const positive = (prop: Statement['prop']): Statement => ({ prop, negated: false });
const negative = (prop: Statement['prop']): Statement => ({ prop, negated: true });

describe('words', () => {
  it('says one thief', () => {
    expect(sentence(positive({ type: 'species', value: 'pies' }), 1)).toBe('Złodziej jest psem.');
    expect(sentence(negative({ type: 'hat' }), 1)).toBe('Złodziej nie ma czapki.');
    expect(sentence(positive({ type: 'hat' }), 1)).toBe('Złodziej ma czapkę.');
    expect(sentence(positive({ type: 'colour', value: 'red' }), 1)).toBe('Złodziej jest na czerwonym.');
  });

  it('says several thieves', () => {
    expect(sentence(positive({ type: 'beside' }), 2)).toBe('Jeden złodziej jest obok mnie.');
    expect(sentence(negative({ type: 'glasses' }), 3)).toBe('Żaden złodziej nie ma okularów.');
    expect(sentence(negative({ type: 'species', value: 'sowa' }), 2)).toBe('Żaden złodziej nie jest sową.');
  });

  it('uses "Złodziei nie ma" for a negative place', () => {
    expect(sentence(negative({ type: 'below' }), 2)).toBe('Złodziei nie ma pode mną.');
    expect(sentence(negative({ type: 'below' }), 1)).toBe('Złodziej nie jest pode mną.');
  });
});

describe('syllables', () => {
  it('uses the hand-made table, ignoring case', () => {
    expect(syllables('Złodziej')).toEqual(['zło', 'dziej']);
    expect(syllables('okularów')).toEqual(['o', 'ku', 'la', 'rów']);
  });

  it('returns an unknown word whole', () => {
    expect(syllables('xyz')).toEqual(['xyz']);
  });
});

describe('arrowOf', () => {
  it('shows an arrow only for a positive place', () => {
    expect(arrowOf(positive({ type: 'above' }))).toBe('⬆️');
    expect(arrowOf(negative({ type: 'above' }))).toBe('');
    expect(arrowOf(positive({ type: 'hat' }))).toBe('');
  });
});
