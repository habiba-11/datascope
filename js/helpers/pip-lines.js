// Helper layer: what Pip says and does (Part 43c, Round 4 pilot feedback:
// Pip should be bigger, alive and talk). The words are in
// data/content/pip-lines.json so Habiba can edit them. No DOM here, so it is
// tested (tests/pip-lines.test.js).

// Each event: Pip's move, and the sound that goes with the line. `sound: null`
// means the moment already has its own sound (the chime for a right answer,
// the badge stamp, the fireworks), so Pip adds none: the same moment always
// sounds the same, and two sounds never pile up.
export const PIP_EVENTS = {
  roomOpen: { move: 'wave', sound: 'hoot' },
  correct: { move: 'jump', sound: null },
  tryAgain: { move: 'tilt', sound: null },
  badge: { move: 'cheer', sound: null },
  phaseDone: { move: 'dance', sound: null },
  hint: { move: 'wink', sound: 'wink' },
  // Part 43e: the child has not tapped for a while; Pip wiggles and offers help.
  idle: { move: 'wiggle', sound: 'hoot' },
  // 8 Nov 2026 (Habiba): no 💡 Hint on this screen, so Pip only encourages and
  // never says "need help?" (there is no help button to offer).
  idleCalm: { move: 'wiggle', sound: 'hoot' },
  // Part 47b: the first time a helper appears in a room, Pip points at it.
  tray: { move: 'wave', sound: null },
};

// Pip's idle life: one small move every few seconds, never the same twice in a row.
export const IDLE_MOVES = ['look', 'hop', 'wave', 'tilt'];
export const IDLE_GAP_SECONDS = { min: 6, max: 10 };

// A random index from 0 to count - 1 that is not `last` (when there is a choice).
// `random` is Math.random, or a fixed one in the tests.
function pickOther(count, last, random) {
  if (count <= 1) return 0;
  const i = Math.floor(random() * (count - 1));
  return i >= last && last >= 0 ? i + 1 : i;
}

// Pip's next line for an event: never the line Pip just said for it.
// Returns { index, text }.
export function pickLine(lines, last = -1, random = Math.random) {
  const index = pickOther(lines.length, last, random);
  return { index, text: lines[index] };
}

// The next idle move: never the same as the last one.
export function nextIdleMove(last = '', random = Math.random) {
  return IDLE_MOVES[pickOther(IDLE_MOVES.length, IDLE_MOVES.indexOf(last), random)];
}

// How long to wait before the next idle move, in milliseconds.
export function idleGap(random = Math.random) {
  const { min, max } = IDLE_GAP_SECONDS;
  return Math.round((min + random() * (max - min)) * 1000);
}

// Part 43e: idle help (Habiba: after 10 seconds, at most once per screen).
// Never a countdown and never a penalty: Pip only offers help.
export const IDLE_HELP_SECONDS = 10;

// One name per screen: the page and the step the child is on.
export function screenKey(page, step = "") {
  return `${page}#${step.trim()}`;
}

// Pip offers help on a screen only once (offered: a Set of screen keys).
export function shouldOfferHelp(screen, offered) {
  return !offered.has(screen);
}

// A reaction to a tap (a right answer, a try again, a hint, the pointer line)
// only makes sense at that moment. If it waited in Pip's line longer than
// this, it is dropped, so Pip never cheers seconds after the moment (scan,
// 7 Nov 2026). Room, badge and phase lines still wait their turn.
export const REACTIONS = ['correct', 'tryAgain', 'hint', 'tray'];
export const STALE_MS = 3000;

export function isStale(event, waitedMs) {
  return REACTIONS.includes(event) && waitedMs > STALE_MS;
}
