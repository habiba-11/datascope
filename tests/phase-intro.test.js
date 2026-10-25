import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeEntry } from '../js/helpers/log.js';
import { setExplorerCode, hasSeenIntro, markIntroSeen, clearChildData } from '../js/storage/save.js';

const phases = JSON.parse(readFileSync(new URL('../data/content/phases.json', import.meta.url), 'utf8'));
const PHASE_IDS = ['ask', 'plan', 'collect', 'graph', 'number', 'chance', 'conclude'];
const ROOM_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

test('every phase has an intro with an icon, a title and a room colour', () => {
  for (const id of PHASE_IDS) {
    const intro = phases[id];
    assert.ok(intro, `missing intro for ${id}`);
    assert.ok(intro.icon && intro.title, `${id} needs an icon and a title`);
    assert.ok(ROOM_COLOURS.includes(intro.accent), `${id} has an unknown colour`);
  }
});

test('intros are short: 1 to 3 bullets, each under 10 words', () => {
  for (const id of PHASE_IDS) {
    const { bullets } = phases[id];
    assert.ok(bullets.length >= 1 && bullets.length <= 3, `${id} has ${bullets.length} bullets`);
    for (const bullet of bullets) {
      const words = bullet.split(/\s+/).length;
      assert.ok(words < 10, `"${bullet}" has ${words} words`);
    }
  }
});

test('a seen intro is remembered for that child only', () => {
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(hasSeenIntro('collect'), false);
  markIntroSeen('collect');
  assert.equal(hasSeenIntro('collect'), true);

  setExplorerCode('FOX-12'); // another child on the same device
  assert.equal(hasSeenIntro('collect'), false);
});

test('clearing the device makes the intros show again', () => {
  setExplorerCode('OWL-07');
  markIntroSeen('ask');
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(hasSeenIntro('ask'), false);
});

test('popup-seen is a known log event', () => {
  const entry = makeEntry('OWL-07', 'shell', 'popup-seen', { phase: 'ask', auto: true });
  assert.equal(entry.type, 'popup-seen');
  assert.equal(entry.auto, true);
});
