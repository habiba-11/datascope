// Shell layer: follows the child through the phases (Parts 15 and 16).
// The rules are in helpers/progress.js; this file saves, logs and tells the page.
import { logEvent } from './helpers/log.js';
import { guardRedirect, journeyRedirect } from './helpers/progress.js';
import { buildPhaseFeedback } from './helpers/feedback.js';
import { getDonePhases, markPhaseDone, getPreviewAll, getSelectedScenarioId } from './storage/save.js';
import { setIntroPhase } from './phase-intro.js';
import { showFeedbackCard } from './feedback-card.js';
import { pauseNextModal } from './modal.js';

// How long the unlock animation (motion.js unlockStep) takes to be seen.
const UNLOCK_SHOW_MS = 1800;

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

// Phase events made while the teacher preview is on are marked, so the
// teacher dashboard can tell them apart. They are still logged: My journey
// needs them to show "Done" and the stars (bug found by Habiba, 26 Oct 2026).
function phaseDetails(phase) {
  const details = { phase, scenarioId: getSelectedScenarioId() };
  if (getPreviewAll()) details.preview = true;
  return details;
}

// The child is now in this phase: log the start (only while it is not done
// yet) and show its intro pop-up the first time.
export function enterPhase(phase) {
  if (phase === lastPhase) return;
  lastPhase = phase;
  if (!isPhaseDone(phase)) logEvent('shell', 'phase-start', phaseDetails(phase));
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
  logEvent('shell', 'phase-complete', phaseDetails(phase));
  logEvent('shell', 'phase-feedback', { ...phaseDetails(phase), stars: card.stars });
  // The next pop-up (e.g. the Plan intro) waits until the unlock has been seen.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pauseNextModal(reduceMotion ? 0 : UNLOCK_SHOW_MS);
  await showFeedbackCard(phase, card);
  window.dispatchEvent(new CustomEvent('datascope:phase-done', { detail: { phase } }));
}
