import { mountShell, addTitleButton } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, range, formatMean } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import { CERTAINTY, certaintyButtonsHTML } from '../helpers/certainty.js';
import { numberLabKind, classStats } from '../helpers/number-tasks.js';
import { buildJourney } from '../helpers/journey.js';
import { buildFindings } from '../helpers/findings.js';
import { logEvent, readLog } from '../helpers/log.js';
import { addHintButton } from '../helpers/prompts.js';
import { playSound } from '../sounds.js';
import { animate, pipReacts, confetti, stamp } from '../motion.js';
import { openModal } from '../modal.js';
import { getSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { whenIntroClosed } from '../phase-intro.js';
import { countWords } from '../helpers/feedback.js';

// Claim -> Evidence -> How sure (Paper 17's three parts). The audience/form task
// was removed on 26 Oct 2026 (Habiba's decision: it had no purpose for the child).
const TASK_COUNT = 3;
const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
const selectedEvidence = new Set();
let selectedCertainty = null;
let scenarioId = null;
let scenarioTeaches = '';
let lastLoggedClaim = null; // so the same card is not logged twice

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  scenarioId = recipe.id;
  scenarioTeaches = recipe.teaches;
  const partner = await loadPartnerRecipe(recipe);
  const { evidenceBoard } = await loadContent(recipe.id); // the claim question and hints
  const { values } = generateClassData(recipe);
  const partnerValues = partner ? generateClassData(partner).values : null;

  let evidenceChips;
  if (partner) {
    // Class A vs Class B: the lesson is "same mean, different spread",
    // so the chips show the mean and range of each class.
    evidenceChips = [
      { id: 'mean-a', label: `Class A mean: ${formatMean(mean(values))}` },
      { id: 'mean-b', label: `Class B mean: ${formatMean(mean(partnerValues))}` },
      { id: 'range-a', label: `Class A range: ${range(values)}` },
      { id: 'range-b', label: `Class B range: ${range(partnerValues)}` },
    ];
  } else if (recipe.answerType === 'number') {
    evidenceChips = [
      { id: 'mean', label: `Mean: ${formatMean(mean(values))}` },
      { id: 'median', label: `Median: ${median(values)}` },
      { id: 'mode', label: `Mode: ${mode(values).join(', ')}` },
      { id: 'range', label: `Range: ${range(values)}` },
    ];
  } else {
    evidenceChips = [{ id: 'mode', label: `Mode (most common): ${mode(values).join(', ')}` }];
  }

  mountShell({
    step: 'conclude',
    phase: 'conclude',
    accent: 'conclude',
    pipMessage: 'Hoo-hoo! Share what you found. What do you think, and why?',
    contentHTML: `
      <h1 class="room-title">🚩 Evidence Board</h1>
      <p class="task-progress" id="task-progress">Task 1 of ${TASK_COUNT}</p>

      <section class="task" data-task="1">
        <h2 class="task-title">💬 Say what you found</h2>
        <p>${evidenceBoard.claimPrompt}</p>
        <p class="sentence-starter">
          I think <input type="text" id="claim-subject" class="inline-input" placeholder="...">
          because <input type="text" id="claim-reason" class="inline-input" placeholder="...">
        </p>
        <button class="btn btn-main" id="claim-check-btn" type="button">Save my claim</button>
        <p class="feedback" id="claim-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h2 class="task-title">🔢 Pick your proof</h2>
        <p>Pick the numbers that prove your idea.</p>
        <div class="evidence-grid" id="evidence-grid">
          ${evidenceChips.map((c) => `<button class="btn choice-btn evidence-chip" data-id="${c.id}" type="button">${c.label}</button>`).join('')}
        </div>
        <p class="feedback" id="evidence-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h2 class="task-title">🤔 How sure are you?</h2>
        <div class="certainty-scale" id="certainty-scale">
          ${certaintyButtonsHTML('choice-btn')}
        </div>
        <label for="certainty-reason">✏️ Why are you that sure?</label>
        <textarea id="certainty-reason" rows="2" placeholder="Because..."></textarea>
        <p class="feedback" id="certainty-feedback" hidden></p>
        <button class="btn btn-main" id="make-card-btn" type="button" disabled>🏅 Make my Evidence Card</button>
        <div class="evidence-card" id="evidence-card" hidden></div>
        <div class="save-work" id="save-work" hidden>
          <a class="btn btn-main" href="my-journey.html">🗺️ See my journey →</a>
        </div>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupClaim();
  addHintButton(document.querySelector('.sentence-starter'), 'claim', 'evidence-board', evidenceBoard.claimHints);
  addHintButton(document.getElementById('certainty-reason'), 'certainty-why', 'evidence-board');
  setupEvidence();
  setupCertainty();
  setupTaskNav();

  // "📋 My findings": the child's own numbers and words, so they don't have to
  // remember them while writing the claim. Opens by itself after the intro
  // (until Conclude is done), and the button reopens it at any time.
  const kind = numberLabKind(recipe);
  const lines = buildFindings({
    kind,
    question: recipe.question,
    values,
    stats: classStats(kind, values, partnerValues),
    journey: buildJourney(readLog(), getExplorerCode(), recipe.id, recipe.compareWith || null),
  });
  const findingsBtn = document.createElement('button');
  findingsBtn.type = 'button';
  findingsBtn.className = 'btn title-btn';
  findingsBtn.textContent = '📋 My findings';
  findingsBtn.addEventListener('click', () => showFindings(lines, false));
  addTitleButton(findingsBtn);
  if (!isPhaseDone('conclude')) whenIntroClosed().then(() => showFindings(lines, true));
}

function showFindings(lines, auto) {
  const list = document.createElement('ul');
  list.className = 'findings-list';
  for (const { icon, label, text } of lines) {
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${icon} ${label}: `;
    item.append(strong, text); // text may be what the child typed: plain text only
    list.append(item);
  }
  logEvent('evidence-board', 'findings-viewed', { auto });
  return openModal({
    icon: '📋',
    title: 'My findings',
    accent: 'conclude',
    body: list,
    buttons: [{ label: "✍️ Let's write my claim", value: 'go', main: true }],
  });
}

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  document.getElementById('task-progress').textContent = `Task ${n} of ${TASK_COUNT}`;
  document.getElementById('back-btn').disabled = n === 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n];
  // Last task: the room's own big button (make the card) is the one clear action.
  nextBtn.hidden = n === TASK_COUNT;
  currentTask = n;
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  // The room's phase is done when every task is done.
  if (Object.values(taskComplete).every(Boolean)) finishPhase('conclude', concludeFacts());
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === TASK_COUNT;
  }
}

