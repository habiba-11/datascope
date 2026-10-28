import { mountShell, setCurrentStep } from '../app.js';
import { checkQuestion } from '../helpers/checker.js';
import { logEvent } from '../helpers/log.js';
import { createHint } from '../helpers/prompts.js';
import { PICKABLE_SCENARIOS, loadRecipe, loadContent } from '../helpers/scenarios.js';
import { setSelectedScenarioId } from '../storage/save.js';
import { cheer } from '../motion.js';
import { pipSay } from '../pip.js';
import { enterPhase, finishPhase } from '../phase-progress.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards } from '../choices.js';

// Question Studio in the 3-zone layout (UI guide). One room, two phases:
// Ask (pick a question, fix two flawed questions) and Plan (guess first).
// Each screen is one step of the mini stepper, with ONE primary button.
const STEPS = [
  { label: 'Pick', phase: 'ask', question: 'What do you want to find out?', pip: 'Pick one. Our pretend class will answer it.' },
  { label: 'Fix 1', phase: 'ask', question: '🛠️ Fix question 1', pip: 'This question has a problem. Change it until you see ✅.' },
  { label: 'Fix 2', phase: 'ask', question: '🛠️ Fix question 2', pip: 'One more! Change it until you see ✅.' },
  { label: 'Guess', phase: 'plan', question: '🤔 Guess first!', pip: 'Scientists guess first, then check.' },
];
const STRIP = { ask: '❓ Ask · Question Studio', plan: '🗺️ Plan · Question Studio' };
const FIXIT_IDS = ['fixit-1', 'fixit-2'];

let step = 0;
let bar = null;
let selectedScenario = null; // { id, recipe, content }
// Which scenario the fix-its and the guess were last built for, so they rebuild if the child picks another one.
let fixitScenarioId = null;
let predictScenarioId = null;
let guessSaved = false;
// Whether each fix-it question is clear right now.
const clearState = { 'fixit-1': false, 'fixit-2': false };
// The Hint button of each fix-it (it sits in the action bar while that fix-it is on screen).
const hintButtons = {};

async function init() {
  // The numbers come from the recipe; the child-facing words from the content file.
  const scenarios = await Promise.all(
    PICKABLE_SCENARIOS.map(async (id) => ({ id, recipe: await loadRecipe(id), content: await loadContent(id) }))
  );

  mountShell({
    step: 'ask',
    accent: 'ask',
    phase: 'ask',
    layout: 'card',
    contentHTML: taskCardHTML({
      title: STRIP.ask,
      bodyHTML: `
        <div id="stepper"></div>
        ${pipLineHTML(STEPS[0].pip, STEPS[0].question)}

        <section class="task" data-step="0">
          <div class="scenario-grid" id="scenario-grid">
            ${scenarios.map((s, i) => `
              <button class="scenario-card m-pop" style="--i: ${i}" data-id="${s.id}" type="button">
                <span class="scenario-emoji" aria-hidden="true">${s.content.emoji}</span>
                <span class="scenario-title">${s.content.cardTitle}</span>
                <span class="scenario-question">${s.recipe.question}</span>
              </button>
            `).join('')}
          </div>
        </section>

        ${FIXIT_IDS.map((id, i) => `
          <section class="task fixit" data-step="${i + 1}" hidden>
            <label for="${id}">Question ${i + 1}</label>
            <textarea id="${id}" class="fixit-input" rows="2"></textarea>
            <ul class="checker-list" id="checker-list-${i + 1}"></ul>
            <div class="hint-list-slot" id="hint-slot-${i + 1}"></div>
            ${i === 1 ? `
              <details class="bonus">
                <summary>⭐ Bonus: write your own question!</summary>
                <textarea id="own-question" class="fixit-input" rows="2" placeholder="Type a question..." aria-label="My own question"></textarea>
                <ul class="checker-list" id="checker-list-own"></ul>
              </details>` : ''}
          </section>`).join('')}

        <section class="task" data-step="3" hidden>
          <p class="plan-prompt" id="predict-question"></p>
          <div class="predict-row" id="predict-row"></div>
          <p class="feedback" id="predict-feedback" hidden></p>
        </section>`,
    }),
  });

  bar = setupActionBar({ back: null, primary: { label: '' } });
  wireChoiceCards(document.getElementById('scenario-grid'), '.scenario-card', (card) => {
    setSelectedScenarioId(card.dataset.id);
    selectedScenario = scenarios.find((s) => s.id === card.dataset.id);
    refreshPrimary();
  });
  setupFixIt();
  showStep(0);
}

function showStep(n) {
  step = n;
  if (n === 1 || n === 2) renderFixIts();
  if (n === 3) renderPredictTask();
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.step) !== n;
  });

  const { phase, question, pip, label } = STEPS[n];
  document.getElementById('stepper').innerHTML = miniStepperHTML(STEPS.map((s) => s.label), n);
  document.querySelector('.task-question').textContent = question;
  pipSay(pip);
  // The card's colour and name follow the phase (Ask coral, Plan yellow).
  document.querySelector('.card-layout').style.setProperty('--accent', `var(--color-${phase})`);
  document.querySelector('.task-card-title').textContent = STRIP[phase];
  setCurrentStep(phase);
  // Ask and Plan share this page, so Plan starts (and its intro opens) on reaching the guess.
  enterPhase(phase);

  bar.setBack(n === 0 ? null : { label: 'Back', onClick: () => showStep(n - 1) });
  bar.setHint(label.startsWith('Fix') ? hintButtons[FIXIT_IDS[n - 1]] : null);
  refreshPrimary();
}

