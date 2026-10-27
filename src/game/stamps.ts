import type { Settings, SizeId } from './types';

export interface Stamp {
  id: string;
  name: string;
  emoji: string;
  /** What the player must switch on to earn it. */
  need: string;
  test: (settings: Settings) => boolean;
}

// Stamps are earned by the settings of a solved case. Help options (hints, syllables) count when ON.
const noHelp = (settings: Settings) => !settings.hints && !settings.syllables;

export const STAMPS: readonly Stamp[] = [
  { id: 'case', name: 'Rozwiązana sprawa', emoji: '🔍', need: 'Rozwiąż dowolną sprawę', test: () => true },
  { id: 'wide', name: 'Szeroka plansza', emoji: '↔️', need: 'Plansza 4×3', test: (settings) => settings.size === '4x3' },
  { id: 'big', name: 'Wielka plansza', emoji: '🗺️', need: 'Plansza 4×4', test: (settings) => settings.size === '4x4' },
  { id: 'k2', name: 'Dwóch złodziei', emoji: '👥', need: '2 złodziei', test: (settings) => settings.thiefCount === 2 },
  { id: 'k3', name: 'Trzech złodziei', emoji: '🎭', need: '3 złodziei', test: (settings) => settings.thiefCount === 3 },
  { id: 'liars', name: 'Kłamcy', emoji: '🤥', need: 'Złodzieje kłamią', test: (settings) => settings.liars },
  { id: 'nohints', name: 'Bez wskazówek', emoji: '🧭', need: 'Strzałki i kolory wyłączone', test: (settings) => !settings.hints },
  { id: 'nosyl', name: 'Bez sylab', emoji: '📖', need: 'Sylaby wyłączone', test: (settings) => !settings.syllables },
  { id: 'lives3', name: 'Trzy życia', emoji: '❤️', need: '3 życia', test: (settings) => settings.lives === 3 },
  { id: 'lives1', name: 'Jedno życie', emoji: '💔', need: '1 życie', test: (settings) => settings.lives === 1 },
  { id: 'liarsk2', name: 'Podwójne kłamstwo', emoji: '🎪', need: '2 lub 3 złodziei, którzy kłamią', test: (settings) => settings.liars && settings.thiefCount >= 2 },
  { id: 'biglie', name: 'Wielki kłamca', emoji: '🦹', need: 'Plansza 4×4, złodzieje kłamią', test: (settings) => settings.size === '4x4' && settings.liars },
  { id: 'trio', name: 'Trio', emoji: '🎰', need: '3 złodziei, którzy kłamią', test: (settings) => settings.thiefCount === 3 && settings.liars },
  { id: 'careful', name: 'Ostrożny kłamca', emoji: '🧐', need: 'Złodzieje kłamią, 1 życie', test: (settings) => settings.liars && settings.lives === 1 },
  {
    id: 'master', name: 'Mistrz detektywów', emoji: '🏆', need: 'Plansza 4×4, 3 złodziei, kłamią, bez pomocy, 1 życie',
    test: (settings) => settings.size === '4x4' && settings.thiefCount === 3 && settings.liars && noHelp(settings) && settings.lives === 1,
  },
];

export const stampById = (stampId: string): Stamp => STAMPS.find((stamp) => stamp.id === stampId)!;

export const earned = (settings: Settings): string[] => STAMPS.filter((stamp) => stamp.test(settings)).map((stamp) => stamp.id);

export const maxThieves = (size: SizeId): number => (size === '3x3' ? 2 : 3);
