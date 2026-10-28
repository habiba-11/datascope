import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  badgeKey, earnedBadges, badgeMessage, badgeType, badgeShelf, levelFor, levelProgress,
  BADGES, findBadge, checkBadges, backpack, explains,
} from '../js/helpers/badges.js';

const code = 'OWL-07';

test('a certainty rating earns a badge only WITH a reason', () => {
  assert.equal(badgeKey({ type: 'certainty', device: 'Fair coin', rating: 'Even chance', reason: 'two sides' }), 'why:Fair coin');
  assert.equal(badgeKey({ type: 'certainty', device: 'Fair coin', rating: 'Even chance', reason: '' }), null);
});

test('changing your mind earns a badge only with a reason; keeping does not', () => {
  assert.equal(badgeKey({ type: 'revision', changed: true, reason: 'most kids said 9' }), 'changed-mind');
  assert.equal(badgeKey({ type: 'revision', changed: false }), null);
});

test('a meaning task solved after a hint still earns a badge; an unsolved one does not', () => {
  assert.equal(badgeKey({ type: 'meaning-task', task: 'find-mias-mistake', result: 'after-hint' }), 'task:find-mias-mistake');
  assert.equal(badgeKey({ type: 'meaning-task', task: 'find-mias-mistake', result: 'incorrect' }), null);
});

test('"What does this graph NOT tell you?" needs a real answer', () => {
  assert.ok(badgeKey({ type: 'reflection', prompt: 'not-tell', scenarioId: 's', text: 'why people sleep less' }));
  assert.equal(badgeKey({ type: 'reflection', prompt: 'not-tell', scenarioId: 's', text: 'idk' }), null);
  assert.equal(badgeKey({ type: 'reflection', prompt: 'tell', scenarioId: 's', text: 'most sleep 9 hours' }), null);
});

test('speed or clicking never earns badges (trials, hints, predictions)', () => {
  for (const type of ['trials', 'hint', 'prediction', 'data-seen']) {
    assert.equal(badgeKey({ type }), null, type);
  }
});

test('each reasoning moment counts once, and only for this child', () => {
  const entries = [
    { code, type: 'certainty', device: 'Fair coin', reason: 'two sides' },
    { code, type: 'certainty', device: 'Fair coin', reason: 'changed my rating' },
    { code, type: 'meaning-task', task: 'build-mean-6', result: 'correct' },
    { code: 'FOX-12', type: 'revision', changed: true, reason: 'other child' },
  ];
  assert.equal(earnedBadges(entries, code).size, 2);
});

test('Pip praises the reasoning, e.g. using a hint', () => {
  assert.match(badgeMessage({ type: 'meaning-task', result: 'after-hint' }), /hint/);
});

test('every badge key belongs to one named kind of badge', () => {
  const keys = ['why:Fair coin', 'changed-mind', 'task:build-mean-6', 'not-tell:sleep-hours', 'claim:sleep-hours'];
  assert.deepEqual(keys.map((key) => badgeType(key).name),
    ['Why-Wizard', 'Mind-Changer', 'Number Cracker', 'Graph Skeptic', 'Data Detective']);
});

test('the shelf counts each kind and shows the rest as still to find', () => {
  const shelf = badgeShelf(new Set(['why:Fair coin', 'why:Six-sided dice', 'task:build-mean-6']));
  const counts = Object.fromEntries(shelf.map((b) => [b.id, b.count]));
  assert.deepEqual(counts, { why: 2, 'changed-mind': 0, task: 1, 'not-tell': 0, claim: 0 });
});

test('levels go up with badges, and the top level has no next level', () => {
  assert.equal(levelFor(0).name, 'Rookie Explorer');
  assert.equal(levelFor(0).next.name, 'Junior Detective');
  assert.equal(levelFor(2).name, 'Junior Detective');
  assert.equal(levelFor(4).name, 'Junior Detective');
  assert.equal(levelFor(5).name, 'Super Detective');
  assert.equal(levelFor(17).name, 'Master Detective');
  assert.equal(levelFor(17).next, null);
});

test('the level bar fills from one level to the next, and is full at the top', () => {
  assert.equal(levelProgress(0), 0); // Rookie (0) -> Junior (2)
  assert.equal(levelProgress(1), 50);
  assert.equal(levelProgress(2), 0); // just became Junior: a new bar starts
  assert.equal(levelProgress(4), 67); // Junior (2) -> Super (5): 2 of 3
  assert.equal(levelProgress(9), 100);
  assert.equal(levelProgress(15), 100);
});

// --- Badge patches (Part 21b) ---

// A child's log after a whole sleep-hours investigation, with a hint used.
const fullRun = [
  { code, type: 'phase-complete', phase: 'ask', scenarioId: 'sleep-hours' },
  { code, type: 'prediction', room: 'question-studio', guess: 8 },
  { code, type: 'phase-complete', phase: 'collect', scenarioId: 'sleep-hours' },
  { code, type: 'chart-switch', scenarioId: 'sleep-hours', from: 'bar', chartType: 'pie' },
  { code, type: 'reflection', prompt: 'not-tell', scenarioId: 'sleep-hours', text: 'why some kids sleep less, because it only counts' },
  { code, type: 'hint', prompt: 'find-mias-mistake', hintNumber: 1 },
  { code, type: 'meaning-task', task: 'find-mias-mistake', result: 'after-hint' },
  { code, type: 'trials', device: 'Dice', trials: 10 },
  { code, type: 'trials', device: 'Dice', trials: 500 },
  { code, type: 'certainty', device: 'Dice', reason: 'so each side is the same' },
  { code, type: 'revision', scenarioId: 'sleep-hours', changed: true, reason: 'the data said 9' },
  { code, type: 'claim', scenarioId: 'sleep-hours', because: 'most kids said 9 hours', evidence: ['Median: 9'], certainty: 'likely', certaintyReason: 'many kids' },
];

