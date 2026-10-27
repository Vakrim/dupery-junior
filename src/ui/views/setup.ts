import { earned, maxThieves, stampById } from '../../game/stamps';
import type { Settings } from '../../game/types';
import { escapeHtml } from '../html';
import { currentProfile, type AppState } from '../state';

type Option<V> = [value: V, label: string, disabled?: boolean];

/** A row of buttons for one setting. The value travels in `data-value` as JSON. */
function segment<K extends keyof Settings>(settings: Settings, key: K, options: Option<Settings[K]>[]): string {
  return options
    .map(([value, label, disabled]) => `<button class="${settings[key] === value ? 'on' : ''}" data-action="set" data-setting="${key}" data-value="${escapeHtml(JSON.stringify(value))}" ${disabled ? 'disabled' : ''}>${label}</button>`)
    .join('');
}

export function setupHTML(state: AppState): string {
  const settings = currentProfile(state).settings;
  const stamps = earned(settings).map((stampId) => {
    const stamp = stampById(stampId);
    return `<div class="stamp"><div class="e">${stamp.emoji}</div>${stamp.name}</div>`;
  }).join('');
  const onOff = (key: 'hints' | 'syllables') => segment(settings, key, [[true, 'Włączone'], [false, 'Wyłączone']]);
  return `<h2>Wybierz trudność</h2><div class="card">
    <div class="row"><b>Plansza</b>${segment(settings, 'size', [['3x3', '3×3'], ['4x3', '4×3'], ['4x4', '4×4']])}</div>
    <div class="row"><b>Złodzieje</b>${segment(settings, 'thiefCount', [[1, '1'], [2, '2'], [3, '3', maxThieves(settings.size) < 3]])}</div>
    <div class="row"><b>Złodzieje kłamią</b>${segment(settings, 'liars', [[false, 'Nie'], [true, 'Tak']])}</div>
    <div class="row"><b>Strzałki i kolory</b>${onOff('hints')}</div>
    <div class="row"><b>Sylaby</b>${onOff('syllables')}</div>
    <div class="row"><b>Życia</b>${segment(settings, 'lives', [[5, '5'], [3, '3'], [1, '1']])}</div></div>
    <h2>Stemple za tę sprawę</h2><div class="stamps">${stamps}</div>
    <p><button class="big" data-action="start">Zacznij sprawę</button></p>`;
}
