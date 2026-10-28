// Shell layer: the "what happens here" pop-up at the start of each phase (Part 14).
// It opens by itself the first time a child reaches a phase; the ℹ️ button
// in the header opens it again at any time. Texts: data/content/phases.json.
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { hasSeenIntro, markIntroSeen } from './storage/save.js';
import { STEP_OF_PHASE } from './helpers/progress.js';

const STEP_ORDER = ['ask', 'plan', 'collect', 'explore', 'conclude'];

let phasesPromise = null;
let currentPhase = null;
// Resolves when the intro that opened by itself is closed (or straight away
// if none opened), so another pop-up can wait its turn (e.g. the maths recap).
let autoIntroClosed = Promise.resolve();

// Loaded once per page, then reused.
function loadPhases() {
  if (!phasesPromise) phasesPromise = fetch('../data/content/phases.json').then((r) => r.json());
  return phasesPromise;
}

async function showPhaseIntro(phase, auto) {
  const intro = (await loadPhases())[phase];
  if (!intro) return;

  // "Step 3 of 5", then the bullets rise in one after another (UI guide f2).
  const body = document.createElement('div');
  const where = document.createElement('p');
  where.className = 'intro-step';
  where.textContent = `Step ${STEP_ORDER.indexOf(STEP_OF_PHASE[phase]) + 1} of ${STEP_ORDER.length}`;
  const list = document.createElement('ul');
  list.className = 'intro-list';
  intro.bullets.forEach((bullet, i) => {
    const item = document.createElement('li');
    item.textContent = bullet;
    item.className = 'm-rise';
    item.style.setProperty('--i', i + 2);
    list.append(item);
  });
  body.append(where, list);
  if (auto) {
    const again = document.createElement('p');
    again.className = 'intro-again';
    again.textContent = 'Tap the (i) button any time to see this again.';
    body.append(again);
  }

  logEvent('shell', 'popup-seen', { phase, auto });
  await openModal({
    icon: intro.icon,
    title: intro.title,
    accent: intro.accent,
    body,
    buttons: [{ label: "Let's go! →", value: 'go', main: true }],
  });
}

// Tells the shell which phase the child is in now. Shows its intro if this
// child has never seen it. "Seen" is saved straight away (before the texts
// load), so two quick calls can never open the same intro twice.
export function setIntroPhase(phase) {
  currentPhase = phase;
  if (hasSeenIntro(phase)) return;
  markIntroSeen(phase);
  autoIntroClosed = showPhaseIntro(phase, true);
}

export function whenIntroClosed() {
  return autoIntroClosed;
}

// The ℹ️ button always shows the intro of the phase the child is in now.
export function setupInfoButton() {
  const button = document.getElementById('info-btn');
  if (button) button.addEventListener('click', () => showPhaseIntro(currentPhase, false));
}
