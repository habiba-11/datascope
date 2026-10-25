import { mountShell } from '../app.js';
import { logEvent } from '../helpers/log.js';
import { addHintButton } from '../helpers/prompts.js';
import { playSound } from '../sounds.js';
import { animate } from '../motion.js';
import { completePhase } from '../phase-progress.js';

const DEVICES = {
  coin: { label: 'Fair coin', emoji: '🪙', outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  dice: { label: 'Six-sided dice', emoji: '🎲', outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  spinner: { label: 'Fair spinner', emoji: '🎡', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  unfairSpinner: { label: 'Unfair spinner', emoji: '🌀', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
};

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let selectedDevice = null;
// The last trial run for the selected device, so feedback can honestly say
// whether a bigger run came out closer to the theory or not.
let previousRun = null;

function init() {
  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'chance',
    phase: 'chance',
    pipMessage: "Hoo-hoo! Let's test our predictions with real trials!",
    contentHTML: `
      <h1 class="room-title">🎲 Chance Lab</h1>
      <p class="task-progress" id="task-progress">Task 1 of 3</p>

      <section class="task" data-task="1">
        <h2 class="task-title">Pick a device</h2>
        <p>Choose something to test, then see every possible outcome.</p>
        <div class="device-grid" id="device-grid">
          ${Object.entries(DEVICES).map(([key, d]) => `
            <button class="device-card" data-key="${key}" type="button">
              <span class="device-emoji">${d.emoji}</span>
              <span class="device-label">${d.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="outcomes-box" id="outcomes-box" hidden>
          <p><strong>Possible outcomes:</strong></p>
          <div class="spinner-picture" id="spinner-picture" role="img" hidden></div>
          <div class="outcome-chips" id="outcome-chips"></div>
        </div>
      </section>

      <section class="task" data-task="2" hidden>
        <h2 class="task-title">Predict</h2>
        <p id="predict-question"></p>
        <div class="certainty-scale" id="certainty-scale">
          <button class="btn certainty-btn" data-value="impossible" type="button">Impossible</button>
          <button class="btn certainty-btn" data-value="unlikely" type="button">Unlikely</button>
          <button class="btn certainty-btn" data-value="even" type="button">Even chance</button>
          <button class="btn certainty-btn" data-value="likely" type="button">Likely</button>
          <button class="btn certainty-btn" data-value="certain" type="button">Certain</button>
        </div>
        <label for="predict-reason" class="reason-label">Why?</label>
        <textarea id="predict-reason" class="reason-input" rows="2" placeholder="Because..."></textarea>
        <p class="feedback" id="predict-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h2 class="task-title">Run trials</h2>
        <p>Let's test it! Run some trials and compare what happened to the theory.</p>
        <div class="trial-device" id="trial-device" aria-hidden="true"></div>
        <div class="trial-row">
          <button class="btn btn-run" data-count="10" type="button">Run 10</button>
          <button class="btn btn-run" data-count="50" type="button">Run 50</button>
          <button class="btn btn-run" data-count="500" type="button">Run 500</button>
        </div>
        <div class="compare-grid" id="compare-grid" hidden>
          <div class="compare-col">
            <h3>Theoretical (what should happen)</h3>
            <div id="theory-bars" class="bars"></div>
          </div>
          <div class="compare-col">
            <h3>Experimental (what did happen)</h3>
            <div id="experiment-bars" class="bars"></div>
          </div>
        </div>
        <p class="feedback" id="trial-feedback" hidden></p>
        <a class="btn btn-main next-room-btn" id="next-room-btn" href="evidence-board.html" hidden>🚩 Next: Evidence Board →</a>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupDevicePicker();
  setupPredict();
  addHintButton(document.getElementById('predict-reason'), 'chance-why', 'chance-lab');
  setupTrials();
  setupTaskNav();
}

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  document.getElementById('task-progress').textContent = `Task ${n} of 3`;
  document.getElementById('back-btn').disabled = n === 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n];
  // Last task: the room's own big button (next room / save) is the one clear action.
  nextBtn.hidden = n === 3;
  currentTask = n;

  if (n === 2 && selectedDevice) {
    document.getElementById('predict-question').textContent =
      `How likely do you think it is that our ${selectedDevice.label.toLowerCase()} lands on ${selectedDevice.target}?`;
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  // The room's phase is done when every task is done.
  if (Object.values(taskComplete).every(Boolean)) completePhase('chance');
  if (taskNum === 3) document.getElementById('next-room-btn').hidden = false;
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === 3;
  }
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask < 3) showTask(currentTask + 1);
  });
  showTask(1);
}

function setupDevicePicker() {
  const cards = document.querySelectorAll('.device-card');
  const outcomesBox = document.getElementById('outcomes-box');
  const chips = document.getElementById('outcome-chips');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedDevice = DEVICES[card.dataset.key];
      previousRun = null;

      showOutcomes(selectedDevice, chips);
      document.getElementById('trial-device').textContent = selectedDevice.emoji;
      outcomesBox.hidden = false;

      markComplete(1);
    });
  });
}

// The child needs both a certainty rating AND a reason ("answer + why").
// Lists every outcome. Spinners are also drawn, with each part sized by its
// weight, so the unfair spinner LOOKS unfair (Papers 12, 13: "everything is
// equally likely" is the hardest misconception to fix).
const SPINNER_COLOURS = { Red: '#FF7A6B', Blue: '#38B6FF', Green: '#4CC26B', Yellow: '#FFC531' };

