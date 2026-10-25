import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HINTS, getHint } from '../js/helpers/prompts.js';
import { longestSentence } from '../js/helpers/readability.js';

test('hints come one at a time, then run out', () => {
  assert.equal(getHint('chance-why', 0), HINTS['chance-why'][0]);
  assert.equal(getHint('chance-why', 3), null);
  assert.equal(getHint('no-such-question', 0), null);
});

test('every open question has 1 to 3 short hints (few words for young readers)', () => {
  for (const [key, hints] of Object.entries(HINTS)) {
    assert.ok(hints.length >= 1 && hints.length <= 3, `${key} has ${hints.length} hints`);
    for (const hint of hints) {
      assert.ok(hint.length <= 80, `${key}: "${hint}" is too long`);
    }
  }
});

test('hints never use the word "middle" (it shapes how kids picture the median)', () => {
  for (const hints of Object.values(HINTS)) {
    for (const hint of hints) {
      assert.ok(!/middle/i.test(hint), `"${hint}"`);
    }
  }
});

test('every hint follows the Grade 5 rule (12 words or fewer per sentence)', () => {
  for (const [key, hints] of Object.entries(HINTS)) {
    for (const hint of hints) assert.ok(longestSentence(hint) <= 12, `${key}: "${hint}"`);
  }
});
