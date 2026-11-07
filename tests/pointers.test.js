import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HELPERS, helperId, whenLine, pointerSpot,
} from '../js/helpers/pointers.js';
import { allStrings, longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import { PIP_EVENTS } from '../js/helpers/pip-lines.js';
import { EVENT_TYPES } from '../js/helpers/log.js';

test('each helper button is known from its words', () => {
  assert.equal(helperId('💡 Need a hint?'), 'hint');
  assert.equal(helperId('💡 Another hint'), 'hint');
  assert.equal(helperId('📘 Maths recap'), 'recap');
  assert.equal(helperId('📋 My findings'), 'findings');
  assert.equal(helperId('Next →'), null);
});

test('the "when to use me" lines are short Grade 5 words', () => {
  for (const text of allStrings(HELPERS)) {
    assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
    assert.ok(text.split(/\s+/).length <= 9, text);
  }
});

test('the games scenario never reads about numbers next to a helper', () => {
  for (const id of Object.keys(HELPERS)) {
    assert.doesNotMatch(whenLine(id, 'category'), /\b(mean|median|range|number|average)\b/i, id);
  }
  assert.match(whenLine('recap', 'number'), /mean/);
});

test('the arrow goes under a button pointing up, or above it near the bottom of the screen', () => {
  assert.deepEqual(pointerSpot({ left: 100, top: 50, width: 80, bottom: 98 }, 768), { x: 140, y: 104, dir: 'up' });
  assert.deepEqual(pointerSpot({ left: 100, top: 700, width: 80, bottom: 748 }, 768), { x: 140, y: 694, dir: 'down' });
});

test('Pip has lines for pointing, and the moment is a known log event', () => {
  assert.ok(PIP_EVENTS.tray);
  assert.ok(EVENT_TYPES.includes('tray-intro-seen'));
});
