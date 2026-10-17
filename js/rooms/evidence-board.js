import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, range } from '../helpers/stats.js';
import { getSelectedScenarioId } from '../storage/save.js';

const taskComplete = { 1: false, 2: false, 3: false, 4: false };
let currentTask = 1;
const selectedEvidence = new Set();
let selectedCertainty = null;
let selectedAudience = null;
let selectedForm = null;

async function init() {
  const scenarioId = getSelectedScenarioId();
  const response = await fetch(`../data/scenarios/${scenarioId}.json`);
  const recipe = await response.json();
  const { values } = generateClassData(recipe);

  const evidenceChips = recipe.answerType === 'number'
    ? [
        { id: 'mean', label: `Mean: ${mean(values).toFixed(1)}` },
        { id: 'median', label: `Median: ${median(values)}` },
        { id: 'mode', label: `Mode: ${mode(values).join(', ')}` },
        { id: 'range', label: `Range: ${range(values)}` },
      ]
    : [{ id: 'mode', label: `Most common: ${mode(values).join(', ')}` }];

  mountShell({
    step: 'conclude',
    accent: 'conclude',
    pipMessage: "Hoo-hoo! Time to share what we found. What do you think, and why?",
    contentHTML: `
      <h2>🚩 Evidence Board</h2>
      <p class="task-progress" id="task-progress">Task 1 of 4</p>

      <section class="task" data-task="1">
        <h3>Make your claim</h3>
        <p>What do you think, based on "${recipe.title}"?</p>
        <p class="sentence-starter">
          I think <input type="text" id="claim-subject" class="inline-input" placeholder="...">
          because <input type="text" id="claim-reason" class="inline-input" placeholder="...">
        </p>
        <button class="btn btn-main" id="claim-check-btn" type="button">Save my claim</button>
        <p class="feedback" id="claim-feedback" hidden></p>
      </section>

      <section class="task" data-task="2" hidden>
        <h3>Pick your evidence</h3>
        <p>Which numbers back up your claim? Choose at least one.</p>
        <div class="evidence-grid" id="evidence-grid">
          ${evidenceChips.map((c) => `<button class="btn choice-btn evidence-chip" data-id="${c.id}" type="button">${c.label}</button>`).join('')}
        </div>
        <p class="feedback" id="evidence-feedback" hidden></p>
      </section>

      <section class="task" data-task="3" hidden>
        <h3>How sure are you?</h3>
        <div class="certainty-scale" id="certainty-scale">
          <button class="btn certainty-btn choice-btn" data-value="impossible" type="button">Impossible</button>
          <button class="btn certainty-btn choice-btn" data-value="unlikely" type="button">Unlikely</button>
          <button class="btn certainty-btn choice-btn" data-value="even" type="button">Even chance</button>
          <button class="btn certainty-btn choice-btn" data-value="likely" type="button">Likely</button>
          <button class="btn certainty-btn choice-btn" data-value="certain" type="button">Certain</button>
        </div>
        <label for="certainty-reason">Why?</label>
        <textarea id="certainty-reason" rows="2" placeholder="Because..."></textarea>
        <p class="feedback" id="certainty-feedback" hidden></p>
      </section>

      <section class="task" data-task="4" hidden>
        <h3>Who is this for?</h3>
        <p>Pick an audience:</p>
        <div class="choice-row" id="audience-choices">
          <button class="btn choice-btn" data-value="the principal" type="button">🧑‍💼 The principal</button>
          <button class="btn choice-btn" data-value="the class" type="button">🧑‍🎓 The class</button>
          <button class="btn choice-btn" data-value="a parent evening" type="button">👨‍👩‍👧 Parent evening</button>
        </div>
        <p>Pick how you'll share it:</p>
        <div class="choice-row" id="form-choices">
          <button class="btn choice-btn" data-value="a prediction" type="button">🔮 A prediction</button>
          <button class="btn choice-btn" data-value="a problem solved" type="button">🧩 A problem solved</button>
          <button class="btn choice-btn" data-value="a recommendation" type="button">💡 A recommendation</button>
        </div>
        <div class="evidence-card" id="evidence-card" hidden></div>
      </section>

      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  setupClaim();
  setupEvidence();
  setupCertainty();
  setupAudienceForm();
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

function setupClaim() {
  const subject = document.getElementById('claim-subject');
  const reason = document.getElementById('claim-reason');
  const btn = document.getElementById('claim-check-btn');
  const feedback = document.getElementById('claim-feedback');

  btn.addEventListener('click', () => {
    if (!subject.value.trim() || !reason.value.trim()) {
      feedback.textContent = 'Fill in both blanks first!';
      feedback.hidden = false;
      return;
    }
    feedback.textContent = `Nice claim! "I think ${subject.value.trim()} because ${reason.value.trim()}."`;
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
        feedback.textContent = `You picked ${selectedEvidence.size} piece${selectedEvidence.size > 1 ? 's' : ''} of evidence.`;
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

function setupCertainty() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('certainty-reason');
  const feedback = document.getElementById('certainty-feedback');

  function checkComplete() {
    if (selectedCertainty && reasonInput.value.trim()) {
      feedback.textContent = 'Got it — your certainty is saved!';
      feedback.hidden = false;
      markComplete(3);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCertainty = btn.dataset.value;
      checkComplete();
    });
  });

  reasonInput.addEventListener('input', checkComplete);
}

function setupAudienceForm() {
  const audienceButtons = document.querySelectorAll('#audience-choices .choice-btn');
  const formButtons = document.querySelectorAll('#form-choices .choice-btn');
  const card = document.getElementById('evidence-card');

  function renderCard() {
    const subject = document.getElementById('claim-subject').value.trim();
    const reason = document.getElementById('claim-reason').value.trim();
    const certaintyReason = document.getElementById('certainty-reason').value.trim();
    const evidenceLabels = [...document.querySelectorAll('.evidence-chip.active')].map((c) => c.textContent);

    card.innerHTML = `
      <h4>Your Evidence Card</h4>
      <p><strong>Claim:</strong> I think ${subject} because ${reason}.</p>
      <p><strong>Evidence:</strong> ${evidenceLabels.join(', ')}</p>
      <p><strong>How sure:</strong> ${selectedCertainty} — ${certaintyReason}</p>
      <p><strong>For:</strong> ${selectedAudience}, as ${selectedForm}</p>
      <a class="btn btn-main" href="question-studio.html">Start a new investigation →</a>
    `;
    card.hidden = false;
  }

  function checkComplete() {
    if (selectedAudience && selectedForm) {
      renderCard();
      markComplete(4);
    }
  }

  audienceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audienceButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAudience = btn.dataset.value;
      checkComplete();
    });
  });

  formButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      formButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedForm = btn.dataset.value;
      checkComplete();
    });
  });
}

init();
