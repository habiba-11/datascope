import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mean, median, mode, range, compareValues } from '../js/helpers/stats.js';

test('mean of whole numbers', () => {
  assert.equal(mean([1, 2, 3, 4, 5]), 3);
});

test('mean can be a decimal', () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5);
});

test('median of an odd-length, unsorted list', () => {
  assert.equal(median([5, 1, 3]), 3);
});

test('median of an even-length list averages the two middle values', () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
});

test('median sorts numerically, not alphabetically', () => {
  // A plain .sort() without a comparator would wrongly order these as
  // [1, 10, 100, 5], giving the wrong median.
  assert.equal(median([10, 1, 5, 100]), 7.5);
});

test('mode finds a single typical value', () => {
  assert.deepEqual(mode([1, 2, 2, 3]), [2]);
});

test('mode finds two tied values (bimodal)', () => {
  assert.deepEqual(mode([6, 6, 7, 8, 8]), [6, 8]);
});

test('mode works for category (text) data', () => {
  assert.deepEqual(mode(['red', 'blue', 'red', 'green']), ['red']);
});

test('mode returns no values when every answer is unique', () => {
  assert.deepEqual(mode([1, 2, 3, 4]), []);
});

test('range is the gap between the smallest and largest value', () => {
  assert.equal(range([3, 9, 10, 1]), 9);
});

test('range is pulled wide by one extreme value', () => {
  // Sleep-hours scenario: most classmates cluster at 8-10, one outlier at 3.
  assert.equal(range([8, 9, 9, 10, 3]), 7);
});

test('compareValues sorts numbers by size and text alphabetically', () => {
  assert.deepEqual([10, 3, 9, 7].sort(compareValues), [3, 7, 9, 10]);
  assert.deepEqual(['Tag', 'Football', 'Swings'].sort(compareValues), ['Football', 'Swings', 'Tag']);
});
