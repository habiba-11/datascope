import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TRAY_TOOLS, TRAY_ORDER, whenLine, hintTileLine,
} from '../js/helpers/tray.js';
import { allStrings, longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import { PIP_EVENTS } from '../js/helpers/pip-lines.js';
import { EVENT_TYPES } from '../js/helpers/log.js';

test('three helpers, each with an icon, a name and a "when to use me" line', () => {
  assert.deepEqual(TRAY_ORDER, ['hint', 'recap', 'findings']);
  for (const id of TRAY_ORDER) {
    const tool = TRAY_TOOLS[id];
    assert.ok(tool.icon && tool.name && tool.when, id);
  }
});

test('Grade 5 words, short enough for the narrow tray', () => {
  for (const text of allStrings(TRAY_TOOLS)) {
    assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
    assert.ok(text.split(/\s+/).length <= 9, `too long for the tray: "${text}"`);
  }
});

test('the games scenario never reads about numbers in the tray', () => {
  assert.equal(whenLine('recap', 'category'), 'Forgot what the mode is? Tap me.');
  for (const id of TRAY_ORDER) {
    assert.doesNotMatch(whenLine(id, 'category'), /\b(mean|median|range|number|average)\b/i, id);
  }
  assert.match(whenLine('recap', 'number'), /mean/);
});

test('the 💡 tile says what the hint on this screen can do', () => {
  assert.equal(hintTileLine(null), 'No hint on this screen.');
  assert.equal(hintTileLine({ text: '💡 Need a hint?', disabled: false }), 'Stuck? Tap me for ideas.');
  assert.equal(hintTileLine({ text: '💡 Another hint', disabled: false }), 'Tap again for another idea.');
  assert.equal(hintTileLine({ text: 'No more hints. You can do it!', disabled: true }), 'No more hints. You can do it!');
});

test('Pip points at the tray with known lines, and the moment is a known log event', () => {
  assert.ok(PIP_EVENTS.tray);
  assert.ok(EVENT_TYPES.includes('tray-intro-seen'));
});
