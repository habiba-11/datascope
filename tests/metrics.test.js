import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenariosIn, childRows, classOverview } from '../js/helpers/metrics.js';

const PARTNERS = { 'reading-minutes-class-a': 'reading-minutes-class-b' };

// Two fixture children. OWL-07 finished sleep-hours; FOX-12 stopped after Collect
// in reading minutes (two classes surveyed).
let minute = 0;
const at = () => new Date(Date.UTC(2026, 9, 26, 9, minute++)).toISOString();
function child(code, scenarioId, steps) {
  const entries = [];
  const e = (room, type, details = {}) => entries.push({ code, time: at(), room, type, ...details });
  const phase = (p, stars, inside = () => {}) => {
    e('shell', 'phase-start', { phase: p, scenarioId });
    inside(e);
    e('shell', 'phase-complete', { phase: p, scenarioId });
    e('shell', 'phase-feedback', { phase: p, scenarioId, stars });
  };
  steps(phase, e);
  return { code, entries };
}

const owl = child('OWL-07', 'sleep-hours', (phase) => {
  phase('ask', 2, (e) => e('question-studio', 'hint', { prompt: 'fixit-1' }));
  phase('plan', 3, (e) => e('question-studio', 'prediction', { scenarioId: 'sleep-hours', guess: 8 }));
  phase('collect', 3, (e) => e('data-hub', 'data-seen', { scenarioId: 'sleep-hours', seed: 5, classSize: 20 }));
  phase('graph', 3, (e) => e('graph-lab', 'reflection', { scenarioId: 'sleep-hours', prompt: 'tell', text: 'Most sleep 9.' }));
  phase('number', 3, (e) => {
    e('number-lab', 'prediction', { scenarioId: 'sleep-hours', guess: 6, mean: 8.4, median: 9 });
    e('number-lab', 'revision', { scenarioId: 'sleep-hours', changed: true, oldGuess: 6, newGuess: 8, reason: 'the 3' });
    e('number-lab', 'meaning-task', { scenarioId: 'sleep-hours', task: 'build-mean', result: 'correct' });
    e('number-lab', 'meaning-task', { scenarioId: 'sleep-hours', task: 'find-mias-mistake', result: 'after-hint' });
    e('number-lab', 'meaning-task', { scenarioId: 'sleep-hours', task: 'real-life-mode', result: 'correct' });
    e('number-lab', 'meaning-task', { scenarioId: 'sleep-hours', task: 'real-life-median', result: 'incorrect' });
  });
  phase('chance', 2, (e) => {
    e('chance-lab', 'certainty', { device: 'Dice', outcome: '6', rating: 'Unlikely', reason: 'one of six' });
    e('chance-lab', 'trials', { device: 'Dice', outcome: '6', trials: 500, experimentalPct: 17.2, theory: '1 in 6' });
  });
  phase('conclude', 3, (e) => e('evidence-board', 'claim', {
    scenarioId: 'sleep-hours', claim: 'most sleep 9', because: 'median 9', evidence: ['Median: 9', 'Mode: 9'], certainty: 'likely', certaintyReason: 'one kid slept 3',
  }));
});

const fox = child('FOX-12', 'reading-minutes-class-a', (phase) => {
  phase('ask', 2);
  phase('plan', 3, (e) => e('question-studio', 'prediction', { scenarioId: 'reading-minutes-class-a', guess: 20 }));
  phase('collect', 3, (e) => {
    e('data-hub', 'data-seen', { scenarioId: 'reading-minutes-class-a', seed: 1, classSize: 18 });
    e('data-hub', 'data-seen', { scenarioId: 'reading-minutes-class-b', seed: 1, classSize: 18 });
  });
});

const rows = childRows([owl, fox], PARTNERS);

test('the second reading class is not counted as a scenario of its own', () => {
  assert.deepEqual(scenariosIn(fox.entries, PARTNERS), ['reading-minutes-class-a']);
  assert.equal(rows.length, 2);
});

test('a finished child: phases, stars, puzzles, prediction error, revision, claim', () => {
  const r = rows.find((row) => row.code === 'OWL-07');
  assert.equal(r.phasesDone, 7);
  assert.equal(r.finished, true);
  assert.equal(r.totalStars, 19);
  assert.equal(r.hintsUsed, 1);
  assert.equal(r.predictionError, 2.4); // guessed 6, mean 8.4
  assert.equal(r.revised, true);
  assert.equal(r.tasksFirstTry, 2);
  assert.equal(r.firstTryRate, 50);
  assert.equal(r.biggestRun, 500);
  assert.equal(r.evidenceCount, 2);
  assert.equal(r.claim, 'most sleep 9');
});

test('time per phase in minutes (each fixture phase takes 1 or 2 minutes)', () => {
  const r = rows.find((row) => row.code === 'OWL-07');
  assert.equal(r.askMinutes, 2); // start, hint, complete: 2 minutes apart
  assert.equal(r.collectMinutes, 2);
});

test('a child who stopped early: later phases are empty, not broken', () => {
  const r = rows.find((row) => row.code === 'FOX-12');
  assert.equal(r.phasesDone, 3);
  assert.equal(r.finished, false);
  assert.equal(r.predictionError, null);
  assert.equal(r.revised, null);
  assert.equal(r.firstTryRate, null);
  assert.equal(r.graphMinutes, null);
});

test('class overview: completion funnel, averages and rates', () => {
  const o = classOverview(rows);
  assert.equal(o.children, 2);
  assert.equal(o.finished, 1);
  assert.deepEqual(o.funnel, { ask: 2, plan: 2, collect: 2, graph: 1, number: 1, chance: 1, conclude: 1 });
  assert.equal(o.avgMinutes.ask, 1.5); // 2 and 1 minutes
  assert.equal(o.firstTryRate, 50);
  assert.equal(o.avgPredictionError, 2.4);
  assert.equal(o.revisedRate, 100);
});

test('an empty class gives zeros and nulls, not errors', () => {
  const o = classOverview([]);
  assert.equal(o.children, 0);
  assert.equal(o.firstTryRate, null);
  assert.equal(o.avgMinutes.ask, null);
});
