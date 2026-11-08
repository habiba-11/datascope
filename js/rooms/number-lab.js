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
import { getSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { cheer, encourage, stagger, countUp } from '../motion.js';
import { finishPhase } from '../phase-progress.js';
import { whenIntroClosed } from '../phase-intro.js';
import { addRecapButton, autoOpenRecap } from '../recap.js';
import { mountCardSort } from '../card-sort.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML, wordsNoteHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { pipSay } from '../pip.js';

// The 3-zone layout (UI guide): the Explore rooms are tabs on the card, the
// tasks are a mini stepper, and the ONE primary button in the action bar says
// what happens next (it replaces each task's own button and "Next").
const STEP_LABELS = {
  predict: 'Guess', build: 'Build it', mistake: "Mia's mistake", realLife: 'Real life',
  whyNoMean: 'Mean of games?', compareRange: 'Spread',
};
const TASK_TITLES = {
  predict: 'Your guess', build: '🧱 Build it!', mistake: '🕵️ Find the mistake', realLife: '🛒 Real life',
  whyNoMean: '🤔 Mean of games?', compareRange: '📏 Which spreads out more?',
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
  TASK_TITLES.predict = kind === 'category' ? '🔮 Your prediction' : '📏 Your estimate';
  // Part 51: the games scenario never talks about numbers.
  if (kind === 'category') TASK_PIP.realLife = 'Data is everywhere in real life!';
  TASK_PIP.predict = fromPlan ? 'Was your prediction right? Let us check!' : 'Estimate first, then check the statistics!';

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
  showTask(1);

  // The maths recap (Part 18): a 📘 button, and the first time it opens by
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
  const task = tasks[n - 1];
  document.getElementById('stepper').innerHTML = miniStepperHTML(tasks.map((t) => STEP_LABELS[t]), n - 1);
  document.querySelector('.task-question').textContent = TASK_TITLES[task];
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
      ? { label: '🎲 Next: Chance Lab →', ready: true, onClick: () => { location.href = 'chance-lab.html'; } }
      : { label: `Next: ${STEP_LABELS[tasks[n]]} →`, ready: true, onClick: () => showTask(n + 1) });
    return;
  }
  if (task === 'predict') {
    if (stage.predict === 'guess') bar.setPrimary({ label: kind === 'category' ? '🔍 Show the mode' : '🔍 Show statistics', onClick: revealNumbers });
    else if (stage.predict === 'changing') bar.setPrimary({ label: `Save my new ${word}`, onClick: saveRevision });
    else bar.setPrimary({ label: '', enabled: false, whyDisabled: `🤔 Keep or change your ${word}?` });
  } else if (task === 'build') {
    bar.setPrimary({ label: 'Check my numbers', onClick: checkBuild });
  } else if (task === 'mistake' && stage.mistake === 'sort') {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '🃏 Put the cards in order first' });
  } else {
    bar.setPrimary({ label: '', enabled: false, whyDisabled: '👆 Pick an answer first' });
  }
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
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

const show = (feedback, text) => {
  feedback.textContent = text;
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

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (isCorrect(btn.dataset.answer)) {
        solved = true;
        show(feedback, correctText);
        tracker.solved();
        cheer(feedback);
        onCorrect();
      } else {
        show(feedback, typeof hintText === 'function' ? hintText() : hintText);
        tracker.wrong();
        encourage(feedback);
      }
    });
  });
}

// ---------- each task: its HTML, then its setup ----------

// Real life (8 Nov 2026): the numbers as chips. In order, each chip also shows
// its place (1st, 2nd...) under it. Numbers only, so this HTML is safe.
function orderChipsHTML(numbers, inPlaces) {
  return numbers.map((value, i) => `
    <li class="order-chip${inPlaces ? ' order-chip--sorted' : ''}" style="--i: ${i}">
      <span class="order-value">${value}</span>
      ${inPlaces ? `<span class="order-place">${i + 1}</span>` : ''}
    </li>`).join('');
}

