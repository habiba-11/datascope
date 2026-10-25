import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPct, theoryText, trialMessage, needleAngle } from '../js/helpers/chance.js';
import { longestSentence } from '../js/helpers/readability.js';

test('percentages have one decimal place', () => {
  assert.equal(toPct(1, 6), 16.7);
  assert.equal(toPct(4, 7), 57.1);
  assert.equal(toPct(3, 10), 30);
});

test('theory reads "1 in 6 (about 16.7%)"', () => {
  assert.equal(theoryText(1, 6), '1 in 6 (about 16.7%)');
});

const base = { verb: 'spins', target: 'Red', theory: '4 in 7 (about 57.1%)' };

test('a first small test suggests a bigger one', () => {
  const message = trialMessage({ ...base, count: 10, timesHit: 1, pct: 10, previous: null, gap: 0.47 });
  assert.match(message, /^10 spins: Red came up 1 time \(10%\)\./);
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
