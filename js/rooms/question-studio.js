import { mountShell, setCurrentStep } from '../app.js';
import { checkQuestion } from '../helpers/checker.js';
import { logEvent } from '../helpers/log.js';
import { setSelectedScenarioId } from '../storage/save.js';
import { cheer } from '../motion.js';

const SCENARIO_CARDS = [
  { id: 'sleep-hours', emoji: '😴' },
  { id: 'shoe-sizes', emoji: '👟' },
  { id: 'playground-game', emoji: '⚽' },
  { id: 'reading-minutes-class-a', emoji: '📖' },
];

const PHASE_BY_TASK = { 1: 'ask', 2: 'ask', 3: 'plan' };

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let selectedScenario = null;
// Which scenario Task 3 was last built for, so it rebuilds if the child picks another one.
let predictScenarioId = null;

async function init() {
  const scenarios = await Promise.all(
    SCENARIO_CARDS.map(async (card) => {
      const response = await fetch(`../data/scenarios/${card.id}.json`);
      const recipe = await response.json();
      return { ...card, recipe };
    })
  );

  mountShell({
    step: 'ask',
    accent: 'ask',
    pipMessage: "Hoo-hoo! I'm Pip. Let's pick a question to investigate!",
    contentHTML: `
      <h1 class="room-title">❓ Question Studio</h1>
      <span class="phase-badge" id="phase-badge"></span>
      <p class="task-progress" id="task-progress">Task 1 of 3</p>

      <section class="task" data-task="1">
        <h2 class="task-title">Pick your investigation</h2>
        <p>Which question do you want to investigate with our pretend class?</p>
        <div class="scenario-grid" id="scenario-grid">
          ${scenarios.map((s) => `
            <button class="scenario-card" data-id="${s.id}" type="button">
              <span class="scenario-emoji">${s.emoji}</span>
              <span class="scenario-title">${s.recipe.compareTitle || s.recipe.title}</span>
              <span class="scenario-question">${s.recipe.question}</span>
            </button>
          `).join('')}
        </div>
        <p class="feedback" id="scenario-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h2 class="task-title">Fix these flawed questions</h2>
        <p>Each one has a problem. Edit it until Pip gives it a green light! ✅</p>

        <div class="fixit">
          <label for="fixit-1">Question 1</label>
          <textarea id="fixit-1" class="fixit-input" rows="2">Isn't staying up late bad for you?</textarea>
          <ul class="checker-list" id="checker-list-1"></ul>
        </div>

        <div class="fixit">
          <label for="fixit-2">Question 2</label>
          <textarea id="fixit-2" class="fixit-input" rows="2">Do you like games?</textarea>
          <ul class="checker-list" id="checker-list-2"></ul>
        </div>

        <div class="fixit">
          <label for="own-question">Bonus: try writing your own question!</label>
          <textarea id="own-question" class="fixit-input" rows="2" placeholder="Type a survey question..."></textarea>
          <ul class="checker-list" id="checker-list-own"></ul>
        </div>
      </section>

      <section class="task" data-task="3" hidden>
        <h2 class="task-title">Predict first!</h2>
        <p id="predict-question"></p>
        <div class="predict-row" id="predict-row"></div>
        <button class="btn btn-main" id="predict-save-btn" type="button">Save my prediction</button>
        <p class="feedback" id="predict-feedback" hidden></p>
        <a class="btn btn-main" id="go-collect-btn" href="data-hub.html" hidden>Let's collect the data →</a>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupScenarioPicker(scenarios);
  setupFixIt();
  setupPredictSave();
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

  const phase = PHASE_BY_TASK[n];
  const badge = document.getElementById('phase-badge');
  badge.textContent = phase === 'plan' ? '🗺️ Plan' : '❓ Ask';
  badge.style.setProperty('--phase-color', `var(--color-${phase})`);
  setCurrentStep(phase);

  if (n === 3) renderPredictTask();
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

function setupScenarioPicker(scenarios) {
  const cards = document.querySelectorAll('.scenario-card');
  const feedback = document.getElementById('scenario-feedback');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setSelectedScenarioId(card.dataset.id);
      selectedScenario = scenarios.find((s) => s.id === card.dataset.id);

      const title = card.querySelector('.scenario-title').textContent;
      feedback.textContent = `Great choice! We'll investigate "${title}" in Data Hub.`;
      feedback.hidden = false;
      markComplete(1);
    });
  });
}

