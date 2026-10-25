import { mountShell, setCurrentStep } from '../app.js';
import { checkQuestion } from '../helpers/checker.js';
import { logEvent } from '../helpers/log.js';
import { addHintButton } from '../helpers/prompts.js';
import { PICKABLE_SCENARIOS, loadRecipe, loadContent } from '../helpers/scenarios.js';
import { setSelectedScenarioId } from '../storage/save.js';
import { cheer } from '../motion.js';
import { enterPhase, finishPhase } from '../phase-progress.js';

const PHASE_BY_TASK = { 1: 'ask', 2: 'ask', 3: 'plan' };
const FIXIT_IDS = ['fixit-1', 'fixit-2'];

const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
let selectedScenario = null; // { id, recipe, content }
// Which scenario Tasks 2 and 3 were last built for, so they rebuild if the child picks another one.
let fixitScenarioId = null;
let predictScenarioId = null;
// Whether each fix-it question is clear right now.
const clearState = { 'fixit-1': false, 'fixit-2': false };

async function init() {
  // The numbers come from the recipe; the child-facing words from the content file.
  const scenarios = await Promise.all(
    PICKABLE_SCENARIOS.map(async (id) => ({ id, recipe: await loadRecipe(id), content: await loadContent(id) }))
  );

  mountShell({
    step: 'ask',
    accent: 'ask',
    phase: 'ask',
    pipMessage: "Hoo-hoo! I'm Pip. Let's pick a question!",
    contentHTML: `
      <h1 class="room-title">❓ Question Studio</h1>
      <span class="phase-badge" id="phase-badge"></span>
      <p class="task-progress" id="task-progress">Task 1 of 3</p>

      <section class="task" data-task="1">
        <h2 class="task-title">🔎 Pick a question</h2>
        <p>Pick one to explore. Our pretend class will answer it.</p>
        <div class="scenario-grid" id="scenario-grid">
          ${scenarios.map((s) => `
            <button class="scenario-card" data-id="${s.id}" type="button">
              <span class="scenario-emoji">${s.content.emoji}</span>
              <span class="scenario-title">${s.content.cardTitle}</span>
              <span class="scenario-question">${s.recipe.question}</span>
            </button>
          `).join('')}
        </div>
        <p class="feedback" id="scenario-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h2 class="task-title">🛠️ Fix the questions</h2>
        <p>Each question has a problem. Change it until you see ✅.</p>

        <div class="fixit">
          <label for="fixit-1">Question 1</label>
          <textarea id="fixit-1" class="fixit-input" rows="2"></textarea>
          <ul class="checker-list" id="checker-list-1"></ul>
        </div>

        <div class="fixit">
          <label for="fixit-2">Question 2</label>
          <textarea id="fixit-2" class="fixit-input" rows="2"></textarea>
          <ul class="checker-list" id="checker-list-2"></ul>
        </div>

        <div class="fixit">
          <label for="own-question">⭐ Bonus: write your own question!</label>
          <textarea id="own-question" class="fixit-input" rows="2" placeholder="Type a question..."></textarea>
          <ul class="checker-list" id="checker-list-own"></ul>
        </div>
      </section>

      <section class="task" data-task="3" hidden>
        <h2 class="task-title">🤔 Guess first!</h2>
        <p id="predict-question"></p>
        <div class="predict-row" id="predict-row"></div>
        <button class="btn btn-main" id="predict-save-btn" type="button">Save my guess</button>
        <p class="feedback" id="predict-feedback" hidden></p>
        <a class="btn btn-main" id="go-collect-btn" href="data-hub.html" hidden>📋 Collect the data →</a>
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
  currentTask = n;
  if (n === 2) renderFixIts();
  if (n === 3) renderPredictTask();

  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n];
  // Last task: the room's own big button (next room / save) is the one clear action.
  nextBtn.hidden = n === 3;

  const phase = PHASE_BY_TASK[n];
  const badge = document.getElementById('phase-badge');
  badge.textContent = phase === 'plan' ? '🗺️ Plan' : '❓ Ask';
  badge.style.setProperty('--phase-color', `var(--color-${phase})`);
  setCurrentStep(phase);
  // Ask and Plan share this page, so Plan starts (and its intro opens) on reaching Task 3.
  enterPhase(phase);
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === 3;
  }
}

// Ask is done when a scenario is picked AND both questions are fixed. It is
// finished when the child taps Next (not while still typing). Progress is saved
// per scenario, so picking another scenario later finishes Ask for that one too.
function finishAsk() {
  if (!taskComplete[1] || !taskComplete[2]) return;
  const own = document.getElementById('own-question').value;
  finishPhase('ask', {
    scenarioTitle: selectedScenario.content.cardTitle,
    ownQuestionClear: own.trim() !== '' && checkQuestion(own).length === 0,
  });
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask === 2) finishAsk();
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

      feedback.textContent = '✅ Great pick! Next, fix some questions.';
      feedback.hidden = false;
      markComplete(1);
    });
  });
}

// Builds Task 2 for the selected scenario: its two flawed questions, each
// with a hint button whose last hint is one possible fix.
function renderFixIts() {
  if (!selectedScenario || fixitScenarioId === selectedScenario.id) return;
  fixitScenarioId = selectedScenario.id;
  taskComplete[2] = false;

  selectedScenario.content.fixIts.forEach(({ flawed, fix }, i) => {
    const textarea = document.getElementById(FIXIT_IDS[i]);
    textarea.value = flawed;
    clearState[FIXIT_IDS[i]] = false;

    // A new scenario gets new hints: remove the old hint box first.
    const box = textarea.closest('.fixit');
    box.querySelector('.hint-box')?.remove();
    addHintButton(box.querySelector('.checker-list'), `fixit-${i + 1}`, 'question-studio', [
      'Fix one tip at a time, starting at the top.',
      `Here is one idea: "${fix}"`,
    ]);
    renderChecker(textarea, box.querySelector('.checker-list'), FIXIT_IDS[i]);
  });
}

// Builds Task 3 for the selected scenario. If the child went back and picked
// a different scenario, the old guess is cleared and the task is rebuilt.
function renderPredictTask() {
  if (!selectedScenario || predictScenarioId === selectedScenario.id) return;
  predictScenarioId = selectedScenario.id;

  // Clear any guess made for the previous scenario.
  taskComplete[3] = false;
  document.getElementById('predict-feedback').hidden = true;
  document.getElementById('go-collect-btn').hidden = true;

  const { recipe, content } = selectedScenario;
  document.getElementById('predict-question').textContent = content.planPrompt;

  const row = document.getElementById('predict-row');
  const saveBtn = document.getElementById('predict-save-btn');
  if (recipe.answerType === 'number') {
    row.innerHTML = `<input type="number" id="predict-input" aria-label="My guess">
      <span class="predict-unit">${recipe.unit || ''}</span>`;
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
  feedback.textContent = `👍 Your guess: ${shown}. Now let's collect the data!`;
  logEvent('question-studio', 'prediction', {
    about: recipe.question, scenarioId: recipe.id, guess: recipe.answerType === 'number' ? Number(guess) : guess,
  });
  feedback.hidden = false;
  document.getElementById('go-collect-btn').hidden = false;
  markComplete(3);
  finishPhase('plan', { guessText: String(shown) });
}

// The "Save my guess" button (number scenarios) is wired up only once,
// so going back and forth never adds a second click listener.
function setupPredictSave() {
  document.getElementById('predict-save-btn').addEventListener('click', () => {
    const input = document.getElementById('predict-input');
    const feedback = document.getElementById('predict-feedback');
    if (input.value === '') {
      feedback.textContent = '✏️ Type a number first!';
      feedback.hidden = false;
      return;
    }
    savePrediction(input.value);
  });
}

// Shows the checker's tips under a question (or ✅). Each tip starts with its
// own emoji, so colour is never the only signal.
function renderChecker(textarea, list, trackId) {
  const warnings = checkQuestion(textarea.value);
  const items = warnings.length
    ? warnings.map((w) => Object.assign(document.createElement('li'), { className: 'warn', textContent: w }))
    : [Object.assign(document.createElement('li'), { className: 'ok', textContent: '✅ Clear question!' })];
  list.replaceChildren(...items);

  if (trackId) {
    // Cheer once, at the moment a flawed question becomes clear (not on every key).
    if (warnings.length === 0 && !clearState[trackId]) cheer(list);
    clearState[trackId] = warnings.length === 0;
    if (Object.values(clearState).every(Boolean)) markComplete(2);
  }
}

function setupFixIt() {
  FIXIT_IDS.forEach((id, i) => {
    const textarea = document.getElementById(id);
    const list = document.getElementById(`checker-list-${i + 1}`);
    textarea.addEventListener('input', () => renderChecker(textarea, list, id));
  });

  const ownTextarea = document.getElementById('own-question');
  const ownList = document.getElementById('checker-list-own');
  ownTextarea.addEventListener('input', () => renderChecker(ownTextarea, ownList, null));
}

init();
