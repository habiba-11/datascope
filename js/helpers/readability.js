// Layer 3: checks that child-facing text is easy to read (Part 17, Grade 5 rule:
// sentences of 12 words or fewer). Used by tests/content.test.js.

export const MAX_SENTENCE_WORDS = 12;

// Splits text into sentences at . ! or ? (followed by a space or the end).
export function sentences(text) {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

// A word has at least one letter or digit, so emoji and dashes don't count.
export function wordCount(sentence) {
  return sentence.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

// The number of words in the longest sentence.
export function longestSentence(text) {
  return Math.max(0, ...sentences(text).map(wordCount));
}

// Every string inside a JSON value (objects and lists are searched too).
export function allStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}
