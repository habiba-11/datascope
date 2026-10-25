// Layer 3: the prompt engine. Gentle hints and sentence starters for the
// open questions (architecture row 8: guided prompts and "I think ___ because ___").
import { logEvent } from './log.js';

// Each list goes from a gentle nudge to a sentence starter. A child sees
// one hint per tap, so they only get as much help as they ask for.
export const HINTS = {
  'graph-tell': [
    'Look at the tallest bar or the biggest stack. What does it show?',
    'Try starting with: "Most classmates..."',
    'Or look at the other end: "Only a few classmates..."',
  ],
  'graph-not-tell': [
    'Does the graph tell us WHY classmates answered this way?',
    'Would a different class give the same answers?',
    'Try starting with: "This graph does not tell us..."',
  ],
  'chance-why': [
    'Look at the list of all possible outcomes. How many are there?',
    'Is every outcome equally likely? Are all the parts the same size?',
    'Try starting with: "There are ___ outcomes, and..."',
  ],
  claim: [
    'What did you find out about our pretend class?',
    'Use a number as your reason, like the median or the mode.',
    'Try: "I think most classmates ___ because the graph shows ___"',
  ],
  'certainty-why': [
    'How many classmates did we ask? Is that a lot or a little?',
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

  box.append(button, list);
  anchor.after(box);
}
