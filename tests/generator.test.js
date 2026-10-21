import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mean, median, mode, range, formatMean } from '../js/helpers/stats.js';
import { generateClassData } from '../js/helpers/generator.js';

import sleepHours from '../data/scenarios/sleep-hours.json' with { type: 'json' };
import shoeSizes from '../data/scenarios/shoe-sizes.json' with { type: 'json' };
import playgroundGame from '../data/scenarios/playground-game.json' with { type: 'json' };
import readingMinutesA from '../data/scenarios/reading-minutes-class-a.json' with { type: 'json' };
import readingMinutesB from '../data/scenarios/reading-minutes-class-b.json' with { type: 'json' };

test('generated class size matches the recipe', () => {
  const result = generateClassData(sleepHours);
  assert.equal(result.values.length, sleepHours.classSize);
});

test('the same recipe always finds the same seed (reproducible)', () => {
  const first = generateClassData(sleepHours);
  const second = generateClassData(sleepHours);
  assert.equal(first.seed, second.seed);
  assert.deepEqual(first.values, second.values);
});

test('the self-check actually retries: the first seed is not always the answer', () => {
  // Proof the "try the next seed" loop runs, not just a lucky first guess.
  const result = generateClassData(sleepHours);
  assert.ok(result.seed > 1, `expected a retried seed, got seed ${result.seed}`);
});

test('sleep-hours: the extreme value appears exactly once, mean and median match', () => {
  const { values } = generateClassData(sleepHours);
  const extremeCount = values.filter((v) => v === 3).length;
  assert.equal(extremeCount, 1);
  assert.equal(Math.round(mean(values) * 10) / 10, sleepHours.target.mean);
  assert.equal(median(values), sleepHours.target.median);
});

test('shoe-sizes: has exactly two tied modes, no accidental extra tie', () => {
  const { values } = generateClassData(shoeSizes);
  assert.deepEqual([...mode(values)].sort(), shoeSizes.target.mode);
});

test('playground-game: has one clear winner, not an accidental tie', () => {
  const { values } = generateClassData(playgroundGame);
  assert.deepEqual(mode(values), playgroundGame.target.mode);
});

test('reading minutes: Class A and B share a mean but differ in spread', () => {
  const classA = generateClassData(readingMinutesA);
  const classB = generateClassData(readingMinutesB);

  assert.equal(mean(classA.values), mean(classB.values));
  assert.equal(median(classA.values), median(classB.values));
  assert.ok(
    range(classB.values) > range(classA.values),
    'Class B should look more spread out than Class A, even with the same mean'
  );
});

test('reading minutes: Class A is paired with Class B, which asks the same question', () => {
  // Data Hub, Graph Lab and Evidence Board show both classes because of this link.
  assert.equal(readingMinutesA.compareWith, readingMinutesB.id);
  assert.equal(readingMinutesA.question, readingMinutesB.question);
  assert.equal(readingMinutesA.target.mean, readingMinutesB.target.mean);
});

// The mean a child sees (formatMean) must equal the recipe's target mean.
test('formatMean: sleep-hours shows 8.4 (not 8.3)', () => {
  assert.equal(formatMean(mean(generateClassData(sleepHours).values)), 8.4);
});

test('formatMean: shoe-sizes shows 35.3', () => {
  assert.equal(formatMean(mean(generateClassData(shoeSizes).values)), 35.3);
});

test('formatMean: reading-minutes shows 20', () => {
  assert.equal(formatMean(mean(generateClassData(readingMinutesA).values)), 20);
});
