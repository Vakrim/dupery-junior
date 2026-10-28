import type { GameState } from '../game/session';
import { AVATARS, type Profile, type Store } from '../state/profiles';

export type Screen = 'profiles' | 'setup' | 'album' | 'game';

/** Everything the views need. Event handlers change it, then the page renders again. */
export interface AppState {
  store: Store;
  screen: Screen;
  game: GameState | null;
  /** Cell that waits for the second click on "aresztuj". */
  confirm: number | null;
  /** Show the sentences in capital letters. Not saved with the profile. */
  uppercase: boolean;
  pickAvatar: string;
  /** Nickname typed before the avatar button was clicked, so the render keeps it. */
  nick: string;
}

export function createState(store: Store): AppState {
  return { store, screen: store.current ? 'setup' : 'profiles', game: null, confirm: null, uppercase: false, pickAvatar: AVATARS[0], nick: '' };
}

/** The logged-in profile. Only call it when `store.current` is set. */
export const currentProfile = (state: AppState): Profile => state.store.profiles[state.store.current!];
