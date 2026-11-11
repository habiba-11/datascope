import { mountShell, exploreCardTabsHTML } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, formatMean, compareValues } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import {
  numberLabKind, TASKS_BY_KIND, fillTemplate, buildTarget, buildExample, isAllSame, miaSays, choicesFor, revealMessage, classStats,
  rangeSummary, rulerSpan,
} from '../helpers/number-tasks.js';
import { logEvent, trackMeaningTask, readLog } from '../helpers/log.js';
import { planPrediction, guessWord, planReminder } from '../helpers/guesses.js';
import { createAnswerHint, createHint } from '../helpers/prompts.js';
import { answerFacts, fillSuggestions } from '../helpers/suggestions.js';
import {
  getSelectedScenarioId, getExplorerCode, loadRoomState, saveRoomState,
} from '../storage/save.js';
import { cheer, encourage, stagger, countUp } from '../motion.js';
import { finishPhase } from '../phase-progress.js';
import { whenIntroClosed } from '../phase-intro.js';
import { addRecapButton, autoOpenRecap } from '../recap.js';
import { mountCardSort } from '../card-sort.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML, wordsNoteHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { pipSay } from '../pip.js';
import { iconHTML, iconLineHTML, setIconLine, setIconText, withoutIcons } from '../icon-text.js';

// The 3-zone layout (UI guide): the Explore rooms are tabs on the card, the
// tasks are a mini stepper, and the ONE primary button in the action bar says
// what happens next (it replaces each task's own button and "Next").
const STEP_LABELS = {
  predict: 'Guess', build: 'Build it', mistake: "Mia's mistake", realLife: 'Real life',
  whyNoMean: 'Mean of games?', compareRange: 'Spread',
};
const TASK_TITLES = {
  predict: 'Your guess', build: ':bricks: Build it!', mistake: ':magnifier: Find the mistake', realLife: ':cart: Real life',
  whyNoMean: ':question: Mean of games?', compareRange: ':ruler: Which spreads out more?',
};
// Pip's one line for each task.
const TASK_PIP = {
  predict: 'Guess first, then check the statistics!',
  build: 'This time, you choose the numbers!',
  mistake: 'Mia needs a data detective!',
  realLife: 'Numbers are everywhere in real life!',
  whyNoMean: 'Think about words and numbers.',
  compareRange: 'Two classes, two stories!',
};
// Where each task is, for the primary button: e.g. predict 'guess' -> 'revealed' -> 'changing'.
const stage = { predict: 'guess', mistake: 'answer' };
let bar = null;
// What the primary button does in the tasks that have their own action (set up in TASK_SETUP).
let revealNumbers = () => {};
let checkBuild = () => {};
let saveRevision = () => {};
let showStats = () => {};
let showRevision = () => {};
let openChange = () => {};
let reasonHint = null; // suggested answers for "I changed my guess because..."
let buildHint = null; // Build it: "write the mean 5 times", then fill it in (Habiba, 6 Nov 2026)

// Number Lab follows the scenario the child picked (Part 17b). The task list
// depends on the kind of data: see TASKS_BY_KIND in helpers/number-tasks.js.
let kind = 'number';
let tasks = [];
const taskComplete = {};
let currentTask = 1;
let recipe = null;
let content = null; // this scenario's numberLab words (data/content/<scenario>.json)
// What the child did, for the feedback card at the end (Part 16).
const numberFacts = { guess: null, changedWithReason: false, teaches: '' };
// Part 50 (Habiba chose A, 7 Nov 2026): the Plan PREDICTION and the Number Lab
// ESTIMATE are two different things. `word`: what this room calls the guess.
// `planGuess`: the child's Plan prediction (or null). `fromPlan`: games check
// that prediction against the mode instead of asking the same question again.
let word = 'estimate';
let planGuess = null;
let fromPlan = false;

// Part 60e (Habiba, 11 Nov 2026): the room remembers where the child was and
// what they did, so coming back opens the same task with the answers there.
// `memory` is what is saved (see remember()); restoring logs nothing.
let restoring = true;
const memory = {
  predict: { guess: null, revealed: false, changing: false, revision: null },
  build: { solvedText: null },
  solved: {}, // multiple-choice tasks answered right: { 'find-mias-mistake': true, ... }
  texts: {}, // the "done" messages of the card sorts: { sort: '...', median: '...' }
};
const showSolved = {}; // task -> shows that task answered right, quietly (wireRetryChoices)

