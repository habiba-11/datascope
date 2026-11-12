import { getDonePhases, getPreviewAll } from './storage/save.js';
import { countBadges, counterHTML, backpackLabel, setupCelebrations } from './celebrate.js';
import { setupAboutTab } from './phase-intro.js';
import { guardPage, enterPhase } from './phase-progress.js';
import { visibleSteps, isStepDone, isUnlocked, hasMoreSteps } from './helpers/progress.js';
import { pipReacts, unlockStep, confetti } from './motion.js';
import { pipSay } from './pip.js';
import { lineIcon, LOGO_SVG } from './icons.js';
import { watchPressedState } from './pressed-state.js';
import { startSync } from './storage/sync.js';
import { setupExitButton } from './exit-button.js';
import { mountSky } from './ambient.js';
import { mountScene } from './scenes/index.js';
import { mountPipStand } from './pip-stand.js';
import { startHelperPointers } from './helper-pointer.js';
import { setupMusic } from './music.js';
import { playSound } from './sounds.js';
import { iconHTML } from './icon-text.js';
import { settingsMenuHTML, setupSettingsMenu, showSyncStatus } from './settings-menu.js';

// `icon` is a line icon from icons.js (step bar).
const STEPS = [
  { id: 'ask', label: 'Ask', icon: 'question', color: 'ask', href: 'question-studio.html' },
  { id: 'plan', label: 'Plan', icon: 'map', color: 'plan', href: 'question-studio.html' },
  { id: 'collect', label: 'Collect', icon: 'clipboard', color: 'collect', href: 'data-hub.html' },
  { id: 'explore', label: 'Explore', icon: 'bars', color: 'explore', href: 'graph-lab.html' },
  { id: 'conclude', label: 'Conclude', icon: 'flag', color: 'conclude', href: 'evidence-board.html' },
];

// The ids are the same as the phase ids in helpers/progress.js.
const EXPLORE_ROOMS = [
// `icon`: an illustration (js/illustrations.js) before the name (Part 54b).
  { id: 'graph', icon: 'chart', label: 'Graph Lab', href: 'graph-lab.html' },
  { id: 'number', icon: 'numbers', label: 'Number Lab', href: 'number-lab.html' },
  { id: 'chance', icon: 'die', label: 'Chance Lab', href: 'chance-lab.html' },
];

const LOCKED_MESSAGE = 'That room is still locked. Finish this step first, then it opens!';

let currentStep = null;
let currentExplorePage = null;

