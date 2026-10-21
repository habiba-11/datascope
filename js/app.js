import { getExplorerCode } from './storage/save.js';
import { countBadges, setupCelebrations } from './celebrate.js';

const STEPS = [
  { id: 'ask', label: 'Ask', icon: '❓', color: 'ask', href: 'question-studio.html' },
  { id: 'plan', label: 'Plan', icon: '🗺️', color: 'plan', href: 'question-studio.html' },
  { id: 'collect', label: 'Collect', icon: '📋', color: 'collect', href: 'data-hub.html' },
  { id: 'explore', label: 'Explore', icon: '📊', color: 'explore', href: 'graph-lab.html' },
  { id: 'conclude', label: 'Conclude', icon: '🚩', color: 'conclude', href: 'evidence-board.html' },
];

const EXPLORE_ROOMS = [
  { id: 'graph', label: '📊 Graph Lab', href: 'graph-lab.html' },
  { id: 'number', label: '🔢 Number Lab', href: 'number-lab.html' },
  { id: 'chance', label: '🎲 Chance Lab', href: 'chance-lab.html' },
];

export function mountShell({ step, accent, pipMessage, contentHTML, explorePage }) {
  const root = document.getElementById('shell');

  const stepBar = STEPS.map((s, i) => {
    const current = s.id === step ? ' current' : '';
    const ariaCurrent = s.id === step ? ' aria-current="step"' : '';
    const connector = i < STEPS.length - 1 ? '<span class="connector"></span>' : '';
    return `
      <a class="step${current}"${ariaCurrent} data-step="${s.id}" href="${s.href}" style="--step-color: var(--color-${s.color})">
        <span class="step-icon">${s.icon}</span>
        <span class="step-label">${s.label}</span>
      </a>
      ${connector}
    `;
  }).join('');

  const exploreSubnav = step === 'explore'
    ? `
      <nav class="explore-subnav" aria-label="Explore rooms">
        ${EXPLORE_ROOMS.map((r) => {
          const isActive = r.id === explorePage;
          return `
            <a class="explore-tab${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''} href="${r.href}">${r.label}</a>
          `;
        }).join('')}
      </nav>
    `
    : '';

  root.innerHTML = `
    <header class="shell-header">
      <a class="logo" href="../index.html">🔎 <span>DataScope</span></a>
      <nav class="step-bar" aria-label="Investigation steps">${stepBar}</nav>
    </header>
    <div class="shell-body">
      <aside class="sidebar">
        <div class="speech-bubble">${pipMessage}</div>
        <div class="pip-mascot" aria-hidden="true">🦉</div>
        <div class="badge-counter" id="badge-counter" aria-live="polite">⭐ Explorer badges: ${countBadges()}</div>
        ${codeBadge()}
        <button class="btn sound-toggle" id="sound-toggle" type="button" aria-pressed="false">🔇 Sound: off</button>
      </aside>
      <main class="room-content" style="--accent: var(--color-${accent})">
        ${exploreSubnav}
        ${contentHTML}
      </main>
    </div>
  `;

  // Screen readers read out new feedback ("Correct!", hints...) without the
  // child having to look for it. Done here once for every room.
  root.querySelectorAll('.feedback').forEach((el) => el.setAttribute('aria-live', 'polite'));

  setupCelebrations();
}

// Shows whose work this is (by code only). Without a code, the work can't be
// matched to a child later, so we point them back to the start page.
function codeBadge() {
  const code = getExplorerCode();
  return code
    ? `<div class="code-badge">🔑 ${code}</div>`
    : '<a class="code-badge missing" href="../index.html">🔑 No code yet: tap here</a>';
}

// Moves the step-bar highlight without rebuilding the shell.
// Used by Question Studio, where one room covers two steps (Ask, then Plan).
export function setCurrentStep(stepId) {
  document.querySelectorAll('.step-bar .step').forEach((link) => {
    const isCurrent = link.dataset.step === stepId;
    link.classList.toggle('current', isCurrent);
    // Screen readers say "current step" for the highlighted one.
    if (isCurrent) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
  });
}
