import { maxThieves } from '../game/stamps';
import type { Settings } from '../game/types';

export const STORAGE_KEY = 'dupery-junior:v1';
export const AVATARS = ['🦸', '🕵️', '🧙', '🧑‍🚀', '🦄', '🐲', '🤖', '👑'];
export const DEFAULT_SETTINGS: Settings = { size: '3x3', k: 1, liars: false, hints: true, syl: true, lives: 5 };

export interface Profile {
  avatar: string;
  /** Stamp id to the number of times it was earned. */
  stamps: Record<string, number>;
  settings: Settings;
}

export interface Store {
  profiles: Record<string, Profile>;
  current: string | null;
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

function parseProfile(raw: unknown): Profile {
  const p = isRecord(raw) ? raw : {};
  const stamps = isRecord(p.stamps) ? p.stamps : {};
  return {
    avatar: typeof p.avatar === 'string' ? p.avatar : AVATARS[0],
    stamps: Object.fromEntries(Object.entries(stamps).filter(([, n]) => typeof n === 'number')) as Record<string, number>,
    // Keys that the game no longer knows (like the old `read`) are dropped.
    settings: { ...DEFAULT_SETTINGS, ...Object.fromEntries(Object.entries(isRecord(p.settings) ? p.settings : {}).filter(([k]) => k in DEFAULT_SETTINGS)) },
  };
}

/** Checks data from outside (storage or a file). Throws when `raw` is not a profile map. */
export function parseProfiles(raw: unknown): Record<string, Profile> {
  if (!isRecord(raw)) throw new Error('Not a profile map');
  // fromEntries makes plain own properties, so a "__proto__" key from a file is harmless.
  return Object.fromEntries(Object.entries(raw).map(([name, p]) => [name, parseProfile(p)]));
}

export function loadStore(storage: Pick<Storage, 'getItem'>): Store {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    const profiles = parseProfiles(raw?.profiles);
    const current = typeof raw.current === 'string' && raw.current in profiles ? raw.current : null;
    return { profiles, current };
  } catch {
    return { profiles: {}, current: null };
  }
}

export function saveStore(storage: Pick<Storage, 'setItem'>, store: Store): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage is full or blocked. The game still works without saving.
  }
}

/** Profiles from a backup file. Throws when the text is not a backup. */
export const parseBackup = (text: string): Record<string, Profile> => parseProfiles(JSON.parse(text)?.profiles);

export function awardStamps(profile: Profile, ids: readonly string[]): void {
  for (const id of ids) profile.stamps[id] = (profile.stamps[id] ?? 0) + 1;
}

/** Changes options. The number of thieves cannot be larger than the board allows. */
export function applySetting(s: Settings, patch: Partial<Settings>): void {
  Object.assign(s, patch);
  s.k = Math.min(s.k, maxThieves(s.size));
}
