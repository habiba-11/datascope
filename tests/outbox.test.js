import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toRow, fromRow, withIds, pendingEntries, batches } from '../js/helpers/outbox.js';
import { newId } from '../js/helpers/log.js';

const entry = {
  id: '11111111-1111-4111-8111-111111111111', code: 'TEST-01', time: '2026-10-27T09:00:00.000Z',
  room: 'number-lab', type: 'revision', scenarioId: 'sleep-hours', changed: true, newGuess: 8, reason: 'the 3',
};

test('an entry becomes a database row: fixed columns + details', () => {
  assert.deepEqual(toRow(entry), {
    id: entry.id, code: 'TEST-01', time: entry.time, room: 'number-lab', type: 'revision',
    scenario_id: 'sleep-hours', details: { changed: true, newGuess: 8, reason: 'the 3' },
  });
});

test('a row comes back as exactly the same entry (round trip)', () => {
  assert.deepEqual(fromRow(toRow(entry)), entry);
  const noScenario = { id: entry.id, code: 'TEST-01', time: entry.time, room: 'shell', type: 'popup-seen', phase: 'ask', auto: true };
  assert.deepEqual(fromRow(toRow(noScenario)), noScenario);
});

test('new ids are unique uuids', () => {
  const a = newId();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, newId());
});

test('old entries without an id get one; others keep theirs', () => {
  const [old, kept] = withIds([{ code: 'TEST-01', type: 'hint' }, entry]);
  assert.ok(old.id);
  assert.equal(kept.id, entry.id);
});

test('only entries with an id, a valid code and not yet sent are waiting', () => {
  const list = [
    entry,
    { ...entry, id: '22222222-2222-4222-8222-222222222222' },
    { ...entry, id: '33333333-3333-4333-8333-333333333333', code: null }, // no code: never sent
    { ...entry, id: undefined },
  ];
  const waiting = pendingEntries(list, new Set([entry.id]));
  assert.deepEqual(waiting.map((e) => e.id), ['22222222-2222-4222-8222-222222222222']);
});

test('batches of at most 50', () => {
  const groups = batches(Array.from({ length: 120 }, (_, i) => i));
  assert.deepEqual(groups.map((g) => g.length), [50, 50, 20]);
  assert.deepEqual(batches([]), []);
});