// Builds Task 3 for the selected scenario. If the child went back and picked
// a different scenario, the old prediction is cleared and the task is rebuilt.
function renderPredictTask() {
  if (!selectedScenario || predictScenarioId === selectedScenario.id) return;
  predictScenarioId = selectedScenario.id;

  // Clear any prediction made for the previous scenario.
  taskComplete[3] = false;
  document.getElementById('predict-feedback').hidden = true;
  document.getElementById('go-collect-btn').hidden = true;

  const { recipe } = selectedScenario;
  document.getElementById('predict-question').textContent =
    `What do you think most classmates will say for: "${recipe.question}"`;

  const row = document.getElementById('predict-row');
  const saveBtn = document.getElementById('predict-save-btn');
  if (recipe.answerType === 'number') {
    row.innerHTML = '<input type="number" id="predict-input" aria-label="Your prediction">';
    saveBtn.hidden = false;
  } else {
    const uniqueValues = [...new Set(recipe.valuePool)];
    row.innerHTML = uniqueValues
      .map((v) => `<button class="btn choice-btn predict-choice" data-value="${v}" type="button">${v}</button>`)
      .join('');
    saveBtn.hidden = true;

    // These buttons are new each time, so they get fresh click listeners.
    document.querySelectorAll('.predict-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.predict-choice').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        savePrediction(btn.dataset.value);
      });
    });
  }
}

// `guess` is a number (typed) or a category such as "Football" (chosen).
function savePrediction(guess) {
  const { recipe } = selectedScenario;
  const shown = recipe.answerType === 'number' ? guess : `"${guess}"`;
  const feedback = document.getElementById('predict-feedback');
  feedback.textContent = `Got it! You predicted ${shown}. Let's go collect the data and see!`;
  logEvent('question-studio', 'prediction', {
    about: recipe.question, scenarioId: recipe.id, guess: recipe.answerType === 'number' ? Number(guess) : guess,
  });
  feedback.hidden = false;
  document.getElementById('go-collect-btn').hidden = false;
  markComplete(3);
}

// The "Save my prediction" button (number scenarios) is wired up only once,
// so going back and forth never adds a second click listener.
function setupPredictSave() {
  document.getElementById('predict-save-btn').addEventListener('click', () => {
    const input = document.getElementById('predict-input');
    const feedback = document.getElementById('predict-feedback');
    if (input.value === '') {
      feedback.textContent = 'Type a number first!';
      feedback.hidden = false;
      return;
    }
    savePrediction(input.value);
  });
}

function setupFixIt() {
  const clearState = { 'fixit-1': false, 'fixit-2': false };

  function renderChecker(textarea, list, trackId) {
    const warnings = checkQuestion(textarea.value);
    list.innerHTML = warnings.length
      ? warnings.map((w) => `<li class="warn">⚠️ ${w}</li>`).join('')
      : '<li class="ok">✅ Looks good!</li>';

    if (trackId) {
      // Cheer once, at the moment a flawed question becomes clear (not on every key).
      if (warnings.length === 0 && !clearState[trackId]) cheer(list);
      clearState[trackId] = warnings.length === 0;
      if (Object.values(clearState).every(Boolean)) {
        markComplete(2);
      }
    }
  }

  ['fixit-1', 'fixit-2'].forEach((id) => {
    const textarea = document.getElementById(id);
    const list = document.getElementById(`checker-list-${id.split('-')[1]}`);
    textarea.addEventListener('input', () => renderChecker(textarea, list, id));
    renderChecker(textarea, list, id);
  });

  const ownTextarea = document.getElementById('own-question');
  const ownList = document.getElementById('checker-list-own');
  ownTextarea.addEventListener('input', () => renderChecker(ownTextarea, ownList, null));
}

init();
