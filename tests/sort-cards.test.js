import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveItem, isSorted, centreIndexes, dropIndex } from '../js/helpers/sort-cards.js';

test('moving a card shifts the others along (and never changes the original list)', () => {
  const list = [9, 3, 20, 5, 7];
  assert.deepEqual(moveItem(list, 2, 4), [9, 3, 5, 7, 20]);
  assert.deepEqual(moveItem(list, 1, 0), [3, 9, 20, 5, 7]);
  assert.deepEqual(moveItem(list, 0, 99), [3, 20, 5, 7, 9]); // past the end: goes last
  assert.deepEqual(list, [9, 3, 20, 5, 7]);
});

test('sorted means smallest to biggest (equal numbers are fine)', () => {
  assert.equal(isSorted([3, 5, 7, 9, 20]), true);
  assert.equal(isSorted([8, 8, 9]), true);
  assert.equal(isSorted([3, 7, 5]), false);
});

test('the centre is one card for an odd count, two for an even count', () => {
  assert.deepEqual(centreIndexes(5), [2]);
  assert.deepEqual(centreIndexes(4), [1, 2]);
});

test('a dropped card lands after every card whose centre it passed', () => {
  const centres = [50, 150, 250, 350]; // the other four cards
  assert.equal(dropIndex(10, centres), 0);
  assert.equal(dropIndex(200, centres), 2);
  assert.equal(dropIndex(999, centres), 4);
});
