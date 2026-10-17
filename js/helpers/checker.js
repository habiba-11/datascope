const LEADING_WORDS = ['good', 'best', 'great', 'bad', 'worst', 'better', 'right', 'wrong', 'amazing', 'awful'];
const TIME_WORDS = [
  'today', 'yesterday', 'tonight', 'tomorrow', 'this week', 'last week',
  'this month', 'this year', 'last night', 'right now', 'this morning', 'this weekend',
];
const YES_NO_STARTERS = [
  'do', 'does', 'did', 'is', 'are', 'was', 'were', 'can', 'could', 'will', 'would',
  'has', 'have', 'should', "isn't", "aren't", "don't", "doesn't",
];
const OPEN_STARTERS = ['what', 'how', 'which', 'when', 'where', 'why', 'who'];

// Returns a list of friendly warnings for a survey question.
// An empty list means the question looks good.
export function checkQuestion(question) {
  const warnings = [];
  const text = question.trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  if (/\bnot\b/.test(lower) || /n't\b/.test(lower)) {
    warnings.push("This question has a 'not' in it — try asking it a more straightforward way.");
  }

  const foundLeadingWord = LEADING_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(lower));
  if (foundLeadingWord) {
    warnings.push(`The word "${foundLeadingWord}" pushes people toward an answer. Try a more neutral word.`);
  }

  const hasTimeframe = TIME_WORDS.some((word) => lower.includes(word)) || /\b\d+\b/.test(lower);
  if (!hasTimeframe) {
    warnings.push("Which time? Add something like 'this week' or 'last night'.");
  }

  const startsYesNo = YES_NO_STARTERS.includes(words[0] || '');
  const hasOpenWord = OPEN_STARTERS.some((word) => words.includes(word));
  if (startsYesNo && !hasOpenWord) {
    warnings.push("This can only be answered yes or no. Try starting with 'What', 'How', or 'Which'.");
  }

  if (!text.endsWith('?')) {
    warnings.push('Questions usually end with a "?".');
  }

  return warnings;
}
