import type { Settings, SizeId } from './types';

export interface Stamp {
  id: string;
  name: string;
  emoji: string;
  /** What the player must switch on to earn it. */
  need: string;
  test: (s: Settings) => boolean;
}

// Stamps are earned by the settings of a solved case. Help options (read, hints, syl) count when ON.
const noHelp = (s: Settings) => !s.read && !s.hints && !s.syl;

export const STAMPS: readonly Stamp[] = [
  { id: 'case', name: 'Rozwiązana sprawa', emoji: '🔍', need: 'Rozwiąż dowolną sprawę', test: () => true },
  { id: 'wide', name: 'Szeroka plansza', emoji: '↔️', need: 'Plansza 4×3', test: (s) => s.size === '4x3' },
  { id: 'big', name: 'Wielka plansza', emoji: '🗺️', need: 'Plansza 4×4', test: (s) => s.size === '4x4' },
  { id: 'k2', name: 'Dwóch złodziei', emoji: '👥', need: '2 złodziei', test: (s) => s.k === 2 },
  { id: 'k3', name: 'Trzech złodziei', emoji: '🎭', need: '3 złodziei', test: (s) => s.k === 3 },
  { id: 'liars', name: 'Kłamcy', emoji: '🤥', need: 'Złodzieje kłamią', test: (s) => s.liars },
  { id: 'noread', name: 'Bez głosu', emoji: '🔇', need: 'Czytanie na głos wyłączone', test: (s) => !s.read },
  { id: 'nohints', name: 'Bez wskazówek', emoji: '🧭', need: 'Strzałki i kolory wyłączone', test: (s) => !s.hints },
  { id: 'nosyl', name: 'Bez sylab', emoji: '📖', need: 'Sylaby wyłączone', test: (s) => !s.syl },
  { id: 'lives3', name: 'Trzy życia', emoji: '❤️', need: '3 życia', test: (s) => s.lives === 3 },
  { id: 'lives1', name: 'Jedno życie', emoji: '💔', need: '1 życie', test: (s) => s.lives === 1 },
  { id: 'liarsk2', name: 'Podwójne kłamstwo', emoji: '🎪', need: '2 lub 3 złodziei, którzy kłamią', test: (s) => s.liars && s.k >= 2 },
  { id: 'biglie', name: 'Wielki kłamca', emoji: '🦹', need: 'Plansza 4×4, złodzieje kłamią', test: (s) => s.size === '4x4' && s.liars },
  { id: 'trio', name: 'Trio', emoji: '🎰', need: '3 złodziei, którzy kłamią', test: (s) => s.k === 3 && s.liars },
  { id: 'reader', name: 'Czytelnik', emoji: '🎓', need: 'Bez głosu, wskazówek i sylab', test: noHelp },
  { id: 'careful', name: 'Ostrożny kłamca', emoji: '🧐', need: 'Złodzieje kłamią, 1 życie', test: (s) => s.liars && s.lives === 1 },
  {
    id: 'master', name: 'Mistrz detektywów', emoji: '🏆', need: 'Plansza 4×4, 3 złodziei, kłamią, bez pomocy, 1 życie',
    test: (s) => s.size === '4x4' && s.k === 3 && s.liars && noHelp(s) && s.lives === 1,
  },
];

export const stampById = (id: string): Stamp => STAMPS.find((x) => x.id === id)!;

export const earned = (s: Settings): string[] => STAMPS.filter((x) => x.test(s)).map((x) => x.id);

export const maxThieves = (size: SizeId): number => (size === '3x3' ? 2 : 3);
