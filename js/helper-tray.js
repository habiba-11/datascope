// Shell layer: the helper tray (Part 47, Round 4 pilot feedback: the children
// did not notice the Hint, Maths recap and My findings buttons). One tray,
// "🧰 Helpers", in the same place in every room: in the left margin above big
// Pip on a laptop screen (1240px and wider), as a row in the top bar on a
// narrower one. Each helper has its icon, its name and a "when to use me" line
// (helpers/tray.js, tested).
// - 💡 Hint is in every room. Tapping it gives the screen's hint (the ideas
//   still appear under the question, where they can be tapped into the box);
//   on a screen with no hint it is greyed out and says so.
// - 📖 Maths recap (Number Lab) and 🧭 My findings (Evidence Board) are added
//   by their rooms (addTrayTool).
// The first time in each room, Pip points up at the tray (an arrow bounces and
// the tray glows). Logged once per room as "tray-intro-seen"; the About tab
// can show it again.
import {
  TRAY_TITLE, TRAY_TOOLS, TRAY_ORDER, whenLine, hintTileLine,
} from './helpers/tray.js';
import { logEvent } from './helpers/log.js';
import { hasSeenIntro, markIntroSeen } from './storage/save.js';
import { pipTalk } from './pip-stand.js';

const WIDE = '(min-width: 1240px)'; // the same width as big Pip (css/shell.css)
const MODAL_WAIT_MS = 20000;

let tray = null;
let hintButton = null; // the room's hint button for the screen (not on the page itself)
let room = '';

const tile = (id) => tray && tray.querySelector(`[data-tool="${id}"]`);

function el(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// One helper: a big button with its icon, name and "when to use me" line.
function makeTile(id) {
  const { icon, name } = TRAY_TOOLS[id];
  const button = el('button', '', 'helper-tile');
  button.type = 'button';
  button.dataset.tool = id;
  const iconSpan = el('span', icon, 'helper-tile-icon');
  iconSpan.setAttribute('aria-hidden', 'true');
  button.append(iconSpan, el('span', name, 'helper-tile-name'), el('span', whenLine(id), 'helper-tile-when'));
  return button;
}

// Laptop: in the left margin, above Pip. Narrower: a row in the top bar.
function place() {
  const wide = window.matchMedia(WIDE).matches;
  tray.classList.toggle('helper-tray--wide', wide);
  tray.classList.toggle('helper-tray--bar', !wide);
  const bar = document.getElementById('room-tools');
  if (wide || !bar) document.body.append(tray);
  else bar.append(tray);
}

// The 💡 tile follows the hint of the screen (none, one, another, no more).
function syncHint() {
  const hint = tile('hint');
  if (!hint) return;
  const state = hintButton ? { text: hintButton.textContent, disabled: hintButton.disabled } : null;
  hint.disabled = !state || state.disabled;
  hint.querySelector('.helper-tile-when').textContent = hintTileLine(state);
}

// Puts the tray on the page (js/app.js, once per room). `roomId`: e.g. 'graph'.
export function mountHelperTray(roomId) {
  if (tray) return;
  room = roomId;
  tray = el('aside', '', 'helper-tray');
  tray.setAttribute('aria-label', 'Helpers');
  tray.append(el('p', TRAY_TITLE, 'helper-tray-title'));
  for (const id of TRAY_ORDER) {
    const button = makeTile(id);
    if (id !== 'hint') button.hidden = true; // the rooms that have them add them
    tray.append(button);
  }
  tile('hint').addEventListener('click', () => {
    if (!hintButton || hintButton.disabled) return;
    hintButton.click(); // the room's own hint: logs it and shows the ideas under the question
    syncHint();
  });
  place();
  window.matchMedia(WIDE).addEventListener('change', place);
  syncHint();
}

// The room's hint button for the screen on show (or null). js/action-bar.js calls this.
export function setTrayHint(button) {
  hintButton = button || null;
  syncHint();
}

// A room adds Maths recap or My findings. `kind`: the scenario's kind (games get their own words).
export function addTrayTool(id, onClick, kind = 'number') {
  const button = tile(id);
  if (!button) return;
  button.querySelector('.helper-tile-when').textContent = whenLine(id, kind);
  button.addEventListener('click', onClick);
  button.hidden = false;
}

// Resolves when no pop-up is open (or after a while), so the pointer is seen.
function whenNoModal() {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      if (!document.querySelector('dialog[open]') || Date.now() - started > MODAL_WAIT_MS) resolve();
      else setTimeout(check, 300);
    };
    check();
  });
}

// Pip points at the tray: it glows, an arrow bounces up from Pip (laptop
// screens), and Pip says where help is. `auto`: false when the child asked
// for it again (the About tab). Logged as "tray-intro-seen".
export async function showTray(auto = true) {
  if (!tray) return;
  await whenNoModal();
  logEvent('shell', 'tray-intro-seen', { room, auto });
  tray.classList.remove('tray-glow');
  void tray.offsetWidth; // restarts the glow
  tray.classList.add('tray-glow');
  setTimeout(() => tray.classList.remove('tray-glow'), 3200);
  if (tray.classList.contains('helper-tray--wide')) {
    const arrow = el('div', '', 'tray-arrow');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg viewBox="0 0 40 60" width="40" height="60"><path d="M20 4 L36 26 H26 V56 H14 V26 H4 Z" fill="#FFC531" stroke="#17324D" stroke-width="4" stroke-linejoin="round"/></svg>';
    const box = tray.getBoundingClientRect();
    arrow.style.left = `${box.left + box.width / 2 - 20}px`;
    arrow.style.top = `${box.bottom + 6}px`;
    document.body.append(arrow);
    setTimeout(() => arrow.remove(), 3200);
  }
  pipTalk('tray');
}

// The first time this child is in this room: Pip points at the tray.
export function introduceTray() {
  const key = `tray:${room}`;
  if (hasSeenIntro(key)) return;
  markIntroSeen(key);
  showTray(true);
}