function statCard(label, value) {
  return `<div class="stat-card"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
}

const modeText = (modes) => (modes.length ? modes.join(', ') : 'none');

function statsHTML(stats) {
  if (kind === 'category') {
    return `<div class="stats-grid">
      ${statCard('Mode', modeText(stats.mode))}
      ${statCard('Mean, median, range', '✖ not for words')}
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
      <p class="build-example-title">${example.title}</p>
      <ol class="example-steps">
        ${step(1, example.startText, chips(example.start, example.start), example.startSum)}
        ${step(2, example.movedText, chips(example.moved, example.start), example.movedSum)}
        ${step(3, example.checkText, '', example.checkSum)}
      </ol>
      <p class="build-example-end">${example.endText}</p>
      <p class="build-example-turn">✏️ Your turn: make a mean of ${target}!</p>
    </aside>`;
}

const TASK_HTML = {
  predict: (n, { values }) => `
    <section class="task" data-task="${n}">
      ${planGuess !== null ? `<p class="plan-reminder">${planReminder(planGuess, recipe)}</p>` : ''}
      <p>${fromPlan ? content.checkPrompt : content.predictPrompt}</p>
      ${fromPlan ? '' : `<div class="predict-row">${guessControl('predict', values)}</div>`}
      <div id="stats-box" hidden></div>
      <p class="feedback" id="predict-feedback" hidden></p>

      <div class="revise-box" id="revise-box" hidden>
        <p><strong>🤔 Has the data changed your mind?</strong></p>
        <div class="choice-row">
          <button class="btn choice-btn" id="keep-guess-btn" type="button">👍 Keep my ${word}</button>
          <button class="btn choice-btn" id="change-guess-btn" type="button">✏️ Change my ${word}</button>
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
      <div class="build-layout">
        <div>
          <!-- 8 Nov 2026 (Habiba: clearer): what to do, the goal, and what the mean is -->
          <p>${content.build}</p>
          <p class="build-goal">${fillTemplate(content.buildGoal, { target: buildTarget(values) })}</p>
          <p class="build-reminder">🔎 Mean = add all 5, then divide by 5.</p>
          <div class="build-row">
            ${[1, 2, 3, 4, 5].map((i) => `<label class="build-box">Friend ${i}<input type="number" class="build-input"></label>`).join('')}
          </div>
          <div class="hint-list-slot" id="build-hint-slot"></div>
        </div>
        ${buildExampleHTML(buildExample(buildTarget(values)), buildTarget(values))}
      </div>
      <p class="feedback" id="build-feedback" hidden></p>
    </section>`,

  mistake: (n) => `
    <section class="task" data-task="${n}" hidden>
      <p>${content.mistake.story}</p>
      <p class="number-list">${content.mistake.numbers.join(', ')}</p>
      <p>She says: <strong>"The median is ${miaSays(content.mistake.numbers)}."</strong> Is she right?</p>
      <div class="choice-row" id="mistake-choices">
        <button class="btn choice-btn" data-answer="yes" type="button">✅ Mia is right</button>
        <button class="btn choice-btn" data-answer="no" type="button">❌ Mia is wrong</button>
      </div>
      <p class="feedback" id="mistake-feedback" hidden></p>
      <div class="sort-box" id="sort-box" hidden>
        <p><strong>🃏 Now you fix it! Put Mia's numbers in order.</strong></p>
      </div>
      <p class="feedback" id="sort-feedback" hidden></p>
    </section>`,

  realLife: (n) => {
    const list = content.realLife.numbers || content.realLife.items;
    return `
    <section class="task" data-task="${n}" hidden>
      <p>${content.realLife.story}</p>
      <p class="number-list">${list.join(', ')}</p>
      <p><strong>1.</strong> ${content.realLife.modeQuestion}</p>
      <div class="choice-row" id="mode-choices">${choiceButtons(choicesFor(list))}</div>
      <p class="feedback" id="mode-feedback" hidden></p>
      ${content.realLife.medianQuestion ? `
        <div id="median-question" hidden>
          <p><strong>2.</strong> ${content.realLife.medianQuestion}</p>
          <!-- 8 Nov 2026 (Habiba): the child can put the numbers in order first -->
          <div class="order-tool">
            <ol class="order-row" id="order-row" aria-label="The numbers">${orderChipsHTML(list, false)}</ol>
            <button class="btn btn-secondary" id="order-btn" type="button">🔢 Put them in order</button>
          </div>
          <div class="choice-row" id="median-choices">${choiceButtons(choicesFor(list))}</div>
          <p class="feedback" id="median-feedback" hidden></p>
        </div>` : ''}
    </section>`;
  },

  whyNoMean: (n) => `
    <section class="task" data-task="${n}" hidden>
      <p>${content.whyNoMean.question}</p>
      <div class="choice-row choice-column" id="why-choices">
        ${content.whyNoMean.options.map((o, i) => `<button class="btn choice-btn" data-answer="${i}" type="button">${o.text}</button>`).join('')}
      </div>
      <p class="feedback" id="why-feedback" hidden></p>
    </section>`,

  compareRange: (n, data) => `
    <section class="task" data-task="${n}" hidden>
      <p>${content.compareRange.story}</p>
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
    { name: '📗 Class A', css: 'a', ...rangeSummary(values) },
    { name: '📘 Class B', css: 'b', ...rangeSummary(valuesB) },
  ];
  const scaleMax = Math.max(classes[0].high, classes[1].high);
  const cards = classes.map((c) => {
    const span = rulerSpan(c, scaleMax);
    return `
      <div class="range-card range-card--${c.css}">
        <p class="range-name">${c.name}</p>
        <ul class="range-facts">
          <li>Lowest: <b>${c.low}</b> · Highest: <b>${c.high}</b></li>
          <li>Mean: <b>${c.mean}</b> ${unit}</li>
          <li>Range: ${c.high} − ${c.low} = <b>${c.range}</b> ${unit}</li>
        </ul>
        <div class="range-ruler" role="img" aria-label="${c.name.slice(3)}: answers from ${c.low} to ${c.high} ${unit}">
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

    revealNumbers = () => {
      // Guess first: the numbers stay hidden until the child has made a guess.
      const guess = readGuess('predict');
      if (guess === null) {
        show(feedback, kind === 'category' ? `👆 Pick your ${word} first!` : `✏️ Type your ${word} first!`);
        return;
      }
      const box = document.getElementById('stats-box');
      box.innerHTML = statsHTML(stats);
      box.hidden = false;
      // The numbers spring in one by one and count up, like a drum roll.
      stagger(box.querySelectorAll('.stat-card'), { each: 0.15 });
      box.querySelectorAll('.stat-value').forEach((value) => {
        const text = value.textContent;
        if (/^\d+(\.\d+)?$/.test(text)) countUp(value, Number(text), text.includes('.') ? 1 : 0);
      });
      show(feedback, revealMessage(kind, guess, stats));
      document.querySelectorAll('.predict-row input, .predict-row button').forEach((el) => { el.disabled = true; });

      numberFacts.guess = guess;
      // Part 50: new fields only. planGuess: the Plan prediction beside the
      // estimate; fromPlan: games checked the Plan prediction (no second guess).
      const logged = { about: recipe.question, scenarioId: recipe.id, guess, planGuess, fromPlan };
      if (kind === 'category') {
        numberFacts.mode = stats.mode;
        logged.mode = stats.mode;
      } else {
        numberFacts.mean = formatMean(stats.mean);
        Object.assign(logged, { mean: numberFacts.mean, median: stats.median });
      }
      logEvent('number-lab', 'prediction', logged);
      document.getElementById('revise-box').hidden = false; // the task completes after the child decides
      stage.predict = 'revealed';
      refreshPrimary();
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
          inputs[0].focus();
        },
      },
    ]);
    document.getElementById('build-hint-slot').replaceChildren(buildHint.list);
    if (tasks[currentTask - 1] === 'build') bar.setHint(buildHint.button);
    // Typing again means the child's own numbers again.
    inputs.forEach((input) => input.addEventListener('input', () => { filledByHint = false; }));

    // After all-the-same numbers, the child may take up Pip's challenge. No
    // button needed: Pip notices as soon as the numbers differ and still fit.
    inputs.forEach((input) => input.addEventListener('input', () => {
      if (!allSameSolved || inputs.some((box) => box.value === '')) return;
      const numbers = inputs.map((box) => Number(box.value));
      if (isAllSame(numbers) || mean(numbers) !== target) return;
      allSameSolved = false;
      show(feedback, `✅ Well done! They are different now, and the mean is still ${target}. 🎉`);
      logEvent('number-lab', 'build-varied', { scenarioId: recipe.id, target });
      cheer(feedback);
    }));

    checkBuild = () => {
      if (inputs.some((input) => input.value === '')) {
        show(feedback, '✏️ Fill in all 5 numbers first!');
        return;
      }
      const numbers = inputs.map((input) => Number(input.value));
      const theirMean = mean(numbers);
      if (theirMean === target) {
        // All the same is correct, so it never blocks; Pip just asks for more.
        allSameSolved = isAllSame(numbers);
        show(feedback, allSameSolved
          ? `✅ Yes! The mean is exactly ${target}. 🤔 Can you make them different? Try one down, one up.`
          : `✅ Yes! The mean of your numbers is exactly ${target}. 🎉`);
        tracker.solved({ allSame: allSameSolved, usedHint: filledByHint });
        cheer(feedback);
        bar.setHint(null);
        markComplete(n);
      } else {
        // The hint shows the idea behind the mean: the total, shared fairly.
        show(feedback, `Your numbers have a mean of ${Math.round(theirMean * 100) / 100}. 💡 Tip: 5 × ${target} = ${5 * target}. Your 5 numbers must add up to ${5 * target}.`);
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
      correctText: '✅ Right! Mia forgot to put the numbers in order first.',
      hintText: '🤔 Not quite. What must we do first to find the median?',
      // Then the child sorts the cards themselves; the task is done once sorted.
      onCorrect: () => {
        stage.mistake = 'sort';
        refreshPrimary();
        const box = document.getElementById('sort-box');
        box.hidden = false;
        mountCardSort(box, numbers, (centre) => {
          const feedback = document.getElementById('sort-feedback');
          feedback.textContent = `✅ In order! The one in the centre is ${centre.join(' and ')}. That is the median, not ${miaSays(numbers)}.`;
          feedback.hidden = false;
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
      correctText: `✅ Yes! ${theMode} comes up ${timesIn(list, theMode)} times. That's more than any other. It is the mode.`,
      hintText: '🤔 Not quite. Count how many times each one comes up.',
      onCorrect: () => {
        if (realLife.medianQuestion) document.getElementById('median-question').hidden = false;
        else markComplete(n);
      },
    });

    if (!realLife.medianQuestion) return;
    const theMedian = median(list);
    // "Put them in order": the chips line up smallest to biggest, each with
    // its place (1 to 7) under it. The child still finds the centre.
    let sorted = false;
    const orderButton = document.getElementById('order-btn');
    orderButton.addEventListener('click', () => {
      sorted = true;
      document.getElementById('order-row').innerHTML = orderChipsHTML([...list].sort(compareValues), true);
      orderButton.disabled = true;
      orderButton.textContent = '✅ In order, smallest to biggest';
      logEvent('number-lab', 'reallife-sorted', { scenarioId: recipe.id });
    });
    wireRetryChoices(document.getElementById('median-choices'), document.getElementById('median-feedback'), {
      task: 'real-life-median',
      isCorrect: (answer) => Number(answer) === theMedian,
      correctText: `✅ Yes! In order: ${inOrder(list)}. The one in the centre is ${theMedian}. It is the median.`,
      hintText: () => (sorted
        ? '🤔 Not quite. The centre has the same number of boxes on each side.'
        : '🤔 Not quite. Tap "Put them in order" first.'),
      onCorrect: () => markComplete(n),
    });
  },

  whyNoMean: (n) => {
    const { options } = content.whyNoMean;
    wireRetryChoices(document.getElementById('why-choices'), document.getElementById('why-feedback'), {
      task: 'why-no-mean',
      isCorrect: (answer) => options[Number(answer)].correct,
      correctText: '✅ Yes! We can only add up numbers. For words, we use the mode.',
      hintText: "🤔 Not quite. Can you add 'Football' + 'Tag'?",
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
      correctText: `✅ Yes! ${wider}'s range is ${big}. ${narrower}'s range is only ${small}. The mean alone hides this!`,
      hintText: '🤔 Not quite. Look at the range of each class.',
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

  function finish(message) {
    show(feedback, message);
    keepBtn.disabled = true;
    changeBtn.disabled = true;
    form.hidden = true;
    bar.setHint(null);
    markComplete(n);
    // The choice buttons are now locked, so keyboard users jump straight to the next step.
    document.getElementById('action-primary').focus();
  }

  keepBtn.addEventListener('click', () => {
    keepBtn.classList.add('active');
    logEvent('number-lab', 'revision', { about: recipe.question, scenarioId: recipe.id, changed: false, oldGuess: getOldGuess() });
    finish(kind === 'category'
      ? `👍 You kept your ${word}: ${getOldGuess()}. Look at the mode above. Does it back you up?`
      : `👍 You kept your ${word}: ${getOldGuess()}. Which number above backs it up?`);
  });

  changeBtn.addEventListener('click', () => {
    changeBtn.classList.add('active');
    stage.predict = 'changing';
    form.hidden = false; // first, so the Hint button can go under the question
    bar.setHint(reasonHint.button);
    refreshPrimary();
    form.querySelector('input, button').focus();
  });

  saveRevision = () => {
    const newGuess = readGuess('new-guess');
    const reason = reasonInput.value.trim();
    if (newGuess === null || !reason) {
      show(feedback, `✏️ Give your new ${word} AND say why.`);
      return;
    }
    numberFacts.changedWithReason = true;
    numberFacts.revision = { reason, source: reasonHint.answerFields().answerSource }; // "Your work" on the card
    logEvent('number-lab', 'revision', {
      about: recipe.question, scenarioId: recipe.id, changed: true, oldGuess: getOldGuess(), newGuess, reason, ...reasonHint.answerFields(),
    });
    finish(`✏️ You changed from ${getOldGuess()} to ${newGuess} because ${reason}. Changing your mind with evidence is what data detectives do! 🔎`);
  };
}

init();
