import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toPct, theoryText, theoryWords, shownTheory, outcomeRows, trialMessage, needleAngle,
} from '../js/helpers/chance.js';
import { longestSentence } from '../js/helpers/readability.js';

test('percentages have one decimal place', () => {
  assert.equal(toPct(1, 6), 16.7);
  assert.equal(toPct(4, 7), 57.1);
  assert.equal(toPct(3, 10), 30);
});

test('theory reads "1 in 6 (about 16.7%)"', () => {
  assert.equal(theoryText(1, 6), '1 in 6 (about 16.7%)');
});

test('a child sees theory with no brackets; older log entries are shown the same way', () => {
  assert.equal(theoryWords(1, 6), '1 in 6, about 16.7%');
  assert.equal(shownTheory('1 in 6 (about 16.7%)'), '1 in 6, about 16.7%');
  assert.equal(shownTheory(theoryWords(4, 7)), '4 in 7, about 57.1%');
});

test('each outcome has one row: should and did, and every number says what it is', () => {
  const results = new Map([['Red', 30], ['Blue', 20]]);
  assert.deepEqual(outcomeRows(['Red', 'Blue'], [4, 1], results, 50), [
    { name: 'Red', shouldPct: 80, shouldText: '4 in 5, about 80%', didPct: 60, didText: '30 of 50, 60%' },
    { name: 'Blue', shouldPct: 20, shouldText: '1 in 5, about 20%', didPct: 40, didText: '20 of 50, 40%' },
  ]);
});

test('what a child sees in Chance Lab has no brackets', () => {
  const rows = outcomeRows(['Heads', 'Tails'], [1, 1], new Map([['Heads', 6], ['Tails', 4]]), 10);
  const previous = { count: 10, pct: 60, gap: 0.1 };
  const texts = [
    ...rows.flatMap((row) => [row.shouldText, row.didText]),
    trialMessage({ ...base, count: 10, timesHit: 3, pct: 30, previous: null, gap: 0.27 }),
    trialMessage({ ...base, count: 500, timesHit: 290, pct: 58, previous, gap: 0.01 }),
    trialMessage({ ...base, count: 500, timesHit: 200, pct: 40, previous, gap: 0.3 }),
  ];
  for (const text of texts) assert.doesNotMatch(text, /[()]/, text);
});

const base = { verb: 'spins', target: 'Red', theory: '4 in 7, about 57.1%' };

test('a first small test suggests a bigger one', () => {
  const message = trialMessage({ ...base, count: 10, timesHit: 1, pct: 10, previous: null, gap: 0.47 });
  assert.match(message, /^10 spins: Red came up 1 time\. That is 10%\./);
  assert.match(message, /Try a bigger test/);
});

test('"closer" is only said when it is true', () => {
  const previous = { count: 10, pct: 30, gap: 0.27 };
  assert.match(trialMessage({ ...base, count: 500, timesHit: 290, pct: 58, previous, gap: 0.01 }), /closer than your 10 spins/);
  assert.match(trialMessage({ ...base, count: 500, timesHit: 200, pct: 40, previous, gap: 0.3 }), /NOT closer/);
});

test('every message follows the Grade 5 rule (12 words or fewer per sentence)', () => {
  const previous = { count: 10, pct: 30, gap: 0.27 };
  const messages = [
    trialMessage({ ...base, count: 10, timesHit: 3, pct: 30, previous: null, gap: 0.27 }),
    trialMessage({ ...base, count: 500, timesHit: 290, pct: 58, previous, gap: 0.01 }),
    trialMessage({ ...base, count: 500, timesHit: 200, pct: 40, previous, gap: 0.3 }),
    trialMessage({ ...base, count: 500, timesHit: 290, pct: 58, previous: null, gap: 0.01 }),
  ];
  for (const message of messages) assert.ok(longestSentence(message) <= 12, message);
});

test('the spinner needle always lands inside the slice of the real result', () => {
  const weights = [4, 1, 1, 1]; // the unfair spinner: Red, Blue, Green, Yellow
  for (const fraction of [0, 0.5, 1]) {
    const red = needleAngle(weights, 0, fraction, 0);
    assert.ok(red > 0 && red < (4 / 7) * 360, `Red at ${red}`);
    const yellow = needleAngle(weights, 3, fraction, 0);
    assert.ok(yellow > (6 / 7) * 360 && yellow < 360, `Yellow at ${yellow}`);
  }
  assert.equal(needleAngle([1, 1], 0, 0.5, 3), 3 * 360 + 90); // centre of the first half, after 3 turns
});
