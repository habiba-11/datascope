// Shell layer: Pip points at the helpers (Part 47b, Round 4 pilot feedback:
// the children did not notice the Hint, Maths recap and My findings buttons).
// The helpers stay where they are (Habiba, 7 Nov 2026): the 💡 Hint under the
// question, 📘 Maths recap and 📋 My findings in the top bar. The first time
// each one appears in a room, a yellow arrow bounces next to it, pointing at
// it, with its "when to use me" line, and Pip says a line. Once per helper,
// per room, per child; logged as "tray-intro-seen". The About tab can show the
// arrows again. Words and the arrow's spot: helpers/pointers.js (tested).
import { helperId, whenLine, pointerSpot } from './helpers/pointers.js';
import { logEvent } from './helpers/log.js';
import { hasSeenIntro, markIntroSeen, getSelectedScenarioId } from './storage/save.js';
import { loadContent } from './helpers/scenarios.js';
import { pipTalk } from './pip-stand.js';

const LOOK_EVERY_MS = 1000; // how often to look for a helper that just appeared
const SHOW_MS = 4000; // how long an arrow stays

let room = '';
let kind = 'number';

// The helper buttons on screen now: { id, button } (the visible ones only).
function visibleHelpers() {
  const buttons = [...document.querySelectorAll('.hint-btn, #room-tools .btn')];
  return buttons
    .filter((b) => b.offsetParent !== null && !b.disabled)
    .map((button) => ({ id: helperId(button.textContent), button }))
    .filter((h) => h.id);
}

// One arrow, pointing at `button`, with the helper's line in a little bubble.
function pointAt({ id, button }) {
  const spot = pointerSpot(button.getBoundingClientRect(), innerHeight);
  const pointer = document.createElement('div');
  pointer.className = `helper-pointer helper-pointer--${spot.dir}`;
  pointer.setAttribute('aria-hidden', 'true'); // the button says what it is; Pip's line is extra
  pointer.style.left = `${spot.x}px`;
  pointer.style.top = `${spot.y}px`;
  pointer.innerHTML = '<svg viewBox="0 0 40 60" width="34" height="50"><path d="M20 4 L36 26 H26 V56 H14 V26 H4 Z" fill="#FFC531" stroke="#17324D" stroke-width="4" stroke-linejoin="round"/></svg>';
  const words = document.createElement('p');
  words.className = 'helper-pointer-words';
  words.textContent = whenLine(id, kind);
  pointer.append(words);
  document.body.append(pointer);
  button.classList.add('helper-glow');
  setTimeout(() => {
    pointer.remove();
    button.classList.remove('helper-glow');
  }, SHOW_MS);
}

// Points at these helpers now, and Pip says a line. `auto`: false when asked again.
function point(helpers, auto) {
  helpers.forEach(pointAt);
  // "phase" (not "room": every log entry already has its own room field).
  for (const { id } of helpers) logEvent('shell', 'tray-intro-seen', { phase: room, helper: id, auto });
  pipTalk('tray');
}

// Looks now and then for a helper this child has not been shown in this room yet.
function look() {
  if (!document.hidden && !document.querySelector('dialog[open]')) {
    const fresh = visibleHelpers().filter(({ id }) => !hasSeenIntro(`pointer:${room}:${id}`));
    if (fresh.length) {
      fresh.forEach(({ id }) => markIntroSeen(`pointer:${room}:${id}`));
      point(fresh, true);
    }
  }
  setTimeout(look, LOOK_EVERY_MS);
}

// Starts the pointers in this room (js/app.js). `roomId`: e.g. 'graph'.
export function startHelperPointers(roomId) {
  room = roomId;
  loadContent(getSelectedScenarioId()).then((c) => { kind = c.numberLab.kind; }).catch(() => {});
  setTimeout(look, LOOK_EVERY_MS);
}

// The About tab's "🧰 Show me the helpers": every helper on screen, again.
export function showHelpersAgain() {
  const helpers = visibleHelpers();
  if (helpers.length) point(helpers, false);
}
