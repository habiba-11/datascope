import { mountShell } from '../app.js';
import { logEvent } from '../helpers/log.js';
import { addHintButton } from '../helpers/prompts.js';
import { playSound } from '../sounds.js';
import { animate } from '../motion.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { loadContent } from '../helpers/scenarios.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { toPct, theoryText, trialMessage } from '../helpers/chance.js';
import { certaintyButtonsHTML } from '../helpers/certainty.js';

// `verb` is the device's own word for one go, used in the messages.
const DEVICES = {
  coin: { label: 'Fair coin', emoji: '🪙', verb: 'flips', outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  dice: { label: 'Dice', emoji: '🎲', verb: 'rolls', outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  spinner: { label: 'Fair spinner', emoji: '🎡', verb: 'spins', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  unfairSpinner: { label: 'Unfair spinner', emoji: '🌀', verb: 'spins', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
};


const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let selectedDevice = null;
// The last trial run for the selected device, so feedback can honestly say
// whether a bigger run came out closer to the theory or not.
let previousRun = null;
// What the child did, for the feedback card at the end (Part 16).
const chanceFacts = { rating: '', target: '', runSizes: [], pct500: null, theoryText: '' };

async function init() {
  // Only the story follows the scenario; the 4 devices stay the same for everyone.
  const { chanceLab } = await loadContent(getSelectedScenarioId());

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'chance',
    phase: 'chance',
    pipMessage: "Hoo-hoo! Guess first. Then test it many times!",
    contentHTML: `
      <h1 class="room-title">🎲 Chance Lab</h1>
      <p class="task-progress" id="task-progress">Task 1 of 3</p>

      <section class="task" data-task="1">
        <h2 class="task-title">🎲 Pick a chance game</h2>
        <p class="chance-story">${chanceLab.story}</p>
        <p>Pick one. Then see everything that could happen.</p>
        <div class="device-grid" id="device-grid">
          ${Object.entries(DEVICES).map(([key, d]) => `
            <button class="device-card" data-key="${key}" type="button">
              <span class="device-emoji">${d.emoji}</span>
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
        <h2 class="task-title">🤔 How likely?</h2>
        <p id="predict-question"></p>
        <div class="certainty-scale" id="certainty-scale">
          ${certaintyButtonsHTML()}
        </div>
        <label for="predict-reason" class="reason-label">✏️ Why do you think so?</label>
        <textarea id="predict-reason" class="reason-input" rows="2" placeholder="Because..."></textarea>
        <p class="feedback" id="predict-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h2 class="task-title">🔁 Test it many times</h2>
        <p>Run a test. Compare what should happen with what did happen.</p>
        <div class="trial-device" id="trial-device" aria-hidden="true"></div>
        <div class="trial-row">
          <button class="btn btn-run" data-count="10" type="button">▶ 10 times</button>
          <button class="btn btn-run" data-count="50" type="button">▶ 50 times</button>
          <button class="btn btn-run" data-count="500" type="button">▶ 500 times</button>
        </div>
        <div class="compare-grid" id="compare-grid" hidden>
          <div class="compare-col">
            <h3>🎯 Should happen (theory)</h3>
            <div id="theory-bars" class="bars"></div>
          </div>
          <div class="compare-col">
            <h3>🧪 Did happen (our test)</h3>
            <div id="experiment-bars" class="bars"></div>
          </div>
        </div>
        <p class="feedback" id="trial-feedback" hidden></p>
        <button class="btn btn-main" id="chance-done-btn" type="button" hidden>✅ I'm done testing</button>
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

  document.getElementById('chance-done-btn').addEventListener('click', (event) => {
    event.target.hidden = true;
    document.getElementById('next-room-btn').hidden = false;
    finishPhase('chance', chanceFacts);
  });
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
      `How likely is it that the ${selectedDevice.label.toLowerCase()} lands on ${selectedDevice.target}?`;
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  // After the first run: "I'm done testing" (or straight on, if this phase was finished before).
  if (taskNum === 3) {
    const finished = isPhaseDone('chance');
    document.getElementById('chance-done-btn').hidden = finished;
    document.getElementById('next-room-btn').hidden = !finished;
  }
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
      chanceFacts.runSizes = []; // a new device starts a new experiment
      chanceFacts.pct500 = null;

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
      chanceFacts.rating = chosen;
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

function barRow(label, pct, text, fillClass) {
  return `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill ${fillClass}" style="width:${pct}%"></div></div>
      <span class="bar-pct">${text}</span>
    </div>
  `;
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

      const theoryFor = (i) => theoryText(selectedDevice.weights[i], totalWeight);

      theoryBars.innerHTML = selectedDevice.outcomes
        .map((o, i) => barRow(o, toPct(selectedDevice.weights[i], totalWeight), theoryFor(i), 'theory'))
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

      markComplete(3);
    });
  });
}

init();
