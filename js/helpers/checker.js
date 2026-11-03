const LEADING_WORDS = ['good', 'best', 'great', 'bad', 'worst', 'better', 'right', 'wrong', 'amazing', 'awful'];
const YES_NO_STARTERS = [
  'do', 'does', 'did', 'is', 'are', 'am', 'was', 'were', 'can', 'could', 'will', 'would',
  'has', 'have', 'had', 'should', 'may', 'might', 'must', 'shall',
  "isn't", "aren't", "wasn't", "weren't", "don't", "doesn't", "didn't",
  "can't", "couldn't", "won't", "wouldn't", "shouldn't", "hasn't", "haven't",
];
const OPEN_STARTERS = ['what', 'how', 'which', 'when', 'where', 'why', 'who'];
const MIN_WORDS = 3;

// The pieces of a time phrase. A vague word like "lately" or "these days" is
// left out on purpose: a survey needs a set timeframe (Paper 28).
const UNITS = 'days?|nights?|mornings?|afternoons?|evenings?|weeks?|weekends?|months?|terms?|semesters?|years?|holidays?|vacations?';
const SEASONS = 'spring|summer|autumn|fall|winter';
const WEEK_DAYS = 'mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?';
const MONTHS = 'january|february|march|april|may|june|july|august|september|october|november|december';
const COUNTS = '\\d+|one|two|three|four|five|six|seven|eight|nine|ten|few|couple of';

// A question has a timeframe if ANY of these patterns is in it.
const TIME_PATTERNS = [
  // Single words and fixed phrases: "today", "right now", "after school"
  /\b(today|yesterday|tonight|tomorrow|daily|weekly|monthly|yearly|ago)\b/,
  /\b(right now|at the moment|after school|before school)\b/,
  /\b(at|during) (recess|lunch|lunchtime|break)\b/,
  /\bat night\b/,
  /\bin the (morning|afternoon|evening)\b/,
  /\b(on|at|over|during) (the )?(weekends?|holidays?|week)\b/,
  // "this week", "last school year", "every night", "in the past month"
  new RegExp(`\\b(this|last|next|past|every|each) (school )?(${UNITS}|${SEASONS})\\b`),
  // "a week", "per day" (how often)
  /\b(a|an|per) (day|night|week|month|year)\b/,
  // "on Monday", "last Friday", "every Saturday"
  new RegExp(`\\b(on|this|last|next|every|each) (${WEEK_DAYS})\\b`),
  // "in March", "this May", "during summer" ("may" alone is not a time)
  new RegExp(`\\b(in|during|this|last|next|every) (the )?(${MONTHS}|${SEASONS})\\b`),
  // "in 2026"
  /\b(in|during|since) (19|20)\d\d\b/,
  // "5 days", "two weeks". A number alone is not a time ("Which 3 games?").
  new RegExp(`\\b(${COUNTS}) (${UNITS})\\b`),
];

// True if the question says WHEN. `lower` is the tidied, lower-case question.
export function hasTimeframe(lower) {
  return TIME_PATTERNS.some((pattern) => pattern.test(lower));
}

// Returns a list of friendly warnings for a survey question.
// An empty list means the question looks good.
export function checkQuestion(question) {
  const warnings = [];
  // Tablets often type a curly apostrophe, and children may type two spaces.
  const text = question.trim().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  const lower = text.toLowerCase();
  const words = lower.split(' ').filter(Boolean);

  if (words.length < MIN_WORDS) {
    warnings.push(`✏️ Write a whole question, with at least ${MIN_WORDS} words.`);
  }

  if (/\bnot\b/.test(lower) || /n't\b/.test(lower)) {
    warnings.push("🚫 It has a 'not' in it. Ask it without 'not'.");
  }

  // "right now" is a time, so its "right" does not push people to an answer.
  const withoutRightNow = lower.replace(/\bright now\b/g, '');
  const foundLeadingWord = LEADING_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(withoutRightNow));
  if (foundLeadingWord) {
    warnings.push(`👉 The word "${foundLeadingWord}" pushes people to one answer. Use a fairer word.`);
  }

  if (!hasTimeframe(lower)) {
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
