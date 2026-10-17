import { mountShell } from '../app.js';

const DEVICES = {
  coin: { label: 'Fair coin', emoji: '🪙', outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  dice: { label: 'Six-sided dice', emoji: '🎲', outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  spinner: { label: 'Fair spinner', emoji: '🎡', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  unfairSpinner: { label: 'Unfair spinner', emoji: '🌀', outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
};

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let selectedDevice = null;

function init() {
  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'chance',
    pipMessage: "Hoo-hoo! Let's test our predictions with real trials!",
    contentHTML: `
      <h2>🎲 Chance Lab</h2>
      <p class="task-progress" id="task-progress">Task 1 of 3</p>

      <section class="task" data-task="1">
        <h3>Pick a device</h3>
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
          <div class="outcome-chips" id="outcome-chips"></div>
        </div>
      </section>

      <section class="task" data-task="2" hidden>
        <h3>Predict</h3>
        <p id="predict-question"></p>
        <div class="certainty-scale" id="certainty-scale">
          <button class="btn certainty-btn" data-value="impossible" type="button">Impossible</button>
          <button class="btn certainty-btn" data-value="unlikely" type="button">Unlikely</button>
          <button class="btn certainty-btn" data-value="even" type="button">Even chance</button>
          <button class="btn certainty-btn" data-value="likely" type="button">Likely</button>
          <button class="btn certainty-btn" data-value="certain" type="button">Certain</button>
        </div>
        <p class="feedback" id="predict-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h3>Run trials</h3>
        <p>Let's test it! Run some trials and compare what happened to the theory.</p>
        <div class="trial-row">
          <button class="btn btn-run" data-count="10" type="button">Run 10</button>
          <button class="btn btn-run" data-count="50" type="button">Run 50</button>
          <button class="btn btn-run" data-count="500" type="button">Run 500</button>
        </div>
        <div class="compare-grid" id="compare-grid" hidden>
          <div class="compare-col">
            <h4>Theoretical (what should happen)</h4>
            <div id="theory-bars" class="bars"></div>
          </div>
          <div class="compare-col">
            <h4>Experimental (what did happen)</h4>
            <div id="experiment-bars" class="bars"></div>
          </div>
        </div>
        <p class="feedback" id="trial-feedback" hidden></p>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupDevicePicker();
  setupPredict();
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
  nextBtn.disabled = !taskComplete[n] || n === 3;
  nextBtn.textContent = n === 3 ? 'All done! 🎉' : 'Next →';
  currentTask = n;

  if (n === 2 && selectedDevice) {
    document.getElementById('predict-question').textContent =
      `How likely do you think it is that our ${selectedDevice.label.toLowerCase()} lands on ${selectedDevice.target}?`;
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
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

      chips.innerHTML = selectedDevice.outcomes.map((o) => `<span class="outcome-chip">${o}</span>`).join('');
      outcomesBox.hidden = false;

      markComplete(1);
    });
  });
}

function setupPredict() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const feedback = document.getElementById('predict-feedback');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      feedback.textContent = `You think it's ${btn.textContent.toLowerCase()} that we'll land on ${selectedDevice.target}. Let's test it!`;
      feedback.hidden = false;
      markComplete(2);
    });
  });
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

function barRow(label, pct, countLabel, fillClass) {
  return `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill ${fillClass}" style="width:${pct}%"></div></div>
      <span class="bar-pct">${pct}%${countLabel}</span>
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
      const totalWeight = selectedDevice.weights.reduce((a, b) => a + b, 0);
      const results = new Map(selectedDevice.outcomes.map((o) => [o, 0]));

      for (let i = 0; i < count; i++) {
        const outcome = runTrial(selectedDevice);
        results.set(outcome, results.get(outcome) + 1);
      }

      theoryBars.innerHTML = selectedDevice.outcomes
        .map((o, i) => barRow(o, Math.round((selectedDevice.weights[i] / totalWeight) * 100), '', 'theory'))
        .join('');

      experimentBars.innerHTML = selectedDevice.outcomes
        .map((o) => barRow(o, Math.round((results.get(o) / count) * 100), ` (${results.get(o)})`, 'experiment'))
        .join('');

      compareGrid.hidden = false;

      const targetIndex = selectedDevice.outcomes.indexOf(selectedDevice.target);
      const theoryPct = Math.round((selectedDevice.weights[targetIndex] / totalWeight) * 100);
      const experimentPct = Math.round((results.get(selectedDevice.target) / count) * 100);
      feedback.textContent = `After ${count} trials, ${selectedDevice.target} came up ${experimentPct}% of the time. Theory says ${theoryPct}%. ${
        count >= 500 ? 'With more trials, it gets closer to theory!' : 'Try more trials to see it get even closer to theory!'
      }`;
      feedback.hidden = false;

      markComplete(3);
    });
  });
}

init();
