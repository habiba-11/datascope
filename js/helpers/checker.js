const LEADING_WORDS = ['good', 'best', 'great', 'bad', 'worst', 'better', 'right', 'wrong', 'amazing', 'awful'];
// A survey question begins with one of these (8 Nov 2026: replaces the list
// of yes/no starters, which a typo could slip past).
const OPEN_STARTERS = ['what', 'how', 'which', 'when', 'where', 'why', 'who'];
// 8 Nov 2026 (Habiba: "how this week?" passed): a whole question has at least
// 5 words and asks the person (you, your, we, our). Fix 2 also stays on its topic.
const MIN_WORDS = 5;
const PERSON_WORDS = ['you', 'your', 'yours', 'we', 'our', 'us'];

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
// `options.topicWords`: words about the scenario's topic (Fix 2 only); a word
// counts if the question has it or a longer form of it ("sleep" in "sleeping").
export function questionProblems(question, { topicWords = null } = {}) {
  const problems = [];
  // Tablets often type a curly apostrophe, and children may type two spaces.
  const text = question.trim().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  const lower = text.toLowerCase();
  const words = lower.split(' ').filter(Boolean);

  if (words.length < MIN_WORDS) {
    problems.push({ id: 'words', tip: `✏️ Write a whole question, with at least ${MIN_WORDS} words.` });
  }

  if (!PERSON_WORDS.some((word) => new RegExp(`\\b${word}\\b`).test(lower))) {
    problems.push({ id: 'person', tip: "🙋 Ask the person. Use 'you' or 'your'." });
  }

  if (topicWords && !topicWords.some((word) => new RegExp(`\\b${word}`).test(lower))) {
    problems.push({ id: 'topic', tip: `🎯 Stay on the topic. Use a word like '${topicWords[0]}'.` });
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

  // 8 Nov 2026 (Habiba: "wdid you read well last night?" passed): the question
  // must BEGIN with a question word, as the checklist says. Before, only a
  // yes/no word at the start was caught, so a typo slipped through, and any
  // question word later on ("Do you know what...") cancelled the warning.
  // A time phrase may come first: "Last night, how many hours...?"
  const clauseStarts = lower.split(',').map((part) => part.trim().split(' ')[0]);
  if (!clauseStarts.some((word) => OPEN_STARTERS.includes(word))) {
    problems.push({ id: 'yesno', tip: '🔁 Not just yes or no. Start with What, How or Which.' });
  }

  if (!text.endsWith('?')) {
    problems.push({ id: 'mark', tip: '❓ End it with a ?' });
  }

  return problems;
}

// Returns a list of friendly warnings for a survey question (the tips).
// An empty list means the question looks good.
export function checkQuestion(question, options) {
  return questionProblems(question, options).map((p) => p.tip);
}

// The checklist the child sees turning green (Round 4, Part 45, Habiba: 4 ticks;
// "not" joins the pushy words). A whole question (3 words) is not a tick: its
// tip still shows first.
// 8 Nov 2026 (Habiba: "more detailed and easier"): each tick has an icon, a
// short title and one line that explains it with examples.
export const CHECKLIST = [
  // 8 Nov 2026: first, does it make sense? Its line says what is missing.
  {
    id: 'sense', icon: '🧠', label: 'It makes sense', rules: ['words', 'person', 'topic'],
    detail: "A whole question of 5 words or more, that asks 'you'.", // shown when it passes
    details: { words: 'Write a whole question, with at least 5 words.', person: "Ask the person: use 'you' or 'your'.", topic: "Stay on the topic, with a word like '{topic}'." },
  },
  { id: 'mark', icon: '❓', label: 'It ends with a question mark (?)', detail: 'Put ? at the very end.', rules: ['mark'] },
  { id: 'when', icon: '⏰', label: 'It says WHEN', detail: "Add a time, like 'last night' or 'this week'.", rules: ['when'] },
  { id: 'open', icon: '💬', label: 'People can say more than yes or no', detail: 'Begin your question with What, Which or How.', rules: ['yesno'] },
  { id: 'fair', icon: '🤝', label: 'It has no pushy words', detail: "Take out pushy words, like 'best' or 'isn't'.", rules: ['not', 'pushy'] },
];

// Each tick: { id, icon, label, detail, ok }. A check with several rules
// (makes sense) explains the first one still broken.
export function questionChecklist(question, options = {}) {
  const broken = questionProblems(question, options).map((p) => p.id);
  return CHECKLIST.map(({ id, icon, label, detail, details, rules }) => {
    const firstBroken = rules.find((r) => broken.includes(r));
    const words = details && firstBroken ? details[firstBroken] : detail;
    const topic = (options.topicWords || [''])[0];
    return { id, icon, label, detail: words.replace('{topic}', topic), ok: !firstBroken };
  });
}

// The check to fix next (8 Nov 2026: the checklist marks it "👉 Fix this
// next"): the check of the first rule still broken, in the same order as the
// tips. null when the question passes, or when the first problem has no check
// (too few words: its tip is shown instead).
export function nextCheck(question, options) {
  const first = questionProblems(question, options)[0];
  if (!first) return null;
  const item = CHECKLIST.find((c) => c.rules.includes(first.id));
  return item ? item.id : null;
}

// ONE tip at a time (the first rule still broken), or null when it is a good question.
export function firstTip(question, options) {
  const problems = questionProblems(question, options);
  return problems.length ? problems[0].tip : null;
}
