import { escapeHtml } from './html';
import { currentProfile, type AppState } from './state';
import { albumHTML } from './views/album';
import { gameHTML } from './views/game';
import { profilesHTML } from './views/profiles';
import { setupHTML } from './views/setup';

const SCREENS = { profiles: profilesHTML, setup: setupHTML, album: albumHTML, game: gameHTML };

export function headerHTML(state: AppState): string {
  const title = '<h1>🔍 Dupery Junior</h1>';
  if (!state.store.current) return title;
  const profile = currentProfile(state);
  return `${title}<span>${profile.avatar} ${escapeHtml(state.store.current)}</span>
    <button data-action="screen" data-value="setup">Ustawienia</button><button data-action="screen" data-value="album">Album</button>
    <button data-action="screen" data-value="profiles">Zmień profil</button>`;
}

export function render(state: AppState): void {
  document.getElementById('head')!.innerHTML = headerHTML(state);
  document.getElementById('app')!.innerHTML = SCREENS[state.screen](state);
}
