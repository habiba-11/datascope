// Layer 3: the prompt engine. Gentle hints and sentence starters for the
// open questions (architecture row 8: guided prompts and "I think ___ because ___").
import { logEvent } from './log.js';
import { appendAnswer, answerSource } from './suggestions.js';

// Tips, one per tap (Question Studio's fix-its: fixing the question is the skill
// itself, so those hints stay words to read). The button and its list are kept
// apart: the button goes into the action bar, the hints appear in the task card.
// `key` names the question in the log. A hint can also be { text, answer, box }:
// then `answer` shows as a chip the child can tap to put it in `box` (the last
// fix-it hint, Habiba, 4 Nov 2026). It replaces the box's text (the flawed
// question) and is logged as hint-picked, so the thesis data knows.
// A hint can also be { text, answer, onPick, id } (Number Lab's Build it, Habiba
// 6 Nov 2026): then tapping the chip runs onPick (e.g. fills 5 boxes) and is
// logged as hint-picked with that id.
function answerChip(key, room, { answer, box, onPick, id = 'fix' }) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'suggestion-chip hint-answer';
  chip.textContent = `👆 ${answer}`;
  chip.addEventListener('click', () => {
    chip.disabled = true;
    logEvent(room, 'hint-picked', { prompt: key, suggestionId: id, how: 'tap' });
    if (onPick) {
      onPick();
      return;
    }
    box.value = answer;
    box.dispatchEvent(new Event('input', { bubbles: true })); // the checker runs again
    box.focus();
  });
  return chip;
}

export function createHint(key, room, hints) {
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
    item.textContent = `🦉 ${hint.text || hint}`;
    if (hint.answer) item.append(answerChip(key, room, hint));
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
// All text goes in with textContent. Returns { button, list, open, answerFields }:
// open() shows the answers (a room with one button for two boxes calls it), and
// answerFields() is what to log with the answer (where it came from).
// `options.line` (8 Nov 2026, Habiba: "not clear this hint is for the second
// line"): the words that start the box's line, e.g. "because". The help line
// names it, and each answer starts with it, faded (it is not put in the box).
export function createAnswerHint(key, room, suggestions, box, { line = '' } = {}) {
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
    if (line) chip.append(Object.assign(document.createElement('span'), { className: 'suggestion-line', textContent: `${line} … ` }));
    chip.append(suggestion.text);
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

  function open({ focus = true } = {}) {
    if (chips.length) return; // already open
    const help = document.createElement('li');
    help.className = 'suggestion-help';
    help.textContent = line
      ? `👆 These finish your "${line} …" line. Tap one, or drag it into the box.`
      : '👆 Tap one, or drag it into the box. You can change the words.';
    list.replaceChildren(help, ...suggestions.map(chipItem));
    logEvent(room, 'hint', { prompt: key, hintNumber: 1 });
    button.textContent = '💡 Answers are below';
    button.disabled = true;
    if (focus) chips[0].focus();
  }
  button.addEventListener('click', () => open());

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

  return { button, list, open, answerFields };
}
