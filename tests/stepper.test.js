import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepStates } from '../js/helpers/stepper.js';
import { hasMoreSteps } from '../js/helpers/progress.js';

test('the mini stepper marks steps before the current one done, then now, then next', () => {
  const steps = stepStates(['Guess', 'Sort', 'Find the centre'], 1);
  assert.deepEqual(steps.map((s) => s.state), ['done', 'now', 'next']);
  assert.deepEqual(steps.map((s) => s.number), [1, 2, 3]);
});

test('every stepper state has a word too (colour is never the only signal)', () => {
  for (const s of stepStates(['A', 'B', 'C'], 1)) assert.ok(s.word.length > 0);
});

test('the trail shows one "More soon" stop until every step is open', () => {
  assert.equal(hasMoreSteps([]), true); // only Ask is open
  assert.equal(hasMoreSteps(['ask', 'plan', 'collect', 'graph', 'number', 'chance']), false); // Conclude is open
  assert.equal(hasMoreSteps([], true), false); // the teacher preview opens everything
});
