import { describe, expect, it } from 'vitest';
import {
  applySetting, awardStamps, AVATARS, DEFAULT_SETTINGS, loadStore, parseBackup, saveStore, STORAGE_KEY, type Profile,
} from './profiles';

const memory = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

const profile = (): Profile => ({ avatar: '🦄', stamps: {}, settings: { ...DEFAULT_SETTINGS } });

describe('loadStore', () => {
  it('starts empty when nothing is saved', () => {
    expect(loadStore(memory())).toEqual({ profiles: {}, current: null });
  });

  it('starts empty when the saved text is broken', () => {
    expect(loadStore(memory('{nope'))).toEqual({ profiles: {}, current: null });
    expect(loadStore(memory('{"profiles":5}'))).toEqual({ profiles: {}, current: null });
  });

  it('round-trips a saved store', () => {
    const store = { profiles: { Ala: { ...profile(), stamps: { case: 2 } } }, current: 'Ala' };
    const storage = memory();
    saveStore(storage, store);
    expect(loadStore(storage)).toEqual(store);
  });

  it('forgets a current profile that does not exist', () => {
    const raw = JSON.stringify({ profiles: { Ala: profile() }, current: 'Ola' });
    expect(loadStore(memory(raw)).current).toBeNull();
  });

  it('fills in missing settings', () => {
    const raw = JSON.stringify({ profiles: { Ala: { avatar: '🐲', settings: { lives: 1 } } } });
    const ala = loadStore(memory(raw)).profiles.Ala;
    expect(ala.settings).toEqual({ ...DEFAULT_SETTINGS, lives: 1 });
    expect(ala.stamps).toEqual({});
  });
});

describe('saveStore', () => {
  it('does not throw when the storage is full', () => {
    const full = { setItem: () => { throw new Error('quota'); } };
    expect(() => saveStore(full, { profiles: {}, current: null })).not.toThrow();
  });
});

describe('parseBackup', () => {
  it('reads profiles from a file', () => {
    const text = JSON.stringify({ profiles: { Ala: profile() }, current: 'Ala' });
    expect(Object.keys(parseBackup(text))).toEqual(['Ala']);
  });

  it('throws when the file is not a backup', () => {
    expect(() => parseBackup('[]')).toThrow();
    expect(() => parseBackup('{"a":1}')).toThrow();
    expect(() => parseBackup('not json')).toThrow();
  });

  it('cleans bad fields', () => {
    const text = JSON.stringify({ profiles: { Ala: { avatar: 7, stamps: { case: 'x', big: 3 } } } });
    expect(parseBackup(text).Ala).toEqual({ avatar: AVATARS[0], stamps: { big: 3 }, settings: DEFAULT_SETTINGS });
  });

  it('keeps a "__proto__" name as a plain profile name', () => {
    const profiles = parseBackup('{"profiles":{"__proto__":{"avatar":"x"}}}');
    expect(Object.keys(profiles)).toEqual(['__proto__']);
    expect(({} as Record<string, unknown>).avatar).toBeUndefined();
  });
});

describe('awardStamps', () => {
  it('counts each time a stamp is earned', () => {
    const p = profile();
    awardStamps(p, ['case', 'big']);
    awardStamps(p, ['case']);
    expect(p.stamps).toEqual({ case: 2, big: 1 });
  });
});

describe('applySetting', () => {
  it('sets an option', () => {
    const s = { ...DEFAULT_SETTINGS };
    applySetting(s, { liars: true });
    expect(s.liars).toBe(true);
  });

  it('lowers the thieves to the maximum of a smaller board', () => {
    const s = { ...DEFAULT_SETTINGS, size: '4x4' as const, k: 3 };
    applySetting(s, { size: '3x3' });
    expect(s.k).toBe(2);
  });
});
