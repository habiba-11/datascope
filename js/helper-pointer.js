// Shell layer: Pip points at the helpers (Part 47b, Round 4 pilot feedback:
// the children did not notice the Hint, Maths recap and My findings buttons).
// The helpers stay where they are (Habiba, 7 Nov 2026): the Hint under the
// question, Maths recap and My findings in the top bar. The first time
// each one appears in a room, a yellow arrow bounces next to it, pointing at
// it, with its "when to use me" line, and Pip says a line. Maths recap and My
// findings: once per room, per child. Every Hint button: the first time it
// is on screen (8 Nov 2026). Logged as "tray-intro-seen". (The About tab's "Show me
// the helpers" button was removed, Habiba, 8 Nov 2026.) Words and the arrow's
// spot: helpers/pointers.js (tested).
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
// 8 Nov 2026 (Habiba: "not well placed when scrolling"): it follows its
// button on every frame while it shows, so it scrolls with the page.
function place(pointer, button) {
  const spot = pointerSpot(button.getBoundingClientRect(), innerHeight, 120, innerWidth);
  pointer.className = `helper-pointer helper-pointer--${spot.dir}`;
  pointer.style.left = `${spot.x}px`;
  pointer.style.top = `${spot.y}px`;
}

function pointAt({ id, button }) {
  const pointer = document.createElement('div');
  pointer.setAttribute('aria-hidden', 'true'); // the button says what it is; Pip's line is extra
  place(pointer, button);
  pointer.innerHTML = '<svg viewBox="0 0 40 60" width="34" height="50"><path d="M20 4 L36 26 H26 V56 H14 V26 H4 Z" fill="#FFC531" stroke="#17324D" stroke-width="4" stroke-linejoin="round"/></svg>';
  const words = document.createElement('p');
  words.className = 'helper-pointer-words';
  words.textContent = whenLine(id, kind);
  pointer.append(words);
  document.body.append(pointer);
  button.classList.add('helper-glow');
  const follow = () => {
    if (!pointer.isConnected) return;
    if (button.offsetParent === null) pointer.remove(); // its button left the screen's page
    else place(pointer, button);
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
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

// Every Hint button gets its arrow the first time it is on screen (8 Nov
// 2026, Habiba: "on all hint buttons"); Maths recap and My findings once per room.
const pointedHints = new WeakSet();

function isFresh({ id, button }) {
  if (id === 'hint') return !pointedHints.has(button);
  return !hasSeenIntro(`pointer:${room}:${id}`);
}

function markPointed({ id, button }) {
  if (id === 'hint') pointedHints.add(button);
  else markIntroSeen(`pointer:${room}:${id}`);
}

// Looks now and then for a helper this child has not been shown yet.
function look() {
  if (!document.hidden && !document.querySelector('dialog[open]')) {
    const fresh = visibleHelpers().filter(isFresh);
    if (fresh.length) {
      fresh.forEach(markPointed);
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