async function init() {
  recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);
  const allContent = await loadContent(recipe.id);
  content = allContent.numberLab;
  kind = numberLabKind(recipe);
  tasks = TASKS_BY_KIND[kind];
  tasks.forEach((task, i) => { taskComplete[i + 1] = false; });
  numberFacts.teaches = recipe.teaches;
  word = guessWord(kind);
  planGuess = planPrediction(readLog(), getExplorerCode(), recipe.id);
  fromPlan = kind === 'category' && planGuess !== null;
  STEP_LABELS.predict = kind === 'category' ? 'Prediction' : 'Estimate';
  TASK_TITLES.predict = kind === 'category' ? ':crystal-ball: Your prediction' : ':ruler: Your estimate';
  // Part 51: the games scenario never talks about numbers.
  if (kind === 'category') TASK_PIP.realLife = 'Data is everywhere in real life!';
  // Scan, 10 Nov 2026: games with no Plan prediction (e.g. a cleared device)
  // had the number words "Estimate ... statistics" here, against Part 51.
  if (fromPlan) TASK_PIP.predict = 'Was your prediction right? Let us check!';
  else TASK_PIP.predict = kind === 'category' ? 'Predict first, then check the mode!' : 'Estimate first, then check the statistics!';

  const { values } = generateClassData(recipe);
  const valuesB = partner ? generateClassData(partner).values : null;
  const stats = classStats(kind, values, valuesB);
  const data = { values, valuesB, stats, facts: answerFacts(recipe, values, partner, valuesB) };

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'number',
    phase: 'number',
    layout: 'card',
    contentHTML: taskCardHTML({
      tabsHTML: exploreCardTabsHTML(),
      bodyHTML: `
        <div id="stepper"></div>
        ${kind === 'category' ? wordsNoteHTML(allContent.wordsNote) : ''}
        ${pipLineHTML(TASK_PIP[tasks[0]], TASK_TITLES[tasks[0]])}
        ${tasks.map((task, i) => TASK_HTML[task](i + 1, data)).join('')}`,
    }),
  });

  bar = setupActionBar({ back: null, primary: { label: '' } });
  tasks.forEach((task, i) => TASK_SETUP[task](i + 1, data));
  const saved = loadRoomState('number-lab', recipe.id);
  if (saved) restore(saved, data);
  restoring = false;
  // A typed (or picked) estimate is kept even before the numbers are shown.
  const predictRow = document.querySelector('.predict-row');
  if (predictRow) ['input', 'click'].forEach((type) => predictRow.addEventListener(type, remember));
  showTask(saved ? saved.task : 1);

  // The maths recap (Part 18): a button, and the first time it opens by
  // itself, right after the Number Lab intro is closed.
  addRecapButton(kind, 'number-lab');
  whenIntroClosed().then(() => autoOpenRecap(kind));
}

// ---------- the task flow ----------

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  currentTask = n;
  remember();
  const task = tasks[n - 1];
  document.getElementById('stepper').innerHTML = miniStepperHTML(tasks.map((t) => STEP_LABELS[t]), n - 1);
  setIconLine(document.querySelector('.task-question'), TASK_TITLES[task]);
  pipSay(TASK_PIP[task]);
  // The Hint button is there while the child is giving a reason, and in Build it.
  let hint = null;
  if (task === 'predict' && stage.predict === 'changing' && !taskComplete[n]) hint = reasonHint.button;
  if (task === 'build' && !taskComplete[n]) hint = buildHint && buildHint.button;
  bar.setHint(hint);
  bar.setBack(n === 1
    ? { label: 'Graph Lab', href: 'graph-lab.html' }
    : { label: 'Back', onClick: () => showTask(n - 1) });
  refreshPrimary();
}

// The ONE primary button: what it says depends on where the child is in the task.
function refreshPrimary() {
  const n = currentTask;
  const task = tasks[n - 1];
  if (taskComplete[n]) {
    bar.setPrimary(n === tasks.length
      ? { label: ':die: Next: Chance Lab →', ready: true, onClick: () => { location.href = 'chance-lab.html'; } }
      : { label: `Next: ${STEP_LABELS[tasks[n]]} →`, ready: true, onClick: () => showTask(n + 1) });
    return;
  }
  if (task === 'predict') {
    if (stage.predict === 'guess') bar.setPrimary({ label: kind === 'category' ? ':magnifier: Show the mode' : ':magnifier: Show statistics', onClick: revealNumbers });
    else if (stage.predict === 'changing') bar.setPrimary({ label: `Save my new ${word}`, onClick: saveRevision });
    else bar.setPrimary({ label: '', enabled: false, whyDisabled: `:question: Keep or change your ${word}?` });
  } else if (task === 'build') {
    bar.setPrimary({ label: 'Check my numbers', onClick: checkBuild });
  } else if (task === 'mistake' && stage.mistake === 'sort') {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: ':cards: Put the cards in order first' });
  } else {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: ':tap: Pick an answer first' });
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  remember();
  if (currentTask === taskNum) refreshPrimary();
  // The room's phase is done when every task is done.
  if (Object.values(taskComplete).every(Boolean)) finishPhase('number', numberFacts);
}

// ---------- small helpers ----------

// A number box (numbers) or a row of choice buttons (words, e.g. games).
function guessControl(prefix, values) {
  if (kind === 'category') {
    return choicesFor(values)
      .map((v) => `<button class="btn choice-btn ${prefix}-choice" data-value="${v}" type="button">${v}</button>`)
      .join('');
  }
  return `<input type="number" id="${prefix}-input" aria-label="My ${word}"> <span class="predict-unit">${recipe.unit || ''}</span>`;
}

