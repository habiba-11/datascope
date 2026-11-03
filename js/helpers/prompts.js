// Layer 3: the prompt engine. Gentle hints and sentence starters for the
// open questions (architecture row 8: guided prompts and "I think ___ because ___").
import { logEvent } from './log.js';
import { appendAnswer, answerSource } from './suggestions.js';

// Each list goes from a gentle nudge to a sentence starter. A child sees
// one hint per tap, so they only get as much help as they ask for.
export const HINTS = {
  'chance-why': [
    'Look at the list. How many things could happen?',
    'Are all the parts the same size?',
    'Try: "There are ___ outcomes, and..."',
  ],
  // Evidence Board uses the scenario's own claim hints (data/content); this is the fallback.
  claim: [
    'What did you find out about our pretend class?',
    'Use a number as your reason, like the median.',
    'Try: "I think most kids ___ because ___"',
  ],
  'certainty-why': [
    'How many kids did we ask? Is that a lot?',
    'Was anything surprising, like one very different answer?',
    'Try: "I am ___ sure because..."',
  ],
};

// Returns hint number `index` (0, 1, 2...) for a question, or null if there are no more.
export function getHint(key, index) {
  return HINTS[key]?.[index] ?? null;
}

// Adds a "Need a hint?" button right after `anchor` (usually a text box).
// `key` names the question in the log; `hints` can replace the list in HINTS
// (e.g. Question Studio's fix-it hints, which follow the chosen scenario).
export function addHintButton(anchor, key, room, hints = HINTS[key] || []) {
  const box = document.createElement('div');
  box.className = 'hint-box';
  const { button, list } = createHint(key, room, hints);
  box.append(button, list);
  anchor.after(box);
}

// The same hint button and its list, kept apart: in the card layout the
// button goes into the action bar and the hints appear in the task card.
export function createHint(key, room, hints = HINTS[key] || []) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn hint-btn';
  button.textContent = '💡 Need a hint?';

  const list = document.createElement('ul');
  list.className = 'hint-list';
  list.setAttribute('aria-live', 'polite'); // screen readers read new hints aloud

  let shown = 0;
  button.addEventListener('click', () => {
    const hint = hints[shown];
    if (!hint) return;
    shown += 1;

    const item = document.createElement('li');
    item.textContent = `🦉 ${hint}`;
    list.append(item);
    logEvent(room, 'hint', { prompt: key, hintNumber: shown });

    const more = shown < hints.length;
    button.textContent = more ? '💡 Another hint' : 'No more hints. You can do it!';
    button.disabled = !more;
  });

  return { button, list };
}

// How far (px) a finger must move before a tap becomes a drag.
const DRAG_START = 8;

// Hints that give answers (Prof's comment 3). The first tap on the button shows
// the suggested answers. A child can tap one, or drag it into `box`, then change
// it, or write their own. `suggestions`: [{ id, text }] (helpers/suggestions.js).
// All text goes in with textContent. Returns { button, list, answerFields }:
// answerFields() is what to log with the answer (where it came from).
export function createAnswerHint(key, room, suggestions, box) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn hint-btn';
  button.textContent = '💡 Need a hint?';

  const list = document.createElement('ul');
  list.className = 'hint-list suggestion-list';
  list.setAttribute('aria-live', 'polite');

  let tapped = []; // the answers put in the box since it was last empty
  const chips = [];

  function fill(suggestion, chip, how) {
    if (chip.disabled) return;
    tapped.push(suggestion.text);
    box.value = appendAnswer(box.value, suggestion.text);
    chip.disabled = true;
    logEvent(room, 'hint-picked', { prompt: key, suggestionId: suggestion.id, how });
    // Changing a box from code fires no events, but the room's Next button and
    // its logging listen for them.
    box.dispatchEvent(new Event('input', { bubbles: true }));
    box.dispatchEvent(new Event('change', { bubbles: true }));
    box.focus();
  }

  function enableDrag(suggestion, chip) {
    let copy = null;
    chip.addEventListener('pointerdown', (down) => {
      if (chip.disabled) return;
      chip.setPointerCapture(down.pointerId);
      const overBox = (e) => {
        const r = box.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      };
      const onMove = (e) => {
        if (!copy && Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < DRAG_START) return;
        if (!copy) {
          copy = chip.cloneNode(true);
          copy.classList.add('suggestion-copy');
          copy.setAttribute('aria-hidden', 'true');
          copy.style.width = `${chip.offsetWidth}px`;
          document.body.append(copy);
        }
        copy.style.left = `${e.clientX - chip.offsetWidth / 2}px`;
        copy.style.top = `${e.clientY - 24}px`;
        box.classList.toggle('drop-ready', overBox(e));
      };
      const onUp = (e) => {
        chip.removeEventListener('pointermove', onMove);
        chip.removeEventListener('pointerup', onUp);
        chip.removeEventListener('pointercancel', onUp);
        box.classList.remove('drop-ready');
        if (!copy) return; // never moved: it was a tap, and "click" handles it
        copy.remove();
        copy = null;
        chip.dataset.dragged = 'yes'; // the click that follows a drag is not a tap
        if (e.type === 'pointerup' && overBox(e)) fill(suggestion, chip, 'drag');
      };
      chip.addEventListener('pointermove', onMove);
      chip.addEventListener('pointerup', onUp);
      chip.addEventListener('pointercancel', onUp);
    });
  }

  function chipItem(suggestion) {
    const item = document.createElement('li');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'suggestion-chip';
    chip.textContent = suggestion.text;
    chip.addEventListener('click', () => {
      if (chip.dataset.dragged) {
        delete chip.dataset.dragged;
        return;
      }
      fill(suggestion, chip, 'tap');
    });
    enableDrag(suggestion, chip);
    chips.push(chip);
    item.append(chip);
    return item;
  }

  button.addEventListener('click', () => {
    const help = document.createElement('li');
    help.className = 'suggestion-help';
    help.textContent = '👆 Tap one, or drag it into the box. You can change the words.';
    list.replaceChildren(help, ...suggestions.map(chipItem));
    logEvent(room, 'hint', { prompt: key, hintNumber: 1 });
    button.textContent = '💡 Answers are below';
    button.disabled = true;
    chips[0].focus();
  });

  // An emptied box starts again: nothing in it came from a hint any more.
  box.addEventListener('input', () => {
    if (box.value.trim() !== '') return;
    tapped = [];
    chips.forEach((chip) => { chip.disabled = false; });
  });

  function answerFields() {
    const fields = { answerSource: answerSource(box.value, tapped) };
    if (tapped.length) fields.suggestions = [...tapped];
    return fields;
  }

  return { button, list, answerFields };
}
