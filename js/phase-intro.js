// Shell layer: what each phase is about (Part 14, Part 33). A pop-up opens by
// itself the first time a child reaches a phase; the "About this room" tab on
// the task card shows the same words, and more, at any time (Prof's comment 6).
// Texts: data/content/phases.json.
// Part 42c (Round 4): each phase also says WHY the room exists ("Why?"), in
// the pop-up and next to the tab; games get their own words. Not in the tab's
// panel: the line is right above it (Habiba, 6 Nov 2026: "repetitive").
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { hasSeenIntro, markIntroSeen, getSelectedScenarioId } from './storage/save.js';
import { STEP_OF_PHASE } from './helpers/progress.js';
import { roomWhy } from './helpers/mission.js';
import { iconNode, setIconText } from './icon-text.js';
import { loadContent } from './helpers/scenarios.js';

const STEP_ORDER = ['ask', 'plan', 'collect', 'explore', 'conclude'];

let phasesPromise = null;
let kindPromise = null;
let currentPhase = null;
// Resolves when the intro that opened by itself is closed (or straight away
// if none opened), so another pop-up can wait its turn (e.g. the maths recap).
let autoIntroClosed = Promise.resolve();

// Loaded once per page, then reused.
function loadPhases() {
  if (!phasesPromise) phasesPromise = fetch('../data/content/phases.json').then((r) => r.json());
  return phasesPromise;
}

// The scenario's kind ('number', 'category' or 'compare'), so games get their own words.
function loadKind() {
  if (!kindPromise) {
    kindPromise = loadContent(getSelectedScenarioId()).then((c) => c.numberLab.kind).catch(() => 'number');
  }
  return kindPromise;
}

// One phase's words for this child's scenario: icon, title, accent, doneWhen, why, bullets.
async function loadIntro(phase) {
  const [phases, kind] = await Promise.all([loadPhases(), loadKind()]);
  const intro = phases[phase];
  return intro ? { ...intro, ...roomWhy(intro, kind) } : null;
}

function el(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// "Why? Graphs help us SEE the answer." (a bold "Why?", then the line; no icon
// since 11 Nov 2026, Habiba)
function whyNodes(why) {
  const label = el('strong', '', '');
  label.textContent = 'Why? ';
  return [label, document.createTextNode(why)];
}

function whyParagraph(why) {
  const line = el('p', '', 'intro-why');
  line.append(...whyNodes(why));
  return line;
}

// "Step 3 of 5", then the bullets rise in one after another (UI guide f2).
function introNodes(phase, intro) {
  const where = el('p', `Step ${STEP_ORDER.indexOf(STEP_OF_PHASE[phase]) + 1} of ${STEP_ORDER.length}`, 'intro-step');
  const list = el('ul', '', 'intro-list');
  intro.bullets.forEach((bullet, i) => {
    const item = el('li', bullet, 'm-rise');
    item.style.setProperty('--i', i + 2);
    list.append(item);
  });
  return [where, list];
}

async function showPhaseIntro(phase) {
  const intro = await loadIntro(phase);
  if (!intro) return;
  // Badges earned by the same tap join the pop-up line one turn later
  // (js/celebrate.js, setTimeout 0). The intro waits that turn too, so it comes
  // AFTER them: Ask card, then the Question Fixer badge, then the Plan intro
  // (bug found by Habiba, 6 Nov 2026: the badge showed after Plan had opened).
  await new Promise((resolve) => { setTimeout(resolve, 0); });

  const body = document.createElement('div');
  body.append(whyParagraph(intro.why), ...introNodes(phase, intro), el('p', 'Tap "About this room" any time to see this again.', 'intro-again'));

  logEvent('shell', 'popup-seen', { phase, auto: true });
  await openModal({
    icon: intro.icon,
    title: intro.title,
    accent: intro.accent,
    body,
    buttons: [{ label: "Let's go! →", value: 'go', main: true }],
  });
}

// Fills the tab's panel with the phase the child is in now.
async function fillAboutPanel(panel, phase) {
  const intro = await loadIntro(phase);
  if (!intro) return;
  // Part 54b: the room's icon (phases.json "icon" is an illustration name).
  const title = el('p', '', 'about-title');
  setIconText(title, intro.icon, intro.title, true); // the room's header icon may move (Part 52e)
  const done = el('p', '', 'about-done');
  done.append(iconNode('check'), document.createTextNode(` You are done when: ${intro.doneWhen}`));
  panel.replaceChildren(title, ...introNodes(phase, intro), done);
}

// Tells the shell which phase the child is in now. Shows its intro if this
// child has never seen it. "Seen" is saved straight away (before the texts
// load), so two quick calls can never open the same intro twice.
export function setIntroPhase(phase) {
  currentPhase = phase;
  // A room with a phase has the tab. One room covers two phases (Ask, then
  // Plan), so an open panel follows along.
  const tab = document.getElementById('about-tab');
  const panel = document.getElementById('about-panel');
  if (tab) tab.hidden = false;
  if (panel && !panel.hidden) fillAboutPanel(panel, phase);
  fillWhyLine(phase);

  if (hasSeenIntro(phase)) return;
  markIntroSeen(phase);
  autoIntroClosed = showPhaseIntro(phase);
}

// The "Why?" line next to the tab (task-card.js). Question Studio moves
// from Ask to Plan, so it is filled again for the new phase.
async function fillWhyLine(phase) {
  const line = document.getElementById('why-line');
  if (!line) return;
  const intro = await loadIntro(phase);
  if (!intro || phase !== currentPhase) return; // the child already moved on
  line.replaceChildren(...whyNodes(intro.why));
  line.hidden = false;
}

export function whenIntroClosed() {
  return autoIntroClosed;
}

// The "About this room" tab opens and closes its panel inside the card.
export function setupAboutTab() {
  const tab = document.getElementById('about-tab');
  const panel = document.getElementById('about-panel');
  if (!tab) return;
  tab.addEventListener('click', async () => {
    const opening = panel.hidden;
    if (opening) {
      await fillAboutPanel(panel, currentPhase);
      logEvent('shell', 'popup-seen', { phase: currentPhase, auto: false, via: 'tab' });
    }
    panel.hidden = !opening;
    tab.setAttribute('aria-expanded', String(opening));
    tab.querySelector('.about-arrow').textContent = opening ? '▲' : '▼';
  });
}