// Choice buttons: only one can be picked at a time.
function wireChoiceGroup(prefix) {
  const buttons = document.querySelectorAll(`.${prefix}-choice`);
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }));
}

// The child's guess: a number, a word, or null if nothing is chosen yet.
function readGuess(prefix) {
  if (prefix === 'predict' && fromPlan) return planGuess;
  if (kind === 'category') {
    const chosen = document.querySelector(`.${prefix}-choice.active`);
    return chosen ? chosen.dataset.value : null;
  }
  const input = document.getElementById(`${prefix}-input`);
  return input.value === '' ? null : Number(input.value);
}

function choiceButtons(values) {
  return values.map((v) => `<button class="btn choice-btn" data-answer="${v}" type="button">${v}</button>`).join('');
}

// Our texts may name icons as :name: (Part 54e).
const show = (feedback, text) => {
  setIconLine(feedback, text);
  feedback.hidden = false;
};

const inOrder = (list) => [...list].sort(compareValues).join(', ');
const timesIn = (list, value) => list.filter((v) => v === value).length;

// A multiple-choice question the child can retry: a wrong answer shows a
// kind hint, the right answer shows the explanation and calls onCorrect().
// `task` names it in the reasoning log (correct / after-hint / incorrect).
function wireRetryChoices(container, feedback, { task, isCorrect, correctText, hintText, onCorrect }) {
  const buttons = container.querySelectorAll('.choice-btn');
  const tracker = trackMeaningTask('number-lab', task, { scenarioId: recipe.id });
  let solved = false;

  // The right answer: marked, explained, and the task goes on. A restore
  // (Part 60e) shows it again without logging or cheering.
  function markSolved(btn, { quiet = false } = {}) {
    solved = true;
    buttons.forEach((b) => b.classList.toggle('active', b === btn));
    show(feedback, correctText);
    memory.solved[task] = true;
    if (!quiet) {
      tracker.solved();
      cheer(feedback);
    }
    onCorrect({ quiet });
  }
  showSolved[task] = () => markSolved([...buttons].find((b) => isCorrect(b.dataset.answer)), { quiet: true });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (isCorrect(btn.dataset.answer)) {
        markSolved(btn);
      } else {
        show(feedback, typeof hintText === 'function' ? hintText() : hintText);
        tracker.wrong();
        encourage(feedback);
      }
    });
  });
}

// ---------- each task: its HTML, then its setup ----------

