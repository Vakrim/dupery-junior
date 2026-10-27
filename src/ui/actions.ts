import { arrest, clickCell, newGame, toggleMark, type Mark } from '../game/session';
import { applySetting, awardStamps, parseBackup, DEFAULT_SETTINGS, type Store } from '../state/profiles';
import { currentProfile, type AppState, type Screen } from './state';

const input = (elementId: string) => document.getElementById(elementId) as HTMLInputElement;

/**
 * Handles one click on the page. Returns true when the page must render again.
 * `persist` saves the store after a change the player wants to keep.
 */
export function handleClick(state: AppState, target: Element, persist: () => void): boolean {
  const element = target.closest<HTMLElement>('[data-action],.cell');
  if (!element) return false;
  const game = state.game;
  const cellIndex = Number(element.dataset.cell);

  if (!element.dataset.action) {
    if (state.screen !== 'game' || !game) return false;
    if (game.over) return false;
    clickCell(game, cellIndex);
    state.confirm = null;
    return true;
  }

  switch (element.dataset.action) {
    case 'screen':
      state.screen = element.dataset.value as Screen;
      break;
    case 'avatar':
      state.pickAvatar = element.dataset.avatar!;
      state.nick = input('nick').value;
      break;
    case 'create': {
      const name = input('nick').value.trim();
      if (!name) return false;
      state.store.profiles[name] ??= { avatar: state.pickAvatar, stamps: {}, settings: { ...DEFAULT_SETTINGS } };
      state.store.current = name;
      state.screen = 'setup';
      persist();
      break;
    }
    case 'login':
      state.store.current = element.dataset.name!;
      state.screen = 'setup';
      persist();
      break;
    case 'set':
      applySetting(currentProfile(state).settings, { [element.dataset.setting!]: JSON.parse(element.dataset.value!) });
      persist();
      break;
    case 'start':
    case 'again': {
      const started = newGame(currentProfile(state).settings);
      if (!started) {
        alert('Nie udało się stworzyć sprawy. Spróbuj jeszcze raz.');
        return false;
      }
      state.game = started;
      state.confirm = null;
      state.screen = 'game';
      break;
    }
    case 'mark':
      if (game) toggleMark(game, cellIndex, element.dataset.mark as Mark);
      break;
    case 'arrest':
      if (!game) return false;
      if (state.confirm !== cellIndex) {
        state.confirm = cellIndex; // the first click only asks "na pewno?"
        break;
      }
      arrest(game, cellIndex);
      state.confirm = null;
      if (game.over === 'win') {
        awardStamps(currentProfile(state), game.earned);
        persist();
      }
      break;
    case 'export':
      downloadBackup(state.store);
      return false;
  }
  return true;
}

function downloadBackup(store: Store): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(store)], { type: 'application/json' }));
  link.download = `${new Date().toISOString().slice(0, 10)} - Dupery Junior profile.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Merges the profiles of a backup file into the store. Shows a message when the file is wrong. */
export async function importBackup(state: AppState, file: File, persist: () => void): Promise<boolean> {
  try {
    Object.assign(state.store.profiles, parseBackup(await file.text()));
    persist();
    return true;
  } catch {
    alert('Ten plik nie jest kopią profili.');
    return false;
  }
}
