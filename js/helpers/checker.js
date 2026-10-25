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
    warnings.push("🚫 It has a 'not' in it. Ask it without 'not'.");
  }

  const foundLeadingWord = LEADING_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(lower));
  if (foundLeadingWord) {
    warnings.push(`👉 The word "${foundLeadingWord}" pushes people to one answer. Use a fairer word.`);
  }

  const hasTimeframe = TIME_WORDS.some((word) => lower.includes(word)) || /\b\d+\b/.test(lower);
  if (!hasTimeframe) {
    warnings.push("⏰ When? Add a time, like 'this week' or 'last night'.");
  }

  const startsYesNo = YES_NO_STARTERS.includes(words[0] || '');
  const hasOpenWord = OPEN_STARTERS.some((word) => words.includes(word));
  if (startsYesNo && !hasOpenWord) {
    warnings.push("🔁 People can only say yes or no. Start with What, How or Which.");
  }

  if (!text.endsWith('?')) {
    warnings.push('❓ Put a ? at the end.');
  }

  return warnings;
}
