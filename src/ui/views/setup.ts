import { earned, maxThieves, stampById } from '../../game/stamps';
import type { Settings } from '../../game/types';
import { esc } from '../html';
import { currentProfile, type AppState } from '../state';

type Option<V> = [value: V, label: string, disabled?: boolean];

/** A row of buttons for one setting. The value travels in `data-v` as JSON. */
function segment<K extends keyof Settings>(s: Settings, key: K, options: Option<Settings[K]>[]): string {
  return options
    .map(([v, label, disabled]) => `<button class="${s[key] === v ? 'on' : ''}" data-act="set" data-k="${key}" data-v="${esc(JSON.stringify(v))}" ${disabled ? 'disabled' : ''}>${label}</button>`)
    .join('');
}

export function setupHTML(st: AppState): string {
  const s = currentProfile(st).settings;
  const stamps = earned(s).map((id) => {
    const x = stampById(id);
    return `<div class="stamp"><div class="e">${x.emoji}</div>${x.name}</div>`;
  }).join('');
  const onOff = (key: 'read' | 'hints' | 'syl') => segment(s, key, [[true, 'Włączone'], [false, 'Wyłączone']]);
  return `<h2>Wybierz trudność</h2><div class="card">
    <div class="row"><b>Plansza</b>${segment(s, 'size', [['3x3', '3×3'], ['4x3', '4×3'], ['4x4', '4×4']])}</div>
    <div class="row"><b>Złodzieje</b>${segment(s, 'k', [[1, '1'], [2, '2'], [3, '3', maxThieves(s.size) < 3]])}</div>
    <div class="row"><b>Złodzieje kłamią</b>${segment(s, 'liars', [[false, 'Nie'], [true, 'Tak']])}</div>
    <div class="row"><b>Czytanie na głos</b>${onOff('read')}</div>
    <div class="row"><b>Strzałki i kolory</b>${onOff('hints')}</div>
    <div class="row"><b>Sylaby</b>${onOff('syl')}</div>
    <div class="row"><b>Życia</b>${segment(s, 'lives', [[5, '5'], [3, '3'], [1, '1']])}</div></div>
    <h2>Stemple za tę sprawę</h2><div class="stamps">${stamps}</div>
    <p><button class="big" data-act="start">Zacznij sprawę</button></p>`;
}
