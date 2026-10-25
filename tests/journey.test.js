import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildJourney } from '../js/helpers/journey.js';
import { journeyRedirect } from '../js/helpers/progress.js';

// A small fixture log: OWL-07 did sleep-hours up to Number Lab (not Chance or
// Conclude). A second child's entries are mixed in and must be ignored.
const S = 'sleep-hours';
let minute = 0;
const at = () => new Date(Date.UTC(2026, 9, 25, 9, minute++)).toISOString();
const e = (room, type, details = {}, code = 'OWL-07') => ({ code, time: at(), room, type, ...details });
const phase = (type, p, extra = {}) => e('shell', type, { phase: p, scenarioId: S, ...extra });

const log = [
  phase('phase-start', 'ask'),
  e('question-studio', 'hint', { prompt: 'fixit-1', hintNumber: 1 }),
  phase('phase-complete', 'ask'), phase('phase-feedback', 'ask', { stars: 2 }),
  phase('phase-start', 'plan'),
  e('question-studio', 'prediction', { scenarioId: S, guess: 8 }),
  phase('phase-complete', 'plan'), phase('phase-feedback', 'plan', { stars: 3 }),
  phase('phase-start', 'collect'),
  e('data-hub', 'data-seen', { scenarioId: S, seed: 5, classSize: 20 }),
  e('data-hub', 'prediction', { scenarioId: S, guess: 99 }, 'FOX-12'), // another child
  phase('phase-complete', 'collect'), phase('phase-feedback', 'collect', { stars: 3 }),
  phase('phase-start', 'graph'),
  e('graph-lab', 'reflection', { scenarioId: S, prompt: 'tell', text: 'Most kids sleep 9 hours.' }),
  e('graph-lab', 'reflection', { scenarioId: S, prompt: 'not-tell', text: 'Not why one kid slept 3.' }),
  e('graph-lab', 'reflection', { scenarioId: S, prompt: 'not-tell', text: 'It does not tell us why one kid slept 3.' }),
  phase('phase-complete', 'graph'), phase('phase-feedback', 'graph', { stars: 3 }),
  phase('phase-start', 'number'),
  e('number-lab', 'prediction', { scenarioId: S, guess: 9, mean: 8.4, median: 9 }),
  e('number-lab', 'revision', { scenarioId: S, changed: true, oldGuess: 9, newGuess: 8, reason: 'the 3 pulls it down' }),
  e('number-lab', 'meaning-task', { scenarioId: S, task: 'build-mean', result: 'correct' }),
  e('number-lab', 'meaning-task', { scenarioId: S, task: 'find-mias-mistake', result: 'after-hint' }),
  phase('phase-complete', 'number'), phase('phase-feedback', 'number', { stars: 3 }),
  phase('phase-start', 'chance'),
  e('chance-lab', 'trials', { device: 'Dice', outcome: '6', trials: 10, experimentalPct: 10, theory: '1 in 6' }),
];

const journey = buildJourney(log, 'OWL-07', S);

test('done phases, stars and the totals', () => {
  assert.deepEqual(
    ['ask', 'plan', 'collect', 'graph', 'number', 'chance', 'conclude'].map((p) => journey.phases[p].done),
    [true, true, true, true, true, false, false],
  );
  assert.equal(journey.phases.ask.stars, 2);
  assert.equal(journey.phasesDone, 5);
  assert.equal(journey.totalStars, 14);
});

test("each phase holds the child's own answers", () => {
  assert.equal(journey.phases.plan.guess, 8);
  assert.deepEqual(journey.phases.collect.classes, [{ scenarioId: S, seed: 5, classSize: 20 }]);
  assert.equal(journey.phases.graph.notTell, 'It does not tell us why one kid slept 3.'); // the newest answer
  assert.equal(journey.phases.number.guess, 9);
  assert.equal(journey.phases.number.mean, 8.4);
  assert.deepEqual(journey.phases.number.revision, { changed: true, newGuess: 8, reason: 'the 3 pulls it down' });
  assert.equal(journey.phases.number.firstTry, 1);
  assert.equal(journey.phases.number.afterHint, 1);
});

test('missing phases are empty, not broken', () => {
  assert.equal(journey.phases.chance.done, false);
  assert.equal(journey.phases.chance.rating, null);
  assert.deepEqual(journey.phases.chance.runs, [10]);
  assert.equal(journey.phases.conclude.claim, null);
});

test('Ask and Plan share a room, but their moments are kept apart by time', () => {
  assert.equal(journey.phases.ask.hints, 1);
  assert.equal(journey.phases.plan.hints, 0);
  assert.equal(journey.hintsUsed, 1);
});

test('time per phase is worked out (for the teacher only)', () => {
  assert.equal(journey.phases.ask.durationMs, 2 * 60 * 1000); // start 9:00, complete 9:02
  assert.equal(journey.phases.chance.durationMs, null);
});

test("another child's entries never leak in", () => {
  assert.equal(buildJourney(log, 'FOX-12', S).phasesDone, 0);
  assert.equal(journey.phases.collect.classes.length, 1);
});

test('an old file with no phase events still shows the answers', () => {
  const old = log.filter((entry) => !entry.type.startsWith('phase'));
  const oldJourney = buildJourney(old, 'OWL-07', S);
  assert.equal(oldJourney.phasesDone, 0);
  assert.equal(oldJourney.phases.number.guess, 9);
});

test('My journey opens only after Conclude (or in teacher preview)', () => {
  assert.equal(journeyRedirect(['ask', 'plan'], false), 'data-hub.html'); // the furthest open room
  assert.equal(journeyRedirect(['ask', 'plan', 'collect', 'graph', 'number', 'chance', 'conclude'], false), null);
  assert.equal(journeyRedirect([], true), null);
});

test('a phase saved as done counts as done, even with no phase-complete in the log', () => {
  const noEvents = log.filter((entry) => !entry.type.startsWith('phase'));
  const j = buildJourney(noEvents, 'OWL-07', S, null, ['ask', 'plan']);
  assert.equal(j.phases.ask.done, true);
  assert.equal(j.phases.plan.done, true);
  assert.equal(j.phases.collect.done, false);
  assert.equal(j.phases.ask.stars, null); // stars that were never logged stay empty
});
