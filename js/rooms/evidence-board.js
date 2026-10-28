import { mountShell, addTitleButton } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, range, formatMean } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import { CERTAINTY, certaintyButtonsHTML } from '../helpers/certainty.js';
import { numberLabKind, classStats } from '../helpers/number-tasks.js';
import { buildJourney } from '../helpers/journey.js';
import { buildFindings } from '../helpers/findings.js';
import { logEvent, readLog } from '../helpers/log.js';
import { createHint } from '../helpers/prompts.js';
import { playSound } from '../sounds.js';
import { animate, pipReacts, confetti, stamp } from '../motion.js';
import { openModal } from '../modal.js';
import { getSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { whenIntroClosed } from '../phase-intro.js';
import { countWords } from '../helpers/feedback.js';
import { pipSay } from '../pip.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';

// Claim -> Evidence -> How sure (Paper 17's three parts). The audience/form task
// was removed on 26 Oct 2026 (Habiba's decision: it had no purpose for the child).
const taskComplete = { 1: false, 2: false, 3: false };
let currentTask = 1;
const selectedEvidence = new Set();
let selectedCertainty = null;
let scenarioId = null;
let scenarioTeaches = '';
let lastLoggedClaim = null; // so the same card is not logged twice
let cardMade = false;
let bar = null;
const hints = {};

// The 3-zone layout (UI guide): each step on the left, and the child's
// Evidence Card on the right, filling up slot by slot as they go (f8).
const STEPS = [
  { label: 'Say it', question: '💬 Say what you found', pip: 'Share what you found. What do you think, and why?' },
  { label: 'Proof', question: '🔢 Pick your proof', pip: 'Pick the numbers that prove your idea.' },
  { label: 'How sure', question: '🤔 How sure are you?', pip: 'Real scientists say how sure they are.' },
];

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
    layout: 'card',
    contentHTML: taskCardHTML({
      title: '🚩 Conclude · Evidence Board',
      bodyHTML: `
        <div id="stepper"></div>
        <div class="card-panels evidence-panels">
          <div class="evidence-steps">
            ${pipLineHTML(STEPS[0].pip, STEPS[0].question)}

            <section class="task" data-task="1">
              <p>${evidenceBoard.claimPrompt}</p>
              <p class="sentence-starter">
                <label for="claim-subject">I think</label> <input type="text" id="claim-subject" class="inline-input" placeholder="...">
                <label for="claim-reason">because</label> <input type="text" id="claim-reason" class="inline-input" placeholder="...">
              </p>
              <div class="hint-list-slot" id="claim-hints"></div>
            </section>

            <section class="task" data-task="2" hidden>
              <div class="evidence-grid" id="evidence-grid">
                ${evidenceChips.map((c, i) => `<button class="btn choice-btn evidence-chip m-pop" style="--i: ${i}" data-id="${c.id}" type="button">${c.label}</button>`).join('')}
              </div>
            </section>

            <section class="task" data-task="3" hidden>
              <div class="certainty-scale" id="certainty-scale">
                ${certaintyButtonsHTML('choice-btn')}
              </div>
              <label for="certainty-reason" class="reason-label">✏️ Why are you that sure?</label>
              <textarea id="certainty-reason" rows="2" placeholder="Because..."></textarea>
              <div class="hint-list-slot" id="sure-hints"></div>
            </section>
          </div>

          <section class="evidence-card" id="evidence-card" aria-labelledby="card-title">
            <h2 class="evidence-card-title" id="card-title">🏅 My Evidence Card</h2>
            <div class="card-slot" data-slot="1"><span class="slot-number" aria-hidden="true">1</span><div><strong>I think...</strong><p class="slot-text" id="slot-claim">Not yet</p></div></div>
            <div class="card-slot" data-slot="2"><span class="slot-number" aria-hidden="true">2</span><div><strong>My proof</strong><p class="slot-text" id="slot-proof">Not yet</p></div></div>
            <div class="card-slot" data-slot="3"><span class="slot-number" aria-hidden="true">3</span><div><strong>How sure am I?</strong><p class="slot-text" id="slot-sure">Not yet</p></div></div>
          </section>
        </div>`,
    }),
  });

  bar = setupActionBar({ back: { label: 'Chance Lab', href: 'chance-lab.html' }, primary: { label: '' } });
  hints[1] = createHint('claim', 'evidence-board', evidenceBoard.claimHints);
  hints[3] = createHint('certainty-why', 'evidence-board');
  document.getElementById('claim-hints').append(hints[1].list);
  document.getElementById('sure-hints').append(hints[3].list);
  setupClaim();
  setupEvidence();
  setupCertainty();
  showTask(1);

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
  findingsBtn.className = 'btn';
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
  currentTask = n;
  const step = STEPS[n - 1];
  document.getElementById('stepper').innerHTML = miniStepperHTML(STEPS.map((x) => x.label), n - 1);
  document.querySelector('.task-question').textContent = step.question;
  pipSay(step.pip);
  // The slot being filled now is outlined on the card.
  document.querySelectorAll('.card-slot').forEach((slot) => slot.classList.toggle('now', Number(slot.dataset.slot) === n));
  bar.setBack(n === 1 ? { label: 'Chance Lab', href: 'chance-lab.html' } : { label: 'Back', onClick: () => showTask(n - 1) });
  bar.setHint(hints[n] ? hints[n].button : null);
  refreshPrimary();
}

