// Layer 3: the prompt engine. Gentle hints and sentence starters for the
// open questions (architecture row 8: guided prompts and "I think ___ because ___").
import { logEvent } from './log.js';

// Each list goes from a gentle nudge to a sentence starter. A child sees
// one hint per tap, so they only get as much help as they ask for.
export const HINTS = {
  // Graph Lab uses the scenario's own hints (data/content); these are the fallback.
  'graph-tell': [
    'Find the tallest bar. What does it show?',
    'Try: "Most kids..."',
    'Look at the ends: "Only a few kids..."',
  ],
  'graph-not-tell': [
    'Does the graph tell us WHY kids answered this way?',
    'Would another class give the same answers?',
    "Try: 'This graph doesn't tell us...'",
  ],
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
