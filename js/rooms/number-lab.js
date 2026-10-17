import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, range } from '../helpers/stats.js';

const taskComplete = { 1: false, 2: false, 3: false, 4: false };
let currentTask = 1;

async function init() {
  const response = await fetch('../data/scenarios/sleep-hours.json');
  const recipe = await response.json();
  const { values } = generateClassData(recipe);

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'number',
    pipMessage: "Hoo-hoo! Make a guess first, then let's see what the numbers really say!",
    contentHTML: `
      <h2>🔢 Number Lab</h2>
      <p class="task-progress" id="task-progress">Task 1 of 4</p>

      <section class="task" data-task="1">
        <h3>Predict first!</h3>
        <p>Before we check, what do you think is the typical number of hours of sleep in our pretend class?</p>
        <div class="predict-row">
          <input type="number" id="predict-input" min="0" max="24" aria-label="Your prediction">
          <button class="btn btn-main" id="reveal-btn" type="button">Reveal the numbers</button>
        </div>
        <div class="stats-grid" id="stats-grid" hidden>
          <div class="stat-card"><span class="stat-label">Mean</span><span class="stat-value" id="stat-mean"></span></div>
          <div class="stat-card"><span class="stat-label">Median</span><span class="stat-value" id="stat-median"></span></div>
          <div class="stat-card"><span class="stat-label">Mode</span><span class="stat-value" id="stat-mode"></span></div>
          <div class="stat-card"><span class="stat-label">Range</span><span class="stat-value" id="stat-range"></span></div>
        </div>
        <p class="feedback" id="predict-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h3>Build it!</h3>
        <p>Can you think of 5 numbers whose <strong>mean is 6</strong>?</p>
        <div class="build-row">
          <input type="number" class="build-input" aria-label="Number 1">
          <input type="number" class="build-input" aria-label="Number 2">
          <input type="number" class="build-input" aria-label="Number 3">
          <input type="number" class="build-input" aria-label="Number 4">
          <input type="number" class="build-input" aria-label="Number 5">
        </div>
        <button class="btn btn-main" id="check-build-btn" type="button">Check my numbers</button>
        <p class="feedback" id="build-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h3>Find the mistake</h3>
        <p>Mia looked at these numbers and said: <strong>"The median is 20."</strong></p>
        <p class="number-list">9, 3, 20, 5, 7</p>
        <div class="choice-row">
          <button class="btn choice-btn" data-answer="yes" type="button">✅ Mia is right</button>
          <button class="btn choice-btn" data-answer="no" type="button">❌ Mia is wrong</button>
        </div>
        <p class="feedback" id="mistake-feedback" hidden></p>
      </section>

      <section class="task" data-task="4" hidden>
        <h3>Real-life median and mode</h3>
        <p>A shoe shop sold these sizes this week: <strong>34, 35, 35, 36, 34, 35, 37</strong></p>
        <p>Which size should the shop order the MOST of?</p>
        <div class="choice-row">
          <button class="btn choice-btn" data-answer="34" type="button">34</button>
          <button class="btn choice-btn" data-answer="35" type="button">35</button>
          <button class="btn choice-btn" data-answer="36" type="button">36</button>
          <button class="btn choice-btn" data-answer="37" type="button">37</button>
        </div>
        <p class="feedback" id="shoe-feedback" hidden></p>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupPredict(values);
  setupBuildIt();
  setupFindMistake();
  setupRealLife();
  setupTaskNav();
}

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  document.getElementById('task-progress').textContent = `Task ${n} of 4`;
  document.getElementById('back-btn').disabled = n === 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n] || n === 4;
  nextBtn.textContent = n === 4 ? 'All done! 🎉' : 'Next →';
  currentTask = n;
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === 4;
  }
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask < 4) showTask(currentTask + 1);
  });
  showTask(1);
}

function setupPredict(values) {
  const predictInput = document.getElementById('predict-input');
  const revealBtn = document.getElementById('reveal-btn');
  const statsGrid = document.getElementById('stats-grid');
  const feedback = document.getElementById('predict-feedback');

  revealBtn.addEventListener('click', () => {
    const guess = Number(predictInput.value);
    const meanVal = mean(values);
    const medianVal = median(values);
    const modeVal = mode(values);
    const rangeVal = range(values);

    document.getElementById('stat-mean').textContent = meanVal.toFixed(1);
    document.getElementById('stat-median').textContent = medianVal;
    document.getElementById('stat-mode').textContent = modeVal.join(', ');
    document.getElementById('stat-range').textContent = rangeVal;
    statsGrid.hidden = false;

    if (predictInput.value !== '' && !Number.isNaN(guess)) {
      const diff = Math.abs(guess - meanVal);
      feedback.textContent = diff <= 1
        ? `Nice guess! You said ${guess}, and the mean is ${meanVal.toFixed(1)}.`
        : `You said ${guess}. The mean is ${meanVal.toFixed(1)} — one classmate (3 hours) pulled it down!`;
    } else {
      feedback.textContent = `The mean is ${meanVal.toFixed(1)}.`;
    }
    feedback.hidden = false;
    revealBtn.disabled = true;
    markComplete(1);
  });
}

function setupBuildIt() {
  const inputs = [...document.querySelectorAll('.build-input')];
  const checkBtn = document.getElementById('check-build-btn');
  const feedback = document.getElementById('build-feedback');

  checkBtn.addEventListener('click', () => {
    if (inputs.some((input) => input.value === '')) {
      feedback.textContent = 'Fill in all 5 numbers first!';
      feedback.hidden = false;
      return;
    }

    const numbers = inputs.map((input) => Number(input.value));
    const actualMean = mean(numbers);

    if (actualMean === 6) {
      feedback.textContent = "Yes! Your numbers' mean is exactly 6. 🎉";
      markComplete(2);
    } else {
      feedback.textContent = `Your numbers' mean is ${actualMean.toFixed(2)}. Try adjusting them to reach exactly 6.`;
    }
    feedback.hidden = false;
  });
}

function setupFindMistake() {
  const section = document.querySelector('.task[data-task="3"]');
  const buttons = section.querySelectorAll('.choice-btn');
  const feedback = document.getElementById('mistake-feedback');
  const correctMedian = median([9, 3, 20, 5, 7]);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const prefix = btn.dataset.answer === 'no' ? 'Correct!' : 'Not quite.';
      feedback.textContent = `${prefix} Mia forgot to put the numbers in order first. Sorted, they are 3, 5, 7, 9, 20 — the middle one is ${correctMedian}, not 20.`;
      feedback.hidden = false;
      markComplete(3);
    });
  });
}

function setupRealLife() {
  const section = document.querySelector('.task[data-task="4"]');
  const buttons = section.querySelectorAll('.choice-btn');
  const feedback = document.getElementById('shoe-feedback');
  const shoeSizes = [34, 35, 35, 36, 34, 35, 37];
  const correctMode = mode(shoeSizes);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const chosen = Number(btn.dataset.answer);
      feedback.textContent = correctMode.includes(chosen)
        ? `Yes! Size ${chosen} sold 3 pairs — more than any other size. That's the mode.`
        : `Not quite. Size ${correctMode.join(', ')} sold the most (3 pairs) — that's the mode.`;
      feedback.hidden = false;
      markComplete(4);
    });
  });
}

init();
