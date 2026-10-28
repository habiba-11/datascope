// "My journey" (Part 19, Prof's comment 6): at the end, the child sees their
// whole investigation: one stop per phase with their stars and their own
// answers, a Detective ID card, and what they learned. Then they save their
// work for the teacher. Built with textContent: most of this is what they typed.
// Time per phase is NOT shown here (teacher only, decided 25 Oct 2026).
import { mountShell } from '../app.js';
import { buildJourney } from '../helpers/journey.js';
import { levelFor } from '../helpers/badges.js';
import { loadRecipe, loadContent } from '../helpers/scenarios.js';
import { numberLabKind } from '../helpers/number-tasks.js';
import { CERTAINTY } from '../helpers/certainty.js';
import { readLog } from '../helpers/log.js';
import { getSelectedScenarioId, getExplorerCode, getAllProgress, getDonePhases } from '../storage/save.js';
import { buildExport, exportFileName, toCSV, downloadFile } from '../storage/export.js';
import { guardJourney } from '../phase-progress.js';
import { backendReady } from '../config.js';
import { pipSVG, pipMoodFor } from '../pip.js';

const STOPS = [
  { phase: 'ask', icon: '❓', name: 'Ask' },
  { phase: 'plan', icon: '🗺️', name: 'Plan' },
  { phase: 'collect', icon: '📋', name: 'Collect' },
  { phase: 'graph', icon: '📊', name: 'Graph Lab' },
  { phase: 'number', icon: '🔢', name: 'Number Lab' },
  { phase: 'chance', icon: '🎲', name: 'Chance Lab' },
  { phase: 'conclude', icon: '🚩', name: 'Conclude' },
];

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

const starsText = (n) => `${'⭐'.repeat(n)}${'☆'.repeat(3 - n)} ${n} of 3 stars`;

// The child's own answers at each stop, in short sentences.
function stopLines(phase, p, { cardTitle, kind }) {
  const lines = [];
  switch (phase) {
    case 'ask':
      lines.push(`You picked: ${cardTitle}`);
      break;
    case 'plan':
      if (p.guess !== null) lines.push(`Your guess: ${p.guess}`);
      break;
    case 'collect':
      if (p.classes.length) lines.push(`You asked ${p.classes.map((c) => c.classSize).join(' + ')} pretend classmates.`);
      break;
    case 'graph':
      if (p.tell) lines.push(`It shows: "${p.tell}"`);
      if (p.notTell) lines.push(`It can't show: "${p.notTell}"`);
      break;
    case 'number':
      if (p.guess !== null) {
        lines.push(kind === 'category'
          ? `You guessed ${p.guess}. The mode was ${(p.mode || []).join(' and ')}.`
          : `You guessed ${p.guess}. The mean was ${p.mean}.`);
      }
      if (p.revision && p.revision.changed) lines.push(`You changed to ${p.revision.newGuess} because "${p.revision.reason}".`);
      if (p.tasks.length) {
        const solved = p.firstTry + p.afterHint;
        lines.push(`🧩 Puzzles solved: ${solved}${p.afterHint ? ` (${p.afterHint} after trying again 💪)` : ''}`);
      }
      break;
    case 'chance':
      if (p.rating) lines.push(`${p.device}: you said "${p.rating}" because "${p.reason}".`);
      if (p.biggestRun) {
        const r = p.biggestRun;
        lines.push(`${r.trials} tries: ${r.outcome} came up ${r.pct}%. It should be ${r.theory}.`);
      }
      break;
    case 'conclude':
      if (p.claim) {
        const c = p.claim;
        const word = CERTAINTY.find((x) => x.value === c.certainty)?.word || c.certainty;
        lines.push(`I think ${c.claim} because ${c.because}.`);
        lines.push(`Proof: ${(c.evidence || []).join(', ')}`);
        lines.push(`How sure: ${word}. ${c.certaintyReason}`);
        if (c.audience) lines.push(`For: ${c.audience}`); // cards from before 26 Oct 2026
      }
      break;
    default:
      break;
  }
  return lines;
}

function trailNode(journey, info) {
  const trail = el('ol', '', 'trail');
  STOPS.forEach(({ phase, icon, name }, i) => {
    const p = journey.phases[phase];
    const stop = el('li', '', `stop${p.done ? ' done' : ''}`);
    stop.style.animationDelay = `${0.1 * i}s`;
    const head = el('div', '', 'stop-head');
    head.append(el('span', icon, 'stop-icon'), el('h2', name, 'stop-name'));
    head.append(el('span', p.done ? '✅ Done' : '🔒 Not done yet', 'stop-status'));
    stop.append(head);
    if (p.stars) stop.append(el('p', starsText(p.stars), 'stop-stars'));
    stopLines(phase, p, info).forEach((line) => stop.append(el('p', line, 'stop-line')));
    trail.append(stop);
  });
  return trail;
}

