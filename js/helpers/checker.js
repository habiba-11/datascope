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

// Every rule the question breaks, in this order, each with its tip in plain
// Grade 5 words (Round 4, Part 45: the same words as the checklist).
// Each: { id, tip }. An empty list means the question looks good.
export function questionProblems(question) {
  const problems = [];
  // Tablets often type a curly apostrophe, and children may type two spaces.
  const text = question.trim().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  const lower = text.toLowerCase();
  const words = lower.split(' ').filter(Boolean);

  if (words.length < MIN_WORDS) {
    problems.push({ id: 'words', tip: `✏️ Write a whole question, with at least ${MIN_WORDS} words.` });
  }

  if (/\bnot\b/.test(lower) || /n't\b/.test(lower)) {
    problems.push({ id: 'not', tip: "🚫 Take out 'not' (like isn't or don't). It pushes people." });
  }

  // "right now" is a time, so its "right" does not push people to an answer.
  const withoutRightNow = lower.replace(/\bright now\b/g, '');
  const foundLeadingWord = LEADING_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(withoutRightNow));
  if (foundLeadingWord) {
    problems.push({ id: 'pushy', tip: `👉 Take out "${foundLeadingWord}". It pushes people to one answer.` });
  }

  if (!hasTimeframe(lower)) {
    problems.push({ id: 'when', tip: "⏰ When? Say a time, like 'this week' or 'last night'." });
  }

  const startsYesNo = YES_NO_STARTERS.includes(words[0] || '');
  const hasOpenWord = OPEN_STARTERS.some((word) => words.includes(word));
  if (startsYesNo && !hasOpenWord) {
    problems.push({ id: 'yesno', tip: '🔁 Not just yes or no. Start with What, How or Which.' });
  }

  if (!text.endsWith('?')) {
    problems.push({ id: 'mark', tip: '❓ End it with a ?' });
  }

  return problems;
}

// Returns a list of friendly warnings for a survey question (the tips).
// An empty list means the question looks good.
export function checkQuestion(question) {
  return questionProblems(question).map((p) => p.tip);
}

// The checklist the child sees turning green (Round 4, Part 45, Habiba: 4 ticks;
// "not" joins the pushy words). A whole question (3 words) is not a tick: its
// tip still shows first.
// 8 Nov 2026 (Habiba: "more detailed and easier"): each tick has an icon, a
// short title and one line that explains it with examples.
export const CHECKLIST = [
  { id: 'mark', icon: '❓', label: 'It ends with a question mark (?)', detail: 'Put ? at the very end.', rules: ['mark'] },
  { id: 'when', icon: '⏰', label: 'It says WHEN', detail: "Add a time, like 'last night' or 'this week'.", rules: ['when'] },
  { id: 'open', icon: '💬', label: 'People can say more than yes or no', detail: 'Begin your question with What, Which or How.', rules: ['yesno'] },
  { id: 'fair', icon: '🤝', label: 'It has no pushy words', detail: "Take out pushy words, like 'best' or 'isn't'.", rules: ['not', 'pushy'] },
];

// Each tick: { id, icon, label, detail, ok }.
export function questionChecklist(question) {
  const broken = questionProblems(question).map((p) => p.id);
  return CHECKLIST.map(({ id, icon, label, detail, rules }) => ({ id, icon, label, detail, ok: !rules.some((r) => broken.includes(r)) }));
}

// The check to fix next (8 Nov 2026: the checklist marks it "👉 Fix this
// next"): the check of the first rule still broken, in the same order as the
// tips. null when the question passes, or when the first problem has no check
// (too few words: its tip is shown instead).
export function nextCheck(question) {
  const first = questionProblems(question)[0];
  if (!first) return null;
  const item = CHECKLIST.find((c) => c.rules.includes(first.id));
  return item ? item.id : null;
}

// ONE tip at a time (the first rule still broken), or null when it is a good question.
export function firstTip(question) {
  const problems = questionProblems(question);
  return problems.length ? problems[0].tip : null;
}
