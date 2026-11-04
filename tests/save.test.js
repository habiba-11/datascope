import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSoundOn, setSoundOn } from '../js/storage/save.js';

// In Node there is no localStorage: save.js keeps its in-memory copy, like a
// browser that blocks storage. That is enough to test the rule.
test('sound is ON by default, and the child can turn it off and on again', () => {
  assert.equal(getSoundOn(), true); // nothing saved yet: a new child or device
  setSoundOn(false);
  assert.equal(getSoundOn(), false);
  setSoundOn(true);
  assert.equal(getSoundOn(), true);
});