function idCardNode(journey, code) {
  const card = el('section', '', 'id-card');
  card.setAttribute('aria-label', 'My Detective ID card');
  card.append(
    el('h2', '🪪 Detective ID'),
    el('p', `🔑 ${code || 'No code yet'}`, 'id-code'),
    el('p', `${levelFor(journey.patches).icon} ${levelFor(journey.patches).name}`),
    el('p', `🎒 Badges: ${journey.patches}`),
    el('p', `⭐ Stars: ${journey.totalStars} of ${STOPS.length * 3}`),
  );
  return card;
}

// "Save my work for my teacher" (moved here from Evidence Board in Part 19).
// JSON is the main file (the teacher dashboard imports it); CSV opens in a spreadsheet.
function save(extension, feedback) {
  const code = getExplorerCode();
  if (!code) {
    // Without a code the teacher can't tell whose file it is. The log stays saved.
    feedback.textContent = '🔑 You need your explorer code first! Go to the start page, type it, then come back.';
    feedback.hidden = false;
    return;
  }
  // Only this child's entries: on a shared device, another child's work stays out of the file.
  const entries = readLog().filter((entry) => entry.code === code);
  const fileName = exportFileName(code, extension);
  if (extension === 'json') {
    downloadFile(fileName, JSON.stringify(buildExport(code, entries, new Date(), getAllProgress()), null, 2), 'application/json');
  } else {
    downloadFile(fileName, toCSV(entries), 'text/csv');
  }
  feedback.textContent = `🎉 Saved! Look in Downloads for "${fileName}". Hand it in to your teacher.`;
  feedback.hidden = false;
}

// A small Pip hops down the trail, stop by stop, to the last finished phase.
// With reduced motion (or no GSAP) Pip just stands there.
function walkPip() {
  const trail = document.querySelector('.trail');
  const done = [...trail.querySelectorAll('.stop.done')];
  if (!done.length) return;
  const pip = el('div', '', 'trail-pip');
  pip.innerHTML = pipSVG(); // our own drawing, no child text
  // In the box around the list, not in the list: an <ol> may only hold <li>s.
  document.getElementById('journey-trail').append(pip);

  const y = (stop) => stop.offsetTop + 4;
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap || reduceMotion) {
    pip.style.transform = `translateY(${y(done[done.length - 1])}px)`;
    return;
  }
  const walk = gsap.timeline({ delay: 0.6, onComplete: () => pipMoodFor('cheer', 2000) });
  walk.set(pip, { y: y(done[0]) });
  done.slice(1).forEach((stop) => {
    walk.to(pip, { y: y(stop), duration: 0.35, ease: 'power1.inOut' })
      .to(pip, { scaleY: 0.85, duration: 0.08, yoyo: true, repeat: 1 }); // a little landing squash
  });
}

async function init() {
  if (guardJourney()) return; // not finished yet: sent to the furthest open room

  const recipe = await loadRecipe(getSelectedScenarioId());
  const { cardTitle, emoji } = await loadContent(recipe.id);
  const code = getExplorerCode();
  const journey = buildJourney(readLog(), code, recipe.id, recipe.compareWith || null, getDonePhases(recipe.id));

  mountShell({
    step: 'conclude',
    accent: 'conclude',
    pipMessage: 'Hoo-hoo! Look how far you came! ⭐',
    contentHTML: `
      <h1 class="room-title">🗺️ My journey</h1>
      <p class="journey-scenario">${emoji} ${cardTitle}</p>
      <div class="journey-top" id="journey-top"></div>
      <div id="journey-trail"></div>
      <div class="journey-actions">
        ${backendReady()
    // With the online database on, nothing to download: the work is already sent.
    ? '<p class="online-note">☁️ Your work goes to your teacher by itself. Nothing to save!</p>'
    : `<button class="btn btn-main" id="save-work-btn" type="button">📤 Save my work for my teacher</button>
        <button class="link-btn" id="save-csv-btn" type="button">or save it as a table (CSV)</button>`}
        <p class="feedback" id="save-feedback" hidden></p>
        <button class="btn" id="print-btn" type="button">🖨️ Print my journey</button>
        <a class="btn" href="question-studio.html">🔁 Start a new investigation →</a>
      </div>
    `,
  });

  const learned = el('section', '', 'learned');
  learned.append(el('h2', '🧠 What I learned'), el('p', recipe.teaches));
  document.getElementById('journey-top').append(idCardNode(journey, code), learned);
  document.getElementById('journey-trail').append(trailNode(journey, { cardTitle, kind: numberLabKind(recipe) }));
  walkPip();

  // Files are only the fallback when the online database is switched off.
  if (!backendReady()) {
    const feedback = document.getElementById('save-feedback');
    document.getElementById('save-work-btn').addEventListener('click', () => save('json', feedback));
    document.getElementById('save-csv-btn').addEventListener('click', () => save('csv', feedback));
  }
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

init();
