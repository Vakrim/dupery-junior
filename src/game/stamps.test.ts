import { describe, expect, it } from 'vitest';
import { earned, maxThieves, STAMPS } from './stamps';
import type { Settings } from './types';

const base: Settings = { size: '3x3', k: 1, liars: false, hints: true, syl: true, lives: 5 };

describe('earned', () => {
  it('gives only the first stamp for the default settings', () => {
    expect(earned(base)).toEqual(['case']);
  });

  it('gives a stamp for each help option that is off', () => {
    expect(earned({ ...base, hints: false, syl: false })).toEqual(['case', 'nohints', 'nosyl']);
  });

  it('gives the master stamp only for the hardest settings', () => {
    const hardest: Settings = { size: '4x4', k: 3, liars: true, hints: false, syl: false, lives: 1 };
    expect(earned(hardest)).toContain('master');
    expect(earned({ ...hardest, lives: 3 })).not.toContain('master');
    expect(earned({ ...hardest, syl: true })).not.toContain('master');
  });

  it('gives the combined liar stamps', () => {
    expect(earned({ ...base, k: 2, liars: true })).toEqual(expect.arrayContaining(['liars', 'k2', 'liarsk2']));
    expect(earned({ ...base, k: 1, liars: true })).not.toContain('liarsk2');
  });
});

describe('STAMPS', () => {
  it('has a unique id for each stamp', () => {
    expect(new Set(STAMPS.map((x) => x.id)).size).toBe(STAMPS.length);
  });
});

describe('maxThieves', () => {
  it('allows 2 thieves on 3x3 and 3 on larger boards', () => {
    expect(maxThieves('3x3')).toBe(2);
    expect(maxThieves('4x3')).toBe(3);
    expect(maxThieves('4x4')).toBe(3);
  });
});
