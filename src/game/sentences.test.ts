import { describe, expect, it } from 'vitest';
import { arrowOf, sentence, syllables } from './sentences';
import type { Statement } from './types';

const pos = (prop: Statement['prop']): Statement => ({ prop, neg: false });
const neg = (prop: Statement['prop']): Statement => ({ prop, neg: true });

describe('words', () => {
  it('says one thief', () => {
    expect(sentence(pos({ type: 'species', val: 'pies' }), 1)).toBe('Złodziej jest psem.');
    expect(sentence(neg({ type: 'hat' }), 1)).toBe('Złodziej nie ma czapki.');
    expect(sentence(pos({ type: 'hat' }), 1)).toBe('Złodziej ma czapkę.');
    expect(sentence(pos({ type: 'colour', val: 'red' }), 1)).toBe('Złodziej jest na czerwonym.');
  });

  it('says several thieves', () => {
    expect(sentence(pos({ type: 'beside' }), 2)).toBe('Jeden złodziej jest obok mnie.');
    expect(sentence(neg({ type: 'glasses' }), 3)).toBe('Żaden złodziej nie ma okularów.');
    expect(sentence(neg({ type: 'species', val: 'sowa' }), 2)).toBe('Żaden złodziej nie jest sową.');
  });

  it('uses "Złodziei nie ma" for a negative place', () => {
    expect(sentence(neg({ type: 'below' }), 2)).toBe('Złodziei nie ma pod mną.');
    expect(sentence(neg({ type: 'below' }), 1)).toBe('Złodziej nie jest pod mną.');
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
    expect(arrowOf(pos({ type: 'above' }))).toBe('⬆️');
    expect(arrowOf(neg({ type: 'above' }))).toBe('');
    expect(arrowOf(pos({ type: 'hat' }))).toBe('');
  });
});
