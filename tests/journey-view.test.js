import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  STOPS, stopLines, showedLine, learnedLine, certaintyLevel,
} from '../js/helpers/journey-view.js';
import { longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';

const words = JSON.parse(readFileSync(new URL('../data/content/journey.json', import.meta.url)));
const info = { cardTitle: 'How much do we sleep?', kind: 'number' };

test('every stop has a skill and a learned line', () => {
  for (const { phase } of STOPS) {
    assert.ok(words.skills[phase].skill, phase);
    assert.ok(words.skills[phase].learned, phase);
  }
});

test('games get their own Number Lab learned line', () => {
  assert.match(learnedLine(words.skills, 'number', 'category'), /mode/);
  assert.match(learnedLine(words.skills, 'number', 'number'), /Mean, median and mode/);
});

test('"I showed it when" uses the child\'s best own words, or nothing', () => {
  assert.match(showedLine('graph', { tell: 'a', notTell: 'not why' }, info), /can't show: "not why"/);
  assert.match(showedLine('number', { guess: 9, mean: 8.4, revision: { changed: true, newGuess: 8, reason: 'the 3 pulls it down' }, tasks: [] }, info), /because "the 3 pulls it down"/);
  assert.equal(showedLine('plan', { guess: null }, info), null);
  assert.equal(stopLines('ask', {}, info)[0], 'You picked: How much do we sleep?');
});

test('certainty sits on a 5-step scale, with its word', () => {
  assert.deepEqual(certaintyLevel('impossible'), { step: 1, word: 'Impossible' });
  assert.deepEqual(certaintyLevel('likely'), { step: 4, word: 'Likely' });
  assert.equal(certaintyLevel(undefined).step, 0);
});

test('Grade 5 rule: My journey words have 12 words or fewer per sentence', () => {
  const texts = [
    words.bigIdeaMore,
    ...words.nextTime,
    ...Object.values(words.skills).flatMap((s) => [s.skill, s.learned, s.learnedWords || '']),
  ];
  for (const text of texts) assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
});