// What the child put on the card, for the feedback card (Part 16).
function concludeFacts() {
  return {
    evidenceCount: selectedEvidence.size,
    certaintyReasonWords: countWords(document.getElementById('certainty-reason').value),
    teaches: scenarioTeaches,
  };
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask < TASK_COUNT) showTask(currentTask + 1);
  });
  showTask(1);
}

function setupClaim() {
  const subject = document.getElementById('claim-subject');
  const reason = document.getElementById('claim-reason');
  const btn = document.getElementById('claim-check-btn');
  const feedback = document.getElementById('claim-feedback');

  btn.addEventListener('click', () => {
    if (!subject.value.trim() || !reason.value.trim()) {
      feedback.textContent = '✏️ Fill in both gaps first!';
      feedback.hidden = false;
      return;
    }
    feedback.textContent = `👍 Nice! "I think ${subject.value.trim()} because ${reason.value.trim()}."`;
    feedback.hidden = false;
    markComplete(1);
  });
}

function setupEvidence() {
  const chips = document.querySelectorAll('.evidence-chip');
  const feedback = document.getElementById('evidence-feedback');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) {
        selectedEvidence.add(chip.dataset.id);
      } else {
        selectedEvidence.delete(chip.dataset.id);
      }

      if (selectedEvidence.size > 0) {
        feedback.textContent = `✅ You picked ${selectedEvidence.size} number${selectedEvidence.size > 1 ? 's' : ''} as proof.`;
        feedback.hidden = false;
        markComplete(2);
      } else {
        feedback.hidden = true;
        taskComplete[2] = false;
        if (currentTask === 2) document.getElementById('next-btn').disabled = true;
      }
    });
  });
}

// "How sure" needs a word AND a reason. Then "Make my Evidence Card" builds the
// card: a button, so the feedback card never pops up while the child is typing.
function setupCertainty() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('certainty-reason');
  const makeBtn = document.getElementById('make-card-btn');

  function checkReady() {
    makeBtn.disabled = !(selectedCertainty && reasonInput.value.trim());
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCertainty = btn.dataset.value;
      checkReady();
    });
  });
  reasonInput.addEventListener('input', checkReady);

  makeBtn.addEventListener('click', () => {
    renderCard();
    playSound('done');
    // A "Checked!" stamp thumps onto the card (in words, not only a picture).
    const mark = document.createElement('span');
    mark.className = 'card-stamp';
    mark.textContent = '✅ Checked!';
    document.getElementById('evidence-card').append(mark);
    stamp(mark);
    animate(document.getElementById('evidence-card'), 'cheer');
    confetti();
    pipReacts('hop');
    markComplete(3);
  });
}

// Logs the finished card. Making the card again (after a change) logs it again
// only if something actually changed.
function logClaim(details) {
  const asText = JSON.stringify(details);
  if (asText === lastLoggedClaim) return;
  lastLoggedClaim = asText;
  logEvent('evidence-board', 'claim', details);
}

// One line of the Evidence Card: a bold label, then plain text.
function cardLine(label, text) {
  const line = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = label;
  line.append(strong, ' ', text);
  return line;
}

function renderCard() {
  const card = document.getElementById('evidence-card');
  const subject = document.getElementById('claim-subject').value.trim();
  const reason = document.getElementById('claim-reason').value.trim();
  const certaintyReason = document.getElementById('certainty-reason').value.trim();
  const evidenceLabels = [...document.querySelectorAll('.evidence-chip.active')].map((c) => c.textContent);

  // Built with textContent, not innerHTML: whatever the child typed is shown
  // as plain text and can never be read by the browser as HTML code.
  const heading = document.createElement('h3');
  heading.textContent = '🏅 My Evidence Card';

  card.replaceChildren(
    heading,
    cardLine('Claim:', `I think ${subject} because ${reason}.`),
    cardLine('Evidence:', evidenceLabels.join(', ')),
    cardLine('How sure:', `${CERTAINTY.find((c) => c.value === selectedCertainty).word} — ${certaintyReason}`),
  );
  card.hidden = false;
  document.getElementById('save-work').hidden = false;
  logClaim({
    scenarioId, claim: subject, because: reason, evidence: evidenceLabels, certainty: selectedCertainty, certaintyReason,
  });
}

init();
