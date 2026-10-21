import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, range, formatMean } from '../helpers/stats.js';
import { logEvent, trackMeaningTask } from '../helpers/log.js';

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
        <p>A shoe shop sold these sizes this week: <strong>36, 34, 35, 34, 37, 36, 34</strong></p>
        <p><strong>1.</strong> Which size should the shop order the MOST of?</p>
        <div class="choice-row" id="mode-choices">
          <button class="btn choice-btn" data-answer="34" type="button">34</button>
          <button class="btn choice-btn" data-answer="35" type="button">35</button>
          <button class="btn choice-btn" data-answer="36" type="button">36</button>
          <button class="btn choice-btn" data-answer="37" type="button">37</button>
        </div>
        <p class="feedback" id="shoe-feedback" hidden></p>

        <div id="median-question" hidden>
          <p><strong>2.</strong> The shop wants the <strong>median</strong> size: half of the shoes sold are this size or smaller, and half are this size or bigger. Which size is it?</p>
          <div class="choice-row" id="median-choices">
            <button class="btn choice-btn" data-answer="34" type="button">34</button>
            <button class="btn choice-btn" data-answer="35" type="button">35</button>
            <button class="btn choice-btn" data-answer="36" type="button">36</button>
            <button class="btn choice-btn" data-answer="37" type="button">37</button>
          </div>
          <p class="feedback" id="median-feedback" hidden></p>
        </div>
        <a class="btn btn-main next-room-btn" id="next-room-btn" href="chance-lab.html" hidden>🎲 Next: Chance Lab →</a>
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
  if (taskNum === 4) document.getElementById('next-room-btn').hidden = false;
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
    // Predict first: the numbers stay hidden until the child has made a guess.
    if (predictInput.value === '') {
      feedback.textContent = 'Type your guess first, then press Reveal!';
      feedback.hidden = false;
      return;
    }
    const guess = Number(predictInput.value);
    const meanVal = formatMean(mean(values));
    const medianVal = median(values);
    const modeVal = mode(values);
    const rangeVal = range(values);

    document.getElementById('stat-mean').textContent = meanVal;
    document.getElementById('stat-median').textContent = medianVal;
    document.getElementById('stat-mode').textContent = modeVal.join(', ');
    document.getElementById('stat-range').textContent = rangeVal;
    statsGrid.hidden = false;

    const diff = Math.abs(guess - meanVal);
    feedback.textContent = diff <= 1
      ? `Nice guess! You said ${guess}, and the mean is ${meanVal}.`
      : `You said ${guess}. The mean is ${meanVal} — one classmate (3 hours) pulled it down!`;
    feedback.hidden = false;
    revealBtn.disabled = true;
    logEvent('number-lab', 'prediction', {
      about: 'typical hours of sleep', guess, mean: meanVal, median: medianVal,
    });
    markComplete(1);
  });
}

function setupBuildIt() {
  const inputs = [...document.querySelectorAll('.build-input')];
  const checkBtn = document.getElementById('check-build-btn');
  const feedback = document.getElementById('build-feedback');
  const tracker = trackMeaningTask('number-lab', 'build-mean-6');

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
      tracker.solved();
      markComplete(2);
    } else {
      tracker.wrong();
      feedback.textContent = `Your numbers' mean is ${actualMean.toFixed(2)}. Try adjusting them to reach exactly 6.`;
    }
    feedback.hidden = false;
  });
}

// A multiple-choice question the child can retry: a wrong answer shows a
// kind hint, the right answer shows the explanation and calls onCorrect().
// `task` names it in the reasoning log (correct / after-hint / incorrect).
function wireRetryChoices(container, feedback, { task, isCorrect, correctText, hintText, onCorrect }) {
  const buttons = container.querySelectorAll('.choice-btn');
  const tracker = trackMeaningTask('number-lab', task);
  let solved = false;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (isCorrect(btn.dataset.answer)) {
        solved = true;
        feedback.textContent = correctText;
        tracker.solved();
        onCorrect();
      } else {
        feedback.textContent = hintText;
        tracker.wrong();
      }
      feedback.hidden = false;
    });
  });
}

function setupFindMistake() {
  const correctMedian = median([9, 3, 20, 5, 7]);

  wireRetryChoices(document.querySelector('.task[data-task="3"] .choice-row'), document.getElementById('mistake-feedback'), {
    task: 'find-mias-mistake',
    isCorrect: (answer) => answer === 'no',
    correctText: `Correct! Mia forgot to put the numbers in order first. In order, they are 3, 5, 7, 9, 20. The number in the centre is ${correctMedian}, not 20.`,
    hintText: 'Hmm, not quite. Try again! Hint: what must we always do to the numbers before finding the median?',
    onCorrect: () => markComplete(3),
  });
}

function setupRealLife() {
  const shoeSizes = [36, 34, 35, 34, 37, 36, 34]; // mode 34, median 35: different answers
  const correctMode = mode(shoeSizes);
  const correctMedian = median(shoeSizes);
  const inOrder = [...shoeSizes].sort((a, b) => a - b).join(', ');

  // Question 1: the mode. Getting it right opens question 2.
  wireRetryChoices(document.getElementById('mode-choices'), document.getElementById('shoe-feedback'), {
    task: 'shoe-shop-mode',
    isCorrect: (answer) => correctMode.includes(Number(answer)),
    correctText: `Yes! Size ${correctMode.join(', ')} sold 3 pairs, more than any other size. That's the mode.`,
    hintText: 'Not quite. Try again! Hint: count how many times each size appears in the list.',
    onCorrect: () => {
      document.getElementById('median-question').hidden = false;
    },
  });

  // Question 2: the median of the same shoes.
  wireRetryChoices(document.getElementById('median-choices'), document.getElementById('median-feedback'), {
    task: 'shoe-shop-median',
    isCorrect: (answer) => Number(answer) === correctMedian,
    correctText: `Yes! In order, the sizes are ${inOrder}. After putting them in order, the size in the centre (the 4th of 7) is ${correctMedian}. That's the median.`,
    hintText: 'Not quite. Try again! Hint: first put the sizes in order from smallest to biggest.',
    onCorrect: () => markComplete(4),
  });
}

init();
