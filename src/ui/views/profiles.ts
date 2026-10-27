import { AVATARS } from '../../state/profiles';
import { esc } from '../html';
import type { AppState } from '../state';

export function profilesHTML(st: AppState): string {
  const list = Object.entries(st.store.profiles)
    .map(([name, p]) => `<button class="profile" data-act="login" data-n="${esc(name)}">${p.avatar} ${esc(name)}</button>`)
    .join(' ');
  const avatars = AVATARS
    .map((a) => `<button class="${st.pickAvatar === a ? 'on' : ''}" data-act="avatar" data-a="${a}">${a}</button>`)
    .join(' ');
  return `<h2>Kto gra?</h2><div class="row">${list || '<i>Nie ma jeszcze profili.</i>'}</div>
    <h2>Nowy profil</h2><div class="card">
    <p>Wpisz pseudonim. Nie wpisuj imienia i nazwiska. Dane zostają w tej przeglądarce.</p>
    <div class="row"><input class="nick" id="nick" maxlength="12" placeholder="Pseudonim" value="${esc(st.nick)}"> ${avatars}
    <button class="big" data-act="create">Utwórz</button></div></div>
    <h2>Kopia zapasowa</h2><div class="row"><button data-act="export">Zapisz profile do pliku</button>
    <label>Wczytaj z pliku: <input type="file" accept=".json" id="import"></label></div>`;
}
