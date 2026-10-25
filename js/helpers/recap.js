// Layer 3: the worked examples in the maths recap (Part 18). Pure, tested in
// Node (tests/recap.test.js). Every number is computed with stats.js, so the
// recap can never show a wrong step.
import { mean, median, mode, range, formatMean, compareValues } from './stats.js';

// Which recap cards a scenario gets. Words (games) only get the mode.
export function recapCardIds(kind) {
  return kind === 'category' ? ['mode'] : ['mean', 'median', 'mode', 'range'];
}

// One line per step, matching the 3 steps on each card.
export function exampleLines(id, numbers) {
  const sorted = [...numbers].sort(compareValues);
  switch (id) {
    case 'mean': {
      const total = numbers.reduce((sum, n) => sum + n, 0);
      const answer = formatMean(mean(numbers));
      return [
        `${numbers.join(' + ')} = ${total}`,
        `There are ${numbers.length} numbers.`,
        `${total} ÷ ${numbers.length} = ${answer}. The mean is ${answer}.`,
      ];
    }
    case 'median': {
      const centre = Math.floor(sorted.length / 2);
      const answer = median(numbers);
      const odd = sorted.length % 2 === 1;
      return [
        `In order: ${sorted.join(', ')}`,
        odd ? `The centre one is ${sorted[centre]}.` : `The centre two are ${sorted[centre - 1]} and ${sorted[centre]}.`,
        odd ? `Just one in the centre. The median is ${answer}.` : `Halfway between them is ${answer}. The median is ${answer}.`,
      ];
    }
    case 'mode': {
      const counted = [...new Set(sorted)].map((v) => `${v}: ${numbers.filter((n) => n === v).length}×`);
      const answer = mode(numbers).join(' and ');
      return [counted.join(', '), `${answer} comes up the most.`, `The mode is ${answer}.`];
    }
    case 'range': {
      const answer = range(numbers);
      const biggest = sorted[sorted.length - 1];
      return [`Biggest: ${biggest}`, `Smallest: ${sorted[0]}`, `${biggest} − ${sorted[0]} = ${answer}. The range is ${answer}.`];
    }
    default:
      throw new Error(`No recap card "${id}"`);
  }
}

// The answer a card's example shows (used by the test that the recap never
// gives away a scenario's real numbers).
export function exampleAnswer(id, numbers) {
  if (id === 'mean') return formatMean(mean(numbers));
  if (id === 'median') return median(numbers);
  if (id === 'mode') return mode(numbers)[0];
  return range(numbers);
}
