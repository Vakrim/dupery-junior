import './styles.css';
import { matchingCells } from './game/board';
import { loadStore, saveStore } from './state/profiles';
import { handleClick, importBackup } from './ui/actions';
import { render } from './ui/render';
import { createState } from './ui/state';

const state = createState(loadStore(localStorage));
const persist = () => saveStore(localStorage, state.store);

document.addEventListener('click', (e) => {
  if (handleClick(state, e.target as Element, persist)) render(state);
});

document.addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  if (input.id !== 'import' || !input.files?.[0]) return;
  if (await importBackup(state, input.files[0], persist)) render(state);
});

// Hints: pointing at a sentence lights up the animals it talks about.
function highlight(on: boolean, e: Event) {
  const g = state.game;
  const bubble = (e.target as Element).closest<HTMLElement>('.bubble');
  if (!bubble || state.screen !== 'game' || !g?.s.hints) return;
  const i = Number(bubble.dataset.i);
  const lit = matchingCells(g.c.statements[i], i, g.c.board);
  document.querySelectorAll<HTMLElement>('.cell').forEach((el) => el.classList.toggle('hl', on && lit.includes(Number(el.dataset.i))));
}
document.addEventListener('mouseover', (e) => highlight(true, e));
document.addEventListener('mouseout', (e) => highlight(false, e));

render(state);
