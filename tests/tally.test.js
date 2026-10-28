import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tallyKeys, colourFor, seatLabels, countAnswers } from '../js/helpers/tally.js';
import sleep from '../data/scenarios/sleep-hours.json' with { type: 'json' };
import games from '../data/scenarios/playground-game.json' with { type: 'json' };

test('every possible answer appears once, in order, including the extreme value', () => {
  assert.deepEqual(tallyKeys(sleep), [3, 7, 8, 9, 10]);
  assert.deepEqual(tallyKeys(games), ['Basketball', 'Football', 'Hopscotch', 'Swings', 'Tag']);
});

test('a seat and its bar share one colour; colours repeat only after 5 answers', () => {
  const keys = [5, 10, 15, 20, 25, 30, 35];
  assert.equal(colourFor(keys, 5), 'ask');
  assert.equal(colourFor(keys, 25), 'conclude');
  assert.equal(colourFor(keys, 30), 'ask');
});

test('seat labels: numbers as they are, words by their first letter unless two words clash', () => {
  const games = seatLabels(['Basketball', 'Football', 'Hopscotch', 'Swings', 'Tag']);
  assert.deepEqual([...games.values()], ['B', 'F', 'H', 'S', 'T']);
  const clash = seatLabels(['Swings', 'Skipping', 'Tag']);
  assert.deepEqual([...clash.values()], ['Sw', 'Sk', 'T']);
  assert.equal(seatLabels([34, 35]).get(34), '34');
});

test('the tally counts each answer, and answers nobody gave stay at 0', () => {
  const counts = countAnswers([3, 7, 8], [7, 7, 3]);
  assert.deepEqual([...counts.entries()], [[3, 1], [7, 2], [8, 0]]);
});
