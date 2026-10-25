import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPhaseFeedback, countWords, FEEDBACK_PHASES } from '../js/helpers/feedback.js';
import { PHASES } from '../js/helpers/progress.js';
import { makeEntry } from '../js/helpers/log.js';

test('every phase has feedback rules', () => {
  assert.deepEqual([...FEEDBACK_PHASES].sort(), [...PHASES].sort());
});

test('countWords counts words, not spaces', () => {
  assert.equal(countWords('  it does   not tell why '), 5);
  assert.equal(countWords(''), 0);
});

test('Ask: writing your own clear question earns the third star', () => {
  const low = buildPhaseFeedback('ask', { scenarioTitle: 'Shoe sizes', ownQuestionClear: false });
  const high = buildPhaseFeedback('ask', { scenarioTitle: 'Shoe sizes', ownQuestionClear: true });
  assert.equal(low.stars, 2);
  assert.equal(high.stars, 3);
  assert.match(low.wins[0], /Shoe sizes/);
});

test('Plan: the guess itself is mentioned', () => {
  const card = buildPhaseFeedback('plan', { guessText: '9' });
  assert.equal(card.stars, 3);
  assert.match(card.wins[0], /9/);
});

test('Collect: a guess to compare with earns a star; the guess and the data are both named', () => {
  const noGuess = buildPhaseFeedback('collect', { classSizes: [20], mostCommon: '9', guess: null });
  const withGuess = buildPhaseFeedback('collect', { classSizes: [20], mostCommon: '9', guess: 8 });
  assert.equal(noGuess.stars, 2);
  assert.equal(withGuess.stars, 3);
  assert.equal(withGuess.wins[1], 'Most common answer: 9. Your guess: 8.');
  const twoClasses = buildPhaseFeedback('collect', { classSizes: [18, 18], mostCommon: null, guess: 20 });
  assert.match(twoClasses.wins[0], /both classes: 18 \+ 18/);
});

test('Graph Lab: low, medium and high stars', () => {
  assert.equal(buildPhaseFeedback('graph', { typesTried: 1, notTellWords: 2 }).stars, 1);
  assert.equal(buildPhaseFeedback('graph', { typesTried: 3, notTellWords: 2 }).stars, 2);
  assert.equal(buildPhaseFeedback('graph', { typesTried: 2, notTellWords: 7 }).stars, 3);
  assert.match(buildPhaseFeedback('graph', { typesTried: 1, notTellWords: 9 }).nextTime, /another graph/);
});

test('Number Lab: a close guess OR a changed mind earns the third star; wrong tries never cost one', () => {
  assert.equal(buildPhaseFeedback('number', { guess: 6, mean: 8.4, changedWithReason: false }).stars, 2);
  assert.equal(buildPhaseFeedback('number', { guess: 8, mean: 8.4, changedWithReason: false }).stars, 3);
  assert.equal(buildPhaseFeedback('number', { guess: 6, mean: 8.4, changedWithReason: true }).stars, 3);
  const card = buildPhaseFeedback('number', { guess: 6, mean: 8.4, teaches: 'One extreme value drags the mean.' });
  assert.match(card.wins[0], /6.*8.4/);
  assert.equal(card.learned, 'One extreme value drags the mean.');
});

test('Chance Lab: more trial sizes and a big run earn stars', () => {
  const base = { rating: 'Likely', target: 'Red', theoryText: '4 in 7 (about 57.1%)', pct500: null };
  assert.equal(buildPhaseFeedback('chance', { ...base, runSizes: [10] }).stars, 1);
  assert.equal(buildPhaseFeedback('chance', { ...base, runSizes: [10, 50, 10] }).stars, 2);
  const high = buildPhaseFeedback('chance', { ...base, runSizes: [10, 500], pct500: 56.2 });
  assert.equal(high.stars, 3);
  assert.match(high.wins[2], /56.2%.*57.1%/);
});

test('Conclude: two numbers as proof and a real reason earn stars', () => {
  const base = { audience: 'the principal' };
  assert.equal(buildPhaseFeedback('conclude', { ...base, evidenceCount: 1, certaintyReasonWords: 2 }).stars, 1);
  assert.equal(buildPhaseFeedback('conclude', { ...base, evidenceCount: 2, certaintyReasonWords: 2 }).stars, 2);
  const high = buildPhaseFeedback('conclude', { ...base, evidenceCount: 3, certaintyReasonWords: 8 });
  assert.equal(high.stars, 3);
  assert.match(high.nextTime, /the principal/);
});

test('a card never has more than 3 wins, and always 1 to 3 stars and a nudge', () => {
  for (const phase of PHASES) {
    const card = buildPhaseFeedback(phase, {
      scenarioTitle: 'x', guessText: '1', classSizes: [5], guess: 1, mean: 1, typesTried: 1, notTellWords: 0,
      rating: 'Likely', target: 'Red', runSizes: [10], evidenceCount: 1, certaintyReasonWords: 0, audience: 'the class',
    });
    assert.ok(card.wins.length >= 1 && card.wins.length <= 3, phase);
    assert.ok(card.stars >= 1 && card.stars <= 3, phase);
    assert.ok(card.nextTime && card.learned, phase);
  }
});

test('phase-feedback is a known log event', () => {
  assert.equal(makeEntry('OWL-07', 'shell', 'phase-feedback', { phase: 'ask', stars: 2 }).stars, 2);
});

test('Number Lab with words (games): a guess that matches the mode earns the third star', () => {
  const right = buildPhaseFeedback('number', { guess: 'Football', mode: ['Football'], changedWithReason: false });
  const wrong = buildPhaseFeedback('number', { guess: 'Tag', mode: ['Football'], changedWithReason: false });
  assert.equal(right.stars, 3);
  assert.match(right.wins[0], /That is the mode/);
  assert.equal(wrong.stars, 2);
  assert.match(wrong.wins[0], /The mode was Football/);
});