function statCard(label, value) {
  return `<div class="stat-card"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
}

const modeText = (modes) => (modes.length ? modes.join(', ') : 'none');

function statsHTML(stats) {
  if (kind === 'category') {
    return `<div class="stats-grid">
      ${statCard('Mode', modeText(stats.mode))}
      ${statCard('Mean, median, range', `${iconHTML('cross')} not for words`)}
    </div>`;
  }
  const grid = (m, md, mo, r) => `<div class="stats-grid">
    ${statCard('Mean', formatMean(m))}${statCard('Median', md)}${statCard('Mode', modeText(mo))}${statCard('Range', r)}
  </div>`;
  if (kind === 'compare') {
    // h2: the task's question is the page's h1 (axe: heading-order).
    return `<h2 class="stats-class-title">Class A</h2>${grid(stats.mean, stats.median, stats.mode, stats.range)}
      <h2 class="stats-class-title">Class B</h2>${grid(stats.meanB, stats.medianB, stats.modeB, stats.rangeB)}`;
  }
  return grid(stats.mean, stats.median, stats.mode, stats.range);
}

// The worked example beside "Build it" (made clearer 4 Nov 2026): 3 numbered
// steps, each with its sum written out. The two numbers that changed say
// "−1" and "+1" (words as well as a colour), and the check shows the mean.
function buildExampleHTML(example, target) {
  const chips = (numbers, start) => numbers.map((number, i) => {
    let tag = '';
    if (number < start[i]) tag = '<small>−1</small>';
    if (number > start[i]) tag = '<small>+1</small>';
    return `<span class="example-chip${tag ? ' example-chip--moved' : ''}">${number}${tag}</span>`;
  }).join('');
  const step = (n, text, row, sum) => `
    <li class="example-step">
      <span class="example-num" aria-hidden="true">${n}</span>
      <div>
        <p>${text}</p>
        ${row ? `<div class="example-row">${row}</div>` : ''}
        <p class="example-sum">${sum}</p>
      </div>
    </li>`;
  return `
    <aside class="build-example" aria-label="A worked example">
      <p class="build-example-title">${iconLineHTML(example.title)}</p>
      <ol class="example-steps">
        ${step(1, example.startText, chips(example.start, example.start), example.startSum)}
        ${step(2, example.movedText, chips(example.moved, example.start), example.movedSum)}
        ${step(3, example.checkText, '', example.checkSum)}
      </ol>
      <p class="build-example-end">${iconLineHTML(example.endText)}</p>
      <p class="build-example-turn">Your turn: make a mean of ${target}!</p>
    </aside>`;
}

const TASK_HTML = {
  predict: (n, { values }) => `
    <section class="task" data-task="${n}">
      ${planGuess !== null ? `<p class="plan-reminder">${iconLineHTML(planReminder(planGuess, recipe))}</p>` : ''}
      <p>${iconLineHTML(fromPlan ? content.checkPrompt : content.predictPrompt)}</p>
      ${fromPlan ? '' : `<div class="predict-row">${guessControl('predict', values)}</div>`}
      <div id="stats-box" hidden></div>
      <p class="feedback" id="predict-feedback" hidden></p>

      <div class="revise-box" id="revise-box" hidden>
        <p><strong>Has the data changed your mind?</strong></p>
        <div class="choice-row">
          <button class="btn choice-btn" id="keep-guess-btn" type="button">Keep my ${word}</button>
          <button class="btn choice-btn" id="change-guess-btn" type="button">Change my ${word}</button>
        </div>
        <div class="revise-form" id="revise-form" hidden>
          <span>My new ${word}:</span>
          ${guessControl('new-guess', values)}
          <label for="revise-reason">because</label>
          <input type="text" id="revise-reason" class="revise-reason" placeholder="...">
          <div class="hint-list-slot" id="reason-hints"></div>
        </div>
        <p class="feedback" id="revise-feedback" hidden></p>
      </div>
    </section>`,

  build: (n, { values }) => `
    <section class="task" data-task="${n}" hidden>
      <!-- Part 55 (Habiba, 8 Nov 2026: "confusing and crowded"): ONE goal
           sentence, the boxes, a live total, and the example behind a button. -->
      <div class="build-layout">
        <div class="build-main">
          <p class="build-goal">${iconLineHTML(fillTemplate(content.build, { target: buildTarget(values) }))}</p>
          <div class="build-row">
            ${[1, 2, 3, 4, 5].map((i) => `<label class="build-box">Friend ${i}<input type="number" class="build-input"></label>`).join('')}
          </div>
          <p class="build-total" id="build-total" aria-live="polite"></p>
          <button class="btn btn-secondary build-example-btn" id="build-example-btn" type="button" aria-expanded="false" aria-controls="build-example-box">See an example</button>
          <div class="hint-list-slot" id="build-hint-slot"></div>
        </div>
        <!-- Opened, the example sits on the right (Habiba, 8 Nov 2026); below on narrow screens. -->
        <div class="build-example-box" id="build-example-box" hidden>${buildExampleHTML(buildExample(buildTarget(values)), buildTarget(values))}</div>
      </div>
      <p class="feedback" id="build-feedback" hidden></p>
    </section>`,

  mistake: (n) => `
    <section class="task" data-task="${n}" hidden>
      <p>${iconLineHTML(content.mistake.story)}</p>
      <p class="number-list">${content.mistake.numbers.join(', ')}</p>
      <p>She says: <strong>"The median is ${miaSays(content.mistake.numbers)}."</strong> Is she right?</p>
      <div class="choice-row" id="mistake-choices">
        <button class="btn choice-btn" data-answer="yes" type="button">${iconHTML('check')} Mia is right</button>
        <button class="btn choice-btn" data-answer="no" type="button">${iconHTML('cross')} Mia is wrong</button>
      </div>
      <p class="feedback" id="mistake-feedback" hidden></p>
      <div class="sort-box" id="sort-box" hidden>
        <p><strong>Now you fix it! Put Mia's numbers in order.</strong></p>
      </div>
      <p class="feedback" id="sort-feedback" hidden></p>
    </section>`,

  realLife: (n) => {
    const list = content.realLife.numbers || content.realLife.items;
    return `
    <section class="task" data-task="${n}" hidden>
      <p>${iconLineHTML(content.realLife.story)}</p>
      <p class="number-list">${list.join(', ')}</p>
      <p><strong>1.</strong> ${content.realLife.modeQuestion}</p>
      <div class="choice-row" id="mode-choices">${choiceButtons(choicesFor(list))}</div>
      <p class="feedback" id="mode-feedback" hidden></p>
      ${content.realLife.medianQuestion ? `
        <div id="median-question" hidden>
          <p><strong>2.</strong> ${content.realLife.medianQuestion}</p>
          <!-- Part 56 (Habiba): the child sorts the cards, then taps the centre -->
          <div class="sort-box" id="median-sort"></div>
          <p class="feedback" id="median-feedback" hidden></p>
        </div>` : ''}
    </section>`;
  },

  whyNoMean: (n) => `
    <section class="task" data-task="${n}" hidden>
      <p>${iconLineHTML(content.whyNoMean.question)}</p>
      <div class="choice-row choice-column" id="why-choices">
        ${content.whyNoMean.options.map((o, i) => `<button class="btn choice-btn" data-answer="${i}" type="button">${o.text}</button>`).join('')}
      </div>
      <p class="feedback" id="why-feedback" hidden></p>
    </section>`,

  compareRange: (n, data) => `
    <section class="task" data-task="${n}" hidden>
      <p>${iconLineHTML(content.compareRange.story)}</p>
      ${rangeReminderHTML(data)}
      <p><strong>${content.compareRange.question}</strong></p>
      <div class="choice-row" id="range-choices">${choiceButtons(['Class A', 'Class B'])}</div>
      <p class="feedback" id="range-feedback" hidden></p>
    </section>`,
};

// Round 4 (Habiba, 6 Nov 2026): a reminder of each class's data next to "Which
// spreads out more?": lowest, highest, mean, the range worked out, and a little
// ruler on one shared scale (0 to the biggest answer), so the spread can be SEEN.
// The same colours and badges as the two classes in Data Hub. Numbers only, from
// stats.js (no child text), so this HTML is safe.
function rangeReminderHTML({ values, valuesB }) {
  const unit = recipe.unit || '';
  const classes = [
    { name: ':book-green: Class A', css: 'a', ...rangeSummary(values) },
    { name: ':book: Class B', css: 'b', ...rangeSummary(valuesB) },
  ];
  const scaleMax = Math.max(classes[0].high, classes[1].high);
  const cards = classes.map((c) => {
    const span = rulerSpan(c, scaleMax);
    return `
      <div class="range-card range-card--${c.css}">
        <p class="range-name">${iconLineHTML(c.name)}</p>
        <ul class="range-facts">
          <li>Lowest: <b>${c.low}</b> · Highest: <b>${c.high}</b></li>
          <li>Mean: <b>${c.mean}</b> ${unit}</li>
          <li>Range: ${c.high} − ${c.low} = <b>${c.range}</b> ${unit}</li>
        </ul>
        <div class="range-ruler" role="img" aria-label="${withoutIcons(c.name)}: answers from ${c.low} to ${c.high} ${unit}">
          <span class="range-span" style="left: ${span.left}%; width: ${span.width}%"></span>
        </div>
        <p class="range-ends"><span>0</span><span>${scaleMax} ${unit}</span></p>
      </div>`;
  }).join('');
  return `<div class="range-reminder">${cards}</div>`;
}

const TASK_SETUP = {
  predict: (n, { stats, facts }) => {
    reasonHint = createAnswerHint(
      'revise-reason', 'number-lab', fillSuggestions(content.reasonAnswers, facts), document.getElementById('revise-reason'),
    );
    document.getElementById('reason-hints').append(reasonHint.list);
    wireChoiceGroup('predict');
    wireChoiceGroup('new-guess');
    const feedback = document.getElementById('predict-feedback');

    // The numbers and what they say about the guess (Part 60e: a restore shows
    // them again without the drum roll).
    showStats = (guess, { quiet = false } = {}) => {
      const box = document.getElementById('stats-box');
      box.innerHTML = statsHTML(stats);
      box.hidden = false;
      if (!quiet) {
        // The numbers spring in one by one and count up, like a drum roll.
        stagger(box.querySelectorAll('.stat-card'), { each: 0.15 });
        box.querySelectorAll('.stat-value').forEach((value) => {
          const text = value.textContent;
          if (/^\d+(\.\d+)?$/.test(text)) countUp(value, Number(text), text.includes('.') ? 1 : 0);
        });
      }
      show(feedback, revealMessage(kind, guess, stats));
      document.querySelectorAll('.predict-row input, .predict-row button').forEach((el) => { el.disabled = true; });
      document.getElementById('revise-box').hidden = false; // the task completes after the child decides
      stage.predict = 'revealed';
      numberFacts.guess = guess;
      if (kind === 'category') numberFacts.mode = stats.mode;
      else numberFacts.mean = formatMean(stats.mean);
      memory.predict.guess = guess;
      memory.predict.revealed = true;
    };

    revealNumbers = () => {
      // Guess first: the numbers stay hidden until the child has made a guess.
      const guess = readGuess('predict');
      if (guess === null) {
        show(feedback, kind === 'category' ? `Pick your ${word} first!` : `Type your ${word} first!`);
        return;
      }
      showStats(guess);

      // Part 50: new fields only. planGuess: the Plan prediction beside the
      // estimate; fromPlan: games checked the Plan prediction (no second guess).
      const logged = { about: recipe.question, scenarioId: recipe.id, guess, planGuess, fromPlan };
      if (kind === 'category') logged.mode = stats.mode;
      else Object.assign(logged, { mean: numberFacts.mean, median: stats.median });
      logEvent('number-lab', 'prediction', logged);
      refreshPrimary();
      remember();
    };

    setupRevision(n, () => numberFacts.guess);
  },

  build: (n, { values }) => {
    const target = buildTarget(values);
    const inputs = [...document.querySelectorAll('.build-input')];
    const feedback = document.getElementById('build-feedback');
    const tracker = trackMeaningTask('number-lab', 'build-mean', { scenarioId: recipe.id, target });
    let allSameSolved = false;
    let filledByHint = false; // for the thesis: the hint wrote the numbers (logged as usedHint)

    // The hint (Habiba, 6 Nov 2026): first an idea, then a chip that fills all
    // 5 boxes with the mean. The child still taps "Check my numbers".
    buildHint = createHint('build-mean', 'number-lab', [
      `Try writing the mean, ${target}, in all 5 boxes!`,
      {
        text: 'Here it is. Tap it to fill the boxes:',
        answer: `Fill it in for me: ${Array(5).fill(target).join(', ')}`,
        id: 'fill-mean',
        onPick: () => {
          inputs.forEach((box) => { box.value = target; });
          filledByHint = true;
          showTotal();
          inputs[0].focus();
        },
      },
    ]);
    document.getElementById('build-hint-slot').replaceChildren(buildHint.list);
    if (tasks[currentTask - 1] === 'build') bar.setHint(buildHint.button);
    // Typing again means the child's own numbers again.
    inputs.forEach((input) => input.addEventListener('input', () => { filledByHint = false; }));

    // Part 55 (Habiba chose the live total, 8 Nov 2026): the fair-share idea
    // in one line. A mean of 8 for 5 friends means a total of 5 x 8 = 40.
    // It never shows the mean itself; the child still checks.
    const totalLine = document.getElementById('build-total');
    const need = 5 * target;
    function showTotal() {
      const filled = inputs.filter((box) => box.value !== '');
      const sum = filled.reduce((s, box) => s + Number(box.value), 0);
      const done = filled.length === 5 && sum === need;
      totalLine.classList.toggle('build-total--done', done);
      if (!filled.length) setIconLine(totalLine, `Your 5 numbers must add up to ${need} (5 × ${target}).`);
      else if (done) setIconLine(totalLine, `:check: Your 5 numbers add up to ${need}. Now tap Check my numbers!`);
      else if (filled.length < 5) setIconLine(totalLine, `So far: ${sum}. All 5 must add up to ${need}.`);
      else setIconLine(totalLine, `Your 5 numbers add up to ${sum}. You need ${need}.`);
      // An old "Not yet" or "Fill in all 5" would contradict the line above: it goes.
      if (feedback.dataset.kind === 'retry') {
        feedback.hidden = true;
        feedback.dataset.kind = '';
      }
    }
    inputs.forEach((input) => input.addEventListener('input', showTotal));
    inputs.forEach((input) => input.addEventListener('input', remember));
    showTotal();

    // The worked example opens and closes in place.
    const exampleBtn = document.getElementById('build-example-btn');
    const exampleBox = document.getElementById('build-example-box');
    exampleBtn.addEventListener('click', () => {
      exampleBox.hidden = !exampleBox.hidden;
      exampleBtn.setAttribute('aria-expanded', String(!exampleBox.hidden));
      exampleBtn.textContent = exampleBox.hidden ? 'See an example' : 'Hide the example';
    });

    // After all-the-same numbers, the child may take up Pip's challenge. No
    // button needed: Pip notices as soon as the numbers differ and still fit.
    inputs.forEach((input) => input.addEventListener('input', () => {
      if (!allSameSolved || inputs.some((box) => box.value === '')) return;
      const numbers = inputs.map((box) => Number(box.value));
      if (isAllSame(numbers) || mean(numbers) !== target) return;
      allSameSolved = false;
      show(feedback, `:check: Well done! They are different now, and the mean is still ${target}.`);
      logEvent('number-lab', 'build-varied', { scenarioId: recipe.id, target });
      cheer(feedback);
    }));

    checkBuild = () => {
      if (inputs.some((input) => input.value === '')) {
        show(feedback, 'Fill in all 5 numbers first!');
        feedback.dataset.kind = 'retry';
        return;
      }
      const numbers = inputs.map((input) => Number(input.value));
      const theirMean = mean(numbers);
      if (theirMean === target) {
        // All the same is correct, so it never blocks; Pip just asks for more.
        allSameSolved = isAllSame(numbers);
        show(feedback, allSameSolved
          ? `:check: Yes! The mean is exactly ${target}. Can you make them different? Try one down, one up.`
          : `:check: Yes! The mean of your numbers is exactly ${target}.`);
        tracker.solved({ allSame: allSameSolved, usedHint: filledByHint });
        cheer(feedback);
        bar.setHint(null);
        memory.build.solvedText = feedback.textContent;
        markComplete(n);
      } else {
        // The hint shows the idea behind the mean: the total, shared fairly.
        // Part 55: short; the live total line shows what to change.
        show(feedback, `:cross: Not yet: their mean is ${Math.round(theirMean * 100) / 100}. Look at the total.`);
        feedback.dataset.kind = 'retry';
        tracker.wrong();
        encourage(feedback);
      }
    };
  },

  mistake: (n) => {
    const { numbers } = content.mistake;
    wireRetryChoices(document.getElementById('mistake-choices'), document.getElementById('mistake-feedback'), {
      task: 'find-mias-mistake',
      isCorrect: (answer) => answer === (miaSays(numbers) === median(numbers) ? 'yes' : 'no'),
      correctText: ':check: Right! Mia forgot to put the numbers in order first.',
      hintText: ':cross: Not quite. What must we do first to find the median?',
      // Then the child sorts the cards themselves; the task is done once sorted.
      onCorrect: ({ quiet }) => {
        stage.mistake = 'sort';
        refreshPrimary();
        const sortFeedback = document.getElementById('sort-feedback');
        if (quiet && memory.texts.sort) {
          // Sorted on an earlier visit: the answer, without the cards.
          sortFeedback.textContent = memory.texts.sort;
          sortFeedback.hidden = false;
          return;
        }
        const box = document.getElementById('sort-box');
        box.hidden = false;
        mountCardSort(box, numbers, (centre) => {
          const feedback = sortFeedback;
          setIconLine(feedback, `:check: In order! The one in the centre is ${centre.join(' and ')}. That is the median, not ${miaSays(numbers)}.`);
          feedback.hidden = false;
          memory.texts.sort = feedback.textContent;
          cheer(feedback);
          // Logged apart from Mia's yes/no answer (that one is logged when it is right).
          logEvent('number-lab', 'cards-sorted', { scenarioId: recipe.id, numbers, centre });
          markComplete(n);
        });
      },
    });
  },

  realLife: (n) => {
    const { realLife } = content;
    const list = realLife.numbers || realLife.items;
    const [theMode] = mode(list); // one mode, checked by tests/number-tasks.test.js
    const asAnswer = (answer) => (realLife.numbers ? Number(answer) : answer);

    wireRetryChoices(document.getElementById('mode-choices'), document.getElementById('mode-feedback'), {
      task: 'real-life-mode',
      isCorrect: (answer) => asAnswer(answer) === theMode,
      correctText: `:check: Yes! ${theMode} comes up ${timesIn(list, theMode)} times. That's more than any other. It is the mode.`,
      hintText: ':cross: Not quite. Count how many times each one comes up.',
      onCorrect: () => {
        if (realLife.medianQuestion) document.getElementById('median-question').hidden = false;
        else markComplete(n);
      },
    });

    if (!realLife.medianQuestion) return;
    // Part 56 (Habiba, 8 Nov 2026): the child sorts the cards (drag or ← →),
    // then taps the one in the centre. Logged as before: real-life-median
    // (wrong taps count as tries) and reallife-sorted (now: sorted by the child).
    const feedback = document.getElementById('median-feedback');
    // Part 60e: answered on an earlier visit: the answer, without the cards.
    showSolved['real-life-median'] = () => {
      document.getElementById('median-sort').hidden = true;
      feedback.textContent = memory.texts.median;
      feedback.hidden = false;
    };
    const tracker = trackMeaningTask('number-lab', 'real-life-median', { scenarioId: recipe.id });
    const side = Math.floor(list.length / 2);
    mountCardSort(document.getElementById('median-sort'), list, () => {
      logEvent('number-lab', 'reallife-sorted', { scenarioId: recipe.id });
    }, {
      pickCentre: (index, value, isCentre) => {
        if (isCentre) {
          show(feedback, `:check: Yes! ${value} is in the centre: ${side} cards on each side. It is the median.`);
          memory.texts.median = feedback.textContent;
          tracker.solved();
          cheer(feedback);
          markComplete(n);
        } else {
          show(feedback, ':cross: Not quite. The centre has the same number of cards on each side. Count them!');
          tracker.wrong();
          encourage(feedback);
        }
        return isCentre;
      },
    });
  },

  whyNoMean: (n) => {
    const { options } = content.whyNoMean;
    wireRetryChoices(document.getElementById('why-choices'), document.getElementById('why-feedback'), {
      task: 'why-no-mean',
      isCorrect: (answer) => options[Number(answer)].correct,
      correctText: ':check: Yes! We can only add up numbers. For words, we use the mode.',
      hintText: ":cross: Not quite. Can you add 'Football' + 'Tag'?",
      onCorrect: () => markComplete(n),
    });
  },

  compareRange: (n, { stats }) => {
    const wider = stats.rangeB > stats.range ? 'Class B' : 'Class A';
    const [big, small] = wider === 'Class B' ? [stats.rangeB, stats.range] : [stats.range, stats.rangeB];
    const narrower = wider === 'Class B' ? 'Class A' : 'Class B';
    wireRetryChoices(document.getElementById('range-choices'), document.getElementById('range-feedback'), {
      task: 'compare-range',
      isCorrect: (answer) => answer === wider,
      correctText: `:check: Yes! ${wider}'s range is ${big}. ${narrower}'s range is only ${small}. The mean alone hides this!`,
      hintText: ':cross: Not quite. Look at the range of each class.',
      onCorrect: () => markComplete(n),
    });
  },
};

