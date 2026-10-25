import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildFindings } from '../js/helpers/findings.js';
import { classStats } from '../js/helpers/number-tasks.js';
import { generateClassData } from '../js/helpers/generator.js';
import { makeEntry } from '../js/helpers/log.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));

// A journey shaped like buildJourney's, with only what findings use.
const journey = (overrides = {}) => ({
  phases: {
    plan: { guess: 8 },
    number: { guess: 9, revision: { changed: true, newGuess: 8, reason: 'the 3 pulls it down' } },
    graph: { tell: 'Most kids sleep 9 hours.', notTell: null },
    ...overrides,
  },
});

test("sleep: the question, the child's guess, the real numbers and their own words", () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  const lines = buildFindings({
    kind: 'number', question: 'How many hours did you sleep last night?', values, stats: classStats('number', values), journey: journey(),
  });
  const text = lines.map((l) => `${l.label}: ${l.text}`);
  assert.deepEqual(text, [
    'Our question: How many hours did you sleep last night?',
    'Your first guess: 8',
    'The numbers: Mean 8.4 · Median 9 · Mode 9 · Range 7',
    'You changed your mind: From 9 to 8, because "the 3 pulls it down"',
    'You said the graph shows: "Most kids sleep 9 hours."',
  ]);
});

test('games: the mode and the votes, most first (no mean or median)', () => {
  const { values } = generateClassData(read('scenarios/playground-game.json'));
  const lines = buildFindings({
    kind: 'category', question: 'q', values, stats: classStats('category', values),
    journey: journey({ number: { guess: 'Tag', revision: null } }),
  });
  assert.equal(lines.find((l) => l.label === 'Mode (most common)').text, 'Football');
  assert.match(lines.find((l) => l.label === 'Votes').text, /^Football \d+, /);
  assert.ok(!lines.some((l) => /Mean/.test(l.text)));
});

test('reading: both classes, side by side', () => {
  const a = generateClassData(read('scenarios/reading-minutes-class-a.json')).values;
  const b = generateClassData(read('scenarios/reading-minutes-class-b.json')).values;
  const lines = buildFindings({ kind: 'compare', question: 'q', values: a, stats: classStats('compare', a, b), journey: journey() });
  assert.match(lines.find((l) => l.label === 'Class A').text, /Range 4$/);
  assert.match(lines.find((l) => l.label === 'Class B').text, /Range 30$/);
});

test('a child who skipped things just gets fewer lines', () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  const lines = buildFindings({
    kind: 'number', question: 'q', values, stats: classStats('number', values),
    journey: journey({ plan: { guess: null }, number: { guess: null, revision: null }, graph: { tell: null, notTell: null } }),
  });
  assert.deepEqual(lines.map((l) => l.label), ['Our question', 'The numbers']);
});

test('findings-viewed is a known log event', () => {
  assert.equal(makeEntry('OWL-07', 'evidence-board', 'findings-viewed', { auto: true }).type, 'findings-viewed');
});
