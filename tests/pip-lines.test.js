import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PIP_EVENTS, IDLE_MOVES, pickLine, nextIdleMove, idleGap,
} from '../js/helpers/pip-lines.js';
import { longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';

const bank = JSON.parse(readFileSync(new URL('../data/content/pip-lines.json', import.meta.url), 'utf8'));

test('every Pip event has 6 to 10 different lines, and every line has an event', () => {
  assert.deepEqual(Object.keys(bank).sort(), Object.keys(PIP_EVENTS).sort());
  for (const [event, lines] of Object.entries(bank)) {
    assert.ok(lines.length >= 6 && lines.length <= 10, `${event} has ${lines.length} lines`);
    assert.equal(new Set(lines).size, lines.length, `${event} repeats a line`);
  }
});

test('Pip talks in Grade 5 words, short enough for a speech bubble', () => {
  for (const lines of Object.values(bank)) {
    for (const line of lines) {
      assert.ok(longestSentence(line) <= MAX_SENTENCE_WORDS, line);
      assert.ok(line.split(/\s+/).length <= 8, `too long for the bubble: "${line}"`);
    }
  }
});

test('Pip never talks about numbers (the games scenario has none) and never about speed', () => {
  for (const lines of Object.values(bank)) {
    for (const line of lines) assert.doesNotMatch(line, /\b(number|mean|median|range|average|fast|quick|hurry)\b/i, line);
  }
});

test('pickLine never says the same line twice in a row', () => {
  const lines = bank.correct;
  for (let last = 0; last < lines.length; last++) {
    for (const r of [0, 0.3, 0.5, 0.99]) assert.notEqual(pickLine(lines, last, () => r).index, last);
  }
  assert.equal(pickLine(['only one'], 0).text, 'only one');
});

test('idle moves never repeat, and wait 6 to 10 seconds', () => {
  for (const last of IDLE_MOVES) {
    for (const r of [0, 0.5, 0.99]) assert.notEqual(nextIdleMove(last, () => r), last);
  }
  assert.equal(idleGap(() => 0), 6000);
  assert.equal(idleGap(() => 1), 10000);
});
