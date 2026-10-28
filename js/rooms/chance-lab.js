import { mountShell, exploreCardTabsHTML } from '../app.js';
import { logEvent } from '../helpers/log.js';
import { createHint } from '../helpers/prompts.js';
import { playSound } from '../sounds.js';
import { stagger } from '../motion.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { loadContent } from '../helpers/scenarios.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { toPct, theoryText, trialMessage, needleAngle } from '../helpers/chance.js';
import { certaintyButtonsHTML } from '../helpers/certainty.js';
import { pipSay } from '../pip.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards, segmentedHTML } from '../choices.js';

// `verb` is the device's own word for one go, used in the messages.
const DEVICES = {
  coin: { label: 'Fair coin', emoji: '🪙', verb: 'flips', outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  dice: { label: 'Dice', emoji: '🎲', verb: 'rolls', outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  spinner: { label: 'Fair spinner', emoji: '🎡', verb: 'spins', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  unfairSpinner: { label: 'Unfair spinner', emoji: '🌀', verb: 'spins', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
};


// Chance Lab in the 3-zone layout (UI guide): Explore tabs on the card, a
// mini stepper, and ONE primary button that says what it does ("▶ Spin 500 times").
const STEP_LABELS = ['Pick a game', 'How likely?', 'Test it'];
const RUN_SIZES = [10, 50, 500];

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let bar = null;
let hint = null;
let runSize = 10; // chosen on the 10 / 50 / 500 switch
let justRan = false; // after a run the primary offers "I'm done testing"
let rating = null; // the certainty word picked in step 2
let story = '';
let selectedDevice = null;
// The last trial run for the selected device, so feedback can honestly say
// whether a bigger run came out closer to the theory or not.
let previousRun = null;
// What the child did, for the feedback card at the end (Part 16).
const chanceFacts = { rating: '', target: '', runSizes: [], pct500: null, theoryText: '' };

async function init() {
  // Only the story follows the scenario; the 4 devices stay the same for everyone.
  const { chanceLab } = await loadContent(getSelectedScenarioId());

  story = chanceLab.story;
  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'chance',
    phase: 'chance',
    layout: 'card',
    contentHTML: taskCardHTML({
      tabsHTML: exploreCardTabsHTML(),
      bodyHTML: `
        <div id="stepper"></div>
        ${pipLineHTML(story, '🎲 Pick a chance game')}

        <section class="task" data-task="1">
          <div class="device-grid" id="device-grid">
            ${Object.entries(DEVICES).map(([key, d], i) => `
              <button class="device-card m-pop" style="--i: ${i}" data-key="${key}" type="button">
                <span class="device-emoji" aria-hidden="true">${d.emoji}</span>
                <span class="device-label">${d.label}</span>
              </button>
            `).join('')}
          </div>
          <div class="outcomes-box" id="outcomes-box" hidden>
            <p><strong>Everything that could happen:</strong></p>
            <div class="spinner-picture" id="spinner-picture" role="img" hidden></div>
            <div class="outcome-chips" id="outcome-chips"></div>
          </div>
        </section>

        <section class="task" data-task="2" hidden>
          <div class="spinner-picture small" id="predict-picture" role="img" hidden></div>
          <div class="certainty-scale" id="certainty-scale">
            ${certaintyButtonsHTML()}
          </div>
          <label for="predict-reason" class="reason-label">✏️ Why do you think so?</label>
          <textarea id="predict-reason" class="reason-input" rows="2" placeholder="Because..."></textarea>
          <div class="hint-list-slot" id="why-hints"></div>
          <p class="feedback" id="predict-feedback" hidden></p>
        </section>

        <section class="task" data-task="3" hidden>
          <div class="card-panels">
            <div class="trial-side">
              <div class="trial-device" id="trial-device" aria-hidden="true"></div>
              <p class="trial-result" id="trial-result"></p>
              ${segmentedHTML(RUN_SIZES.map((n) => ({ value: n, label: String(n) })), 'How many times')}
            </div>
            <div class="compare-side">
              <h2 class="panel-title">Should happen vs. did happen</h2>
              <p class="compare-key"><span class="key-should" aria-hidden="true"></span> 🎯 Should (theory) <span class="key-did" aria-hidden="true"></span> 🧪 Did (our test)</p>
              <div class="compare-grid" id="compare-grid" hidden>
                <div class="compare-col">
                  <h3>🎯 Should happen</h3>
                  <div id="theory-bars" class="bars"></div>
                </div>
                <div class="compare-col">
                  <h3>🧪 Did happen</h3>
                  <div id="experiment-bars" class="bars"></div>
                </div>
              </div>
              <p class="compare-empty" id="compare-empty">Run a test to see the bars.</p>
            </div>
          </div>
          <p class="feedback" id="trial-feedback" hidden></p>
        </section>`,
    }),
  });

  bar = setupActionBar({ back: null, primary: { label: '' } });
  setupDevicePicker();
  setupPredict();
  hint = createHint('chance-why', 'chance-lab');
  document.getElementById('why-hints').append(hint.list);
  setupTrials();
  showTask(1);
}

const TASK_QUESTIONS = ['🎲 Pick a chance game', '', '🔁 Test it many times'];

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  currentTask = n;
  document.getElementById('stepper').innerHTML = miniStepperHTML(STEP_LABELS, n - 1);
  let question = TASK_QUESTIONS[n - 1];

  if (n === 2 && selectedDevice) {
    // Spinners: show the spinner again, so the child can see the slice sizes while deciding.
    const picture = document.getElementById('predict-picture');
    picture.hidden = !isSpinner(selectedDevice);
    if (!picture.hidden) {
      picture.style.background = spinnerGradient(selectedDevice);
      picture.setAttribute('aria-label', document.getElementById('spinner-picture').getAttribute('aria-label'));
    }
    question = `How likely is it that the ${selectedDevice.label.toLowerCase()} lands on ${selectedDevice.target}?`;
  }
  document.querySelector('.task-question').textContent = question;
  pipSay([story, 'Guess first. Then test it many times!', 'Compare what should happen with what did happen.'][n - 1]);
  bar.setBack(n === 1 ? { label: 'Number Lab', href: 'number-lab.html' } : { label: 'Back', onClick: () => showTask(n - 1) });
  bar.setHint(n === 2 ? hint.button : null);
  refreshPrimary();
}

// "flips" -> "Flip": the device's own word, for the run button.
const runWord = (device) => device.verb[0].toUpperCase() + device.verb.slice(1, -1);

// The ONE primary button: what it says depends on the step and what is done.
function refreshPrimary() {
  const reasonGiven = document.getElementById('predict-reason').value.trim() !== '';
  if (currentTask === 1) {
    bar.setPrimary(selectedDevice
      ? { label: 'Next: How likely? →', ready: true, onClick: () => showTask(2) }
      : { label: '', enabled: false, whyDisabled: '👆 Pick a game first' });
  } else if (currentTask === 2) {
    if (!rating) bar.setPrimary({ label: '', enabled: false, whyDisabled: '👆 Pick how likely' });
    else if (!reasonGiven) bar.setPrimary({ label: '', enabled: false, whyDisabled: '✏️ Say why first' });
    else bar.setPrimary({ label: 'Next: Test it →', ready: true, onClick: () => showTask(3) });
  } else if (isPhaseDone('chance') && taskComplete[3]) {
    bar.setPrimary({ label: '🚩 Next: Evidence Board →', ready: true, onClick: () => { location.href = 'evidence-board.html'; } });
  } else if (justRan) {
    bar.setPrimary({ label: "✅ I'm done testing", onClick: () => finishPhase('chance', chanceFacts).then(refreshPrimary) });
  } else {
    bar.setPrimary({ label: `▶ ${runWord(selectedDevice)} ${runSize} times`, onClick: runTrials });
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) refreshPrimary();
}

function setupDevicePicker() {
  const outcomesBox = document.getElementById('outcomes-box');
  const chips = document.getElementById('outcome-chips');

  wireChoiceCards(document.getElementById('device-grid'), '.device-card', (card) => {
    selectedDevice = DEVICES[card.dataset.key];
    previousRun = null;
    chanceFacts.runSizes = []; // a new device starts a new experiment
    chanceFacts.pct500 = null;

    showOutcomes(selectedDevice, chips);
    drawTrialDevice(selectedDevice);
    outcomesBox.hidden = false;
    justRan = false;

    markComplete(1);
  });
}

// The child needs both a certainty rating AND a reason ("answer + why").
// Lists every outcome. Spinners are also drawn, with each part sized by its
// weight, so the unfair spinner LOOKS unfair (Papers 12, 13: "everything is
// equally likely" is the hardest misconception to fix).
const SPINNER_COLOURS = { Red: '#FF7A6B', Blue: '#38B6FF', Green: '#4CC26B', Yellow: '#FFC531' };

function showOutcomes(device, chips) {
  const picture = document.getElementById('spinner-picture');
  const spinner = isSpinner(device);
  const total = device.weights.reduce((a, b) => a + b, 0);

  chips.innerHTML = device.outcomes
    .map((o, i) => (spinner
      ? `<span class="outcome-chip">${o}: ${device.weights[i]} of ${total} parts</span>`
      : `<span class="outcome-chip">${o}</span>`))
    .join('');

  picture.hidden = !spinner;
  if (!spinner) return;

  picture.style.background = spinnerGradient(device);
  picture.setAttribute('aria-label', `Spinner: ${device.outcomes.map((o, i) => `${o} ${device.weights[i]} of ${total} parts`).join(', ')}`);
}

const isSpinner = (device) => device.outcomes.every((o) => SPINNER_COLOURS[o]);

// conic-gradient draws pie slices: each colour runs from where the last one
// stopped, clockwise from the top (needleAngle in helpers/chance.js uses the same).
function spinnerGradient(device) {
  const total = device.weights.reduce((a, b) => a + b, 0);
  let start = 0;
  const slices = device.outcomes.map((o, i) => {
    const end = start + (device.weights[i] / total) * 360;
    const slice = `${SPINNER_COLOURS[o]} ${start}deg ${end}deg`;
    start = end;
    return slice;
  });
  return `conic-gradient(${slices.join(', ')})`;
}

// The device in Task 3: a coin or dice emoji, or a small spinner with a needle.
function drawTrialDevice(device) {
  const box = document.getElementById('trial-device');
  document.getElementById('trial-result').textContent = '';
  if (isSpinner(device)) {
    box.innerHTML = '<div class="mini-spinner"><div class="needle"></div></div>';
    box.querySelector('.mini-spinner').style.background = spinnerGradient(device);
  } else {
    box.innerHTML = `<span class="device-face">${device.emoji}</span>`;
  }
}

// Part 21c: the device moves, then shows the LAST trial's result. The coin
// flips, the dice tumbles, the spinner's needle spins and stops inside the
// slice of the real result. Reduced motion (or no GSAP): just the result.
function playTrialDevice(device, lastOutcome) {
  const result = document.getElementById('trial-result');
  const showResult = () => { result.textContent = `Last one: ${lastOutcome}`; };
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const needle = document.querySelector('#trial-device .needle');
  const index = device.outcomes.indexOf(lastOutcome);

  if (needle) {
    const angle = needleAngle(device.weights, index, Math.random());
    if (!gsap || reduceMotion) {
      needle.style.transform = `rotate(${angle % 360}deg)`;
      showResult();
      return;
    }
    result.textContent = '';
    gsap.fromTo(needle, { rotation: 0 }, {
      rotation: angle, duration: 1.6, ease: 'power3.out', onComplete: showResult,
    });
    return;
  }

  const face = document.querySelector('#trial-device .device-face');
  if (!gsap || reduceMotion || !face) {
    showResult();
    return;
  }
  result.textContent = '';
  const coin = device.outcomes.length === 2;
  gsap.timeline({ onComplete: showResult })
    .to(face, coin
      ? { rotationY: 1080, y: -40, duration: 0.5, ease: 'power2.out' } // a flip, up in the air
      : { rotation: 720, y: -30, duration: 0.45, ease: 'power2.out' }) // the dice tumbles up
    .to(face, { y: 0, duration: 0.45, ease: 'bounce.out' })
    .set(face, { rotation: 0, rotationY: 0 });
}

function setupPredict() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('predict-reason');
  const feedback = document.getElementById('predict-feedback');
  let chosen = null;

  function checkComplete() {
    if (!chosen) return;
    if (!reasonInput.value.trim()) {
      feedback.textContent = '✏️ Now say why you think so!';
      feedback.hidden = false;
      return;
    }
    feedback.textContent = `👍 You think ${selectedDevice.target} is "${chosen.toLowerCase()}". Let's test it!`;
    feedback.hidden = false;
    markComplete(2);
  }

  // Logged when a rating is picked (if a reason exists) or when the child
  // leaves the reason box, so a changed mind shows up as a new entry.
  function logCertainty() {
    if (!chosen || !reasonInput.value.trim()) return;
    logEvent('chance-lab', 'certainty', {
      device: selectedDevice.label, outcome: selectedDevice.target, rating: chosen, reason: reasonInput.value.trim(),
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      chosen = btn.dataset.word; // the word only, without the small gloss
      rating = chosen;
      chanceFacts.rating = chosen;
      refreshPrimary();
      checkComplete();
      logCertainty();
    });
  });

  reasonInput.addEventListener('input', () => { checkComplete(); refreshPrimary(); });
  reasonInput.addEventListener('change', logCertainty);
}

