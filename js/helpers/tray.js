// Helper layer: the helper tray (Part 47, Round 4 pilot feedback: the children
// did not notice the Hint, Maths recap and My findings buttons). One tray, in
// the same place in every room, each helper with its icon, its name and a
// short "when to use me" line. No DOM here, so it is tested (tests/tray.test.js);
// js/helper-tray.js draws the tray.
// Habiba (7 Nov 2026): the tray sits in the left margin above Pip; the Hint
// joins the tray; Maths recap stays in Number Lab, My findings in Evidence Board.

export const TRAY_TITLE = '🧰 Helpers';

// The tray's helpers, in this order. `whenWords` is for the games scenario,
// which has no numbers (only the mode).
export const TRAY_TOOLS = {
  hint: { icon: '💡', name: 'Hint', when: 'Stuck? Tap me for ideas.' },
  recap: {
    icon: '📖', name: 'Maths recap', when: 'Forgot mean, median, mode or range? Tap me.', whenWords: 'Forgot what the mode is? Tap me.',
  },
  findings: { icon: '🧭', name: 'My findings', when: 'See what you found so far.' },
};
export const TRAY_ORDER = ['hint', 'recap', 'findings'];

// The "when to use me" line of a helper. `kind`: the scenario's kind ('category' = games).
export function whenLine(id, kind = 'number') {
  const tool = TRAY_TOOLS[id];
  return (kind === 'category' && tool.whenWords) || tool.when;
}

// The 💡 tile follows the hint of the screen: none here, one to give, another
// one, or none left. `hint`: null, or { text, disabled } of the room's hint button.
export function hintTileLine(hint) {
  if (!hint) return 'No hint on this screen.';
  if (hint.disabled) return 'No more hints. You can do it!';
  if (/another/i.test(hint.text)) return 'Tap again for another idea.';
  return TRAY_TOOLS.hint.when;
}
