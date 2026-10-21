import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badgeKey, earnedBadges, badgeMessage } from '../js/helpers/badges.js';

const code = 'OWL-07';

test('a certainty rating earns a badge only WITH a reason', () => {
  assert.equal(badgeKey({ type: 'certainty', device: 'Fair coin', rating: 'Even chance', reason: 'two sides' }), 'why:Fair coin');
  assert.equal(badgeKey({ type: 'certainty', device: 'Fair coin', rating: 'Even chance', reason: '' }), null);
});

test('changing your mind earns a badge only with a reason; keeping does not', () => {
  assert.equal(badgeKey({ type: 'revision', changed: true, reason: 'most kids said 9' }), 'changed-mind');
  assert.equal(badgeKey({ type: 'revision', changed: false }), null);
});

test('a meaning task solved after a hint still earns a badge; an unsolved one does not', () => {
  assert.equal(badgeKey({ type: 'meaning-task', task: 'find-mias-mistake', result: 'after-hint' }), 'task:find-mias-mistake');
  assert.equal(badgeKey({ type: 'meaning-task', task: 'find-mias-mistake', result: 'incorrect' }), null);
});

test('"What does this graph NOT tell you?" needs a real answer', () => {
  assert.ok(badgeKey({ type: 'reflection', prompt: 'not-tell', scenarioId: 's', text: 'why people sleep less' }));
  assert.equal(badgeKey({ type: 'reflection', prompt: 'not-tell', scenarioId: 's', text: 'idk' }), null);
  assert.equal(badgeKey({ type: 'reflection', prompt: 'tell', scenarioId: 's', text: 'most sleep 9 hours' }), null);
});

test('speed or clicking never earns badges (trials, hints, predictions)', () => {
  for (const type of ['trials', 'hint', 'prediction', 'data-seen']) {
    assert.equal(badgeKey({ type }), null, type);
  }
});

test('each reasoning moment counts once, and only for this child', () => {
  const entries = [
    { code, type: 'certainty', device: 'Fair coin', reason: 'two sides' },
    { code, type: 'certainty', device: 'Fair coin', reason: 'changed my rating' },
    { code, type: 'meaning-task', task: 'build-mean-6', result: 'correct' },
    { code: 'FOX-12', type: 'revision', changed: true, reason: 'other child' },
  ];
  assert.equal(earnedBadges(entries, code).size, 2);
});

test('Pip praises the reasoning, e.g. using a hint', () => {
  assert.match(badgeMessage({ type: 'meaning-task', result: 'after-hint' }), /hint/);
});
