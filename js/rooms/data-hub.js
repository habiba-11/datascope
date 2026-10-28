import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mode } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe } from '../helpers/scenarios.js';
import { tallyKeys, colourFor, seatLabels, countAnswers } from '../helpers/tally.js';
import { logEvent, readLog } from '../helpers/log.js';
import { playSound } from '../sounds.js';
import { pipReacts } from '../motion.js';
import { pipSay } from '../pip.js';
import { getSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { finishPhase } from '../phase-progress.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';

// Data Hub in the 3-zone layout (UI guide): ONE task card with the pretend
// class (seats) and the tally side by side, and ONE primary button that says
// what happens next. Reading minutes has two classes, so it goes in 3 steps:
// Class A, Class B, then both tallies side by side.

// CLAUDE.md: the data is synthetic, and the app says so where the data appears.
const PRETEND_PILL = '🎭 Pretend class · made-up answers';
const REVEAL_MS = 400; // the pace of answers (no sound or motion with reduced motion)
const BAR_HEIGHT = 160; // px: the tallest bar

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const shortName = (recipe) => recipe.title.split(': ')[1] || 'Our pretend class'; // "Class A"

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);
  const classes = [recipe, partner].filter(Boolean).map((r, i) => ({
    recipe: r,
    p: i === 0 ? 'a' : 'b',
    data: generateClassData(r),
    keys: tallyKeys(r),
    answers: [],
    done: false,
  }));
  // Two classes share one scale, so their bars can be compared fairly.
  const allKeys = partner ? tallyKeys({ valuePool: [...classes[0].keys, ...classes[1].keys] }) : classes[0].keys;
  const scaleMax = () => Math.max(1, ...classes.flatMap((c) => [...countAnswers(c.keys, c.answers).values()]));

  const steps = partner
    ? [shortName(recipe), shortName(partner), 'Compare']
    : null;

  mountShell({
    step: 'collect',
    phase: 'collect',
    accent: 'collect',
    layout: 'card',
    contentHTML: taskCardHTML({
      title: '📋 Collect · Data Hub',
      pill: PRETEND_PILL,
      bodyHTML: `
        ${steps ? '<div id="stepper"></div>' : ''}
        ${pipLineHTML(partner ? 'Survey Class A first, then Class B.' : 'Hoo-hoo! Our pretend class is ready to answer.', recipe.question)}
        ${classes.map((c) => classPanelsHTML(c, !!partner)).join('')}
        ${partner ? comparePanelsHTML(classes) : ''}`,
    }),
  });

  const bar = setupActionBar({ back: { label: 'Back', href: 'question-studio.html' }, primary: { label: '' } });
  classes.forEach((c) => renderTally(c, allKeys, scaleMax()));

  // Collect is done when every class has been surveyed.
  function finishCollect() {
    finishPhase('collect', {
      classSizes: classes.map((c) => c.data.values.length),
      // Two classes have two different "most common" answers, so none is named.
      mostCommon: partner ? null : mode(classes[0].data.values).join(' and ') || null,
      guess: lastPrediction(recipe.id),
    });
  }

  const goToGraphs = { label: '📊 Let\'s draw a graph! →', ready: true, onClick: () => { location.href = 'graph-lab.html'; } };

  // One class's survey: the primary runs it, then says what comes next.
  function surveyStep(c, afterDone) {
    if (c.done) {
      bar.setPrimary(afterDone);
      return;
    }
    const label = partner ? `▶ Survey ${shortName(c.recipe)}` : '▶ Run survey';
    bar.setPrimary({
      label,
      onClick: () => runSurvey(c, allKeys, {
        onProgress: (n) => bar.setPrimary({ label, enabled: false, whyDisabled: `⏳ Asking... ${n} of ${c.data.values.length}` }),
        onDone: () => {
          c.done = true;
          classes.forEach((other) => renderTally(other, allKeys, scaleMax()));
          bar.setPrimary(afterDone);
          if (classes.every((x) => x.done)) finishCollect();
        },
      }),
    });
  }

  if (!partner) {
    surveyStep(classes[0], goToGraphs);
    return;
  }

  // Reading minutes: Class A -> Class B -> Compare.
  function showStep(i) {
    document.getElementById('stepper').innerHTML = miniStepperHTML(steps, i);
    classes.forEach((c, k) => { document.getElementById(`${c.p}-panels`).hidden = k !== i; });
    document.getElementById('compare-panels').hidden = i !== 2;
    pipSay(['Survey Class A first, then Class B.', 'Now ask Class B the same question.', 'Look: how are the two classes different?'][i]);
    bar.setBack(i === 0
      ? { label: 'Back', href: 'question-studio.html' }
      : { label: 'Back', onClick: () => showStep(i - 1) });
    if (i === 0) surveyStep(classes[0], { label: `Next: ${shortName(partner)} →`, ready: true, onClick: () => showStep(1) });
    if (i === 1) surveyStep(classes[1], { label: 'Compare the classes →', ready: true, onClick: () => showStep(2) });
    if (i === 2) {
      classes.forEach((c) => renderTally(c, allKeys, scaleMax(), 'compare'));
      bar.setPrimary(goToGraphs);
    }
  }
  showStep(0);
}

