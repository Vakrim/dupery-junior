import { STAMPS } from '../../game/stamps';
import { currentProfile, type AppState } from '../state';

export function albumHTML(st: AppState): string {
  const have = currentProfile(st).stamps;
  const tiles = STAMPS.map((x) => {
    const n = have[x.id] || 0;
    return `<div class="stamp ${n ? '' : 'locked'}"><div class="e">${x.emoji}</div><b>${x.name}</b>${n ? ` × ${n}` : ''}<small>${x.need}</small></div>`;
  }).join('');
  const total = STAMPS.reduce((n, x) => n + (have[x.id] || 0), 0);
  return `<h2>Album detektywa</h2><p>Stempli razem: <b>${total}</b>. Szare stemple jeszcze czekają. Pod nazwą jest napisane, co włączyć.</p><div class="stamps">${tiles}</div>
    <p><button class="big" data-act="screen" data-v="setup">Wróć do ustawień</button></p>`;
}
