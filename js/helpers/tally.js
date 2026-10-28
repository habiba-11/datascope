// Layer 3: what the Data Hub seats and tally show (pure, tested in tests/tally.test.js).
// Each answer gets one colour, the same on its seat and on its tally bar, so
// a child sees "one answer -> one bar step" (UI guide, Collect motion).
import { compareValues } from './stats.js';

export const TALLY_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

// Every possible answer, once, in order (numbers small to big, words A to Z).
export function tallyKeys(recipe) {
  return [...new Set([...recipe.valuePool, ...(recipe.mustInclude || [])])].sort(compareValues);
}

// The room colour name for each answer (they repeat after 5; the seat and
// the bar label always show the answer too, so colour is never the only signal).
export function colourFor(keys, key) {
  return TALLY_COLOURS[keys.indexOf(key) % TALLY_COLOURS.length];
}

// What fits on a small round seat: a number as it is; a word as its first
// letter, or more letters when two words start the same way.
export function seatLabels(keys) {
  const labels = new Map();
  for (const key of keys) {
    if (typeof key === 'number') {
      labels.set(key, String(key));
      continue;
    }
    let size = 1;
    const clash = (n) => keys.some((other) => other !== key && typeof other === 'string'
      && other.slice(0, n).toLowerCase() === key.slice(0, n).toLowerCase());
    while (size < key.length && clash(size)) size += 1;
    labels.set(key, key.slice(0, size));
  }
  return labels;
}

// How many classmates gave each answer so far (every answer starts at 0).
export function countAnswers(keys, answers) {
  const counts = new Map(keys.map((key) => [key, 0]));
  for (const value of answers) counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}
