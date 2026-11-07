// Helper layer: the words Fix 1 shows when the child picks the better question
// (8 Nov 2026, Habiba: "explain what WHEN is and what pushy is"). No DOM here,
// so it is tested (tests/fixit-words.test.js). The scenario's own words come
// from data/content/<scenario>.json (fixIts[0].choice).

// `choice`: { goodFirst, whenWords, whenWhy, pushyWords }.
// Returns 3 lines: the answer, WHEN explained, pushy explained.
export function choiceExplanation(choice) {
  const good = choice.goodFirst ? 'A' : 'B';
  const pushy = choice.goodFirst ? 'B' : 'A';
  return [
    `✅ Yes! ${good} is the better question. Here is why:`,
    `⏰ It says WHEN: "${choice.whenWords}". WHEN is the time we ask about. ${choice.whenWhy}`,
    `👉 It is not pushy. ${pushy} says ${choice.pushyWords}. Pushy words push people to one answer. ${good} lets everyone answer freely.`,
  ];
}

// A wrong pick: a nudge to look for the two things, never the answer.
export const TRY_AGAIN = '🤔 Not quite. Look again: which one says a time, and has no pushy words?';
