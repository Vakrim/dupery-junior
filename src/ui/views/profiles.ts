import { AVATARS } from '../../state/profiles';
import { escapeHtml } from '../html';
import type { AppState } from '../state';

export function profilesHTML(state: AppState): string {
  const list = Object.entries(state.store.profiles)
    .map(([name, profile]) => `<button class="profile" data-action="login" data-name="${escapeHtml(name)}">${profile.avatar} ${escapeHtml(name)}</button>`)
    .join(' ');
  const avatars = AVATARS
    .map((avatar) => `<button class="${state.pickAvatar === avatar ? 'on' : ''}" data-action="avatar" data-avatar="${avatar}">${avatar}</button>`)
    .join(' ');
  return `<h2>Kto gra?</h2><div class="row">${list || '<i>Nie ma jeszcze profili.</i>'}</div>
    <h2>Nowy profil</h2><div class="card">
    <p>Wpisz pseudonim. Nie wpisuj imienia i nazwiska. Dane zostają w tej przeglądarce.</p>
    <div class="row"><input class="nick" id="nick" maxlength="12" placeholder="Pseudonim" value="${escapeHtml(state.nick)}"> ${avatars}
    <button class="big" data-action="create">Utwórz</button></div></div>
    <h2>Kopia zapasowa</h2><div class="row"><button data-action="export">Zapisz profile do pliku</button>
    <label>Wczytaj z pliku: <input type="file" accept=".json" id="import"></label></div>`;
}
