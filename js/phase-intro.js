// Shell layer: the "what happens here" pop-up at the start of each phase (Part 14).
// It opens by itself the first time a child reaches a phase; the ℹ️ button
// in the header opens it again at any time. Texts: data/content/phases.json.
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { hasSeenIntro, markIntroSeen } from './storage/save.js';

let phasesPromise = null;
let currentPhase = null;

// Loaded once per page, then reused.
function loadPhases() {
  if (!phasesPromise) phasesPromise = fetch('../data/content/phases.json').then((r) => r.json());
  return phasesPromise;
}

async function showPhaseIntro(phase, auto) {
  const intro = (await loadPhases())[phase];
  if (!intro) return;

  const list = document.createElement('ul');
  list.className = 'intro-list';
  for (const bullet of intro.bullets) {
    const item = document.createElement('li');
    item.textContent = bullet;
    list.append(item);
  }

  logEvent('shell', 'popup-seen', { phase, auto });
  await openModal({
    icon: intro.icon,
    title: intro.title,
    accent: intro.accent,
    body: list,
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
  showPhaseIntro(phase, true);
}

// The ℹ️ button always shows the intro of the phase the child is in now.
export function setupInfoButton() {
  const button = document.getElementById('info-btn');
  if (button) button.addEventListener('click', () => showPhaseIntro(currentPhase, false));
}
