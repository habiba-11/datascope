const STEPS = [
  { id: 'ask', label: 'Ask', icon: '❓', color: 'ask', href: 'question-studio.html' },
  { id: 'plan', label: 'Plan', icon: '🗺️', color: 'plan', href: 'question-studio.html' },
  { id: 'collect', label: 'Collect', icon: '📋', color: 'collect', href: 'data-hub.html' },
  { id: 'explore', label: 'Explore', icon: '📊', color: 'explore', href: 'graph-lab.html' },
  { id: 'conclude', label: 'Conclude', icon: '🚩', color: 'conclude', href: 'evidence-board.html' },
];

export function mountShell({ step, accent, pipMessage, contentHTML, badgeCount = 0 }) {
  const root = document.getElementById('shell');

  const stepBar = STEPS.map((s, i) => {
    const current = s.id === step ? ' current' : '';
    const connector = i < STEPS.length - 1 ? '<span class="connector"></span>' : '';
    return `
      <a class="step${current}" href="${s.href}" style="--step-color: var(--color-${s.color})">
        <span class="step-icon">${s.icon}</span>
        <span class="step-label">${s.label}</span>
      </a>
      ${connector}
    `;
  }).join('');

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
        ${contentHTML}
      </main>
    </div>
  `;
}
