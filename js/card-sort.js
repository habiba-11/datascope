// Shell layer: "sort the cards" (Part 21c). The child puts number cards in
// order, smallest to biggest, by dragging them (mouse or touch) OR with the
// ← → buttons on each card (keyboard and tap). When the cards are in order, the
// card(s) in the centre light up: that is the median. With `pickCentre`
// (Part 56, Habiba: "he finds the centre by himself"), the child taps the
// centre card instead; a wrong tap shows each card's place (1, 2, 3...).
// The rules are in helpers/sort-cards.js.
import { moveItem, isSorted, centreIndexes, dropIndex } from './helpers/sort-cards.js';
import { pulse } from './motion.js';
import { setIconText } from './icon-text.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// Builds the puzzle inside `container`. `onSorted()` runs once, when sorted.
// `pickCentre(index, value, isCentre)`: optional; when sorted, the child taps
// a card and this decides what to say; it returns true when the tap was right.
export function mountCardSort(container, numbers, onSorted, { pickCentre = null } = {}) {
  // Each card keeps its id, so it can glide from its old place to its new one.
  let cards = numbers.map((value, id) => ({ id, value }));
  let done = false;

  const row = el('ol', '', 'sort-row');
  row.setAttribute('aria-label', 'Number cards, from left to right');
  const status = el('p', '', 'sort-status');
  status.setAttribute('aria-live', 'polite');
  container.append(row, status);

  // FLIP: remember where each card was, re-draw, then slide each from old to new.
  function placesNow() {
    const places = new Map();
    row.querySelectorAll('.sort-card').forEach((card) => places.set(card.dataset.id, card.getBoundingClientRect().left));
    return places;
  }

  function glide(before) {
    if (reduceMotion() || !window.gsap) return;
    row.querySelectorAll('.sort-card').forEach((card) => {
      const dx = before.get(card.dataset.id) - card.getBoundingClientRect().left;
      if (dx) window.gsap.from(card, { x: dx, duration: 0.3, ease: 'power2.out', clearProps: 'transform' });
    });
  }

  function move(from, to, focusSide) {
    if (done || to < 0 || to >= cards.length || from === to) return;
    const before = placesNow();
    cards = moveItem(cards, from, to);
    render();
    glide(before);
    // Keyboard users keep their place: focus the same button on the moved card.
    const moved = row.children[to];
    if (focusSide && moved) moved.querySelector(`.sort-${focusSide}`)?.focus();
  }

  function finish() {
    done = true;
    const centre = centreIndexes(cards.length);
    if (pickCentre) {
      row.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      askForCentre(centre);
      onSorted();
      return;
    }
    centre.forEach((i) => {
      row.children[i].classList.add('centre');
      pulse(row.children[i]);
    });
    row.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    onSorted(centre.map((i) => cards[i].value));
  }

  // Part 56: every card becomes one big tap target; the child picks the centre.
  function askForCentre(centre) {
    setIconText(status, 'tap', 'In order! Now tap the card in the centre.');
    [...row.children].forEach((card, i) => {
      card.classList.add('pickable');
      const pick = el('button', '', 'sort-pick');
      pick.type = 'button';
      pick.setAttribute('aria-label', `Card ${i + 1}: ${cards[i].value}`);
      pick.addEventListener('click', () => {
        if (pickCentre(i, cards[i].value, centre.includes(i))) {
          row.querySelectorAll('.sort-pick').forEach((b) => { b.disabled = true; });
          centre.forEach((c) => {
            row.children[c].classList.add('centre');
            pulse(row.children[c]);
          });
          status.textContent = '';
        } else {
          card.classList.add('wrong-pick');
          showPlaces();
        }
      });
      card.append(pick);
    });
  }

  // After a wrong tap: each card's place under it, so the child can count.
  function showPlaces() {
    [...row.children].forEach((card, i) => {
      if (!card.querySelector('.sort-place')) card.append(el('span', String(i + 1), 'sort-place'));
    });
  }

  function cardNode({ id, value }, index) {
    const card = el('li', '', 'sort-card');
    card.dataset.id = String(id);
    // Text arrows (kept as text, Part 54e); the aria-labels say what they do.
    const left = el('button', '←', 'btn sort-left');
    const right = el('button', '→', 'btn sort-right');
    left.type = 'button';
    right.type = 'button';
    left.setAttribute('aria-label', `Move ${value} left`);
    right.setAttribute('aria-label', `Move ${value} right`);
    left.disabled = index === 0;
    right.disabled = index === cards.length - 1;
    left.addEventListener('click', () => move(index, index - 1, 'left'));
    right.addEventListener('click', () => move(index, index + 1, 'right'));

    const number = el('span', String(value), 'sort-value');
    const arrows = el('span', '', 'sort-arrows');
    arrows.append(left, right);
    card.append(number, arrows);
    enableDrag(card, index);
    return card;
  }

  // Dragging: the card follows the pointer; on release it lands where it was dropped.
  function enableDrag(card, index) {
    card.addEventListener('pointerdown', (event) => {
      if (done || event.target.closest('button')) return;
      card.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      card.classList.add('dragging');

      const onMove = (e) => { card.style.transform = `translateX(${e.clientX - startX}px)`; };
      const onUp = (e) => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerup', onUp);
        card.removeEventListener('pointercancel', onUp);
        card.classList.remove('dragging');
        card.style.transform = '';
        const others = [...row.children].filter((c) => c !== card)
          .map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; });
        move(index, dropIndex(e.clientX, others), null);
      };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerup', onUp);
      card.addEventListener('pointercancel', onUp);
    });
  }

  function render() {
    row.replaceChildren(...cards.map(cardNode));
    if (!done && isSorted(cards.map((c) => c.value))) finish();
  }

  setIconText(status, 'tap', 'Drag the cards, or use ← →, from smallest to biggest.');
  render();
}
