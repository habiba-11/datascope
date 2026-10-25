// Shell layer: follows the child through the phases (Part 15).
// The rules are in helpers/progress.js; this file saves, logs and tells the page.
import { logEvent } from './helpers/log.js';
import { guardRedirect } from './helpers/progress.js';
import { getDonePhases, markPhaseDone, getPreviewAll, getSelectedScenarioId } from './storage/save.js';
import { setIntroPhase } from './phase-intro.js';

// If this page's phase is still locked, sends the child to the furthest open
// room (which shows a friendly Pip line). Returns true when it does.
export function guardPage(phase) {
  const target = guardRedirect(phase, getDonePhases(), getPreviewAll());
  if (!target) return false;
  location.replace(`${target}?locked=1`);
  return true;
}

let lastPhase = null;

// The child is now in this phase: log the start (only while it is not done
// yet) and show its intro pop-up the first time.
// In teacher preview, phase events are not logged (they are not a child's work).
export function enterPhase(phase) {
  if (phase === lastPhase) return;
  lastPhase = phase;
  if (!getPreviewAll() && !isPhaseDone(phase)) {
    logEvent('shell', 'phase-start', { phase, scenarioId: getSelectedScenarioId() });
  }
  setIntroPhase(phase);
}

export function isPhaseDone(phase) {
  return getDonePhases().includes(phase);
}

// The child finished this phase: save it, log it once, and tell the shell
// so the step bar can show the newly opened step.
export function completePhase(phase) {
  if (!markPhaseDone(phase)) return; // done before: nothing new happens
  if (!getPreviewAll()) {
    logEvent('shell', 'phase-complete', { phase, scenarioId: getSelectedScenarioId() });
  }
  window.dispatchEvent(new CustomEvent('datascope:phase-done', { detail: { phase } }));
}
