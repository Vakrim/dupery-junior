import { esc } from './html';
import { currentProfile, type AppState } from './state';
import { albumHTML } from './views/album';
import { gameHTML } from './views/game';
import { profilesHTML } from './views/profiles';
import { setupHTML } from './views/setup';

const SCREENS = { profiles: profilesHTML, setup: setupHTML, album: albumHTML, game: gameHTML };

export function headerHTML(st: AppState): string {
  const title = '<h1>🔍 Dupery Junior</h1>';
  if (!st.store.current) return title;
  const p = currentProfile(st);
  return `${title}<span>${p.avatar} ${esc(st.store.current)}</span>
    <button data-act="screen" data-v="setup">Ustawienia</button><button data-act="screen" data-v="album">Album</button>
    <button data-act="screen" data-v="profiles">Zmień profil</button>`;
}

export function render(st: AppState): void {
  document.getElementById('head')!.innerHTML = headerHTML(st);
  document.getElementById('app')!.innerHTML = SCREENS[st.screen](st);
}
