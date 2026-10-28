import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  unlockedPhases, isUnlocked, furthestPhase, visibleSteps, isStepDone, guardRedirect, finishedScenarios,
} from '../js/helpers/progress.js';
import { makeEntry, logEvent, readLog } from '../js/helpers/log.js';
import {
  setExplorerCode, setSelectedScenarioId, getDonePhases, markPhaseDone, clearChildData,
  getPreviewAll, setPreviewAll, startNewInvestigation, getSelectedScenarioId,
} from '../js/storage/save.js';

test('a fresh child sees only Ask', () => {
  assert.deepEqual(unlockedPhases([]), ['ask']);
  assert.deepEqual(visibleSteps([]), ['ask']);
});

test('finishing a phase opens the next one, one at a time', () => {
  assert.deepEqual(unlockedPhases(['ask']), ['ask', 'plan']);
  assert.deepEqual(unlockedPhases(['ask', 'plan', 'collect']), ['ask', 'plan', 'collect', 'graph']);
  assert.equal(isUnlocked('number', ['ask', 'plan', 'collect']), false);
});

test('Explore rooms open in order: Graph Lab, Number Lab, Chance Lab', () => {
  const done = ['ask', 'plan', 'collect', 'graph'];
  assert.equal(isUnlocked('number', done), true);
  assert.equal(isUnlocked('chance', done), false);
  assert.equal(furthestPhase(done), 'number');
});

test('Conclude appears only after all three Explore rooms', () => {
  const done = ['ask', 'plan', 'collect', 'graph', 'number'];
  assert.equal(isUnlocked('conclude', done), false);
  assert.deepEqual(visibleSteps([...done, 'chance']), ['ask', 'plan', 'collect', 'explore', 'conclude']);
});

test('the Explore step is done only when all three rooms are done', () => {
  assert.equal(isStepDone('explore', ['graph', 'number']), false);
  assert.equal(isStepDone('explore', ['graph', 'number', 'chance']), true);
  assert.equal(isStepDone('ask', ['ask']), true);
});

test('a skipped phase keeps later ones locked (the chain must be complete)', () => {
  assert.deepEqual(unlockedPhases(['ask', 'collect']), ['ask', 'plan']);
});

test('route guard: open rooms load, locked rooms send you to the furthest open room', () => {
  assert.equal(guardRedirect('ask', []), null);
  assert.equal(guardRedirect('graph', ['ask']), 'question-studio.html');
  assert.equal(guardRedirect('chance', ['ask', 'plan', 'collect']), 'graph-lab.html');
  assert.equal(guardRedirect('collect', ['ask', 'plan']), null);
});

test('route guard: the teacher preview switch opens every room', () => {
  assert.equal(guardRedirect('conclude', [], true), null);
});

test('progress is saved per child AND per scenario', () => {
  clearChildData();
  setExplorerCode('OWL-07');
  setSelectedScenarioId('sleep-hours');
  assert.equal(markPhaseDone('ask'), true);
  assert.equal(markPhaseDone('ask'), false); // already done: nothing new
  assert.deepEqual(getDonePhases(), ['ask']);

  setSelectedScenarioId('shoe-sizes'); // a new investigation starts at Ask
  assert.deepEqual(getDonePhases(), []);
  setSelectedScenarioId('sleep-hours'); // switching back keeps the old progress
  assert.deepEqual(getDonePhases(), ['ask']);

  setExplorerCode('FOX-12'); // another child on the same device
  assert.deepEqual(getDonePhases(), []);
});

test('clearing the device removes progress, but keeps the teacher preview switch', () => {
  setExplorerCode('OWL-07');
  markPhaseDone('ask');
  setPreviewAll(true);
  clearChildData();
  setExplorerCode('OWL-07');
  assert.deepEqual(getDonePhases(), []);
  assert.equal(getPreviewAll(), true);
  setPreviewAll(false);
});

test('phase-start and phase-complete are known log events', () => {
  assert.equal(makeEntry('OWL-07', 'shell', 'phase-start', { phase: 'ask' }).type, 'phase-start');
  assert.equal(makeEntry('OWL-07', 'shell', 'phase-complete', { phase: 'ask' }).type, 'phase-complete');
});

test('a new investigation starts the trail at Ask again, but keeps the log', () => {
  clearChildData();
  setExplorerCode('OWL-07');
  setSelectedScenarioId('shoe-sizes');
  markPhaseDone('ask');
  markPhaseDone('plan');
  logEvent('question-studio', 'prediction', { guess: 35 });
  startNewInvestigation();
  assert.deepEqual(getDonePhases(), []); // the trail shows only Ask
  assert.deepEqual(getDonePhases('shoe-sizes'), []);
  assert.equal(getSelectedScenarioId(), 'sleep-hours'); // back to the default: the child picks again
  assert.equal(readLog().length, 1); // the reasoning log is untouched
});

test('a question counts as done before only when this child finished Conclude for it', () => {
  const log = [
    { code: 'OWL-07', type: 'phase-complete', phase: 'conclude', scenarioId: 'sleep-hours' },
    { code: 'OWL-07', type: 'phase-complete', phase: 'collect', scenarioId: 'shoe-sizes' }, // not finished
    { code: 'FOX-12', type: 'phase-complete', phase: 'conclude', scenarioId: 'playground-game' }, // another child
  ];
  assert.deepEqual([...finishedScenarios(log, 'OWL-07')], ['sleep-hours']);
});
