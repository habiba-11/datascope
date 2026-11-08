// Helper layer: the words Fix 1 shows when the child picks the better question
// (8 Nov 2026, Habiba: "explain what WHEN is and what pushy is", then "too many
// words": 3 short rows, each with a bold label first). No DOM here, so it is
// tested (tests/fixit-words.test.js). The scenario's own words come from
// data/content/<scenario>.json (fixIts[0].choice).

// `choice`: { goodFirst, whenWords, whenWhy, pushyWords }.
// Returns 3 rows, each { label, text }: the answer, WHEN, not pushy.
export function choiceExplanation(choice) {
  const good = choice.goodFirst ? 'A' : 'B';
  const pushy = choice.goodFirst ? 'B' : 'A';
  return [
    { label: `:check: Yes! ${good} is better.`, text: '' },
    { label: ':clock: WHEN:', text: `"${choice.whenWords}", so ${choice.whenWhy}` },
    { label: ':scales: Not pushy:', text: `${pushy} uses ${choice.pushyWords}. They push you to one answer.` },
  ];
}

// A wrong pick: a nudge to look for the two things, never the answer.
export const TRY_AGAIN = ':question: Not quite. Look again: which one says a time, and has no pushy words?';
