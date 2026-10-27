import { describe, expect, it } from 'vitest';
import { newGame } from '../game/session';
import type { Settings } from '../game/types';
import { DEFAULT_SETTINGS, type Profile } from '../state/profiles';
import { escapeHtml } from './html';
import { headerHTML } from './render';
import { createState, type AppState } from './state';
import { albumHTML } from './views/album';
import { gameHTML, wordHTML } from './views/game';
import { profilesHTML } from './views/profiles';
import { setupHTML } from './views/setup';

const profile = (settings: Partial<Settings> = {}): Profile => ({
  avatar: '🦄', stamps: { case: 3 }, settings: { ...DEFAULT_SETTINGS, ...settings },
});

const loggedIn = (settings: Partial<Settings> = {}): AppState =>
  createState({ profiles: { Ala: profile(settings) }, current: 'Ala' });

describe('escapeHtml', () => {
  it('escapes HTML characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('createState', () => {
  it('opens the profile screen when nobody is logged in', () => {
    expect(createState({ profiles: {}, current: null }).screen).toBe('profiles');
    expect(loggedIn().screen).toBe('setup');
  });
});

describe('wordHTML', () => {
  const enabled = { ...DEFAULT_SETTINGS };
  const where = { first: false, last: false };

  it('splits a word in syllables', () => {
    expect(wordHTML('okulary', enabled, where)).toContain('<span class="s0">o</span><span class="s1">ku</span><span class="s0">la</span><span class="s1">ry</span>');
  });

  it('writes a capital letter at the start of the sentence and a full stop at the end', () => {
    const html = wordHTML('złodziej', enabled, { first: true, last: true });
    expect(html).toContain('<span class="s0">Zło</span>');
    expect(html).toMatch(/\.<\/span>$/);
  });

  it('writes the plain word when syllables are off', () => {
    expect(wordHTML('psem', { ...enabled, syllables: false }, where)).toBe('<span class="w">psem</span>');
  });

  it('colours a colour word only when hints are on', () => {
    expect(wordHTML('czerwonym', enabled, where)).toContain('style="color:#c62828"');
    expect(wordHTML('czerwonym', { ...enabled, hints: false }, where)).not.toContain('style=');
  });
});

describe('views', () => {
  it('shows the profile names, escaped', () => {
    const state = createState({ profiles: { '<b>': profile() }, current: null });
    const html = profilesHTML(state);
    expect(html).toContain('&lt;b&gt;');
    expect(html).not.toContain('<b>&');
  });

  it('shows the header only with a profile', () => {
    expect(headerHTML(createState({ profiles: {}, current: null }))).not.toContain('Album');
    expect(headerHTML(loggedIn())).toContain('Ala');
  });

  it('disables 3 thieves on a 3x3 board', () => {
    const html = setupHTML(loggedIn({ size: '3x3' }));
    expect(html).toMatch(/data-setting="thiefCount" data-value="3" disabled/);
    expect(setupHTML(loggedIn({ size: '4x4' }))).not.toMatch(/data-setting="thiefCount" data-value="3" disabled/);
  });

  it('shows how many times each stamp was earned', () => {
    const html = albumHTML(loggedIn());
    expect(html).toContain('× 3');
    expect(html).toContain('stamp locked');
  });

  it('draws one cell for each animal and hides the sentences at the start', () => {
    const state = loggedIn();
    state.game = newGame(state.store.profiles.Ala.settings);
    const html = gameHTML(state);
    expect(html.match(/class="cell /g)).toHaveLength(9);
    expect(html.match(/class="cardback"/g)).toHaveLength(9);
    expect(html).not.toContain('class="bubble"');
  });

  it('tells the player whether the thieves lie', () => {
    const show = (liars: boolean, thiefCount: number) => {
      const state = loggedIn({ liars, thiefCount });
      state.game = newGame(state.store.profiles.Ala.settings);
      return gameHTML(state);
    };
    expect(show(true, 1)).toContain('Złodziej kłamie');
    expect(show(true, 2)).toContain('Złodzieje kłamią');
    expect(show(false, 2)).toContain('Wszyscy mówią prawdę');
  });

  it('shows the sentences when the game is lost, and marks the thieves', () => {
    const state = loggedIn({ lives: 1, thiefCount: 2 });
    const game = (state.game = newGame(state.store.profiles.Ala.settings)!);
    game.over = 'lose';
    const html = gameHTML(state);
    expect(html.match(/class="bubble"/g)).toHaveLength(9);
    expect(html.match(/ thief"/g)).toHaveLength(2);
    expect(html).toContain('banner lose');
  });
});