function showOutcomes(device, chips) {
  const picture = document.getElementById('spinner-picture');
  const isSpinner = device.outcomes.every((o) => SPINNER_COLOURS[o]);
  const total = device.weights.reduce((a, b) => a + b, 0);

  chips.innerHTML = device.outcomes
    .map((o, i) => (isSpinner
      ? `<span class="outcome-chip">${o}: ${device.weights[i]} of ${total} parts</span>`
      : `<span class="outcome-chip">${o}</span>`))
    .join('');

  picture.hidden = !isSpinner;
  if (!isSpinner) return;

  // conic-gradient draws pie slices: each colour runs from where the last one stopped.
  let start = 0;
  const slices = device.outcomes.map((o, i) => {
    const end = start + (device.weights[i] / total) * 360;
    const slice = `${SPINNER_COLOURS[o]} ${start}deg ${end}deg`;
    start = end;
    return slice;
  });
  picture.style.background = `conic-gradient(${slices.join(', ')})`;
  picture.setAttribute('aria-label', `Spinner: ${device.outcomes.map((o, i) => `${o} ${device.weights[i]} of ${total} parts`).join(', ')}`);
}

function setupPredict() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('predict-reason');
  const feedback = document.getElementById('predict-feedback');
  let chosen = null;

  function checkComplete() {
    if (!chosen) return;
    if (!reasonInput.value.trim()) {
      feedback.textContent = 'Now tell us why you think so!';
      feedback.hidden = false;
      return;
    }
    feedback.textContent = `You think it's ${chosen.toLowerCase()} that we'll land on ${selectedDevice.target}. Let's test it!`;
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
      chosen = btn.textContent;
      checkComplete();
      logCertainty();
    });
  });

  reasonInput.addEventListener('input', checkComplete);
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

// Percentages with one decimal place (16.7, 30, 57.1).
function toPct(part, whole) {
  return Math.round((part / whole) * 1000) / 10;
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

// Honest feedback: says what this run really showed. "Closer" is only
// claimed if this bigger run really is closer to the theory than the last one.
function trialMessage(count, target, timesHit, experimentPct, theoryText, previous, gap) {
  const times = timesHit === 1 ? 'time' : 'times';
  let message = `After ${count} trials, ${target} came up ${timesHit} ${times} (${experimentPct}%). Theory says ${theoryText}.`;

  if (previous && count > previous.count) {
    message += gap < previous.gap
      ? ` That's closer to the theory than your ${previous.count}-trial run (${previous.pct}%).`
      : ` This time it was NOT closer than your ${previous.count}-trial run (${previous.pct}%). Chance can surprise us! Bigger runs are usually closer, but not every time.`;
  } else if (count < 500) {
    message += ' Try a bigger run. Do you think it will get closer?';
  } else {
    message += ' Run 500 again. Does it stay close?';
  }
  return message;
}

function setupTrials() {
  const buttons = document.querySelectorAll('.trial-row .btn-run');
  const compareGrid = document.getElementById('compare-grid');
  const theoryBars = document.getElementById('theory-bars');
  const experimentBars = document.getElementById('experiment-bars');
  const feedback = document.getElementById('trial-feedback');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const count = Number(btn.dataset.count);
      playSound('spin');
      animate(document.getElementById('trial-device'), 'roll');
      const totalWeight = selectedDevice.weights.reduce((a, b) => a + b, 0);
      const results = new Map(selectedDevice.outcomes.map((o) => [o, 0]));

      for (let i = 0; i < count; i++) {
        const outcome = runTrial(selectedDevice);
        results.set(outcome, results.get(outcome) + 1);
      }

      // Theory as "1 in 6 (about 16.7%)", so six rounded numbers never look like 102%.
      const theoryText = (i) => `${selectedDevice.weights[i]} in ${totalWeight} (about ${toPct(selectedDevice.weights[i], totalWeight)}%)`;

      theoryBars.innerHTML = selectedDevice.outcomes
        .map((o, i) => barRow(o, toPct(selectedDevice.weights[i], totalWeight), theoryText(i), 'theory'))
        .join('');

      // For 10, 50 and 500 trials one decimal place is always exact, so these add up to 100%.
      experimentBars.innerHTML = selectedDevice.outcomes
        .map((o) => barRow(o, toPct(results.get(o), count), `${toPct(results.get(o), count)}% (${results.get(o)})`, 'experiment'))
        .join('');

      compareGrid.hidden = false;

      const targetIndex = selectedDevice.outcomes.indexOf(selectedDevice.target);
      const timesHit = results.get(selectedDevice.target);
      const experimentPct = toPct(timesHit, count);
      const gap = Math.abs(timesHit / count - selectedDevice.weights[targetIndex] / totalWeight);

      feedback.textContent = trialMessage(
        count, selectedDevice.target, timesHit, experimentPct, theoryText(targetIndex), previousRun, gap
      );
      feedback.hidden = false;
      logEvent('chance-lab', 'trials', {
        device: selectedDevice.label, outcome: selectedDevice.target, trials: count, timesHit,
        experimentalPct: experimentPct, theory: theoryText(targetIndex),
      });
      previousRun = { count, pct: experimentPct, gap };

      markComplete(3);
    });
  });
}

init();