// The ONE primary button: what it says depends on the step and what is done.
function refreshPrimary() {
  const filled = (id) => document.getElementById(id).value.trim() !== '';
  if (currentTask === 1) {
    bar.setPrimary(filled('claim-subject') && filled('claim-reason')
      ? { label: 'Next: Pick your proof →', ready: true, onClick: () => { markComplete(1); showTask(2); } }
      : { label: '', enabled: false, whyDisabled: '✏️ Fill in both gaps' });
  } else if (currentTask === 2) {
    bar.setPrimary(selectedEvidence.size > 0
      ? { label: 'Next: How sure? →', ready: true, onClick: () => showTask(3) }
      : { label: '', enabled: false, whyDisabled: '👆 Pick at least one number' });
  } else if (cardMade) {
    bar.setPrimary({ label: '🗺️ See my journey →', ready: true, onClick: () => { location.href = 'my-journey.html'; } });
  } else if (!selectedCertainty) {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '👆 Pick how sure' });
  } else if (!filled('certainty-reason')) {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '✏️ Say why first' });
  } else {
    bar.setPrimary({ label: '🏅 Make my Evidence Card', onClick: makeCard });
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  // The room's phase is done when every task is done.
  if (Object.values(taskComplete).every(Boolean)) finishPhase('conclude', concludeFacts());
}

// What the child put on the card, for the feedback card (Part 16).
function concludeFacts() {
  return {
    evidenceCount: selectedEvidence.size,
    certaintyReasonWords: countWords(document.getElementById('certainty-reason').value),
    teaches: scenarioTeaches,
  };
}

// A slot on the card shows what the child wrote (as plain text) or "Not yet".
function fillSlot(id, text) {
  const slot = document.getElementById(id);
  slot.textContent = text || 'Not yet';
  slot.closest('.card-slot').classList.toggle('filled', Boolean(text));
}

function setupClaim() {
  const subject = document.getElementById('claim-subject');
  const reason = document.getElementById('claim-reason');
  const show = () => {
    const both = subject.value.trim() && reason.value.trim();
    fillSlot('slot-claim', both ? `I think ${subject.value.trim()} because ${reason.value.trim()}.` : '');
    // Changing the claim after making the card means the card must be made again.
    cardMade = false;
    refreshPrimary();
  };
  subject.addEventListener('input', show);
  reason.addEventListener('input', show);
}

function setupEvidence() {
  document.querySelectorAll('.evidence-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) selectedEvidence.add(chip.dataset.id);
      else selectedEvidence.delete(chip.dataset.id);

      // The chosen numbers pop onto the card, in the "My proof" slot.
      const labels = [...document.querySelectorAll('.evidence-chip.active')].map((c) => c.textContent);
      fillSlot('slot-proof', labels.join(' · '));
      const slot = document.getElementById('slot-proof');
      slot.classList.remove('m-pop');
      void slot.offsetWidth;
      slot.classList.add('m-pop');

      if (selectedEvidence.size > 0) markComplete(2);
      else taskComplete[2] = false;
      refreshPrimary();
    });
  });
}

// "How sure" needs a word AND a reason. Then "Make my Evidence Card" finishes
// the card: a button, so the feedback card never pops up while the child is typing.
function setupCertainty() {
  const buttons = document.querySelectorAll('.certainty-btn');
  const reasonInput = document.getElementById('certainty-reason');
  const showSure = () => {
    const word = selectedCertainty ? CERTAINTY.find((c) => c.value === selectedCertainty).word : '';
    const why = reasonInput.value.trim();
    fillSlot('slot-sure', word ? `${word}${why ? ` — because ${why}` : ''}` : '');
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCertainty = btn.dataset.value;
      showSure();
      refreshPrimary();
    });
  });
  reasonInput.addEventListener('input', () => { showSure(); refreshPrimary(); });
}

function makeCard() {
  renderCard();
  cardMade = true;
  playSound('done');
  // A "Checked!" stamp thumps onto the card (in words, not only a picture).
  const card = document.getElementById('evidence-card');
  card.querySelector('.card-stamp')?.remove();
  const mark = document.createElement('span');
  mark.className = 'card-stamp';
  mark.textContent = '✅ Checked!';
  card.append(mark);
  stamp(mark);
  animate(card, 'cheer');
  confetti();
  pipReacts('hop');
  markComplete(3);
  refreshPrimary();
}

// Logs the finished card. Making the card again (after a change) logs it again
// only if something actually changed.
function logClaim(details) {
  const asText = JSON.stringify(details);
  if (asText === lastLoggedClaim) return;
  lastLoggedClaim = asText;
  logEvent('evidence-board', 'claim', details);
}

// The card is already on screen (filled slot by slot); this logs it.
function renderCard() {
  const subject = document.getElementById('claim-subject').value.trim();
  const reason = document.getElementById('claim-reason').value.trim();
  const certaintyReason = document.getElementById('certainty-reason').value.trim();
  const evidenceLabels = [...document.querySelectorAll('.evidence-chip.active')].map((c) => c.textContent);
  logClaim({
    scenarioId, claim: subject, because: reason, evidence: evidenceLabels, certainty: selectedCertainty, certaintyReason,
  });
}

init();
