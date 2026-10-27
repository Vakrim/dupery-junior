import { arrest, clickCell, newGame, toggleMark, type Mark } from '../game/session';
import { applySetting, awardStamps, parseBackup, DEFAULT_SETTINGS, type Store } from '../state/profiles';
import { currentProfile, type AppState, type Screen } from './state';

const input = (id: string) => document.getElementById(id) as HTMLInputElement;

/**
 * Handles one click on the page. Returns true when the page must render again.
 * `persist` saves the store after a change the player wants to keep.
 */
export function handleClick(st: AppState, target: Element, persist: () => void): boolean {
  const el = target.closest<HTMLElement>('[data-act],.cell');
  if (!el) return false;
  const g = st.game;
  const i = Number(el.dataset.i);

  if (!el.dataset.act) {
    if (st.screen !== 'game' || !g) return false;
    if (g.over) return false;
    clickCell(g, i);
    st.confirm = null;
    return true;
  }

  switch (el.dataset.act) {
    case 'screen':
      st.screen = el.dataset.v as Screen;
      break;
    case 'avatar':
      st.pickAvatar = el.dataset.a!;
      st.nick = input('nick').value;
      break;
    case 'create': {
      const name = input('nick').value.trim();
      if (!name) return false;
      st.store.profiles[name] ??= { avatar: st.pickAvatar, stamps: {}, settings: { ...DEFAULT_SETTINGS } };
      st.store.current = name;
      st.screen = 'setup';
      persist();
      break;
    }
    case 'login':
      st.store.current = el.dataset.n!;
      st.screen = 'setup';
      persist();
      break;
    case 'set':
      applySetting(currentProfile(st).settings, { [el.dataset.k!]: JSON.parse(el.dataset.v!) });
      persist();
      break;
    case 'start':
    case 'again': {
      const game = newGame(currentProfile(st).settings);
      if (!game) {
        alert('Nie udało się stworzyć sprawy. Spróbuj jeszcze raz.');
        return false;
      }
      st.game = game;
      st.confirm = null;
      st.screen = 'game';
      break;
    }
    case 'mark':
      if (g) toggleMark(g, i, el.dataset.m as Mark);
      break;
    case 'arrest':
      if (!g) return false;
      if (st.confirm !== i) {
        st.confirm = i; // the first click only asks "na pewno?"
        break;
      }
      arrest(g, i);
      st.confirm = null;
      if (g.over === 'win') {
        awardStamps(currentProfile(st), g.earned);
        persist();
      }
      break;
    case 'export':
      downloadBackup(st.store);
      return false;
  }
  return true;
}

function downloadBackup(store: Store): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(store)], { type: 'application/json' }));
  a.download = `${new Date().toISOString().slice(0, 10)} - Dupery Junior profile.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Merges the profiles of a backup file into the store. Shows a message when the file is wrong. */
export async function importBackup(st: AppState, file: File, persist: () => void): Promise<boolean> {
  try {
    Object.assign(st.store.profiles, parseBackup(await file.text()));
    persist();
    return true;
  } catch {
    alert('Ten plik nie jest kopią profili.');
    return false;
  }
}
