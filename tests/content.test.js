import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkQuestion } from '../js/helpers/checker.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';
import {
  sentences, wordCount, longestSentence, allStrings, MAX_SENTENCE_WORDS,
} from '../js/helpers/readability.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
const contents = PICKABLE_SCENARIOS.map((id) => ({ id, content: read(`content/${id}.json`) }));

// Keys every content file must have. Parts 17b-d add more.
const REQUIRED_KEYS = ['scenarioId', 'emoji', 'cardTitle', 'fixIts', 'planPrompt', 'numberLab', 'graphLab', 'chanceLab', 'evidenceBoard'];

test('readability helper: sentences and words', () => {
  assert.deepEqual(sentences('Make a guess! How many? Go.'), ['Make a guess!', 'How many?', 'Go.']);
  assert.equal(wordCount('🤔 Make a guess!'), 3); // the emoji is not a word
  assert.equal(longestSentence('One two. One two three four.'), 4);
});

test('every pickable scenario has a content file with every key', () => {
  for (const { id, content } of contents) {
    assert.equal(content.scenarioId, id);
    for (const key of REQUIRED_KEYS) assert.ok(content[key] !== undefined, `${id} is missing "${key}"`);
  }
});

test(`Grade 5 rule: every sentence has ${MAX_SENTENCE_WORDS} words or fewer`, () => {
  for (const { id, content } of contents) {
    for (const text of allStrings(content)) {
      assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, `${id}: "${text}"`);
    }
  }
});

test('every fix-it question is flawed, and its suggested fix passes the checker', () => {
  for (const { id, content } of contents) {
    assert.equal(content.fixIts.length, 2, id);
    for (const { flawed, fix } of content.fixIts) {
      assert.ok(checkQuestion(flawed).length > 0, `${id}: "${flawed}" should have a problem`);
      assert.deepEqual(checkQuestion(fix), [], `${id}: "${fix}" should pass`);
    }
  }
});

test('the scenario questions shown on the cards follow the Grade 5 rule too', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { question } = read(`scenarios/${id}.json`);
    assert.ok(longestSentence(question) <= MAX_SENTENCE_WORDS, `${id}: "${question}"`);
  }
});

test('no hard-coded answers: content never states a mean, median, mode or range with a number', () => {
  // Answers are computed from the data with stats.js. Everyday numbers are fine.
  for (const { id, content } of contents) {
    for (const text of allStrings(content)) {
      assert.doesNotMatch(text, /\b(mean|median|mode|range)\b[^.?!]*\d/i, `${id}: "${text}"`);
    }
  }
});

test('content never says "middle" (we say "centre": Part 9.5 decision on how kids picture the median)', () => {
  for (const { id, content } of contents) {
    for (const text of allStrings(content)) assert.doesNotMatch(text, /middle/i, `${id}: "${text}"`);
  }
});

test('Graph Lab hints: 1 to 3 per question, like the other hints', () => {
  for (const { id, content } of contents) {
    for (const list of [content.graphLab.tellHints, content.graphLab.notTellHints]) {
      assert.ok(list.length >= 1 && list.length <= 3, id);
    }
  }
});

test('hints do not start with an emoji (the hint box already adds 🦉)', () => {
  for (const { id, content } of contents) {
    for (const hint of [...content.graphLab.tellHints, ...content.graphLab.notTellHints]) {
      assert.match(hint, /^[\p{L}"']/u, `${id}: "${hint}"`);
    }
  }
});