// This child's Plan guess for this scenario (the newest one), or null.
// Filtered by code: on a shared device the log also holds other children's work.
function lastPrediction(scenarioId) {
  const code = getExplorerCode();
  const guesses = readLog().filter((e) => e.code === code && e.type === 'prediction' && e.scenarioId === scenarioId);
  return guesses.length ? guesses[guesses.length - 1].guess : null;
}

// Two panels for one class: the seats (left) and the tally (right).
function classPanelsHTML(c, twoClasses) {
  const size = c.data.values.length;
  const seats = Array.from({ length: size }, (_, i) => `<li class="seat" id="${c.p}-seat-${i}"><span class="sr-only">Classmate ${i + 1}: not asked yet</span></li>`).join('');
  return `
    <div class="card-panels" id="${c.p}-panels">
      <section>
        <h2 class="panel-title">${twoClasses ? shortName(c.recipe) : 'Our pretend class'}</h2>
        <ol class="seats" aria-label="Answers so far">${seats}</ol>
        <p class="seat-said" id="${c.p}-said" aria-live="polite">Nobody has answered yet.</p>
        <div class="progress-row">
          <div class="progress-track"><div id="${c.p}-fill" class="progress-fill"></div></div>
          <span id="${c.p}-text" class="progress-text">0 of ${size}</span>
        </div>
      </section>
      <section>
        <h2 class="panel-title">Our tally so far</h2>
        <div class="tally" id="${c.p}-tally"></div>
        <p class="tally-unit">${c.recipe.unit || ''}</p>
      </section>
    </div>`;
}

// Reading minutes, step 3: both tallies side by side, on one scale.
function comparePanelsHTML(classes) {
  return `
    <div class="card-panels" id="compare-panels" hidden>
      ${classes.map((c) => `
        <section>
          <h2 class="panel-title">${shortName(c.recipe)}</h2>
          <div class="tally" id="${c.p}-tally-compare"></div>
          <p class="tally-unit">${c.recipe.unit || ''}</p>
        </section>`).join('')}
    </div>`;
}

// The tally: one bar per answer, in the same colour as its seats. Bars grow
// with scaleY (transform only), so the layout never jumps.
function renderTally(c, allKeys, scaleMax, where = '') {
  const tally = document.getElementById(`${c.p}-tally${where ? `-${where}` : ''}`);
  const counts = countAnswers(c.keys, c.answers);
  if (!tally.children.length) {
    tally.innerHTML = c.keys.map((key) => `
      <div class="tally-col" data-key="${key}" style="--bar: var(--color-${colourFor(allKeys, key)})">
        <div class="tally-track"><span class="tally-count"></span><div class="tally-bar"></div></div>
        <span class="tally-label">${key}</span>
      </div>`).join('');
  }
  tally.querySelectorAll('.tally-col').forEach((col) => {
    const key = c.keys.find((k) => String(k) === col.dataset.key);
    const count = counts.get(key);
    const share = count / scaleMax;
    col.querySelector('.tally-bar').style.transform = `scaleY(${share})`;
    const label = col.querySelector('.tally-count');
    label.textContent = count || '';
    label.style.transform = `translateY(${-share * BAR_HEIGHT}px)`;
  });
}

// "Run survey": the classmates answer one by one. Each answer pops into its
// seat and its bar grows one step at the same moment.
// `allKeys`: every answer of every class here, so the colours match the bars.
function runSurvey(c, allKeys, { onProgress, onDone }) {
  const { values } = c.data;
  const labels = seatLabels(c.keys);
  const unit = c.recipe.unit || '';
  const said = document.getElementById(`${c.p}-said`);

  function revealNext() {
    const i = c.answers.length;
    const value = values[i];
    c.answers.push(value);

    const seat = document.getElementById(`${c.p}-seat-${i}`);
    seat.innerHTML = `<span aria-hidden="true">${labels.get(value)}</span><span class="sr-only">Classmate ${i + 1}: ${value} ${unit}</span>`;
    seat.style.setProperty('--seat', `var(--color-${colourFor(allKeys, value)})`);
    seat.classList.add('seat--filled', 'm-pop');
    said.textContent = `Classmate ${i + 1} said: ${value} ${unit}`;

    const scale = Math.max(1, ...countAnswers(c.keys, c.answers).values());
    renderTally(c, allKeys, scale);
    document.getElementById(`${c.p}-fill`).style.transform = `scaleX(${c.answers.length / values.length})`;
    document.getElementById(`${c.p}-text`).textContent = `${c.answers.length} of ${values.length}`;
    onProgress(c.answers.length);
    // One tick per answer. With reduced motion all answers arrive at once, so no ticks.
    if (!reduceMotion()) playSound('tick');

    if (c.answers.length < values.length) {
      setTimeout(revealNext, reduceMotion() ? 0 : REVEAL_MS);
      return;
    }
    said.textContent = `✅ All ${values.length} classmates answered!`;
    playSound('done');
    pipReacts('hop');
    // Scenario + seed recreate exactly the data this child saw (architecture section 5).
    logEvent('data-hub', 'data-seen', {
      scenarioId: c.data.scenarioId, seed: c.data.seed, classSize: values.length,
    });
    onDone();
  }
  revealNext();
}

init();
