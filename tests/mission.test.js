import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MISSION_WORDS, roomWhy } from '../js/helpers/mission.js';
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

// ---------- Part 42c: "Why this room?" ----------
const phases = JSON.parse(readFileSync(new URL('../data/content/phases.json', import.meta.url), 'utf8'));

test('every room says why it exists, in one short Grade 5 line', () => {
  for (const [id, intro] of Object.entries(phases)) {
    assert.ok(intro.why, `${id} needs a why line`);
    assert.ok(longestSentence(intro.why) <= MAX_SENTENCE_WORDS, intro.why);
  }
});

test('roomWhy: games get their own words, the number scenarios the normal ones', () => {
  assert.equal(roomWhy(phases.number, 'category').title, 'Find the most popular answer');
  assert.equal(roomWhy(phases.number, 'number').title, 'Find the statistics');
  assert.equal(roomWhy(phases.number, 'number').why, phases.number.why);
  assert.equal(roomWhy(phases.number, 'category').why, phases.number.whyWords);
  assert.deepEqual(roomWhy(phases.number, 'category').bullets, phases.number.bulletsWords);
  // A phase with no special words keeps its normal ones for games too.
  assert.equal(roomWhy(phases.graph, 'category').why, phases.graph.why);
});

test('what the games scenario sees in every room intro never talks about numbers', () => {
  for (const intro of Object.values(phases)) {
    const { why, bullets } = roomWhy(intro, 'category');
    for (const text of [why, ...bullets]) {
      assert.doesNotMatch(text, /\b(number|numbers|mean|median|range|average)\b/i, text);
    }
  }
});
