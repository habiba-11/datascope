import { getExplorerCode, getDonePhases, getPreviewAll } from './storage/save.js';
import { countBadges, counterHTML, backpackLabel, setupCelebrations } from './celebrate.js';
import { setupInfoButton } from './phase-intro.js';
import { guardPage, enterPhase } from './phase-progress.js';
import { visibleSteps, isStepDone, isUnlocked, hasMoreSteps } from './helpers/progress.js';
import { pipReacts, enterRoom, float, unlockStep, confetti } from './motion.js';
import { pipSVG, pipSay } from './pip.js';
import { lineIcon, LOGO_SVG } from './icons.js';
import { watchPressedState } from './pressed-state.js';
import { startSync, STATUS_TEXT } from './storage/sync.js';
import { backendReady } from './config.js';

// `icon` is a line icon from icons.js (step bar); `emoji` is used in Pip's words.
const STEPS = [
  { id: 'ask', label: 'Ask', icon: 'question', emoji: '❓', color: 'ask', href: 'question-studio.html' },
  { id: 'plan', label: 'Plan', icon: 'map', emoji: '🗺️', color: 'plan', href: 'question-studio.html' },
  { id: 'collect', label: 'Collect', icon: 'clipboard', emoji: '📋', color: 'collect', href: 'data-hub.html' },
  { id: 'explore', label: 'Explore', icon: 'bars', emoji: '📊', color: 'explore', href: 'graph-lab.html' },
  { id: 'conclude', label: 'Conclude', icon: 'flag', emoji: '🚩', color: 'conclude', href: 'evidence-board.html' },
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
// `layout`: 'card' = the 3-zone layout of the UI guide (top bar, ONE task card,
// action bar; Pip lives in the card). Rooms move to it one at a time; the
// others keep the 'sidebar' layout until then.
export function mountShell({ step, accent, pipMessage, contentHTML, explorePage, phase, layout = 'sidebar' }) {
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
      <a class="logo" href="../index.html">${LOGO_SVG}<span>Data<span class="logo-accent">Scope</span></span></a>
      <nav class="step-bar" aria-label="Investigation steps">${stepBarHTML()}</nav>
      <div class="header-actions">
        <span class="room-tools" id="room-tools"></span>
        <button class="btn icon-btn info-btn" id="info-btn" type="button" aria-label="What to do" title="What to do">${lineIcon('info', 28, 2.6)}</button>
        <button class="btn icon-btn badge-counter" id="badge-counter" type="button" aria-label="${backpackLabel(countBadges())}">${counterHTML(countBadges())}</button>
      </div>
    </header>
    ${getPreviewAll() ? '<p class="preview-banner">👀 Teacher preview: all rooms are open on this device</p>' : ''}
    ${layout === 'card' ? cardBodyHTML(accent, contentHTML) : `<div class="shell-body">
      <aside class="sidebar">
        <div class="speech-bubble" data-pip-text>${pipMessage}</div>
        <div class="pip-mascot">${pipSVG()}</div>
        ${codeBadge()}
        <button class="btn sound-toggle" id="sound-toggle" type="button" aria-pressed="false">🔇 Sound: off</button>
        ${backendReady() ? '<p class="sync-status" id="sync-status" role="status"></p>' : ''}
      </aside>
      <main class="room-content" style="--accent: var(--color-${accent})">
        ${step === 'explore' ? `<nav class="explore-subnav" aria-label="Explore rooms">${exploreTabsHTML()}</nav>` : ''}
        ${contentHTML}
      </main>
    </div>`}
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
  watchPressedState();
  // Part 22: send the log to the online database (only when it is switched on).
  startSync((status) => {
    const label = document.getElementById('sync-status');
    if (!label) return;
    label.textContent = STATUS_TEXT[status];
    label.dataset.status = status;
  });
  if (layout !== 'card') {
    enterRoom(root.querySelector('.room-content'));
    float(root.querySelector('.pip-mascot .pip'));
  }
  // Looping motions rest while the tab is hidden (css/motion.css).
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });
  window.addEventListener('datascope:phase-done', showUnlocked);
  if (phase) enterPhase(phase);
}

// The trail (Part 15 + UI guide). Only the open steps are shown (Prof's
// comment 2), then ONE locked "More soon" stop. Done steps are green with a ✓
// and stay clickable, so a child can go back and look. The current step has a
// breathing ring. `newStep` springs in (motion.js unlockStep).
function stepBarHTML(newStep = null) {
  const done = getDonePhases();
  const shown = getPreviewAll() ? STEPS : STEPS.filter((s) => visibleSteps(done).includes(s.id));

  const stops = shown.map((s, i) => {
    const isCurrent = s.id === currentStep;
    const isNew = s.id === newStep;
    const isDone = isStepDone(s.id, done);
    const connector = i > 0
      ? `<span class="connector${isDone || isCurrent ? ' connector--done' : ''}${isNew ? ' connector-new' : ''}"></span>`
      : '';
    return `
      ${connector}
      <a class="step${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}${isNew ? ' step-new' : ''}"${isCurrent ? ' aria-current="step"' : ''} data-step="${s.id}" href="${s.href}" style="--step-color: var(--color-${s.color})">
        <span class="step-icon${isCurrent ? ' m-ring' : ''}" style="--ring-colour: var(--color-${s.color})">${isDone && !isCurrent ? '<span class="step-check" aria-hidden="true">✓</span>' : lineIcon(s.icon)}</span>
        <span class="step-label">${s.label}${isDone ? '<span class="sr-only"> (done)</span>' : ''}</span>
      </a>
    `;
  });

  if (hasMoreSteps(done, getPreviewAll())) {
    stops.push(`
      <span class="connector connector--soon"></span>
      <span class="step step--soon">
        <span class="step-icon">${lineIcon('lock', 20)}</span>
        <span class="step-label">More soon<span class="sr-only"> (locked)</span></span>
      </span>`);
  }
  return stops.join('');
}

// Zone 2 and zone 3 of the card layout: the room's task card, the action bar
// (filled by the room with setupActionBar), and a quiet status line with the
// child's code, the sound switch and the online status.
function cardBodyHTML(accent, contentHTML) {
  return `
    <main class="room-content card-layout" style="--accent: var(--color-${accent})">${contentHTML}</main>
    <nav class="action-bar" id="action-bar" aria-label="What to do next"></nav>
    <footer class="status-line">
      ${codeBadge()}
      <button class="btn btn-quiet sound-toggle" id="sound-toggle" type="button" aria-pressed="false">🔇 Sound: off</button>
      ${backendReady() ? '<p class="sync-status" id="sync-status" role="status"></p>' : ''}
    </footer>`;
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
  const name = opened ? `${opened.emoji} ${opened.label}` : newTab && newTab.label;
  if (name) {
    pipSay(`🔓 Hoo-hoo! You unlocked ${name}!`);
    pipReacts('hop');
    unlockStep(document.querySelector('.step-bar .step-new, .explore-subnav .step-new'));
    confetti(); // a phase is finished: a big moment
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
    link.querySelector('.step-icon').classList.toggle('m-ring', isCurrent);
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
