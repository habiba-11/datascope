import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIndex } from '../js/helpers/choice-keys.js';

test('arrow keys move to the next or previous card, wrapping round', () => {
  assert.equal(nextIndex('ArrowRight', 0, 4), 1);
  assert.equal(nextIndex('ArrowDown', 3, 4), 0);
  assert.equal(nextIndex('ArrowLeft', 0, 4), 3);
  assert.equal(nextIndex('ArrowUp', 2, 4), 1);
});

test('Home and End jump to the first and last card; other keys do nothing', () => {
  assert.equal(nextIndex('Home', 2, 4), 0);
  assert.equal(nextIndex('End', 0, 4), 3);
  assert.equal(nextIndex('a', 1, 4), null);
});