// Guess -> Test -> Compare -> Refine: after seeing the numbers, the child
// keeps or changes their guess. Both choices are logged as a "revision".
function setupRevision(n, getOldGuess) {
  const keepBtn = document.getElementById('keep-guess-btn');
  const changeBtn = document.getElementById('change-guess-btn');
  const form = document.getElementById('revise-form');
  const reasonInput = document.getElementById('revise-reason');
  const feedback = document.getElementById('revise-feedback');

  function finish(message, { quiet = false } = {}) {
    show(feedback, message);
    keepBtn.disabled = true;
    changeBtn.disabled = true;
    form.hidden = true;
    bar.setHint(null);
    memory.predict.revision = { message, kept: keepBtn.classList.contains('active') };
    markComplete(n);
    // The choice buttons are now locked, so keyboard users jump straight to the next step.
    if (!quiet) document.getElementById('action-primary').focus();
  }
  // Part 60e: the decision made on an earlier visit, shown again (not logged).
  showRevision = ({ message, kept }) => {
    (kept ? keepBtn : changeBtn).classList.add('active');
    finish(message, { quiet: true });
  };

  keepBtn.addEventListener('click', () => {
    keepBtn.classList.add('active');
    logEvent('number-lab', 'revision', { about: recipe.question, scenarioId: recipe.id, changed: false, oldGuess: getOldGuess() });
    finish(kind === 'category'
      ? `You kept your ${word}: ${getOldGuess()}. Look at the mode above. Does it back you up?`
      : `You kept your ${word}: ${getOldGuess()}. Which number above backs it up?`);
  });

  openChange = ({ quiet = false } = {}) => {
    changeBtn.classList.add('active');
    stage.predict = 'changing';
    memory.predict.changing = true;
    form.hidden = false; // first, so the Hint button can go under the question
    if (quiet) return;
    bar.setHint(reasonHint.button);
    refreshPrimary();
    remember();
    form.querySelector('input, button').focus();
  };
  changeBtn.addEventListener('click', () => openChange());
  form.addEventListener('input', remember);
  form.addEventListener('click', remember);

  saveRevision = () => {
    const newGuess = readGuess('new-guess');
    const reason = reasonInput.value.trim();
    if (newGuess === null || !reason) {
      show(feedback, `Give your new ${word} AND say why.`);
      return;
    }
    numberFacts.changedWithReason = true;
    numberFacts.revision = { reason, source: reasonHint.answerFields().answerSource }; // "Your work" on the card
    logEvent('number-lab', 'revision', {
      about: recipe.question, scenarioId: recipe.id, changed: true, oldGuess: getOldGuess(), newGuess, reason, ...reasonHint.answerFields(),
    });
    finish(`You changed from ${getOldGuess()} to ${newGuess} because ${reason}. Changing your mind with evidence is what data detectives do! :magnifier:`);
  };
}

