import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { choiceExplanation, TRY_AGAIN } from '../js/helpers/fixit-words.js';
import { longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import { withoutIcons } from '../js/icon-text.js';

const SCENARIOS = ['sleep-hours', 'shoe-sizes', 'playground-game', 'reading-minutes-class-a'];
const fixIts = SCENARIOS.map((id) => JSON.parse(readFileSync(new URL(`../data/content/${id}.json`, import.meta.url), 'utf8')).fixIts[0]);
// The words a child reads (the :name: icons are pictures, not words; Part 54c).
const sentence = ({ label, text }) => withoutIcons(`${label} ${text}`);

test('Fix 1: 3 short rows that name the right letter, the WHEN words and the pushy words', () => {
  const rows = choiceExplanation({ goodFirst: false, whenWhy: 'everyone answers about the same night.', whenWords: 'last night', pushyWords: '"Isn\'t" and "bad"' });
  assert.equal(rows.length, 3);
  assert.equal(rows[0].label, ':check: Yes! B is better.');
  assert.equal(sentence(rows[1]), 'WHEN: "last night", so everyone answers about the same night.');
  assert.equal(sentence(rows[2]), 'Not pushy: A uses "Isn\'t" and "bad". They push you to one answer.');
  assert.match(rows[1].label, /^:clock:/);
  assert.match(rows[2].label, /^:scales:/);
});

test('Fix 1: every scenario\'s WHEN words are in the good question, and its pushy words in the other one', () => {
  for (const { flawed, fix, choice } of fixIts) {
    assert.ok(fix.includes(choice.whenWords), `${fix} / ${choice.whenWords}`);
    for (const word of choice.pushyWords.match(/"([^"]+)"/g).map((w) => w.slice(1, -1))) {
      assert.ok(flawed.includes(word), `${flawed} / ${word}`);
    }
  }
});

test('Fix 1: short, not a paragraph (each row at most 14 words)', () => {
  for (const { choice } of fixIts) {
    for (const row of choiceExplanation(choice)) {
      const text = sentence(row);
      assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
      assert.ok(text.split(/\s+/).length <= 14, `too long: ${text}`);
    }
  }
  assert.ok(longestSentence(TRY_AGAIN) <= MAX_SENTENCE_WORDS);
});
