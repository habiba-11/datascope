import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildFindings, votes } from '../js/helpers/findings.js';
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

test("sleep: the question, the real numbers as tiles, and the child's own words in order", () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  const f = buildFindings({
    kind: 'number', question: 'How many hours did you sleep last night?', values, stats: classStats('number', values), journey: journey(),
  });
  assert.equal(f.question, 'How many hours did you sleep last night?');
  assert.deepEqual(f.data.tiles.map((t) => `${t.label} ${t.value} (${t.meaning})`), [
    'Mean 8.4 (fair share)', 'Median 9 (the middle one)', 'Mode 9 (most common)', 'Range 7 (biggest − smallest)',
  ]);
  assert.equal(f.data.line.max - f.data.line.min, 7);
  assert.ok(f.data.line.meanPct > 0 && f.data.line.meanPct < 100);
  assert.deepEqual(f.thinking.map((r) => `${r.label}: ${r.text}`), [
    'Your first guess: 8',
    'You changed your mind: From 9 to 8',
    'You said the graph shows: "Most kids sleep 9 hours."',
  ]);
  assert.equal(f.thinking[1].because, 'the 3 pulls it down');
  assert.equal(f.thinking[0].matched, false); // "matched" is only for words
});

test('games: bars with the votes, most first, the mode, and no mean or median', () => {
  const { values } = generateClassData(read('scenarios/playground-game.json'));
  const f = buildFindings({
    kind: 'category', question: 'q', values, stats: classStats('category', values),
    journey: journey({ plan: { guess: 'Football' }, number: { guess: 'Tag', revision: null } }),
  });
  assert.equal(f.data.mode, 'Football');
  assert.equal(f.data.votes[0].value, 'Football');
  assert.equal(f.data.votes[0].pct, 100);
  assert.equal(f.data.votes.reduce((sum, v) => sum + v.count, 0), values.length);
  assert.equal(f.data.tiles, undefined);
  assert.equal(f.thinking[0].matched, true);
});

test('votes: ties are in a fixed order, and widths are count ÷ the biggest', () => {
  assert.deepEqual(votes(['Tag', 'Swings', 'Tag', 'Swings', 'Tag']), [
    { value: 'Tag', count: 3, pct: 100 },
    { value: 'Swings', count: 2, pct: 67 },
  ]);
});

test('reading: both classes side by side, and the same-mean note in words', () => {
  const a = generateClassData(read('scenarios/reading-minutes-class-a.json')).values;
  const b = generateClassData(read('scenarios/reading-minutes-class-b.json')).values;
  const f = buildFindings({ kind: 'compare', question: 'q', values: a, stats: classStats('compare', a, b), journey: journey() });
  assert.equal(f.data.a.find((t) => t.label === 'Range').value, '4');
  assert.equal(f.data.b.find((t) => t.label === 'Range').value, '30');
  assert.match(f.data.note, /Same mean .*range is 4 vs 30/);
  // One row per number, A beside B, with "same" said in words.
  const row = (label) => f.data.rows.find((r) => r.label === label);
  assert.deepEqual([row('Mean').a, row('Mean').b, row('Mean').same], ['20', '20', true]);
  assert.deepEqual([row('Range').a, row('Range').b, row('Range').same], ['4', '30', false]);
});

test('a child who skipped things just gets fewer thinking rows', () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  const f = buildFindings({
    kind: 'number', question: 'q', values, stats: classStats('number', values),
    journey: journey({ plan: { guess: null }, number: { guess: null, revision: null }, graph: { tell: null, notTell: null } }),
  });
  assert.deepEqual(f.thinking, []);
  assert.equal(f.noGuess, true);
});

test('findings-viewed is a known log event', () => {
  assert.equal(makeEntry('OWL-07', 'evidence-board', 'findings-viewed', { auto: true }).type, 'findings-viewed');
});