// ---------- Part 60e (Habiba, 11 Nov 2026): the room remembers ----------

// The child's guess control as it is now (a number box or a chosen word).
function guessDraft(prefix) {
  if (kind === 'category') {
    const chosen = document.querySelector(`.${prefix}-choice.active`);
    return chosen ? chosen.dataset.value : null;
  }
  const input = document.getElementById(`${prefix}-input`);
  return input ? input.value : null;
}

function setGuessDraft(prefix, value) {
  if (value === null || value === undefined) return;
  if (kind === 'category') {
    document.querySelectorAll(`.${prefix}-choice`).forEach((b) => b.classList.toggle('active', b.dataset.value === String(value)));
    return;
  }
  const input = document.getElementById(`${prefix}-input`);
  if (input) input.value = value;
}

function remember() {
  if (restoring) return;
  saveRoomState('number-lab', recipe.id, {
    task: currentTask,
    done: { ...taskComplete },
    facts: numberFacts,
    predict: {
      ...memory.predict,
      draft: memory.predict.revealed ? null : guessDraft('predict'),
      newGuess: guessDraft('new-guess'),
      reason: document.getElementById('revise-reason') ? document.getElementById('revise-reason').value : '',
      reasonTapped: reasonHint ? reasonHint.tappedAnswers() : [],
    },
    build: {
      ...memory.build,
      numbers: [...document.querySelectorAll('.build-input')].map((box) => box.value),
    },
    solved: memory.solved,
    texts: memory.texts,
  });
}

