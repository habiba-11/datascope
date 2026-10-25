import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { mean, median, mode, formatMean, compareValues } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import {
  numberLabKind, TASKS_BY_KIND, fillTemplate, buildTarget, miaSays, choicesFor, revealMessage, classStats,
} from '../helpers/number-tasks.js';
import { logEvent, trackMeaningTask } from '../helpers/log.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { cheer, encourage } from '../motion.js';
import { finishPhase } from '../phase-progress.js';

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

async function init() {
  recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);
  content = (await loadContent(recipe.id)).numberLab;
  kind = numberLabKind(recipe);
  tasks = TASKS_BY_KIND[kind];
  tasks.forEach((task, i) => { taskComplete[i + 1] = false; });
  numberFacts.teaches = recipe.teaches;

  const { values } = generateClassData(recipe);
  const valuesB = partner ? generateClassData(partner).values : null;
  const stats = classStats(kind, values, valuesB);
  const data = { values, stats };

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'number',
    phase: 'number',
    pipMessage: "Hoo-hoo! Guess first. Then let's see what the numbers say!",
    contentHTML: `
      <h1 class="room-title">🔢 Number Lab</h1>
      <p class="task-progress" id="task-progress"></p>
      ${tasks.map((task, i) => TASK_HTML[task](i + 1, data)).join('')}
      <a class="btn btn-main next-room-btn" id="next-room-btn" href="chance-lab.html" hidden>🎲 Next: Chance Lab →</a>
      <div class="task-nav">
        <button class="btn" id="back-btn" type="button">← Back</button>
        <button class="btn btn-main" id="next-btn" type="button" disabled>Next →</button>
      </div>
    `,
  });

  tasks.forEach((task, i) => TASK_SETUP[task](i + 1, data));
  setupTaskNav();
}

// ---------- the task flow ----------

function showTask(n) {
  document.querySelectorAll('.task').forEach((el) => {
    el.hidden = Number(el.dataset.task) !== n;
  });
  document.getElementById('task-progress').textContent = `Task ${n} of ${tasks.length}`;
  document.getElementById('back-btn').disabled = n === 1;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = !taskComplete[n];
  // Last task: the room's own big button (next room) is the one clear action.
  nextBtn.hidden = n === tasks.length;
  currentTask = n;
}

function markComplete(taskNum) {
  taskComplete[taskNum] = true;
  if (currentTask === taskNum) {
    document.getElementById('next-btn').disabled = taskNum === tasks.length;
  }
  // The room's phase is done when every task is done.
  if (Object.values(taskComplete).every(Boolean)) {
    document.getElementById('next-room-btn').hidden = false;
    finishPhase('number', numberFacts);
  }
}

function setupTaskNav() {
  document.getElementById('back-btn').addEventListener('click', () => {
    showTask(Math.max(1, currentTask - 1));
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentTask < tasks.length) showTask(currentTask + 1);
  });
  showTask(1);
}

// ---------- small helpers ----------

