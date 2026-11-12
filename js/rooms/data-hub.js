import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mode } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe } from '../helpers/scenarios.js';
import { tallyKeys, colourFor, seatLabels, countAnswers, tallyWords } from '../helpers/tally.js';
import { valueText } from '../helpers/charts.js';
import { logEvent, readLog } from '../helpers/log.js';
import { planPrediction } from '../helpers/guesses.js';
import { playSound } from '../sounds.js';
import { pipReacts, animate } from '../motion.js';
import { pipSay } from '../pip.js';
import {
  getSelectedScenarioId, getExplorerCode, loadRoomState, saveRoomState,
} from '../storage/save.js';
import { finishPhase } from '../phase-progress.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { iconHTML, setIconText } from '../icon-text.js';
import { seatKidSVG } from '../characters.js';

// Data Hub in the 3-zone layout (UI guide): ONE task card with the pretend
// class (seats) and the tally side by side, and ONE primary button that says
// what happens next. Reading minutes has two classes, so it goes in 3 steps:
// Class A, Class B, then both tallies side by side.

// CLAUDE.md: the data is synthetic, and the app says so where the data appears.
const PRETEND_PILL = ':masks: Pretend class · made-up answers'; // :name: = icon (Part 54d)
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
    plain: Boolean(partner), // two classes side by side: plain numbers, like the charts
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
    contentHTML: taskCardHTML({
      title: ':clipboard: Collect · Data Hub',
      pill: PRETEND_PILL,
      bodyHTML: `
        ${steps ? '<div id="stepper"></div>' : ''}
        ${pipLineHTML(partner ? 'Survey Class A first, then Class B.' : 'Hoo-hoo! Our pretend class is ready to answer.', recipe.question)}
        ${classes.map((c) => classPanelsHTML(c, !!partner)).join('')}
        ${partner ? comparePanelsHTML(classes) : ''}`,
    }),
  });

  const bar = setupActionBar({ back: { label: 'Back', href: 'question-studio.html' }, primary: { label: '' } });

  // Part 60e (Habiba, 11 Nov 2026): a class already surveyed stays surveyed
  // when the child comes back (all seats filled at once, nothing logged again),
  // and the room opens at the step the child was on.
  const saved = loadRoomState('data-hub', recipe.id);
  let step = saved ? saved.step : 0;
  const remember = () => saveRoomState('data-hub', recipe.id, {
    step, surveyed: classes.filter((c) => c.done).map((c) => c.p),
  });
  classes.forEach((c) => {
    if (saved && saved.surveyed.includes(c.p)) fillAllSeats(c, allKeys);
  });
  classes.forEach((c) => renderTally(c, allKeys, scaleMax()));

  // Collect is done when every class has been surveyed.
  function finishCollect() {
    finishPhase('collect', {
      classSizes: classes.map((c) => c.data.values.length),
      // Two classes have two different "most common" answers, so none is named.
      mostCommon: partner ? null : mode(classes[0].data.values).join(' and ') || null,
      guess: planPrediction(readLog(), getExplorerCode(), recipe.id),
    });
  }

  const goToGraphs = { label: ':chart: Let\'s draw a graph! →', ready: true, onClick: () => { location.href = 'graph-lab.html'; } };

  // One class's survey: the primary runs it, then says what comes next.
  function surveyStep(c, afterDone) {
    if (c.done) {
      bar.setPrimary(afterDone);
      return;
    }
    const label = partner ? `:play: Survey ${shortName(c.recipe)}` : ':play: Run survey';
    bar.setPrimary({
      label,
      ready: true, // the one thing to do here: the button invites a tap
      onClick: () => runSurvey(c, allKeys, {
        onProgress: (n) => bar.setPrimary({ label, enabled: false, whyDisabled: `:clock: Asking... ${n} of ${c.data.values.length}` }),
        onDone: () => {
          c.done = true;
          remember();
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
    step = i;
    remember();
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
      // Built afresh each time, so the bars grow again when the child comes back.
      classes.forEach((c) => {
        document.getElementById(`${c.p}-tally-compare`).replaceChildren();
        renderTally(c, allKeys, scaleMax(), 'compare');
      });
      bar.setPrimary(goToGraphs);
    }
  }
  showStep(step);
}

// Two panels for one class: the seats (left) and the tally (right).
function classPanelsHTML(c, twoClasses) {
  const size = c.data.values.length;
  // Part 59a: each seat is a small classmate (grey with a "?" until asked).
  const seats = Array.from({ length: size }, (_, i) => `<li class="seat" id="${c.p}-seat-${i}">${seatKidSVG(i, false)}<span class="sr-only">Classmate ${i + 1}: not asked yet</span></li>`).join('');
  return `
    <div class="card-panels hub-panels" id="${c.p}-panels">
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
        <p class="tally-unit">${c.recipe.chartAxis}</p>
      </section>
    </div>`;
}

// Reading minutes, step 3: both tallies side by side, on one scale.
function comparePanelsHTML(classes) {
  return `
    <div class="card-panels compare-panels" id="compare-panels" hidden>
      ${classes.map((c, i) => `
        <section class="compare-class compare-class--${i === 0 ? 'a' : 'b'}">
          <h2 class="panel-title compare-name">${iconHTML(i === 0 ? 'book-green' : 'book')} ${shortName(c.recipe)}</h2>
          <div class="tally" id="${c.p}-tally-compare"></div>
          <p class="tally-unit">${c.recipe.chartAxis}</p>
        </section>`).join('')}
    </div>`;
}

// The tally: one bar per answer, in the same colour as its seats. Bars grow
// with scaleY (transform only), so the layout never jumps.
function renderTally(c, allKeys, scaleMax, where = '') {
  const tally = document.getElementById(`${c.p}-tally${where ? `-${where}` : ''}`);
  const counts = countAnswers(c.keys, c.answers);
  if (!tally.children.length) {
    tally.innerHTML = c.keys.map((key, i) => `
      <div class="tally-col" data-key="${key}" style="--bar: var(--color-${colourFor(allKeys, key)}); --i: ${i}">
        <div class="tally-track"><span class="tally-count"></span><div class="tally-bar"></div></div>
        <span class="tally-label">${tallyWords(key, 0, c.recipe, c.plain).value}</span>
      </div>`).join('');
    // 10 Nov 2026 (Habiba: "no movement" in the reading Compare step): the
    // browser first draws the new bars at zero, so they can GROW to their
    // heights (setting both in one go made them simply appear).
    void tally.offsetHeight;
  }
  tally.querySelectorAll('.tally-col').forEach((col) => {
    // Part 43b: a tapped column wiggles with a tick (just for fun; it changes nothing).
    if (!col.dataset.wiggle) {
      col.dataset.wiggle = 'on';
      col.addEventListener('click', () => { animate(col, 'tally-wiggle'); playSound('tick'); });
    }
    const key = c.keys.find((k) => String(k) === col.dataset.key);
    const count = counts.get(key);
    const share = count / scaleMax;
    col.querySelector('.tally-bar').style.transform = `scaleY(${share})`;
    const label = col.querySelector('.tally-count');
    label.textContent = tallyWords(key, count, c.recipe, c.plain).count;
    label.style.transform = `translateY(${-share * BAR_HEIGHT}px)`;
  });
}

// "Run survey": the classmates answer one by one. Each answer pops into its
// seat and its bar grows one step at the same moment.
// `allKeys`: every answer of every class here, so the colours match the bars.
function runSurvey(c, allKeys, { onProgress, onDone }) {
  const { values } = c.data;
  const labels = seatLabels(c.keys);
  const said = document.getElementById(`${c.p}-said`);

  function revealNext() {
    const i = c.answers.length;
    const value = values[i];
    c.answers.push(value);

    fillSeat(c, allKeys, labels, i, value);
    document.getElementById(`${c.p}-seat-${i}`).classList.add('m-pop');
    said.textContent = `Classmate ${i + 1} said: ${valueText(value, c.recipe)}`;

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
    setIconText(said, 'check', `All ${values.length} classmates answered!`);
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

// One classmate's seat, filled: the classmate gets a face; the shirt and the
// answer badge take the bar's colour.
function fillSeat(c, allKeys, labels, i, value) {
  const seat = document.getElementById(`${c.p}-seat-${i}`);
  seat.innerHTML = `${seatKidSVG(i, true)}<span class="seat-badge" aria-hidden="true">${labels.get(value)}</span><span class="sr-only">Classmate ${i + 1}: ${valueText(value, c.recipe)}</span>`;
  seat.style.setProperty('--seat', `var(--color-${colourFor(allKeys, value)})`);
  seat.classList.add('seat--filled');
}

// Part 60e: a class surveyed on an earlier visit, shown all at once (no sound,
// no log: "data-seen" was logged when the survey ran).
function fillAllSeats(c, allKeys) {
  const { values } = c.data;
  const labels = seatLabels(c.keys);
  values.forEach((value, i) => fillSeat(c, allKeys, labels, i, value));
  c.answers = [...values];
  c.done = true;
  document.getElementById(`${c.p}-fill`).style.transform = 'scaleX(1)';
  document.getElementById(`${c.p}-text`).textContent = `${values.length} of ${values.length}`;
  setIconText(document.getElementById(`${c.p}-said`), 'check', `All ${values.length} classmates answered!`);
}

init();
