import { mountShell, exploreCardTabsHTML } from '../app.js';
import { logEvent } from '../helpers/log.js';
import { createAnswerHint } from '../helpers/prompts.js';
import { chanceAnswers } from '../helpers/suggestions.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { loadContent, loadSharedAnswers } from '../helpers/scenarios.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { toPct, theoryText, theoryWords, outcomeRows, trialMessage } from '../helpers/chance.js';
import { certaintyButtonsHTML } from '../helpers/certainty.js';
import { pipSay } from '../pip.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards } from '../choices.js';
import { iconHTML, setIconLine } from '../icon-text.js';
import {
  deviceHTML, tokenHTML, playDevice, resetDevice, isSpinner, SPINNER_COLOURS,
} from '../chance-devices.js';

// `verb` is the device's own word for one go, used in the messages.
// `sub` and `art` are for its picker card (f12 design, 4 Nov 2026).
const DEVICES = {
  coin: { label: 'Fair coin', sub: '2 sides', art: 'plan-light', verb: 'flips', ing: 'Flipping', outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  dice: { label: 'Dice', sub: '6 sides', art: 'conclude-light', verb: 'rolls', ing: 'Rolling', outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  spinner: { label: 'Fair spinner', sub: '4 equal parts', art: 'collect-light', verb: 'spins', ing: 'Spinning', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  unfairSpinner: { label: 'Unfair spinner', sub: 'one big part', art: 'ask-light', verb: 'spins', ing: 'Spinning', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
};

// Chance Lab in the 3-zone layout (UI guide): Explore tabs on the card, a
// mini stepper, and ONE primary button that says what it does ("▶ Spin 500 times").
const STEP_LABELS = ['Pick a game', 'How likely?', 'Test it'];
const RUN_SIZES = [10, 50, 500];
const RECENT_SHOWN = 12; // the last results, as small tokens

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let bar = null;
let hint = null; // the "why" answers: they follow the device the child picked
let whyWords = null;
let runSize = 10; // chosen on the 10 / 50 / 500 dials
let running = false; // the device is moving: the button waits until it stops
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
  whyWords = (await loadSharedAnswers()).chanceWhy;

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
        ${pipLineHTML(story, ':die: Pick a chance game')}

        <section class="task" data-task="1">
          <div class="device-grid" id="device-grid" aria-label="Chance games">
            ${Object.entries(DEVICES).map(([key, d], i) => `
              <button class="device-card m-pop" style="--i: ${i}" data-key="${key}" type="button">
                <span class="device-art cl-floaty" style="--art: var(--color-${d.art}); --float-delay: ${-i * 0.7}s" aria-hidden="true">${deviceHTML(d)}</span>
                <span class="device-label">${d.label}</span>
                <span class="device-sub">${d.sub}</span>
              </button>`).join('')}
          </div>
          <div class="outcomes-box" id="outcomes-box" hidden>
            <h2 class="outcomes-title">Everything that could happen</h2>
            <div class="outcomes-row">
              <div class="outcomes-spinner cl-floaty" id="outcomes-spinner" aria-hidden="true"></div>
              <div class="outcome-chips" id="outcome-chips"></div>
            </div>
          </div>
        </section>

        <section class="task" data-task="2" hidden>
          <div class="predict-layout">
            <div class="predict-art cl-floaty" id="predict-art" aria-hidden="true"></div>
            <div>
              <div class="likely-ruler" aria-hidden="true"></div>
              <div class="likely-ends" aria-hidden="true"><span>won't happen</span><span>will happen</span></div>
              <div class="certainty-scale likely-scale" id="certainty-scale" role="group" aria-label="How likely">
                ${certaintyButtonsHTML()}
              </div>
              <label for="predict-reason" class="reason-label">${iconHTML('pencil')} Why do you think so?</label>
              <textarea id="predict-reason" class="reason-input" rows="2" placeholder="Because..."></textarea>
              <div class="hint-list-slot" id="why-hints"></div>
              <p class="feedback" id="predict-feedback" hidden></p>
            </div>
          </div>
        </section>

        <section class="task" data-task="3" hidden>
          <div class="test-layout">
            <div class="lab-table">
              <div class="trial-device cl-floaty" id="trial-device" aria-hidden="true"></div>
              <p class="trial-result" id="trial-result" aria-live="polite"></p>
              <div class="size-dials" id="size-dials" aria-label="How many times">
                ${RUN_SIZES.map((n) => `<button class="size-dial" data-value="${n}" type="button">${n}<small>times</small></button>`).join('')}
              </div>
              <!-- The run button sits under the device (Habiba, 4 Nov 2026), not in the bottom bar. -->
              <button class="btn btn-main run-btn" id="run-btn" type="button"></button>
            </div>
            <div>
              <div class="compare-head">
                <h2 class="panel-title">Should happen vs. did happen</h2>
                <span class="compare-key"><i class="key-should"></i>Should</span>
                <span class="compare-key"><i class="key-did"></i>Did</span>
              </div>
              <div class="recent" id="recent"></div>
              <p class="compare-empty" id="compare-empty">Run a test to see what really happens.</p>
              <div class="outcome-rows" id="outcome-rows"></div>
              <p class="feedback" id="trial-feedback" hidden></p>
            </div>
          </div>
        </section>`,
    }),
  });

  bar = setupActionBar({ back: null, primary: { label: '' } });
  setupDevicePicker();
  setupPredict();
  setupTrials();
  showTask(1);
}

const TASK_QUESTIONS = [':die: Pick a chance game', '', ':repeat: Test it many times'];

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  currentTask = n;
  document.getElementById('stepper').innerHTML = miniStepperHTML(STEP_LABELS, n - 1);
  let question = TASK_QUESTIONS[n - 1];

  if (n === 2 && selectedDevice) {
    // The device again (spinners with their slice names), so the child can see
    // the slice sizes while deciding.
    document.getElementById('predict-art').innerHTML = deviceHTML(selectedDevice, { labels: true });
    question = `How likely is it that the ${selectedDevice.label.toLowerCase()} lands on ${selectedDevice.target}?`;
  }
  setIconLine(document.querySelector('.task-question'), question);
  pipSay([story, 'Guess first. Then test it many times!', 'Compare what should happen with what did happen.'][n - 1]);
  bar.setBack(n === 1 ? { label: 'Number Lab', href: 'number-lab.html' } : { label: 'Back', onClick: () => showTask(n - 1) });
  bar.setHint(n === 2 ? hint.button : null);
  refreshPrimary();
}

// "flips" -> "Flip": the device's own word, for the run button.
const runWord = (device) => device.verb[0].toUpperCase() + device.verb.slice(1, -1);

// The run button on the lab table: "▶ Roll 50 times", or "⏳ Rolling..." while
// the device moves. It invites a tap (nudge) until the first test is done.
function refreshRunButton() {
  const button = document.getElementById('run-btn');
  if (!selectedDevice) return;
  const tested = chanceFacts.runSizes.length > 0;
  setIconLine(button, running ? `:clock: ${selectedDevice.ing}...` : `:play: ${runWord(selectedDevice)} ${runSize} times`);
  button.disabled = running;
  button.classList.toggle('m-nudge', !running && !tested);
}

// The ONE primary button: what it says depends on the step and what is done.
// On the test step it only finishes; the run button is on the lab table.
function refreshPrimary() {
  refreshRunButton();
  const tested = chanceFacts.runSizes.length > 0;
  const reasonGiven = document.getElementById('predict-reason').value.trim() !== '';
  if (currentTask === 1) {
    bar.setPrimary(selectedDevice
      ? { label: 'Next: How likely? →', ready: true, onClick: () => showTask(2) }
      : { label: '', enabled: false, whyDisabled: ':tap: Pick a game first' });
  } else if (currentTask === 2) {
    if (!rating) bar.setPrimary({ label: '', enabled: false, whyDisabled: ':tap: Pick how likely' });
    else if (!reasonGiven) bar.setPrimary({ label: '', enabled: false, whyDisabled: ':pencil: Say why first' });
    else bar.setPrimary({ label: 'Next: Test it →', ready: true, onClick: () => showTask(3) });
  } else if (running || !tested) {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: running ? `:clock: ${selectedDevice.ing}...` : ':tap: Test it first' });
  } else if (isPhaseDone('chance') && taskComplete[3]) {
    bar.setPrimary({ label: ':flag: Next: Evidence Board →', ready: true, onClick: () => { location.href = 'evidence-board.html'; } });
  } else {
    bar.setPrimary({ label: ":check: I'm done testing", ready: true, onClick: () => finishPhase('chance', withYourWork()).then(refreshPrimary) });
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) refreshPrimary();
}

// The facts for the summary card, with the child's "why" for "Your work".
function withYourWork() {
  return {
    ...chanceFacts,
    reason: document.getElementById('predict-reason').value.trim(),
    reasonSource: hint ? hint.answerFields().answerSource : null,
  };
}

function setupDevicePicker() {
  wireChoiceCards(document.getElementById('device-grid'), '.device-card', (card) => {
    const reasonBox = document.getElementById('predict-reason');
    // Another device means another question, so its answers and its "why" start afresh.
    if (DEVICES[card.dataset.key] !== selectedDevice) {
      reasonBox.value = '';
      hint = createAnswerHint('chance-why', 'chance-lab', chanceAnswers(whyWords, DEVICES[card.dataset.key]), reasonBox);
      document.getElementById('why-hints').replaceChildren(hint.list);
    }
    selectedDevice = DEVICES[card.dataset.key];
    previousRun = null;
    chanceFacts.runSizes = []; // a new device starts a new experiment
    chanceFacts.pct500 = null;

    showOutcomes(selectedDevice);
    drawTrialDevice(selectedDevice);
    document.getElementById('outcomes-box').hidden = false;

    markComplete(1);
  });
}

// Lists every outcome. Spinners are also drawn, with each part sized by its
// weight, so the unfair spinner LOOKS unfair (Papers 12, 13: "everything is
// equally likely" is the hardest misconception to fix).
function showOutcomes(device) {
  const spinner = isSpinner(device);
  const total = device.weights.reduce((a, b) => a + b, 0);
  const picture = document.getElementById('outcomes-spinner');
  picture.innerHTML = spinner ? deviceHTML(device, { labels: true }) : '';
  picture.hidden = !spinner;
  document.getElementById('outcome-chips').innerHTML = device.outcomes
    .map((o, i) => `<span class="outcome-chip">${tokenHTML(o)}${o}${spinner ? `<small>${device.weights[i]} of ${total} parts</small>` : ''}</span>`)
    .join('');
}

// The device in Task 3, big, on the lab table; the "did" bars start empty.
function drawTrialDevice(device) {
  resetDevice();
  document.getElementById('trial-device').innerHTML = deviceHTML(device, { labels: true });
  document.getElementById('trial-result').textContent = 'Ready? Press the green button!';
  document.getElementById('recent').innerHTML = '';
  document.getElementById('compare-empty').hidden = false;
  document.getElementById('trial-feedback').hidden = true;
  const none = new Map(device.outcomes.map((o) => [o, 0]));
  const rows = document.getElementById('outcome-rows');
  // The cards sit side by side, so every outcome (and the goal) is in view
  // without scrolling: 3 across for the die (2 rows), 2 across for the others.
  rows.style.setProperty('--cols', device.outcomes.length > 4 ? 3 : 2);
  rows.innerHTML = outcomeRows(device.outcomes, device.weights, none, 1)
    .map((row) => outcomeCardHTML(device, row, false)).join('');
  growBars();
}

function setupPredict() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('predict-reason');
  const feedback = document.getElementById('predict-feedback');
  let chosen = null;

  function checkComplete() {
    if (!chosen) return;
    if (!reasonInput.value.trim()) {
      setIconLine(feedback, ':pencil: Now say why you think so!');
      feedback.hidden = false;
      return;
    }
    setIconLine(feedback, `:thumbsup: You think ${selectedDevice.target} is "${chosen.toLowerCase()}". Let's test it!`);
    feedback.hidden = false;
    markComplete(2);
  }

  // Logged when a rating is picked (if a reason exists) or when the child
  // leaves the reason box, so a changed mind shows up as a new entry.
  function logCertainty() {
    if (!chosen || !reasonInput.value.trim()) return;
    logEvent('chance-lab', 'certainty', {
      device: selectedDevice.label, outcome: selectedDevice.target, rating: chosen, reason: reasonInput.value.trim(), ...hint.answerFields(),
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

// One small card per outcome (f12, made compact 4 Nov 2026 so the cards fit
// side by side): "Should 16.7%" over its striped bar, then "Did 20%" over its
// solid bar (the outcome's colour), with the small words under each bar.
// The goal's card has a gold frame AND "⭐ we track this".
function outcomeCardHTML(device, row, tested) {
  const name = /^[1-6]$/.test(row.name) ? `Rolling a ${row.name}` : row.name;
  const goal = row.name === device.target;
  const tracked = goal ? `<span class="tracked">${iconHTML('star')} we track this</span>` : '';
  const line = (word, pct, big, small, fillClass) => `
    <div class="bar-line">
      <div class="bar-head"><span class="bar-word">${word}</span><span class="bar-value">${big}</span></div>
      <div class="bar-track"><i class="bar-fill ${fillClass}" data-width="${pct}%"></i></div>
      <span class="bar-small">${small}</span>
    </div>`;
  return `
    <div class="outcome-card${goal ? ' goal' : ''}" style="--c: ${SPINNER_COLOURS[row.name] || 'var(--color-explore)'}">
      <div class="outcome-name">${tokenHTML(row.name)}${name}${tracked}</div>
      ${line('Should', row.shouldPct, row.shouldBig, row.shouldSmall, 'should')}
      ${tested ? line('Did', row.didPct, row.didBig, row.didSmall, 'did') : line('Did', 0, '–', 'not tested yet', 'did')}
    </div>`;
}

// The bars grow from nothing once they are on the page (no growing with reduced motion: css).
function growBars() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('#outcome-rows .bar-fill').forEach((fill) => { fill.style.width = fill.dataset.width; });
  }));
}

// What the run button does (set up in setupTrials).
let runTrials = () => {};

function setupTrials() {
  // Picking a size changes what the run button says.
  const dials = document.getElementById('size-dials');
  wireChoiceCards(dials, '.size-dial', (btn) => {
    runSize = Number(btn.dataset.value);
    refreshRunButton();
  });
  document.getElementById('run-btn').addEventListener('click', () => runTrials());
  dials.querySelector('.size-dial[data-value="10"]').click();

  const rows = document.getElementById('outcome-rows');
  const feedback = document.getElementById('trial-feedback');
  const result = document.getElementById('trial-result');

  runTrials = () => {
    if (running) return;
    const device = selectedDevice;
    const count = runSize;
    const totalWeight = device.weights.reduce((a, b) => a + b, 0);
    const results = new Map(device.outcomes.map((o) => [o, 0]));
    const order = [];
    for (let i = 0; i < count; i++) {
      const outcome = runTrial(device);
      results.set(outcome, results.get(outcome) + 1);
      order.push(outcome);
    }
    const lastOutcome = order[order.length - 1];

    // The device moves first; the results appear when it has stopped.
    running = true;
    refreshPrimary();
    result.textContent = '…';
    playDevice(document.getElementById('trial-device'), device, lastOutcome).then(() => {
      running = false;
      result.textContent = /^[1-6]$/.test(lastOutcome) ? `You rolled a ${lastOutcome}!` : `${lastOutcome}!`;

      // For 10, 50 and 500 trials one decimal place is always exact, so these add up to 100%.
      rows.innerHTML = outcomeRows(device.outcomes, device.weights, results, count)
        .map((row) => outcomeCardHTML(device, row, true)).join('');
      growBars();
      document.getElementById('compare-empty').hidden = true;
      // The last results as small tokens, each with its name for screen readers.
      document.getElementById('recent').innerHTML = `<span class="recent-label">Last ${Math.min(count, RECENT_SHOWN)}:</span>${order.slice(-RECENT_SHOWN)
        .map((o, i) => `<span class="recent-token" style="--i: ${i}">${tokenHTML(o)}<span class="sr-only">${o}</span></span>`).join('')}`;

      const targetIndex = device.outcomes.indexOf(device.target);
      const timesHit = results.get(device.target);
      const experimentPct = toPct(timesHit, count);
      const gap = Math.abs(timesHit / count - device.weights[targetIndex] / totalWeight);

      setIconLine(feedback, trialMessage({
        count, verb: device.verb, target: device.target, timesHit,
        pct: experimentPct, theory: theoryWords(device.weights[targetIndex], totalWeight), previous: previousRun, gap,
      }));
      feedback.hidden = false;
      logEvent('chance-lab', 'trials', {
        device: device.label, outcome: device.target, trials: count, timesHit,
        experimentalPct: experimentPct, theory: theoryText(device.weights[targetIndex], totalWeight),
      });
      previousRun = { count, pct: experimentPct, gap };
      chanceFacts.target = device.target;
      chanceFacts.theoryText = theoryWords(device.weights[targetIndex], totalWeight);
      chanceFacts.runSizes.push(count);
      if (count === 500) chanceFacts.pct500 = experimentPct;

      markComplete(3);
      refreshPrimary();
    });
  };
}

init();