test('there are 12 patches, each with its own id, name, icon and why/how words', () => {
  assert.equal(BADGES.length, 12);
  assert.equal(new Set(BADGES.map((b) => b.id)).size, 12);
  for (const b of BADGES) {
    assert.ok(b.name && b.icon && b.why && b.how && b.color, b.id);
  }
});

test('the 5 old kinds keep their ids, the 3 super badges are marked', () => {
  for (const id of ['why', 'changed-mind', 'task', 'not-tell', 'claim']) assert.ok(findBadge(id), id);
  assert.deepEqual(BADGES.filter((b) => b.super).map((b) => b.id), ['changed-mind', 'because-builder', 'claim']);
  assert.equal(findBadge('claim').name, 'Evidence Expert');
});

test('a whole investigation earns every patch (a hint never blocks a badge)', () => {
  assert.deepEqual(checkBadges(fullRun, code).sort(), BADGES.map((b) => b.id).sort());
});

test('an empty log earns nothing', () => {
  assert.deepEqual(checkBadges([], code), []);
});

test('a patch already shown (badge-earned) is not new again', () => {
  const log = [...fullRun, { code, type: 'badge-earned', badgeId: 'brave-guesser', phase: 'plan' }];
  assert.ok(!checkBadges(log, code).includes('brave-guesser'));
  assert.ok(checkBadges(log, code).includes('data-collector'));
});

test('another child\'s entries never earn a patch for this child', () => {
  const other = fullRun.map((e) => ({ ...e, code: 'FOX-12' }));
  assert.deepEqual(checkBadges(other, code), []);
  // ...and their badge-earned entries do not hide this child's new patches.
  const log = [{ code: 'FOX-12', type: 'badge-earned', badgeId: 'brave-guesser' }, { code, type: 'prediction' }];
  assert.deepEqual(checkBadges(log, code), ['brave-guesser']);
});

test('Graph Explorer needs a real switch to another kind of graph', () => {
  const ids = (log) => checkBadges(log, code);
  assert.ok(!ids([{ code, type: 'chart-switch', from: 'bar', chartType: 'bar' }]).includes('graph-explorer'));
  assert.ok(ids([{ code, type: 'chart-switch', from: 'bar', chartType: 'dot' }]).includes('graph-explorer'));
});

test('Chance Tester needs 10 AND 500 tries with the same device', () => {
  const ids = (log) => checkBadges(log, code);
  assert.ok(!ids([{ code, type: 'trials', device: 'Dice', trials: 500 }]).includes('chance-tester'));
  assert.ok(!ids([
    { code, type: 'trials', device: 'Dice', trials: 10 },
    { code, type: 'trials', device: 'Fair coin', trials: 500 },
  ]).includes('chance-tester'));
});

test('Centre Finder (middle-finder) needs Mia\'s mistake solved; an unsolved try does not count', () => {
  const ids = (log) => checkBadges(log, code);
  assert.ok(!ids([{ code, type: 'meaning-task', task: 'find-mias-mistake', result: 'incorrect' }]).includes('middle-finder'));
  assert.ok(!ids([{ code, type: 'meaning-task', task: 'build-mean', result: 'correct' }]).includes('middle-finder'));
});

test('Because Builder needs 3 different explaining answers', () => {
  const ids = (log) => checkBadges(log, code);
  const two = [
    { code, type: 'certainty', device: 'Dice', reason: 'because it has 6 sides' },
    { code, type: 'certainty', device: 'Dice', reason: 'because it has six sides' }, // same question again
    { code, type: 'reflection', prompt: 'tell', scenarioId: 's', text: 'most kids sleep 9 so they rest' },
  ];
  assert.ok(!ids(two).includes('because-builder'));
  const three = [...two, { code, type: 'certainty', device: 'Fair coin', reason: 'because two sides' }];
  assert.ok(ids(three).includes('because-builder'));
});

test('"because" must be a real explanation, not one short word', () => {
  assert.equal(explains('because'), false);
  assert.equal(explains('I like it a lot'), false);
  assert.equal(explains('Because most kids said 9'), true);
  assert.equal(explains('it is fair so it is 50-50'), true);
});

test('Evidence Expert needs a claim with proof AND a reason for how sure', () => {
  const ids = (log) => checkBadges(log, code);
  const card = { code, type: 'claim', scenarioId: 's', because: 'most said 9', certaintyReason: 'many kids' };
  assert.ok(!ids([{ ...card, evidence: [] }]).includes('claim'));
  assert.ok(!ids([{ ...card, certaintyReason: '', evidence: ['Mean: 8.4'] }]).includes('claim'));
  assert.ok(ids([{ ...card, evidence: ['Mean: 8.4'] }]).includes('claim'));
});

test('the backpack lists every patch, earned or not', () => {
  const shelf = backpack([{ code, type: 'prediction' }], code);
  assert.equal(shelf.length, 12);
  assert.deepEqual(shelf.filter((b) => b.earned).map((b) => b.id), ['brave-guesser']);
});

test('hints, page views and seeing the data alone never earn a patch', () => {
  const log = ['hint', 'data-seen', 'popup-seen', 'recap-viewed', 'phase-start'].map((type) => ({ code, type }));
  assert.deepEqual(checkBadges(log, code), []);
});
