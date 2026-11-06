// Shell layer: big Pip beside the card (Part 43c, Round 4 pilot feedback:
// "make Pip bigger, always visible, alive, and let Pip talk").
// On a laptop screen (1240px or wider) Pip stands on the hills in the left
// margin with a speech bubble. On a narrower screen there is no margin, so the
// small Pip in the card talks instead: the line shows for a moment where the
// instruction is, then the instruction comes back.
// Words: data/content/pip-lines.json. Moves and sounds: helpers/pip-lines.js.
// Pip's words are extra cheering: the real feedback is already on the page
// (and read out to screen readers there), so the stand is aria-hidden.
import { pipSVG } from './pip.js';
import { animate } from './motion.js';
import { playSound } from './sounds.js';
import { PIP_EVENTS, pickLine, nextIdleMove, idleGap } from './helpers/pip-lines.js';

const WIDE = '(min-width: 1240px)'; // the same width as in css/shell.css (Part 43c)
const SAY_MS = 4500; // how long a line stays
const MODAL_WAIT_MS = 15000; // a line waits for an open pop-up to close, at most this long

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isWide = () => window.matchMedia(WIDE).matches;

let linesPromise = null;
const lastLine = {}; // per event: the index Pip said last
let bubbleTimer = null;
let lastIdle = '';

function loadLines() {
  if (!linesPromise) linesPromise = fetch('../data/content/pip-lines.json').then((r) => r.json()).catch(() => ({}));
  return linesPromise;
}

// Resolves when no pop-up is open (or after MODAL_WAIT_MS), so Pip never talks behind one.
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

// Pip says one line for an event ('roomOpen', 'correct', 'hint', ...), with
// its move and (for some events) its sound. Lines wait in a queue with a short
// pause between them, so two at once (a finished phase AND a badge) are both read.
const GAP_MS = 2500;
let queue = Promise.resolve();

export function pipTalk(event) {
  queue = queue.then(() => talkNow(event)).catch(() => {});
  return queue;
}

async function talkNow(event) {
  const style = PIP_EVENTS[event];
  const lines = (await loadLines())[event];
  if (!style || !lines || !lines.length) return;
  await whenNoModal();
  const { index, text } = pickLine(lines, lastLine[event]);
  lastLine[event] = index;
  if (style.sound) playSound(style.sound);
  if (isWide()) sayInBubble(text, style.move);
  else sayInCard(text, style.move);
  await new Promise((resolve) => { setTimeout(resolve, GAP_MS); });
}

function sayInBubble(text, move) {
  const bubble = document.getElementById('pip-stand-bubble');
  if (!bubble) return;
  bubble.textContent = text;
  bubble.hidden = false;
  animate(bubble, 'pip-bubble-pop');
  animate(document.querySelector('.pip-stand .pip-stand-body'), `pip-move-${move}`);
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { bubble.hidden = true; }, SAY_MS);
}

// The small Pip in the card says the line for a moment, then the instruction
// comes back (unless the room already changed it to something new).
function sayInCard(text, move) {
  const line = document.querySelector('.pip-line-text[data-pip-text]');
  animate(document.querySelector('.pip-mascot--line'), `pip-move-${move}`);
  if (!line) return;
  const instruction = line.textContent;
  line.textContent = `🦉 ${text}`;
  setTimeout(() => { if (line.textContent === `🦉 ${text}`) line.textContent = instruction; }, SAY_MS);
}

// One small idle move every 6 to 10 seconds: look around, hop, wave or tilt.
// Never with reduced motion, while the tab is hidden, or while a pop-up is open.
function idleLoop() {
  setTimeout(() => {
    const body = document.querySelector('.pip-stand .pip-stand-body');
    if (body && isWide() && !reduceMotion() && !document.hidden && !document.querySelector('dialog[open]')) {
      lastIdle = nextIdleMove(lastIdle);
      animate(body, `pip-move-${lastIdle}`);
    }
    idleLoop();
  }, idleGap());
}

// Puts big Pip on the page and lets Pip react. Called once by js/app.js.
export function mountPipStand() {
  if (document.querySelector('.pip-stand')) return;
  const stand = document.createElement('aside');
  stand.className = 'pip-stand';
  stand.setAttribute('aria-hidden', 'true');
  stand.innerHTML = `
    <p class="pip-stand-bubble" id="pip-stand-bubble" hidden></p>
    <div class="pip-stand-body pip-mascot">${pipSVG()}</div>`;
  document.body.append(stand);
  idleLoop();

  // Rooms say "right" or "try again" through motion.js (cheer, encourage).
  window.addEventListener('datascope:pip', (e) => pipTalk(e.detail.event));
  // Hints, badges and finished phases come from the reasoning log.
  window.addEventListener('datascope:logged', (e) => {
    const { type, backfill } = e.detail;
    if (type === 'hint') pipTalk('hint');
    else if (type === 'badge-earned' && !backfill) pipTalk('badge');
    else if (type === 'phase-complete') pipTalk('phaseDone');
  });
  // A wave and a hello when the room opens (after its intro pop-up, if any).
  setTimeout(() => pipTalk('roomOpen'), 800);
}
