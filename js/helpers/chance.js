// Layer 3: Chance Lab's numbers and messages (Part 17c). Pure, tested in Node
// (tests/chance.test.js). Moved here from js/rooms/chance-lab.js.

// Percentages with one decimal place (16.7, 30, 57.1).
export function toPct(part, whole) {
  return Math.round((part / whole) * 1000) / 10;
}

// Theory as "1 in 6 (about 16.7%)", so six rounded numbers never look like 102%.
export function theoryText(weight, totalWeight) {
  return `${weight} in ${totalWeight} (about ${toPct(weight, totalWeight)}%)`;
}

// Honest feedback in Grade 5 words: it says what this test really showed.
// "Closer" is only claimed if this bigger test really is closer to the theory
// than the last one. `verb` is the device's own word: flips, rolls, spins.
export function trialMessage({ count, verb, target, timesHit, pct, theory, previous, gap }) {
  const times = timesHit === 1 ? 'time' : 'times';
  let message = `${count} ${verb}: ${target} came up ${timesHit} ${times} (${pct}%). It should be ${theory}.`;

  if (previous && count > previous.count) {
    message += gap < previous.gap
      ? ` 🎯 That's closer than your ${previous.count} ${verb} (${previous.pct}%).`
      : ` 😮 This time it was NOT closer than ${previous.count} ${verb}. Chance can surprise us! Big tests are usually closer.`;
  } else if (count < 500) {
    message += ' Try a bigger test. Will it get closer?';
  } else {
    message += ' Try 500 again. Does it stay close?';
  }
  return message;
}

// Where a spinner's needle should stop so it points into the slice of
// `outcomeIndex` (Part 21c). Slices go clockwise from the top, sized by weight,
// like the conic-gradient picture. `fraction` (0 to 1) picks a spot inside the
// slice, kept away from the edges so the needle never sits on a border line.
// Returns degrees, plus `turns` full turns so it really spins first.
export function needleAngle(weights, outcomeIndex, fraction, turns = 3) {
  const total = weights.reduce((a, b) => a + b, 0);
  const start = weights.slice(0, outcomeIndex).reduce((a, b) => a + b, 0);
  const size = weights[outcomeIndex];
  const inside = 0.15 + 0.7 * fraction; // between 15% and 85% of the slice
  return turns * 360 + ((start + inside * size) / total) * 360;
}
