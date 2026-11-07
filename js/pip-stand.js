// Shell layer: big Pip beside the card (Part 43c, Round 4 pilot feedback:
// "make Pip bigger, always visible, alive, and let Pip talk").
// On a laptop screen (1240px or wider) Pip stands on the hills in the left
// margin with a speech bubble. On a narrower screen there is no margin, so the
// small Pip in the card talks instead: the line shows for a moment where the
// instruction is, then the instruction comes back.
// Words: data/content/pip-lines.json. Moves and sounds: helpers/pip-lines.js.
// Pip's words are extra cheering: the real feedback is already on the page
// (and read out to screen readers there), so Pip and the words are aria-hidden;
// only the idle-help button (Part 43e) is a real button.
import { pipSVG } from './pip.js';
import { animate } from './motion.js';
import { playSound } from './sounds.js';
import {
  PIP_EVENTS, pickLine, nextIdleMove, idleGap, IDLE_HELP_SECONDS, screenKey, shouldOfferHelp,
} from './helpers/pip-lines.js';
import { logEvent } from './helpers/log.js';

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

// `options.help`: a function for a "💡 Yes, help me!" button in the bubble (idle help).
// `options.ms`: how long the line stays.
export function pipTalk(event, options = {}) {
  queue = queue.then(() => talkNow(event, options)).catch(() => {});
  return queue;
}

async function talkNow(event, options) {
  const style = PIP_EVENTS[event];
  const lines = (await loadLines())[event];
  if (!style || !lines || !lines.length) return;
  await whenNoModal();
  const { index, text } = pickLine(lines, lastLine[event]);
  lastLine[event] = index;
  if (style.sound) playSound(style.sound);
  if (isWide()) sayInBubble(text, style.move, options);
  else sayInCard(text, style.move);
  await new Promise((resolve) => { setTimeout(resolve, GAP_MS); });
}

function sayInBubble(text, move, { help = null, ms = SAY_MS } = {}) {
  const bubble = document.getElementById('pip-stand-bubble');
  if (!bubble) return;
  const words = document.createElement('span');
  words.textContent = text;
  words.setAttribute('aria-hidden', 'true'); // cheering only: the page already says it
  bubble.replaceChildren(words);
  if (help) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-quiet pip-help-btn';
    button.textContent = '💡 Yes, help me!';
    button.addEventListener('click', () => {
      bubble.hidden = true;
      help();
    });
    bubble.append(button);
  }
  bubble.hidden = false;
  animate(bubble, 'pip-bubble-pop');
  animate(document.querySelector('.pip-stand .pip-stand-body'), `pip-move-${move}`);
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { bubble.hidden = true; }, ms);
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

// ---------- Part 43e: idle help ----------
// No tap, key, typing or scrolling for 10 seconds: Pip wiggles and offers
// help, at most once per screen (Habiba, 6 Nov 2026). Never a countdown, never
// a penalty; nothing happens while a pop-up is open or the tab is hidden.
const offered = new Set();
let idleTimer = null;

function visibleHintButton() {
  return [...document.querySelectorAll('.hint-btn')].find((b) => b.offsetParent !== null && !b.disabled) || null;
}

// The screen: the page and the step of the mini stepper (or the question).
function currentScreen() {
  const step = document.querySelector('.stepper-chip--now') || document.querySelector('.task-question');
  return screenKey(location.pathname, step ? step.textContent.replace(/\s+/g, ' ') : '');
}

function restartIdleHelp() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(offerHelp, IDLE_HELP_SECONDS * 1000);
}

function offerHelp() {
  if (document.hidden || document.querySelector('dialog[open]')) {
    restartIdleHelp();
    return;
  }
  const screen = currentScreen();
  if (!shouldOfferHelp(screen, offered)) return; // this screen had its offer; wait for the next tap
  offered.add(screen);
  const hint = visibleHintButton();
  logEvent('shell', 'idle-help-shown', { screen, hintButton: Boolean(hint) });
  const help = hint ? () => {
    logEvent('shell', 'idle-help-taken', { screen });
    hint.click();
  } : null;
  pipTalk('idle', { help, ms: 9000 });
}

// Puts big Pip on the page and lets Pip react. Called once by js/app.js.
// The Pip drawing is decoration (hidden from screen readers); the bubble's
// words are extra cheering (hidden too), but its help button is a real button.
export function mountPipStand() {
  if (document.querySelector('.pip-stand')) return;
  const stand = document.createElement('aside');
  stand.className = 'pip-stand';
  stand.setAttribute('aria-label', 'Pip');
  stand.innerHTML = `
    <div class="pip-stand-bubble" id="pip-stand-bubble" hidden></div>
    <div class="pip-stand-body pip-mascot" aria-hidden="true">${pipSVG()}</div>`;
  document.body.append(stand);
  idleLoop();
  ['pointerdown', 'keydown', 'input', 'wheel', 'scroll'].forEach((type) => {
    window.addEventListener(type, restartIdleHelp, { passive: true, capture: true });
  });
  restartIdleHelp();

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
