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

export function mountShell({ step, accent, pipMessage, contentHTML, badgeCount = 0, explorePage }) {
  const root = document.getElementById('shell');

  const stepBar = STEPS.map((s, i) => {
    const current = s.id === step ? ' current' : '';
    const connector = i < STEPS.length - 1 ? '<span class="connector"></span>' : '';
    return `
      <a class="step${current}" data-step="${s.id}" href="${s.href}" style="--step-color: var(--color-${s.color})">
        <span class="step-icon">${s.icon}</span>
        <span class="step-label">${s.label}</span>
      </a>
      ${connector}
    `;
  }).join('');

  const exploreSubnav = step === 'explore'
    ? `
      <nav class="explore-subnav" aria-label="Explore rooms">
        ${EXPLORE_ROOMS.map((r) => `
          <a class="explore-tab${r.id === explorePage ? ' active' : ''}" href="${r.href}">${r.label}</a>
        `).join('')}
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
        <div class="badge-counter">⭐ Explorer badges: ${badgeCount}</div>
      </aside>
      <main class="room-content" style="--accent: var(--color-${accent})">
        ${exploreSubnav}
        ${contentHTML}
      </main>
    </div>
  `;
}

// Moves the step-bar highlight without rebuilding the shell.
// Used by Question Studio, where one room covers two steps (Ask, then Plan).
export function setCurrentStep(stepId) {
  document.querySelectorAll('.step-bar .step').forEach((link) => {
    link.classList.toggle('current', link.dataset.step === stepId);
  });
}