// `phase` is this page's phase (see helpers/progress.js), e.g. 'collect' or
// 'graph'. It drives the route guard, the phase-start log and the intro pop-up.
// Every room has the 3-zone layout of the UI guide: the top bar, ONE task card,
// the action bar. (The old "sidebar" layout was removed on 12 Nov 2026.)
export function mountShell({ step, accent, contentHTML, explorePage, phase }) {
  const root = document.getElementById('shell');
  currentStep = step;
  currentExplorePage = explorePage;

  // Sent here from a locked room? Pip explains (after the room has said its
  // own first line), and the address is tidied up. (12 Nov 2026: this message
  // was only drawn in the old sidebar, so the card layout never showed it.)
  if (new URLSearchParams(location.search).has('locked')) {
    history.replaceState(null, '', location.pathname);
    setTimeout(() => pipSay(LOCKED_MESSAGE), 0);
  }

  root.innerHTML = `
    <header class="shell-header">
      <div class="header-left">
        <a class="logo" href="../index.html">${LOGO_SVG}<span>Data<span class="logo-accent">Scope</span></span></a>
        ${settingsMenuHTML()}
      </div>
      <nav class="step-bar" aria-label="Investigation steps">${stepBarHTML()}</nav>
      <div class="header-actions">
        <span class="room-tools" id="room-tools"></span>
        <button class="btn icon-btn badge-counter" id="badge-counter" type="button" aria-label="${backpackLabel(countBadges())}">${counterHTML(countBadges())}</button>
      </div>
    </header>
    ${getPreviewAll() ? `<p class="preview-banner">${iconHTML('magnifier')} Teacher preview: all rooms are open on this device</p>` : ''}
    ${cardBodyHTML(accent, contentHTML)}
  `;

  // The Explore tabs were built before this page's room was known, so they
  // are drawn again now with the right one marked.
  const cardTabs = root.querySelector('.task-card-tabs');
  if (cardTabs) cardTabs.innerHTML = exploreCardTabsHTML();

  // A locked room: hide it and go to the furthest open room instead.
  if (phase && guardPage(phase)) {
    root.hidden = true;
    return;
  }

  // Screen readers read out new feedback ("Correct!", hints...) without the
  // child having to look for it. Done here once for every room.
  root.querySelectorAll('.feedback').forEach((el) => el.setAttribute('aria-live', 'polite'));

  // Part 43a: the living background, with this room's own touch (My journey has no phase).
  // Part 59: rooms that are already a place get their scene instead.
  if (!mountScene(phase || step)) mountSky(phase || step);
  mountPipStand(); // Part 43c: big Pip beside the card, alive and talking
  // Part 47b: the first time each helper appears in a room, Pip points at it.
  if (phase) startHelperPointers(phase);
  // Part 43d: a whoosh as the room opens, a soft tap for every button, and the music.
  playSound('whoosh');
  document.addEventListener('pointerdown', (e) => {
    const button = e.target.closest('.btn');
    if (button && !button.disabled && !button.classList.contains('sound-toggle')) playSound('tap');
  });
  const musicButton = document.getElementById('music-toggle');
  if (musicButton) setupMusic(musicButton);
  setupCelebrations();
  setupAboutTab();
  watchPressedState();
  setupExitButton();
  setupSettingsMenu();
  centreStepBarOverCard();
  // Part 22: send the log to the online database (only when it is switched on).
  // Part 60c: the status is shown in the Settings menu.
  startSync(showSyncStatus);
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

// Zone 2 and zone 3 of the card layout: the room's task card and the action
// bar (filled by the room with setupActionBar). Part 60c (Habiba, 11 Nov 2026):
// the status strip under them is gone; the code, "Saved online?", Sound, Music
// and Exit are in the Settings menu beside the logo (js/settings-menu.js).
function cardBodyHTML(accent, contentHTML) {
  return `
    <main class="room-content card-layout" style="--accent: var(--color-${accent})">${contentHTML}</main>
    <nav class="action-bar" id="action-bar" aria-label="What to do next"></nav>`;
}

// Part 60c (Habiba): on laptop screens big Pip pushes the card to the right,
// so the step bar moves right too, until its centre is over the card's centre.
// It stops 16px before the buttons on the right, so it never covers them
// (at 1366 that is almost the whole way; on narrower laptops a bit less).
function centreStepBarOverCard() {
  const header = document.querySelector('.shell-header');
  const bar = header.querySelector('.step-bar');
  const actions = header.querySelector('.header-actions');
  const card = document.querySelector('.room-content.card-layout');
  const wide = window.matchMedia('(min-width: 1240px)'); // same as css/scenes.css
  const place = () => {
    bar.style.translate = '';
    if (!wide.matches || !document.documentElement.classList.contains('has-cast')) return;
    const b = bar.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const wanted = (c.left + c.width / 2) - (b.left + b.width / 2);
    const room = actions.getBoundingClientRect().left - 16 - b.right;
    bar.style.translate = `${Math.round(Math.max(0, Math.min(wanted, room)))}px 0`;
  };
  // Again whenever the window, the trail (a new step) or the buttons change size.
  const watch = new ResizeObserver(place);
  [header, bar, actions].forEach((el) => watch.observe(el));
}

// The Explore rooms as tabs on the task card's header (card layout, UI guide):
// done rooms get a ✓, the current room is white, then ONE "More soon" tab (a lock)
// while a room is still locked (its name stays hidden, Prof's comment 2).
export function exploreCardTabsHTML(newTab = null) {
  const done = getDonePhases();
  const open = EXPLORE_ROOMS.filter((r) => getPreviewAll() || isUnlocked(r.id, done));
  const tabs = open.map((r) => {
    const isActive = r.id === currentExplorePage;
    const isDone = done.includes(r.id);
    return `<a class="card-tab${isActive ? ' active' : ''}${isDone ? ' done' : ''}${r.id === newTab ? ' step-new' : ''}"${isActive ? ' aria-current="page"' : ''} href="${r.href}">${isDone ? '<span aria-hidden="true">✓</span> ' : ''}${iconHTML(r.icon)} ${r.label}${isDone ? '<span class="sr-only"> (done)</span>' : ''}</a>`;
  });
  if (open.length < EXPLORE_ROOMS.length) {
    tabs.push(`<span class="card-tab locked">${iconHTML('lock')} More soon<span class="sr-only"> (locked)</span></span>`);
  }
  return `<nav class="card-tab-row" aria-label="Explore rooms">${tabs.join('')}</nav>`;
}

// A phase was just finished (the child closed its end-of-room card): confetti,
// every time (8 Nov 2026, Habiba: "after completing each room", also when
// nothing new opens); then redraw the bar so the new step (or Explore room)
// slides in, and Pip announces it.
function showUnlocked() {
  confetti(); // a room is finished: a big moment (fireworks only on My journey)
  const bar = document.querySelector('.step-bar');
  const before = [...bar.querySelectorAll('.step')].map((link) => link.dataset.step);
  const newStep = visibleSteps(getDonePhases()).find((id) => !before.includes(id)) || null;
  bar.innerHTML = stepBarHTML(newStep);

  // The Explore rooms are tabs on the task card.
  let newTab = null;
  const cardTabs = document.querySelector('.task-card-tabs');
  if (cardTabs) {
    const before = cardTabs.querySelectorAll('.card-tab:not(.locked)').length;
    const open = EXPLORE_ROOMS.filter((r) => isUnlocked(r.id, getDonePhases()));
    if (open.length > before) newTab = open[open.length - 1];
    cardTabs.innerHTML = exploreCardTabsHTML(newTab && newTab.id);
  }

  const opened = newStep ? STEPS.find((s) => s.id === newStep) : null;
  const name = opened ? opened.label : newTab && newTab.label;
  if (name) {
    pipSay(`Hoo-hoo! You unlocked ${name}!`, 'lock-open');
    pipReacts('hop');
    unlockStep(document.querySelector('.step-bar .step-new, .task-card-tabs .step-new'));
  }
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

// Puts a room's own tool (e.g. "Maths recap") in the top bar, so it never
// crowds the task text (UI guide: at most 3 buttons there).
export function addTitleButton(button) {
  button.classList.add('btn-secondary', 'room-tool');
  document.getElementById('room-tools').append(button);
}