function runTrial(device) {
  const totalWeight = device.weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < device.outcomes.length; i++) {
    r -= device.weights[i];
    if (r <= 0) return device.outcomes[i];
  }
  return device.outcomes[device.outcomes.length - 1];
}

function barRow(label, pct, text, fillClass) {
  return `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill ${fillClass}" style="width:${pct}%"></div></div>
      <span class="bar-pct">${text}</span>
    </div>
  `;
}

// What the primary button runs on the test step (set up in setupTrials).
let runTrials = () => {};

function setupTrials() {
  // Picking a size (again) makes the primary a run button for that size.
  wireChoiceCards(document.querySelector('.segmented'), '.segment', (btn) => {
    runSize = Number(btn.dataset.value);
    justRan = false;
    if (currentTask === 3) refreshPrimary();
  });
  document.querySelector('.segment[data-value="10"]').click();

  const compareGrid = document.getElementById('compare-grid');
  const theoryBars = document.getElementById('theory-bars');
  const experimentBars = document.getElementById('experiment-bars');
  const feedback = document.getElementById('trial-feedback');

  runTrials = () => {
    const count = runSize;
    playSound('spin');
    const totalWeight = selectedDevice.weights.reduce((a, b) => a + b, 0);
    const results = new Map(selectedDevice.outcomes.map((o) => [o, 0]));

    let lastOutcome = null;
    for (let i = 0; i < count; i++) {
      lastOutcome = runTrial(selectedDevice);
      results.set(lastOutcome, results.get(lastOutcome) + 1);
    }
    playTrialDevice(selectedDevice, lastOutcome);

    const theoryFor = (i) => theoryText(selectedDevice.weights[i], totalWeight);

    theoryBars.innerHTML = selectedDevice.outcomes
      .map((o, i) => barRow(o, toPct(selectedDevice.weights[i], totalWeight), theoryFor(i), 'theory'))
      .join('');

    // For 10, 50 and 500 trials one decimal place is always exact, so these add up to 100%.
    experimentBars.innerHTML = selectedDevice.outcomes
      .map((o) => barRow(o, toPct(results.get(o), count), `${toPct(results.get(o), count)}% (${results.get(o)})`, 'experiment'))
      .join('');

    compareGrid.hidden = false;
    document.getElementById('compare-empty').hidden = true;
    // The "did happen" bars grow from nothing, one after another.
    stagger(experimentBars.querySelectorAll('.bar-fill'), { each: 0.1, from: { width: 0 }, keepStyle: true });

    const targetIndex = selectedDevice.outcomes.indexOf(selectedDevice.target);
    const timesHit = results.get(selectedDevice.target);
    const experimentPct = toPct(timesHit, count);
    const gap = Math.abs(timesHit / count - selectedDevice.weights[targetIndex] / totalWeight);

    feedback.textContent = trialMessage({
      count, verb: selectedDevice.verb, target: selectedDevice.target, timesHit,
      pct: experimentPct, theory: theoryFor(targetIndex), previous: previousRun, gap,
    });
    feedback.hidden = false;
    logEvent('chance-lab', 'trials', {
      device: selectedDevice.label, outcome: selectedDevice.target, trials: count, timesHit,
      experimentalPct: experimentPct, theory: theoryFor(targetIndex),
    });
    previousRun = { count, pct: experimentPct, gap };
    chanceFacts.target = selectedDevice.target;
    chanceFacts.theoryText = theoryFor(targetIndex);
    chanceFacts.runSizes.push(count);
    if (count === 500) chanceFacts.pct500 = experimentPct;

    justRan = true;
    markComplete(3);
  };
}

init();
