import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { choiceExplanation, TRY_AGAIN } from '../js/helpers/fixit-words.js';
import { longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';

const SCENARIOS = ['sleep-hours', 'shoe-sizes', 'playground-game', 'reading-minutes-class-a'];
const fixIts = SCENARIOS.map((id) => JSON.parse(readFileSync(new URL(`../data/content/${id}.json`, import.meta.url), 'utf8')).fixIts[0]);

test('Fix 1: the explanation names the right letter, the WHEN words and the pushy words', () => {
  const lines = choiceExplanation({ goodFirst: false, whenWords: 'last night', whenWhy: 'So all answers are about the same night.', pushyWords: '"Isn\'t" and "bad"' });
  assert.equal(lines.length, 3);
  assert.match(lines[0], /B is the better question/);
  assert.match(lines[1], /"last night"/);
  assert.match(lines[2], /A says "Isn't" and "bad"/);
  assert.match(lines[2], /B lets everyone answer freely/);
});

test('Fix 1: every scenario\'s WHEN words are in the good question, and its pushy words in the other one', () => {
  for (const { flawed, fix, choice } of fixIts) {
    assert.ok(fix.includes(choice.whenWords), `${fix} / ${choice.whenWords}`);
    for (const word of choice.pushyWords.match(/"([^"]+)"/g).map((w) => w.slice(1, -1))) {
      assert.ok(flawed.includes(word), `${flawed} / ${word}`);
    }
  }
});

test('Fix 1: the explanation uses Grade 5 sentences', () => {
  for (const { choice } of fixIts) {
    for (const line of choiceExplanation(choice)) assert.ok(longestSentence(line) <= MAX_SENTENCE_WORDS, line);
  }
  assert.ok(longestSentence(TRY_AGAIN) <= MAX_SENTENCE_WORDS);
});
