import { mountShell } from '../app.js';
import { checkQuestion } from '../helpers/checker.js';
import { setSelectedScenarioId } from '../storage/save.js';

const SCENARIO_CARDS = [
  { id: 'sleep-hours', emoji: '😴' },
  { id: 'shoe-sizes', emoji: '👟' },
  { id: 'playground-game', emoji: '⚽' },
  { id: 'reading-minutes-class-a', emoji: '📖', displayTitle: 'Reading minutes' },
];

const taskComplete = { 1: false, 2: false };
let currentTask = 1;

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
      <h2>❓ Question Studio</h2>
      <p class="task-progress" id="task-progress">Task 1 of 2</p>

      <section class="task" data-task="1">
        <h3>Pick your investigation</h3>
        <p>Which question do you want to investigate with our pretend class?</p>
        <div class="scenario-grid" id="scenario-grid">
          ${scenarios.map((s) => `
            <button class="scenario-card" data-id="${s.id}" type="button">
              <span class="scenario-emoji">${s.emoji}</span>
              <span class="scenario-title">${s.displayTitle || s.recipe.title}</span>
              <span class="scenario-question">${s.recipe.question}</span>
            </button>
          `).join('')}
        </div>
        <p class="feedback" id="scenario-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h3>Fix these flawed questions</h3>
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

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupScenarioPicker();
  setupFixIt();
  setupTaskNav();
}

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  document.getElementById('task-progress').textContent = `Task ${n} of 2`;
  document.getElementById('back-btn').disabled = n === 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n] || n === 2;
  nextBtn.textContent = n === 2 ? 'All done! 🎉' : 'Next →';
  currentTask = n;
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === 2;
  }
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask < 2) showTask(currentTask + 1);
  });
  showTask(1);
}

function setupScenarioPicker() {
  const cards = document.querySelectorAll('.scenario-card');
  const feedback = document.getElementById('scenario-feedback');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setSelectedScenarioId(card.dataset.id);

      const title = card.querySelector('.scenario-title').textContent;
      feedback.textContent = `Great choice! We'll investigate "${title}" in Data Hub.`;
      feedback.hidden = false;
      markComplete(1);
    });
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
