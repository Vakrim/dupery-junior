import { ACCESSORY_TYPES, colourById, speciesById } from '../../game/board';
import { COLOURS } from '../../game/data';
import { arrowOf, syllables, words } from '../../game/sentences';
import { stampById } from '../../game/stamps';
import type { Settings } from '../../game/types';
import { assetUrl, esc } from '../html';
import type { AppState } from '../state';

const hearts = (n: number, max: number) => '❤️'.repeat(n) + '🖤'.repeat(max - n);

/** One word, split in coloured syllables when the option is on. Ends with "." for the last word. */
export function wordHTML(w: string, s: Settings, pos: { first: boolean; last: boolean }): string {
  let inner = esc(w);
  if (s.syl) {
    const parts = [...syllables(w)];
    if (pos.first) parts[0] = parts[0][0].toUpperCase() + parts[0].slice(1);
    inner = parts.map((p, j) => `<span class="s${j % 2}">${esc(p)}</span>`).join('');
  }
  const colour = s.hints ? COLOURS.find((x) => x.loc === w) : undefined;
  const style = colour ? ` style="color:${colour.ink}"` : '';
  return `<span class="w" data-word="${esc(w)}"${style}>${inner}${pos.last ? '.' : ''}</span>`;
}

function bubbleHTML(st: AppState, i: number): string {
  const g = st.game!, statement = g.c.statements[i];
  const ws = words(statement, g.c.k);
  let html = ws.map((w, j) => wordHTML(w, g.s, { first: j === 0, last: j === ws.length - 1 })).join(' ');
  if (g.s.hints) html += ` ${arrowOf(statement)}`;
  if (g.s.read) {
    html += ` <button class="say" data-act="say" data-i="${i}" ${g.tokens ? '' : 'disabled'} title="Przeczytaj całe zdanie">🔊</button>`;
  }
  return html;
}

function toolsHTML(st: AppState, i: number): string {
  const confirming = st.confirm === i;
  return `<div class="tools">
      <button data-act="mark" data-i="${i}" data-m="ok">✅ niewinny</button>
      <button data-act="mark" data-i="${i}" data-m="?">❓ podejrzany</button>
      <button data-act="arrest" data-i="${i}" class="${confirming ? 'on' : ''}">🚓 ${confirming ? 'na pewno?' : 'aresztuj'}</button></div>`;
}

function cellHTML(st: AppState, i: number): string {
  const g = st.game!, cell = g.c.board.cells[i], over = !!g.over;
  const arrested = g.arrested.includes(i);
  const shown = over || g.revealed.includes(i);
  const selected = g.selected === i && !over;
  const badge = arrested ? '🚓' : g.marks[i] === 'ok' ? '✅' : g.marks[i] === '?' ? '❓' : '';
  const cls = [
    'cell', g.s.syl ? 'syl' : '', selected ? 'sel' : '', arrested ? 'arrested' : '',
    g.over === 'lose' && g.c.thieves.includes(i) ? 'thief' : '',
  ].join(' ');
  const species = speciesById(cell.species);
  const accessories = ACCESSORY_TYPES
    .map((a) => (cell[a] ? `<img class="acc" alt="" src="${assetUrl(`accessories/${species.img}-${a}.svg`)}">` : ''))
    .join('');
  return `<div class="${cls}" data-i="${i}" style="background:${colourById(cell.colour).css}">
    <div class="animal"><div class="pic"><img class="face" alt="${species.id}" src="${assetUrl(`animals/${species.img}.png`)}">${accessories}</div></div>
    <span class="badge">${badge}</span>
    ${shown ? `<div class="bubble" data-i="${i}">${bubbleHTML(st, i)}</div>` : '<div class="cardback">Kliknij</div>'}${selected && !arrested ? toolsHTML(st, i) : ''}</div>`;
}

function bannerHTML(st: AppState): string {
  const g = st.game!;
  if (!g.over) return '';
  const next = `<div class="row"><button class="big" data-act="again">Nowa sprawa</button>
    <button data-act="screen" data-v="setup">Ustawienia</button><button data-act="screen" data-v="album">Album</button></div>`;
  if (g.over === 'lose') {
    return `<div class="banner lose"><b>Tym razem się nie udało. Złodzieje są zaznaczeni na czerwono.</b>${next}</div>`;
  }
  const stamps = g.earned.map((id) => {
    const x = stampById(id);
    return `<div class="stamp fresh"><div class="e">${x.emoji}</div>${x.name}</div>`;
  }).join('');
  return `<div class="banner win"><b>Brawo! Sprawa rozwiązana. Ciastko wróciło.</b><div class="stamps spaced">${stamps}</div>${next}</div>`;
}

export function gameHTML(st: AppState): string {
  const g = st.game!, k = g.c.k, left = k - g.arrested.length;
  const goal = k === 1 ? 'Zniknęło ciastko 🍪. Znajdź złodzieja.' : `Zniknęły ciastka 🍪. Znajdź ${k === 2 ? 'dwóch' : 'trzech'} złodziei.`;
  return `${bannerHTML(st)}<div class="bar"><span>${goal}</span><span>${hearts(g.lives, g.s.lives)}</span>
    ${g.s.read ? `<span title="Zdania do przeczytania na głos">🔊 × ${g.tokens}</span>` : ''}${k > 1 ? `<span>Do złapania: ${left}</span>` : ''}</div>
    <div class="board" style="--cols:${g.c.board.cols}">${g.c.board.cells.map((_, i) => cellHTML(st, i)).join('')}</div>`;
}
