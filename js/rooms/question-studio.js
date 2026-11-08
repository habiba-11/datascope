import { mountShell, setCurrentStep } from '../app.js';
import { checkQuestion, firstTip, questionChecklist, nextCheck } from '../helpers/checker.js';
import { choiceExplanation, TRY_AGAIN } from '../helpers/fixit-words.js';
import { logEvent, readLog } from '../helpers/log.js';
import { createHint } from '../helpers/prompts.js';
import {
  PICKABLE_SCENARIOS, loadRecipe, loadContent, loadSharedAnswers,
} from '../helpers/scenarios.js';
import { setSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { finishedScenarios } from '../helpers/progress.js';
import { cheer, encourage } from '../motion.js';
import { pipSay } from '../pip.js';
import { enterPhase, finishPhase } from '../phase-progress.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards } from '../choices.js';
import { showMissionCard } from '../mission.js';

// Question Studio in the 3-zone layout (UI guide). One room, two phases:
// Ask (pick a question, fix two flawed questions) and Plan (predict first; Part 50:
// a PREDICTION here, an ESTIMATE of the mean in Number Lab).
// Each screen is one step of the mini stepper, with ONE primary button.
const STEPS = [
  { label: 'Pick', phase: 'ask', question: 'What do you want to find out?', pip: 'Pick one. Our pretend class will answer it.' },
  // Round 4, Part 45 (Habiba): Fix 1 is a choice (A or B), Fix 2 is typing with
  // a checklist that turns green and ONE tip at a time.
  { label: 'Fix 1', phase: 'ask', question: '🤔 Which question is better?', pip: 'Only one is a good survey question. Tap it!' },
  { label: 'Fix 2', phase: 'ask', question: '🛠️ Make it better!', pip: 'This question is not good yet. Make it better!' },
  // Part 46 (Round 4): the bonus is its own optional step, so children notice it.
  { label: '⭐ Bonus', phase: 'ask', question: '⭐ Bonus: your own question', pip: 'Want a challenge? Write your OWN question!' },
  { label: 'Predict', phase: 'plan', question: '🔮 Predict first!', pip: 'Scientists predict first, then check.' },
];
const STRIP = { ask: '❓ Ask · Question Studio', plan: '🗺️ Plan · Question Studio' };

let step = 0;
let bar = null;
let selectedScenario = null; // { id, recipe, content }
// Which scenario the fix-its and the guess were last built for, so they rebuild if the child picks another one.
let fixitScenarioId = null;
let predictScenarioId = null;
let guessSaved = false;
// The scenario whose Mission card was shown on this visit (Part 42a), so it
// opens again only if the child goes back and picks another one.
let missionScenarioId = null;
// Whether each fix-it question is clear right now.
const clearState = { 'fixit-1': false, 'fixit-2': false };
// The Hint button of each fix-it (it sits in the action bar while that fix-it is on screen).
const hintButtons = {};

async function init() {
  // The numbers come from the recipe; the child-facing words from the content file.
  const scenarios = await Promise.all(
    PICKABLE_SCENARIOS.map(async (id) => ({ id, recipe: await loadRecipe(id), content: await loadContent(id) }))
  );

  // Questions this child already finished get a "✓ Done before" label: a
  // nudge to try a new one (they can still pick it again).
  const doneBefore = finishedScenarios(readLog(), getExplorerCode());
  // Part 45: one good question on another topic, shown beside Fix 2 as a model.
  const { goodQuestion } = await loadSharedAnswers();

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
                ${doneBefore.has(s.id) ? '<span class="scenario-done">✓ Done before</span>' : ''}
              </button>
            `).join('')}
          </div>
        </section>

        <section class="task fixit" data-step="1" hidden>
          <div class="fixit-choices" id="fixit-choices" role="group" aria-label="Which question is better?"></div>
          <div class="feedback" id="fixit-choice-feedback" hidden></div>
        </section>

        <section class="task fixit" data-step="2" hidden>
          <div class="fixit-layout">
            <div>
              <label for="fixit-2">This question:</label>
              <textarea id="fixit-2" class="fixit-input" rows="2"></textarea>
              <p class="fixit-tip" id="fixit-tip-2" aria-live="polite"></p>
              <div class="hint-list-slot" id="hint-slot-2"></div>
            </div>
            <aside class="fixit-example">
              <p>👍 A good question looks like this:</p>
              <p class="fixit-example-q">${goodQuestion}</p>
            </aside>
          </div>
          <!-- 8 Nov 2026: the checklist goes under both columns, 2 across, so the box, tip and hint stay near the top -->
          <p class="fixit-checklist-title" id="checklist-title-2">📋 Your question is ready when all 4 have a ✓:</p>
          <ul class="fixit-checklist" id="checklist-2" aria-labelledby="checklist-title-2"></ul>
        </section>

        <section class="task bonus-step" data-step="3" hidden>
          <div class="bonus-offer" id="bonus-offer">
            <p class="bonus-note">⭐ This one is extra. You can try it, or skip it.</p>
            <div class="bonus-buttons">
              <button type="button" class="btn btn-main" id="bonus-yes">⭐ Try the bonus</button>
              <button type="button" class="btn btn-secondary" id="bonus-no">No thanks, continue →</button>
            </div>
          </div>
          <div class="bonus-write" id="bonus-write" hidden>
            <label for="own-question">My own question:</label>
            <textarea id="own-question" class="fixit-input" rows="2" placeholder="Type a question..."></textarea>
            <p class="fixit-tip" id="fixit-tip-own" aria-live="polite"></p>
            <p class="fixit-checklist-title" id="checklist-title-own">📋 Your question is ready when all 4 have a ✓:</p>
            <ul class="fixit-checklist" id="checklist-own" aria-labelledby="checklist-title-own"></ul>
          </div>
        </section>

        <section class="task" data-step="4" hidden>
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
  setupBonus();
  showStep(0);
}

function showStep(n) {
  step = n;
  if (n === 1 || n === 2) renderFixIts();
  if (n === 3) offerBonus();
  if (n === 4) renderPredictTask();
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
  // Only Fix 2 (typing) has a hint; Fix 1 is a choice.
  bar.setHint(n === 2 ? hintButtons['fixit-2'] : null);
  refreshPrimary();
}

// The ONE primary button: what it says depends on the step and what is done.
function refreshPrimary() {
  if (step === 0) {
    bar.setPrimary(selectedScenario
      ? { label: 'Next: Fix 1 →', ready: true, onClick: startMission }
      : { label: '', enabled: false, whyDisabled: '👆 Pick a question first' });
  } else if (step === 1) {
    bar.setPrimary(clearState['fixit-1']
      ? { label: 'Next: Fix 2 →', ready: true, onClick: () => showStep(2) }
      : { label: '', enabled: false, whyDisabled: '👆 Pick A or B first' });
  } else if (step === 2) {
    const bothClear = Object.values(clearState).every(Boolean);
    const why = clearState['fixit-2'] ? '👆 Fix 1 needs an answer too' : '✏️ Make the question better first';
    bar.setPrimary(bothClear
      ? { label: 'Next: ⭐ Bonus →', ready: true, onClick: () => showStep(3) }
      : { label: '', enabled: false, whyDisabled: why });
  } else if (step === 3) {
    // The bonus is optional: once the child tries it, they can go on at any time.
    bar.setPrimary(bonusTaken
      ? { label: 'Next: Make a prediction →', ready: true, onClick: () => { finishAsk(); showStep(4); } }
      : { label: '', enabled: false, whyDisabled: '👆 Try the bonus, or skip it' });
  } else if (guessSaved) {
    bar.setPrimary({ label: '📋 Collect the data →', ready: true, onClick: () => { location.href = 'data-hub.html'; } });
  } else if (selectedScenario.recipe.answerType === 'number') {
    bar.setPrimary({ label: 'Save my prediction', onClick: saveTypedGuess });
  } else {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '👆 Pick your prediction' });
  }
}

// Part 42a: before the first fix-it, Pip shows the mission for the chosen scenario.
async function startMission() {
  if (missionScenarioId !== selectedScenario.id) {
    missionScenarioId = selectedScenario.id;
    await showMissionCard(selectedScenario.content);
  }
  showStep(1);
}

// Part 46: the bonus offer. Seen once per scenario (logged "bonus-seen"); the
// child's answer is logged as "bonus-choice" (taken: true or false). Skipping
// is fine: it costs nothing and goes straight on to the guess.
let bonusTaken = false;
let bonusSeenFor = null;

function offerBonus() {
  if (bonusSeenFor === selectedScenario.id) return;
  bonusSeenFor = selectedScenario.id;
  logEvent('question-studio', 'bonus-seen', { scenarioId: selectedScenario.id });
}

function resetBonus() {
  bonusTaken = false;
  bonusSeenFor = null;
  document.getElementById('bonus-offer').hidden = false;
  document.getElementById('bonus-write').hidden = true;
  document.getElementById('own-question').value = '';
}

function setupBonus() {
  document.getElementById('bonus-yes').addEventListener('click', () => {
    logEvent('question-studio', 'bonus-choice', { scenarioId: selectedScenario.id, taken: true });
    bonusTaken = true;
    document.getElementById('bonus-offer').hidden = true;
    document.getElementById('bonus-write').hidden = false;
    const box = document.getElementById('own-question');
    renderChecker(box, null, 'own');
    box.focus();
    refreshPrimary();
  });
  document.getElementById('bonus-no').addEventListener('click', () => {
    logEvent('question-studio', 'bonus-choice', { scenarioId: selectedScenario.id, taken: false });
    finishAsk();
    showStep(4);
  });
}

// Ask is done when a scenario is picked AND both questions are fixed. It is
// finished when the child taps Next (not while still typing). Progress is saved
// per scenario, so picking another scenario later finishes Ask for that one too.
function finishAsk() {
  const own = document.getElementById('own-question').value;
  const ownQuestionClear = own.trim() !== '' && checkQuestion(own).length === 0;
  finishPhase('ask', {
    scenarioTitle: selectedScenario.content.cardTitle,
    ownQuestionClear,
    // For "Your work" on the card: their own clear question, or the one they picked.
    ownQuestion: ownQuestionClear ? own.trim() : null,
    question: selectedScenario.recipe.question,
  });
}

// Builds the fix-its for the selected scenario: its two flawed questions, each
// with a hint button whose last hint is one possible fix.
function renderFixIts() {
  if (!selectedScenario || fixitScenarioId === selectedScenario.id) return;
  fixitScenarioId = selectedScenario.id;

  const [first, second] = selectedScenario.content.fixIts;
  renderChoice(first);
  resetBonus(); // a new scenario: the bonus is offered again

  // Fix 2: the flawed question in the box, its tip, checklist and hint.
  const textarea = document.getElementById('fixit-2');
  textarea.value = second.flawed;
  clearState['fixit-2'] = false;
  // A new scenario gets new hints: the old hint list goes.
  const { button, list } = createHint('fixit-2', 'question-studio', [
    'Look at the 👉 line. Fix that one first.',
    { text: 'Here is one idea. Tap it to use it:', answer: second.fix, box: textarea },
  ]);
  hintButtons['fixit-2'] = button;
  document.getElementById('hint-slot-2').replaceChildren(list);
  renderChecker(textarea, 'fixit-2', '2');
}

// Fix 1 (Part 45): "Which question is better? A or B?" The better question is
// the scenario's fix; the content says which letter it gets (A or B), so the
// answer is not always B. A wrong pick is fine: try again, nothing is lost.
// Logged as "fixit-choice" (which letter, right or not, which try).
function renderChoice({ flawed, fix, choice }) {
  const box = document.getElementById('fixit-choices');
  const feedback = document.getElementById('fixit-choice-feedback');
  const options = choice.goodFirst ? [fix, flawed] : [flawed, fix];
  clearState['fixit-1'] = false;
  feedback.hidden = true;
  feedback.classList.remove('fixit-why');
  let tries = 0;
  box.replaceChildren(...options.map((question, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn choice-btn fixit-choice';
    const letter = Object.assign(document.createElement('span'), { className: 'fixit-letter', textContent: 'AB'[i] });
    button.append(letter, document.createTextNode(question));
    button.addEventListener('click', () => {
      tries += 1;
      const right = question === fix;
      logEvent('question-studio', 'fixit-choice', {
        scenarioId: selectedScenario.id, picked: 'AB'[i], correct: right, tries,
      });
      feedback.hidden = false;
      if (right) {
        button.classList.add('correct');
        box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        // 3 rows: the answer, what WHEN is, what pushy is (helpers/fixit-words.js).
        feedback.replaceChildren(...choiceExplanation(choice).map((line) => Object.assign(document.createElement('span'), { className: 'fixit-why-line', textContent: line })));
        feedback.classList.add('fixit-why');
        clearState['fixit-1'] = true;
        cheer(feedback);
        refreshPrimary();
      } else {
        button.classList.add('wrong');
        button.disabled = true;
        feedback.textContent = TRY_AGAIN;
        encourage(feedback);
      }
    });
    return button;
  }));
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
    row.innerHTML = `<input type="number" id="predict-input" aria-label="My prediction">
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
  feedback.textContent = `👍 Your prediction: ${shown}. Now let's collect the data!`;
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
// Part 45: ONE tip at a time (the first thing to fix), and the checklist of 4
// ticks that turn green as the question gets better. Each tick has a word and
// a mark (✓ or ○), so colour is never the only signal. `suffix` names the tip
// and the list ('2' for Fix 2, 'own' for the bonus); `trackId` is null for the bonus.
function renderChecker(textarea, trackId, suffix) {
  const tip = firstTip(textarea.value);
  const clear = tip === null;
  const next = nextCheck(textarea.value);
  // 8 Nov 2026 (Habiba: "crowded, explained twice"): the tip box shows only
  // what the checklist cannot say: "Great question!", or "write a whole
  // question" (no check for that). Otherwise the checklist's 👉 line says it.
  const tipBox = document.getElementById(`fixit-tip-${suffix}`);
  tipBox.textContent = clear ? '✅ Great question! It passes every check.' : tip;
  tipBox.hidden = !clear && next !== null;
  tipBox.classList.toggle('fixit-tip--done', clear);
  const list = document.getElementById(`checklist-${suffix}`);
  list.replaceChildren(...questionChecklist(textarea.value).map((item) => {
    const li = document.createElement('li');
    const isNext = item.id === next;
    li.className = item.ok ? 'ok' : `todo${isNext ? ' next' : ''}`;
    // ✓ or ○, then the title (with its icon). Only the check to fix next
    // also shows its explaining line, so each explanation shows once.
    const words = document.createElement('div');
    words.append(Object.assign(document.createElement('strong'), { className: 'fixit-check-title', textContent: `${item.icon} ${item.label}` }));
    if (isNext) {
      words.append(
        Object.assign(document.createElement('span'), { className: 'fixit-next-tag', textContent: '👉 Fix this next' }),
        Object.assign(document.createElement('span'), { className: 'fixit-check-detail', textContent: item.detail }),
      );
    }
    li.append(Object.assign(document.createElement('span'), { className: 'fixit-mark', textContent: item.ok ? '✓' : '○' }), words);
    if (!item.ok) li.append(Object.assign(document.createElement('span'), { className: 'sr-only', textContent: ' (not yet)' }));
    return li;
  }));

  if (trackId) {
    // Cheer once, at the moment the flawed question becomes clear (not on every key).
    if (clear && !clearState[trackId]) cheer(list);
    clearState[trackId] = clear;
    refreshPrimary();
  }
}

function setupFixIt() {
  const textarea = document.getElementById('fixit-2');
  textarea.addEventListener('input', () => renderChecker(textarea, 'fixit-2', '2'));
  const ownTextarea = document.getElementById('own-question');
  ownTextarea.addEventListener('input', () => renderChecker(ownTextarea, null, 'own'));
}

init();
