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
  hint: { move: 'wink', sound: 'chirp' },
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
