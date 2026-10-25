import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  badgeKey, earnedBadges, badgeMessage, badgeType, badgeShelf, levelFor, levelProgress,
} from '../js/helpers/badges.js';

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

test('every badge key belongs to one named kind of badge', () => {
  const keys = ['why:Fair coin', 'changed-mind', 'task:build-mean-6', 'not-tell:sleep-hours', 'claim:sleep-hours'];
  assert.deepEqual(keys.map((key) => badgeType(key).name),
    ['Why-Wizard', 'Mind-Changer', 'Number Cracker', 'Graph Skeptic', 'Data Detective']);
});

test('the shelf counts each kind and shows the rest as still to find', () => {
  const shelf = badgeShelf(new Set(['why:Fair coin', 'why:Six-sided dice', 'task:build-mean-6']));
  const counts = Object.fromEntries(shelf.map((b) => [b.id, b.count]));
  assert.deepEqual(counts, { why: 2, 'changed-mind': 0, task: 1, 'not-tell': 0, claim: 0 });
});

test('levels go up with badges, and the top level has no next level', () => {
  assert.equal(levelFor(0).name, 'Rookie Explorer');
  assert.equal(levelFor(0).next.name, 'Junior Detective');
  assert.equal(levelFor(2).name, 'Junior Detective');
  assert.equal(levelFor(4).name, 'Junior Detective');
  assert.equal(levelFor(5).name, 'Super Detective');
  assert.equal(levelFor(17).name, 'Master Detective');
  assert.equal(levelFor(17).next, null);
});

test('the level bar fills from one level to the next, and is full at the top', () => {
  assert.equal(levelProgress(0), 0); // Rookie (0) -> Junior (2)
  assert.equal(levelProgress(1), 50);
  assert.equal(levelProgress(2), 0); // just became Junior: a new bar starts
  assert.equal(levelProgress(4), 67); // Junior (2) -> Super (5): 2 of 3
  assert.equal(levelProgress(9), 100);
  assert.equal(levelProgress(15), 100);
});
