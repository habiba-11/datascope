// Shell layer: big choice cards that work like radio buttons (UI guide:
// choiceCards). One can be chosen; it lifts and gets a ✓ badge (css). Screen
// readers hear "radio, checked"; the arrow keys move between the cards and
// choose (like real radio buttons); only the chosen card is a Tab stop.
import { nextIndex } from './helpers/choice-keys.js';

// `group`: the element around the cards. `cardSelector`: the cards inside it.
// `onChoose(card)` runs each time the child chooses a card.
export function wireChoiceCards(group, cardSelector, onChoose) {
  const cards = [...group.querySelectorAll(cardSelector)];
  group.setAttribute('role', 'radiogroup');

  function choose(card, { focus = false } = {}) {
    cards.forEach((c) => {
      const isIt = c === card;
      c.classList.toggle('selected', isIt);
      c.setAttribute('aria-checked', String(isIt));
      c.tabIndex = isIt ? 0 : -1;
    });
    if (focus) card.focus();
    onChoose(card);
  }

  cards.forEach((card, i) => {
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', 'false');
    card.tabIndex = i === 0 ? 0 : -1; // Tab reaches the group once
    card.addEventListener('click', () => choose(card));
    card.addEventListener('keydown', (event) => {
      const next = nextIndex(event.key, i, cards.length);
      if (next === null) return;
      event.preventDefault();
      choose(cards[next], { focus: true });
    });
  });
}

// A row of joined buttons for one small choice (UI guide: segmented), e.g.
// the chart types or 10 / 50 / 500 tries. Wire it with wireChoiceCards:
// radio buttons with arrow keys. `options`: [{ value, label }].
export function segmentedHTML(options, label) {
  return `<div class="segmented" aria-label="${label}">${options
    .map((o) => `<button class="segment" data-value="${o.value}" type="button">${o.label}</button>`)
    .join('')}</div>`;
}
