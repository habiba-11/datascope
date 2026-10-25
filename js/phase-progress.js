// Shell layer: follows the child through the phases (Parts 15 and 16).
// The rules are in helpers/progress.js; this file saves, logs and tells the page.
import { logEvent } from './helpers/log.js';
import { guardRedirect, journeyRedirect } from './helpers/progress.js';
import { buildPhaseFeedback } from './helpers/feedback.js';
import { getDonePhases, markPhaseDone, getPreviewAll, getSelectedScenarioId } from './storage/save.js';
import { setIntroPhase } from './phase-intro.js';
import { showFeedbackCard } from './feedback-card.js';

// If this page's phase is still locked, sends the child to the furthest open
// room (which shows a friendly Pip line). Returns true when it does.
export function guardPage(phase) {
  const target = guardRedirect(phase, getDonePhases(), getPreviewAll());
  if (!target) return false;
  location.replace(`${target}?locked=1`);
  return true;
}

// "My journey" opens only after Conclude. Returns true when it sends the child away.
export function guardJourney() {
  const target = journeyRedirect(getDonePhases(), getPreviewAll());
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

// The child finished this phase. The first time only: save it (straight away,
// so a reload can't lose it), log it, show the feedback card, and when the
// child taps "Unlock next phase", tell the shell to show the newly opened step.
// `facts` describe what the child did (see helpers/feedback.js).
export async function finishPhase(phase, facts = {}) {
  if (!markPhaseDone(phase)) return; // done before: nothing new happens
  const card = buildPhaseFeedback(phase, facts);
  if (!getPreviewAll()) {
    const scenarioId = getSelectedScenarioId();
    logEvent('shell', 'phase-complete', { phase, scenarioId });
    logEvent('shell', 'phase-feedback', { phase, scenarioId, stars: card.stars });
  }
  await showFeedbackCard(phase, card);
  window.dispatchEvent(new CustomEvent('datascope:phase-done', { detail: { phase } }));
}
