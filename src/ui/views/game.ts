import { ACCESSORY_TYPES, colourById, speciesById } from '../../game/board';
import { COLOURS } from '../../game/data';
import { arrowOf, syllables, words } from '../../game/sentences';
import { stampById } from '../../game/stamps';
import type { Settings } from '../../game/types';
import { assetUrl, escapeHtml } from '../html';
import type { AppState } from '../state';

const hearts = (lives: number, max: number) => '❤️'.repeat(lives) + '🖤'.repeat(max - lives);

/** One word, split in coloured syllables when the option is on. Ends with "." for the last word. */
export function wordHTML(word: string, settings: Settings, position: { first: boolean; last: boolean }): string {
  let inner = escapeHtml(word);
  if (settings.syllables) {
    const parts = [...syllables(word)];
    if (position.first) parts[0] = parts[0][0].toUpperCase() + parts[0].slice(1);
    inner = parts.map((part, index) => `<span class="s${index % 2}">${escapeHtml(part)}</span>`).join('');
  }
  const colour = settings.hints ? COLOURS.find((option) => option.locative === word) : undefined;
  const style = colour ? ` style="color:${colour.ink}"` : '';
  return `<span class="w"${style}>${inner}${position.last ? '.' : ''}</span>`;
}

function bubbleHTML(state: AppState, cellIndex: number): string {
  const game = state.game!, statement = game.puzzle.statements[cellIndex];
  const wordList = words(statement, game.puzzle.thiefCount);
  let html = wordList.map((word, index) => wordHTML(word, game.settings, { first: index === 0, last: index === wordList.length - 1 })).join(' ');
  if (game.settings.hints) html += ` ${arrowOf(statement)}`;
  return html;
}

function toolsHTML(state: AppState, cellIndex: number): string {
  const confirming = state.confirm === cellIndex;
  return `<div class="tools">
      <button data-action="mark" data-cell="${cellIndex}" data-mark="ok">✅ niewinny</button>
      <button data-action="mark" data-cell="${cellIndex}" data-mark="?">❓ podejrzany</button>
      <button data-action="arrest" data-cell="${cellIndex}" class="${confirming ? 'on' : ''}">🚓 ${confirming ? 'na pewno?' : 'aresztuj'}</button></div>`;
}

function cellHTML(state: AppState, cellIndex: number): string {
  const game = state.game!, cell = game.puzzle.board.cells[cellIndex], over = !!game.over;
  const arrested = game.arrested.includes(cellIndex);
  const shown = over || game.revealed.includes(cellIndex);
  const selected = game.selected === cellIndex && !over;
  const badge = arrested ? '🚓' : game.marks[cellIndex] === 'ok' ? '✅' : game.marks[cellIndex] === '?' ? '❓' : '';
  const className = [
    'cell', game.settings.syllables ? 'syl' : '', selected ? 'sel' : '', arrested ? 'arrested' : '',
    game.over === 'lose' && game.puzzle.thieves.includes(cellIndex) ? 'thief' : '',
  ].join(' ');
  const species = speciesById(cell.species);
  const accessories = ACCESSORY_TYPES
    .map((accessory) => (cell[accessory] ? `<img class="acc" alt="" src="${assetUrl(`accessories/${species.image}-${accessory}.svg`)}">` : ''))
    .join('');
  return `<div class="${className}" data-cell="${cellIndex}" style="background:${colourById(cell.colour).background}">
    <div class="animal"><div class="pic"><img class="face" alt="${species.id}" src="${assetUrl(`animals/${species.image}.png`)}">${accessories}</div></div>
    <span class="badge">${badge}</span>
    ${shown ? `<div class="bubble" data-cell="${cellIndex}">${bubbleHTML(state, cellIndex)}</div>` : '<div class="cardback">Kliknij</div>'}${selected && !arrested ? toolsHTML(state, cellIndex) : ''}</div>`;
}

function bannerHTML(state: AppState): string {
  const game = state.game!;
  if (!game.over) return '';
  const next = `<div class="row"><button class="big" data-action="again">Nowa sprawa</button>
    <button data-action="screen" data-value="setup">Ustawienia</button><button data-action="screen" data-value="album">Album</button></div>`;
  if (game.over === 'lose') {
    return `<div class="banner lose"><b>Tym razem się nie udało. Złodzieje są zaznaczeni na czerwono.</b>${next}</div>`;
  }
  const stamps = game.earned.map((stampId) => {
    const stamp = stampById(stampId);
    return `<div class="stamp fresh"><div class="e">${stamp.emoji}</div>${stamp.name}</div>`;
  }).join('');
  return `<div class="banner win"><b>Brawo! Sprawa rozwiązana. Ciastko wróciło.</b><div class="stamps spaced">${stamps}</div>${next}</div>`;
}

export function gameHTML(state: AppState): string {
  const game = state.game!, thiefCount = game.puzzle.thiefCount, left = thiefCount - game.arrested.length;
  const goal = thiefCount === 1 ? 'Zniknęło ciastko 🍪. Znajdź złodzieja.' : `Zniknęły ciastka 🍪. Znajdź ${thiefCount === 2 ? 'dwóch' : 'trzech'} złodziei.`;
  const lies = game.puzzle.liars ? `🤥 ${thiefCount === 1 ? 'Złodziej kłamie' : 'Złodzieje kłamią'}` : '😇 Wszyscy mówią prawdę';
  return `${bannerHTML(state)}<div class="bar"><span>${goal}</span><span>${lies}</span><span>${hearts(game.lives, game.settings.lives)}</span>
    ${thiefCount > 1 ? `<span>Do złapania: ${left}</span>` : ''}</div>
    <div class="board" style="--cols:${game.puzzle.board.cols}">${game.puzzle.board.cells.map((_, cellIndex) => cellHTML(state, cellIndex)).join('')}</div>`;
}