function restore(saved) {
  Object.assign(numberFacts, saved.facts);
  memory.texts = { ...saved.texts };
  const p = saved.predict || {};
  // The estimate (or prediction), its reveal, and keep / change.
  if (p.revealed) {
    setGuessDraft('predict', p.guess);
    showStats(p.guess, { quiet: true });
    if (p.revision) {
      showRevision(p.revision);
    } else if (p.changing) {
      openChange({ quiet: true });
    }
  } else {
    setGuessDraft('predict', p.draft);
  }
  setGuessDraft('new-guess', p.newGuess);
  if (reasonHint) reasonHint.restoreTapped(p.reasonTapped);
  const reason = document.getElementById('revise-reason');
  if (reason) reason.value = p.reason || '';
  // Build it: the 5 numbers, and the answer if it was solved.
  const b = saved.build || {};
  const inputs = [...document.querySelectorAll('.build-input')];
  (b.numbers || []).forEach((value, i) => { if (inputs[i]) inputs[i].value = value; });
  if (inputs.length) inputs[0].dispatchEvent(new Event('input')); // the live total line
  if (b.solvedText) {
    memory.build.solvedText = b.solvedText;
    const feedback = document.getElementById('build-feedback');
    feedback.textContent = b.solvedText;
    feedback.hidden = false;
  }
  // The multiple-choice tasks answered right (and their card sorts).
  Object.keys(saved.solved || {}).forEach((task) => { if (showSolved[task]) showSolved[task](); });
  if (memory.texts.median && showSolved['real-life-median']) showSolved['real-life-median']();
  Object.assign(taskComplete, saved.done);
}

init();
