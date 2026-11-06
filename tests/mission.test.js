import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MISSION_WORDS } from '../js/helpers/mission.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';
import { longestSentence, allStrings, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';

const read = (id) => JSON.parse(readFileSync(new URL(`../data/content/${id}.json`, import.meta.url), 'utf8'));

test('every scenario has a mission with a goal and a short line', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { mission } = read(id);
    assert.ok(mission && mission.goal && mission.short, `${id} needs mission.goal and mission.short`);
  }
});

test('the games mission never talks about numbers (words, not numbers)', () => {
  for (const text of allStrings(read('playground-game').mission)) {
    assert.doesNotMatch(text, /\b(number|numbers|mean|median|range|average|hours|minutes)\b/i, text);
  }
});

test(`mission card words follow the Grade 5 rule (${MAX_SENTENCE_WORDS} words or fewer)`, () => {
  for (const text of allStrings(MISSION_WORDS)) assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
});
