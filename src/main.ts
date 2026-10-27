import './styles.css';
import { matchingCells } from './game/board';
import { loadStore, saveStore } from './state/profiles';
import { handleClick, importBackup } from './ui/actions';
import { render } from './ui/render';
import { createState } from './ui/state';

const state = createState(loadStore(localStorage));
const persist = () => saveStore(localStorage, state.store);

document.addEventListener('click', (event) => {
  if (handleClick(state, event.target as Element, persist)) render(state);
});

document.addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id !== 'import' || !input.files?.[0]) return;
  if (await importBackup(state, input.files[0], persist)) render(state);
});

// Hints: pointing at a sentence lights up the animals it talks about.
function highlight(enabled: boolean, event: Event) {
  const game = state.game;
  const bubble = (event.target as Element).closest<HTMLElement>('.bubble');
  if (!bubble || state.screen !== 'game' || !game?.settings.hints) return;
  const cellIndex = Number(bubble.dataset.cell);
  const litCells = matchingCells(game.puzzle.statements[cellIndex], cellIndex, game.puzzle.board);
  document.querySelectorAll<HTMLElement>('.cell').forEach((cell) => cell.classList.toggle('hl', enabled && litCells.includes(Number(cell.dataset.cell))));
}
document.addEventListener('mouseover', (event) => highlight(true, event));
document.addEventListener('mouseout', (event) => highlight(false, event));

render(state);
