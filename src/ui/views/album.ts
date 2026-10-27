import { STAMPS } from '../../game/stamps';
import { currentProfile, type AppState } from '../state';

export function albumHTML(state: AppState): string {
  const have = currentProfile(state).stamps;
  const tiles = STAMPS.map((stamp) => {
    const count = have[stamp.id] || 0;
    return `<div class="stamp ${count ? '' : 'locked'}"><div class="e">${stamp.emoji}</div><b>${stamp.name}</b>${count ? ` × ${count}` : ''}<small>${stamp.need}</small></div>`;
  }).join('');
  const total = STAMPS.reduce((count, stamp) => count + (have[stamp.id] || 0), 0);
  return `<h2>Album detektywa</h2><p>Stempli razem: <b>${total}</b>. Szare stemple jeszcze czekają. Pod nazwą jest napisane, co włączyć.</p><div class="stamps">${tiles}</div>
    <p><button class="big" data-action="screen" data-value="setup">Wróć do ustawień</button></p>`;
}
