import { getExplorerCode, getDonePhases, getPreviewAll } from './storage/save.js';
import { countBadges, counterHTML, setupCelebrations } from './celebrate.js';
import { setupInfoButton } from './phase-intro.js';
import { guardPage, enterPhase } from './phase-progress.js';
import { visibleSteps, isStepDone, isUnlocked } from './helpers/progress.js';
import { pipReacts } from './motion.js';

const STEPS = [
  { id: 'ask', label: 'Ask', icon: '❓', color: 'ask', href: 'question-studio.html' },
  { id: 'plan', label: 'Plan', icon: '🗺️', color: 'plan', href: 'question-studio.html' },
  { id: 'collect', label: 'Collect', icon: '📋', color: 'collect', href: 'data-hub.html' },
  { id: 'explore', label: 'Explore', icon: '📊', color: 'explore', href: 'graph-lab.html' },
  { id: 'conclude', label: 'Conclude', icon: '🚩', color: 'conclude', href: 'evidence-board.html' },
];

// The ids are the same as the phase ids in helpers/progress.js.
const EXPLORE_ROOMS = [
  { id: 'graph', label: '📊 Graph Lab', href: 'graph-lab.html' },
  { id: 'number', label: '🔢 Number Lab', href: 'number-lab.html' },
  { id: 'chance', label: '🎲 Chance Lab', href: 'chance-lab.html' },
];

const LOCKED_MESSAGE = "🔒 That room is still locked. Finish this step first, then it opens!";

let currentStep = null;
let currentExplorePage = null;

// `phase` is this page's phase (see helpers/progress.js), e.g. 'collect' or
// 'graph'. It drives the route guard, the phase-start log and the intro pop-up.
export function mountShell({ step, accent, pipMessage, contentHTML, explorePage, phase }) {
  const root = document.getElementById('shell');
  currentStep = step;
  currentExplorePage = explorePage;

  // Sent here from a locked room? Pip explains, and the address is tidied up.
  const params = new URLSearchParams(location.search);
  if (params.has('locked')) {
    pipMessage = LOCKED_MESSAGE;
    history.replaceState(null, '', location.pathname);
  }

  root.innerHTML = `
    <header class="shell-header">
      <a class="logo" href="../index.html">🔎 <span>DataScope</span></a>
      <nav class="step-bar" aria-label="Investigation steps">${stepBarHTML()}</nav>
      <button class="btn info-btn" id="info-btn" type="button">ℹ️ What to do</button>
    </header>
    ${getPreviewAll() ? '<p class="preview-banner">👀 Teacher preview: all rooms are open on this device</p>' : ''}
    <div class="shell-body">
      <aside class="sidebar">
        <div class="speech-bubble">${pipMessage}</div>
        <div class="pip-mascot" aria-hidden="true">🦉</div>
        <button class="btn badge-counter" id="badge-counter" type="button" aria-live="polite">${counterHTML(countBadges())}</button>
        ${codeBadge()}
        <button class="btn sound-toggle" id="sound-toggle" type="button" aria-pressed="false">🔇 Sound: off</button>
      </aside>
      <main class="room-content" style="--accent: var(--color-${accent})">
        ${step === 'explore' ? `<nav class="explore-subnav" aria-label="Explore rooms">${exploreTabsHTML()}</nav>` : ''}
        ${contentHTML}
      </main>
    </div>
  `;

  // A locked room: hide it and go to the furthest open room instead.
  if (phase && guardPage(phase)) {
    root.hidden = true;
    return;
  }

  // Screen readers read out new feedback ("Correct!", hints...) without the
  // child having to look for it. Done here once for every room.
  root.querySelectorAll('.feedback').forEach((el) => el.setAttribute('aria-live', 'polite'));

  setupCelebrations();
  setupInfoButton();
  window.addEventListener('datascope:phase-done', showUnlocked);
  if (phase) enterPhase(phase);
}

// Only the open steps are shown (Prof's comment 2). Done steps get a ✅ and
// stay clickable, so a child can go back and look. `newStep` slides in.
function stepBarHTML(newStep = null) {
  const done = getDonePhases();
  const shown = getPreviewAll() ? STEPS : STEPS.filter((s) => visibleSteps(done).includes(s.id));

  return shown.map((s, i) => {
    const isCurrent = s.id === currentStep;
    const isNew = s.id === newStep;
    const connector = i > 0 ? `<span class="connector${isNew ? ' connector-new' : ''}"></span>` : '';
    const doneMark = isStepDone(s.id, done)
      ? '<span class="step-done" aria-hidden="true">✅</span><span class="sr-only"> (done)</span>'
      : '';
    return `
      ${connector}
      <a class="step${isCurrent ? ' current' : ''}${isNew ? ' step-new' : ''}"${isCurrent ? ' aria-current="step"' : ''} data-step="${s.id}" href="${s.href}" style="--step-color: var(--color-${s.color})">
        <span class="step-icon">${s.icon}</span>
        <span class="step-label">${s.label}${doneMark}</span>
      </a>
    `;
  }).join('');
}

// The Explore rooms open one after another; only the open ones are shown.
function exploreTabsHTML(newTab = null) {
  const done = getDonePhases();
  return EXPLORE_ROOMS
    .filter((r) => getPreviewAll() || isUnlocked(r.id, done))
    .map((r) => {
      const isActive = r.id === currentExplorePage;
      const doneMark = done.includes(r.id) ? ' ✅' : '';
      return `<a class="explore-tab${isActive ? ' active' : ''}${r.id === newTab ? ' step-new' : ''}"${isActive ? ' aria-current="page"' : ''} href="${r.href}">${r.label}${doneMark}</a>`;
    })
    .join('');
}

// A phase was just finished: redraw the bar so the new step (or Explore
// room) slides in, and Pip announces it.
function showUnlocked() {
  const bar = document.querySelector('.step-bar');
  const before = [...bar.querySelectorAll('.step')].map((link) => link.dataset.step);
  const newStep = visibleSteps(getDonePhases()).find((id) => !before.includes(id)) || null;
  bar.innerHTML = stepBarHTML(newStep);

  const subnav = document.querySelector('.explore-subnav');
  let newTab = null;
  if (subnav) {
    const tabsBefore = subnav.querySelectorAll('.explore-tab').length;
    const open = EXPLORE_ROOMS.filter((r) => isUnlocked(r.id, getDonePhases()));
    if (open.length > tabsBefore) newTab = open[open.length - 1];
    subnav.innerHTML = exploreTabsHTML(newTab && newTab.id);
  }

  const opened = newStep ? STEPS.find((s) => s.id === newStep) : null;
  const name = opened ? `${opened.icon} ${opened.label}` : newTab && newTab.label;
  if (name) {
    document.querySelector('.speech-bubble').textContent = `🔓 Hoo-hoo! You unlocked ${name}!`;
    pipReacts('hop');
  }
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
  currentStep = stepId;
  document.querySelectorAll('.step-bar .step').forEach((link) => {
    const isCurrent = link.dataset.step === stepId;
    link.classList.toggle('current', isCurrent);
    // Screen readers say "current step" for the highlighted one.
    if (isCurrent) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
  });
}

// Puts a button on the same row as the room's title (e.g. "📘 Maths recap"),
// so it never crowds the task text underneath.
export function addTitleButton(button) {
  const title = document.querySelector('.room-title');
  let row = title.parentElement;
  if (!row.classList.contains('room-title-row')) {
    row = document.createElement('div');
    row.className = 'room-title-row';
    title.before(row);
    row.append(title);
  }
  row.append(button);
}