// The ONE primary button: what it says depends on the step and what is done.
function refreshPrimary() {
  if (step === 0) {
    bar.setPrimary(selectedScenario
      ? { label: 'Next: Fix 1 →', ready: true, onClick: () => showStep(1) }
      : { label: '', enabled: false, whyDisabled: '👆 Pick a question first' });
  } else if (step === 1) {
    bar.setPrimary(clearState['fixit-1']
      ? { label: 'Next: Fix 2 →', ready: true, onClick: () => showStep(2) }
      : { label: '', enabled: false, whyDisabled: '✏️ Fix the question first' });
  } else if (step === 2) {
    const bothClear = Object.values(clearState).every(Boolean);
    const why = clearState['fixit-2'] ? '✏️ Question 1 needs fixing too' : '✏️ Fix the question first';
    bar.setPrimary(bothClear
      ? { label: 'Next: Make a guess →', ready: true, onClick: () => { finishAsk(); showStep(3); } }
      : { label: '', enabled: false, whyDisabled: why });
  } else if (guessSaved) {
    bar.setPrimary({ label: '📋 Collect the data →', ready: true, onClick: () => { location.href = 'data-hub.html'; } });
  } else if (selectedScenario.recipe.answerType === 'number') {
    bar.setPrimary({ label: 'Save my guess', onClick: saveTypedGuess });
  } else {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '👆 Pick your guess' });
  }
}

// Ask is done when a scenario is picked AND both questions are fixed. It is
// finished when the child taps Next (not while still typing). Progress is saved
// per scenario, so picking another scenario later finishes Ask for that one too.
function finishAsk() {
  const own = document.getElementById('own-question').value;
  finishPhase('ask', {
    scenarioTitle: selectedScenario.content.cardTitle,
    ownQuestionClear: own.trim() !== '' && checkQuestion(own).length === 0,
  });
}

// Builds the fix-its for the selected scenario: its two flawed questions, each
// with a hint button whose last hint is one possible fix.
function renderFixIts() {
  if (!selectedScenario || fixitScenarioId === selectedScenario.id) return;
  fixitScenarioId = selectedScenario.id;

  selectedScenario.content.fixIts.forEach(({ flawed, fix }, i) => {
    const id = FIXIT_IDS[i];
    const textarea = document.getElementById(id);
    textarea.value = flawed;
    clearState[id] = false;

    // A new scenario gets new hints: the old hint list goes.
    const { button, list } = createHint(id, 'question-studio', [
      'Fix one tip at a time, starting at the top.',
      `Here is one idea: "${fix}"`,
    ]);
    hintButtons[id] = button;
    document.getElementById(`hint-slot-${i + 1}`).replaceChildren(list);
    renderChecker(textarea, document.getElementById(`checker-list-${i + 1}`), id);
  });
}

// Builds the guess for the selected scenario. If the child went back and
// picked a different scenario, the old guess is cleared and it is rebuilt.
function renderPredictTask() {
  if (!selectedScenario || predictScenarioId === selectedScenario.id) return;
  predictScenarioId = selectedScenario.id;
  guessSaved = false;
  document.getElementById('predict-feedback').hidden = true;

  const { recipe, content } = selectedScenario;
  document.getElementById('predict-question').textContent = content.planPrompt;

  const row = document.getElementById('predict-row');
  if (recipe.answerType === 'number') {
    row.innerHTML = `<input type="number" id="predict-input" aria-label="My guess">
      <span class="predict-unit">${recipe.unit || ''}</span>`;
    return;
  }
  const uniqueValues = [...new Set(recipe.valuePool)];
  row.innerHTML = uniqueValues
    .map((v) => `<button class="btn choice-btn predict-choice" data-value="${v}" type="button">${v}</button>`)
    .join('');
  // These buttons are new each time, so they get fresh click listeners.
  document.querySelectorAll('.predict-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.predict-choice').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      savePrediction(btn.dataset.value);
    });
  });
}

function saveTypedGuess() {
  const input = document.getElementById('predict-input');
  if (input.value === '') {
    const feedback = document.getElementById('predict-feedback');
    feedback.textContent = '✏️ Type a number first!';
    feedback.hidden = false;
    return;
  }
  savePrediction(input.value);
}

// `guess` is a number (typed) or a category such as "Football" (chosen).
function savePrediction(guess) {
  const { recipe } = selectedScenario;
  const shown = recipe.answerType === 'number' ? guess : `"${guess}"`;
  const feedback = document.getElementById('predict-feedback');
  feedback.textContent = `👍 Your guess: ${shown}. Now let's collect the data!`;
  feedback.hidden = false;
  logEvent('question-studio', 'prediction', {
    about: recipe.question, scenarioId: recipe.id, guess: recipe.answerType === 'number' ? Number(guess) : guess,
  });
  guessSaved = true;
  refreshPrimary();
  finishPhase('plan', { guessText: String(shown) });
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
    refreshPrimary();
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
