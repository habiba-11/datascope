// Layer 3: the rules behind Number Lab's tasks (Part 17b). Pure, so they can
// be tested in Node (tests/number-tasks.test.js). Every answer is worked out
// here with stats.js, never written into the content files.
import { mean, median, mode, range, compareValues, formatMean } from './stats.js';

// What kind of Number Lab a scenario gets:
//   'number'   - numbers (sleep, shoes): mean, median, mode, range
//   'category' - words (games): the mode is the only "typical value" (Paper 7)
//   'compare'  - two classes (reading minutes): same mean, different spread
export function numberLabKind(recipe) {
  if (recipe.compareWith) return 'compare';
  return recipe.answerType === 'category' ? 'category' : 'number';
}

// The tasks, in order, for each kind.
export const TASKS_BY_KIND = {
  number: ['predict', 'build', 'mistake', 'realLife'],
  category: ['predict', 'whyNoMean', 'realLife'],
  compare: ['predict', 'build', 'mistake', 'compareRange'],
};

// Fills {name} gaps in a content sentence, e.g. "Their mean is {target}."
export function fillTemplate(text, values) {
  return text.replace(/\{(\w+)\}/g, (gap, name) => (name in values ? String(values[name]) : gap));
}

// "Build it": the mean to aim for is the class's own mean, rounded to a whole number.
export function buildTarget(values) {
  return Math.round(mean(values));
}

// "Find the mistake": Mia picks the middle number WITHOUT putting them in order.
export function miaSays(numbers) {
  return numbers[Math.floor(numbers.length / 2)];
}

// The different values in a list, in order: the answer buttons for a question.
export function choicesFor(values) {
  return [...new Set(values)].sort(compareValues);
}

// The mean is "pulled" by an extreme value only if it is at least this far
// from the median (sleep: 8.4 vs 9 yes; shoes: 35.3 vs 35 no, no extreme there).
const PULL_GAP = 0.5;

// What Pip says after Reveal, in Grade 5 words. `guess` is what the child typed
// (or picked); `stats` holds the class's numbers.
export function revealMessage(kind, guess, stats) {
  if (kind === 'category') {
    const top = stats.mode.join(' and ');
    return stats.mode.includes(guess)
      ? `🎯 Yes! Most kids picked ${top}. That is the mode.`
      : `Most kids picked ${top}, not ${guess}. That is the mode.`;
  }

  const shownMean = formatMean(stats.mean);
  let message = Math.abs(guess - shownMean) <= 1
    ? `🎯 Nice guess! You said ${guess}. The mean is ${shownMean}.`
    : `You said ${guess}. The mean is ${shownMean}.`;

  if (kind === 'compare') {
    if (formatMean(stats.meanB) === shownMean && stats.rangeB !== stats.range) {
      message += ' 👀 Both classes have this mean. But look at the range!';
    }
    return message;
  }
  if (shownMean <= stats.median - PULL_GAP) message += ' 👀 The mean is lower than the median. A very small answer pulls it down.';
  else if (shownMean >= stats.median + PULL_GAP) message += ' 👀 The mean is higher than the median. A very big answer pulls it up.';
  if (stats.mode.length > 1) message += ` 👀 Look: there are ${stats.mode.length} modes!`;
  return message;
}

// The class's numbers for the reveal (for words: the mode only).
export function classStats(kind, values, valuesB = null) {
  if (kind === 'category') return { mode: mode(values) };
  const stats = { mean: mean(values), median: median(values), mode: mode(values), range: range(values) };
  if (valuesB) {
    stats.meanB = mean(valuesB);
    stats.medianB = median(valuesB);
    stats.modeB = mode(valuesB);
    stats.rangeB = range(valuesB);
  }
  return stats;
}
