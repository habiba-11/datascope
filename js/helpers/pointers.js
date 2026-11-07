// Helper layer: Pip's pointers to the helpers (Part 47b, Round 4 pilot
// feedback: the children did not notice the Hint, Maths recap and My findings
// buttons). The helpers stay where they are (Habiba, 7 Nov 2026: the Hint
// under the question, Maths recap and My findings in the top bar); the first
// time each one appears in a room, an arrow points at it with a short "when to
// use me" line. No DOM here, so it is tested (tests/pointers.test.js);
// js/helper-pointer.js shows the arrows.

// Each helper's "when to use me" line. `whenWords` is for the games scenario
// (no numbers there, only the mode).
export const HELPERS = {
  hint: { when: 'Stuck? Tap me for ideas.' },
  recap: { when: 'Forgot mean, median, mode or range? Tap me.', whenWords: 'Forgot what the mode is? Tap me.' },
  findings: { when: 'See what you found so far.' },
};

// Which helper a button is, from its words ("💡 Need a hint?", "📘 Maths recap",
// "📋 My findings"), or null.
export function helperId(text) {
  if (/recap/i.test(text)) return 'recap';
  if (/findings/i.test(text)) return 'findings';
  if (/hint/i.test(text)) return 'hint';
  return null;
}

export function whenLine(id, kind = 'number') {
  const helper = HELPERS[id];
  return (kind === 'category' && helper.whenWords) || helper.when;
}

// Where the arrow goes for a button at `rect` ({ left, top, width, bottom }) on
// a screen `height` px tall: under it pointing up, or (near the bottom of the
// screen) above it pointing down. `room`: the space the arrow and its line need.
export function pointerSpot(rect, height, room = 120) {
  const x = rect.left + rect.width / 2;
  if (rect.bottom + room <= height) return { x, y: rect.bottom + 6, dir: 'up' };
  return { x, y: rect.top - 6, dir: 'down' };
}
