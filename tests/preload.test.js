// 13 Nov 2026 (speed on the live site): every page lists all the JavaScript
// files it needs, so the browser fetches them at once. If this test fails,
// run:  npm run preload   and commit the pages it changed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { PAGES, ROOT, preloadBlock, currentBlock, preloadList } from '../dev/preload.mjs';

test('every page has an up-to-date list of the scripts it needs', () => {
  for (const page of PAGES) {
    assert.equal(currentBlock(page), preloadBlock(page), `${page}: run "npm run preload"`);
  }
});

test('every listed script exists, and a room lists its own room file and the shell', () => {
  for (const page of PAGES) {
    for (const href of preloadList(page)) {
      assert.ok(existsSync(join(dirname(join(ROOT, page)), href)), `${page}: ${href}`);
    }
  }
  const room = preloadList('rooms/graph-lab.html');
  assert.ok(room.includes('../js/rooms/graph-lab.js'));
  assert.ok(room.includes('../js/app.js'));
});
