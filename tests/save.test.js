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

// Part 60d: the last code stays after Exit; "I'm finished" clears it, but
// never throws away work that has not reached the database yet.
test('Exit forgets the code but keeps the last code; clearing forgets both', async () => {
  const save = await import('../js/storage/save.js');
  save.setExplorerCode('FOX-4725');
  save.clearExplorerCode();
  assert.equal(save.getExplorerCode(), null);
  assert.equal(save.getLastCode(), 'FOX-4725');
  save.clearChildData();
  assert.equal(save.getLastCode(), null);
});

test('clearing the device keeps only the entries that were not sent yet', async () => {
  const save = await import('../js/storage/save.js');
  save.setLogEntries([
    { id: 'a', code: 'FOX-4725', type: 'prediction' },
    { id: 'b', code: 'FOX-4725', type: 'claim' },
    { code: 'FOX-4725', type: 'old-entry-without-id' },
  ]);
  save.addSentIds(['a']);
  save.clearChildData();
  assert.deepEqual(save.getLogEntries().map((e) => e.type), ['claim', 'old-entry-without-id']);
  assert.equal(save.getSentIds().size, 0);
  // Everything sent: nothing is left behind.
  save.addSentIds(['b']);
  save.setLogEntries([{ id: 'b', code: 'FOX-4725', type: 'claim' }]);
  save.clearChildData();
  assert.deepEqual(save.getLogEntries(), []);
});
