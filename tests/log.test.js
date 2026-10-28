import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCode, isValidCode, makeEntry, logEvent, readLog, meaningTaskResult, trackMeaningTask,
} from '../js/helpers/log.js';
import { setExplorerCode, getExplorerCode, clearChildData, getLogEntries } from '../js/storage/save.js';

test('codes are tidied: spaces removed, capital letters', () => {
  assert.equal(normalizeCode('  owl-07 '), 'OWL-07');
});

test('a teacher-style code like OWL-07 is valid', () => {
  assert.ok(isValidCode('OWL-07'));
  assert.ok(isValidCode('5A12'));
});

test('a name without digits is NOT a valid code (protects privacy)', () => {
  assert.equal(isValidCode('HABIBA'), false);
  assert.equal(isValidCode('12'), false);
  assert.equal(isValidCode('OWL_07!'), false);
});

test('an entry holds the code, time, room, type and details', () => {
  const when = new Date('2026-10-22T09:00:00Z');
  const entry = makeEntry('OWL-07', 'number-lab', 'prediction', { guess: 9 }, when);
  assert.deepEqual(entry, {
    code: 'OWL-07', time: '2026-10-22T09:00:00.000Z', room: 'number-lab', type: 'prediction', guess: 9,
  });
});

test('an unknown event type is refused', () => {
  assert.throws(() => makeEntry('OWL-07', 'number-lab', 'guesss', {}));
});

test('a meaning task needs a known result (correct / after-hint / incorrect)', () => {
  assert.ok(makeEntry('OWL-07', 'number-lab', 'meaning-task', { task: 'mia', result: 'after-hint' }));
  assert.throws(() => makeEntry('OWL-07', 'number-lab', 'meaning-task', { task: 'mia', result: 'maybe' }));
});

test('meaning-task result: first try, after a hint, or not solved', () => {
  assert.equal(meaningTaskResult(0, true), 'correct');
  assert.equal(meaningTaskResult(2, true), 'after-hint');
  assert.equal(meaningTaskResult(1, false), 'incorrect');
});

test('a tracked task logs one result, even if solved() is called twice', () => {
  setExplorerCode('OWL-07');
  const before = readLog().length;
  const tracker = trackMeaningTask('number-lab', 'find-mias-mistake');
  tracker.wrong();
  tracker.solved();
  tracker.solved();
  const added = readLog().slice(before);
  assert.equal(added.length, 1);
  assert.equal(added[0].result, 'after-hint');
  assert.equal(added[0].wrongTries, 1);
});

test('clearing a shared device removes the code and the log', () => {
  setExplorerCode('OWL-07');
  logEvent('number-lab', 'revision', { changed: true, oldGuess: 7, newGuess: 9, reason: 'most kids said 9' });
  clearChildData();
  assert.equal(getExplorerCode(), null);
  assert.deepEqual(getLogEntries(), []);
});

test('logEvent adds entries in order, under the current code', () => {
  // Node has no localStorage, so save.js uses its in-memory backup here.
  setExplorerCode('FOX-12');
  const before = readLog().length;
  logEvent('chance-lab', 'certainty', { rating: 'likely', reason: 'more red on the spinner' });
  logEvent('number-lab', 'prediction', { guess: 8 });
  const log = readLog();
  assert.equal(log.length, before + 2);
  assert.equal(log.at(-2).type, 'certainty');
  assert.equal(log.at(-1).code, 'FOX-12');
});

test('Part 21b events: a graph switch and an earned badge patch can be logged', () => {
  const now = new Date('2026-10-28T10:00:00Z');
  assert.equal(makeEntry('OWL-07', 'graph-lab', 'chart-switch', { from: 'bar', chartType: 'pie' }, now).chartType, 'pie');
  assert.equal(makeEntry('OWL-07', 'shell', 'badge-earned', { badgeId: 'brave-guesser', phase: 'plan' }, now).badgeId, 'brave-guesser');
});