// A number box (numbers) or a row of choice buttons (words, e.g. games).
function guessControl(prefix, values) {
  if (kind === 'category') {
    return choicesFor(values)
      .map((v) => `<button class="btn choice-btn ${prefix}-choice" data-value="${v}" type="button">${v}</button>`)
      .join('');
  }
  return `<input type="number" id="${prefix}-input" aria-label="My guess"> <span class="predict-unit">${recipe.unit || ''}</span>`;
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
        show(feedback, hintText);
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
      ${statCard('Mean or median', '✖ not for words')}
    </div>`;
  }
  const grid = (m, md, mo, r) => `<div class="stats-grid">
    ${statCard('Mean', formatMean(m))}${statCard('Median', md)}${statCard('Mode', modeText(mo))}${statCard('Range', r)}
  </div>`;
  if (kind === 'compare') {
    return `<h3 class="stats-class-title">Class A</h3>${grid(stats.mean, stats.median, stats.mode, stats.range)}
      <h3 class="stats-class-title">Class B</h3>${grid(stats.meanB, stats.medianB, stats.modeB, stats.rangeB)}`;
  }
  return grid(stats.mean, stats.median, stats.mode, stats.range);
}

const TASK_HTML = {
  predict: (n, { values }) => `
    <section class="task" data-task="${n}">
      <h2 class="task-title">Your guess</h2>
      <p>${content.predictPrompt}</p>
      <div class="predict-row">${guessControl('predict', values)}</div>
      <button class="btn btn-main" id="reveal-btn" type="button">🔍 Show the numbers</button>
      <div id="stats-box" hidden></div>
      <p class="feedback" id="predict-feedback" hidden></p>

      <div class="revise-box" id="revise-box" hidden>
        <p><strong>🤔 Has the data changed your mind?</strong></p>
        <div class="choice-row">
          <button class="btn choice-btn" id="keep-guess-btn" type="button">👍 Keep my guess</button>
          <button class="btn choice-btn" id="change-guess-btn" type="button">✏️ Change my guess</button>
        </div>
        <div class="revise-form" id="revise-form" hidden>
          <span>My new guess:</span>
          ${guessControl('new-guess', values)}
          <label for="revise-reason">because</label>
          <input type="text" id="revise-reason" class="revise-reason" placeholder="...">
          <button class="btn btn-main" id="save-revision-btn" type="button">Save my new guess</button>
        </div>
        <p class="feedback" id="revise-feedback" hidden></p>
      </div>
    </section>`,

  build: (n, { values }) => `
    <section class="task" data-task="${n}" hidden>
      <h2 class="task-title">🧱 Build it!</h2>
      <p>${fillTemplate(content.build, { target: buildTarget(values) })}</p>
      <div class="build-row">
        ${[1, 2, 3, 4, 5].map((i) => `<input type="number" class="build-input" aria-label="Number ${i}">`).join('')}
      </div>
      <button class="btn btn-main" id="check-build-btn" type="button">Check my numbers</button>
      <p class="feedback" id="build-feedback" hidden></p>
    </section>`,

  mistake: (n) => `
    <section class="task" data-task="${n}" hidden>
      <h2 class="task-title">🕵️ Find the mistake</h2>
      <p>${content.mistake.story}</p>
      <p class="number-list">${content.mistake.numbers.join(', ')}</p>
      <p>She says: <strong>"The median is ${miaSays(content.mistake.numbers)}."</strong> Is she right?</p>
      <div class="choice-row" id="mistake-choices">
        <button class="btn choice-btn" data-answer="yes" type="button">✅ Mia is right</button>
        <button class="btn choice-btn" data-answer="no" type="button">❌ Mia is wrong</button>
      </div>
      <p class="feedback" id="mistake-feedback" hidden></p>
    </section>`,

  realLife: (n) => {
    const list = content.realLife.numbers || content.realLife.items;
    return `
    <section class="task" data-task="${n}" hidden>
      <h2 class="task-title">🛒 Real life</h2>
      <p>${content.realLife.story}</p>
      <p class="number-list">${list.join(', ')}</p>
      <p><strong>1.</strong> ${content.realLife.modeQuestion}</p>
      <div class="choice-row" id="mode-choices">${choiceButtons(choicesFor(list))}</div>
      <p class="feedback" id="mode-feedback" hidden></p>
      ${content.realLife.medianQuestion ? `
        <div id="median-question" hidden>
          <p><strong>2.</strong> ${content.realLife.medianQuestion}</p>
          <div class="choice-row" id="median-choices">${choiceButtons(choicesFor(list))}</div>
          <p class="feedback" id="median-feedback" hidden></p>
        </div>` : ''}
    </section>`;
  },

  whyNoMean: (n) => `
    <section class="task" data-task="${n}" hidden>
      <h2 class="task-title">🤔 Mean of games?</h2>
      <p>${content.whyNoMean.question}</p>
      <div class="choice-row choice-column" id="why-choices">
        ${content.whyNoMean.options.map((o, i) => `<button class="btn choice-btn" data-answer="${i}" type="button">${o.text}</button>`).join('')}
      </div>
      <p class="feedback" id="why-feedback" hidden></p>
    </section>`,

  compareRange: (n) => `
    <section class="task" data-task="${n}" hidden>
      <h2 class="task-title">📏 Which spreads out more?</h2>
      <p>${content.compareRange.story}</p>
      <p><strong>${content.compareRange.question}</strong></p>
      <div class="choice-row" id="range-choices">${choiceButtons(['Class A', 'Class B'])}</div>
      <p class="feedback" id="range-feedback" hidden></p>
    </section>`,
};

const TASK_SETUP = {
  predict: (n, { stats }) => {
    wireChoiceGroup('predict');
    wireChoiceGroup('new-guess');
    const feedback = document.getElementById('predict-feedback');

    document.getElementById('reveal-btn').addEventListener('click', (event) => {
      // Guess first: the numbers stay hidden until the child has made a guess.
      const guess = readGuess('predict');
      if (guess === null) {
        show(feedback, kind === 'category' ? '👆 Pick your guess first!' : '✏️ Type your guess first!');
        return;
      }
      const box = document.getElementById('stats-box');
      box.innerHTML = statsHTML(stats);
      box.hidden = false;
      show(feedback, revealMessage(kind, guess, stats));
      event.target.disabled = true;
      document.querySelectorAll('.predict-row input, .predict-row button').forEach((el) => { el.disabled = true; });

      numberFacts.guess = guess;
      const logged = { about: recipe.question, scenarioId: recipe.id, guess };
      if (kind === 'category') {
        numberFacts.mode = stats.mode;
        logged.mode = stats.mode;
      } else {
        numberFacts.mean = formatMean(stats.mean);
        Object.assign(logged, { mean: numberFacts.mean, median: stats.median });
      }
      logEvent('number-lab', 'prediction', logged);
      document.getElementById('revise-box').hidden = false; // the task completes after the child decides
    });

    setupRevision(n, () => numberFacts.guess);
  },

  build: (n, { values }) => {
    const target = buildTarget(values);
    const inputs = [...document.querySelectorAll('.build-input')];
    const feedback = document.getElementById('build-feedback');
    const tracker = trackMeaningTask('number-lab', 'build-mean', { scenarioId: recipe.id, target });

    document.getElementById('check-build-btn').addEventListener('click', () => {
      if (inputs.some((input) => input.value === '')) {
        show(feedback, '✏️ Fill in all 5 numbers first!');
        return;
      }
      const numbers = inputs.map((input) => Number(input.value));
      const theirMean = mean(numbers);
      if (theirMean === target) {
        show(feedback, `✅ Yes! The mean of your numbers is exactly ${target}. 🎉`);
        tracker.solved();
        cheer(feedback);
        markComplete(n);
      } else {
        // The hint shows the idea behind the mean: the total, shared fairly.
        show(feedback, `Your numbers have a mean of ${Math.round(theirMean * 100) / 100}. 💡 Tip: 5 × ${target} = ${5 * target}. Your 5 numbers must add up to ${5 * target}.`);
        tracker.wrong();
        encourage(feedback);
      }
    });
  },

  mistake: (n) => {
    const { numbers } = content.mistake;
    wireRetryChoices(document.getElementById('mistake-choices'), document.getElementById('mistake-feedback'), {
      task: 'find-mias-mistake',
      isCorrect: (answer) => answer === (miaSays(numbers) === median(numbers) ? 'yes' : 'no'),
      correctText: `✅ Right! Mia forgot to put them in order. In order: ${inOrder(numbers)}. The one in the centre is ${median(numbers)}.`,
      hintText: '🤔 Not quite. What must we do first to find the median?',
      onCorrect: () => markComplete(n),
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
    wireRetryChoices(document.getElementById('median-choices'), document.getElementById('median-feedback'), {
      task: 'real-life-median',
      isCorrect: (answer) => Number(answer) === theMedian,
      correctText: `✅ Yes! In order: ${inOrder(list)}. The one in the centre is ${theMedian}. It is the median.`,
      hintText: '🤔 Not quite. First put them in order, from smallest to biggest.',
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
    markComplete(n);
    // The choice buttons are now locked, so keyboard users jump straight to Next.
    document.getElementById('next-btn').focus();
  }

  keepBtn.addEventListener('click', () => {
    keepBtn.classList.add('active');
    logEvent('number-lab', 'revision', { about: recipe.question, scenarioId: recipe.id, changed: false, oldGuess: getOldGuess() });
    finish(`👍 You kept your guess: ${getOldGuess()}. Which number above backs it up?`);
  });

  changeBtn.addEventListener('click', () => {
    changeBtn.classList.add('active');
    form.hidden = false;
    form.querySelector('input, button').focus();
  });

  document.getElementById('save-revision-btn').addEventListener('click', () => {
    const newGuess = readGuess('new-guess');
    const reason = reasonInput.value.trim();
    if (newGuess === null || !reason) {
      show(feedback, '✏️ Give your new guess AND say why.');
      return;
    }
    numberFacts.changedWithReason = true;
    logEvent('number-lab', 'revision', {
      about: recipe.question, scenarioId: recipe.id, changed: true, oldGuess: getOldGuess(), newGuess, reason,
    });
    finish(`✏️ You changed from ${getOldGuess()} to ${newGuess} because ${reason}. Changing your mind with evidence is what data detectives do! 🔎`);
  });
}

init();
