import { mountShell, exploreCardTabsHTML } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { compareValues } from '../helpers/stats.js';
import { buildFrequencyData, makeChartConfig, directLabelsPlugin, describeChart } from '../helpers/charts.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import { logEvent } from '../helpers/log.js';
import { createHint } from '../helpers/prompts.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { countWords } from '../helpers/feedback.js';
import { pipSay } from '../pip.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards, segmentedHTML } from '../choices.js';

// Graph Lab in the 3-zone layout (UI guide): the Explore rooms are tabs on
// the card; three steps (look, what it tells, what it can NOT tell), each
// with the chart in view and ONE primary button.
const STEP_LABELS = ['Look', 'What it tells', 'What it can NOT tell'];
const CHART_TYPES = [
  { value: 'bar', label: '📊 Bar' },
  { value: 'line', label: '📈 Line' },
  { value: 'pie', label: '🥧 Pie' },
  { value: 'dot', label: '⚫ Dot plot' },
];

// A real answer, not just "ok": both reflections need at least this many characters.
const MIN_REFLECTION = 10;

Chart.register(directLabelsPlugin);

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);
  const { graphLab } = await loadContent(recipe.id); // the questions and hints for this scenario

  // One entry per class: usually just one, two for "Class A vs Class B".
  const classes = [recipe, partner].filter(Boolean).map((r, i) => ({
    recipe: r,
    canvasId: `graph-canvas-${i}`,
    values: generateClassData(r).values,
  }));

  // When comparing, both charts get the same labels and the same height,
  // so a wider spread really looks wider (a fair comparison).
  const sharedLabels = partner
    ? [...new Set(classes.flatMap((c) => c.values))].sort(compareValues)
    : undefined;
  classes.forEach((c) => {
    Object.assign(c, buildFrequencyData(c.values, sharedLabels));
  });
  const sharedMax = partner ? Math.max(...classes.flatMap((c) => c.data)) : undefined;

  const chartBlocks = classes.map((c) => `
    <div class="chart-block">
      ${partner ? `<h2 class="chart-title">📖 ${c.recipe.title}</h2>` : ''}
      <div class="chart-wrap"><canvas id="${c.canvasId}" role="img"></canvas></div>
    </div>
  `).join('');

  const reflectionHTML = (id, question) => `
    <section class="reflection" data-step="${id === 'tell' ? 1 : 2}" hidden>
      <label for="${id}">${question}</label>
      <textarea id="${id}" rows="3"></textarea>
      <div class="hint-list-slot" id="${id}-hints"></div>
    </section>`;

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'graph',
    phase: 'graph',
    layout: 'card',
    contentHTML: taskCardHTML({
      tabsHTML: exploreCardTabsHTML(),
      bodyHTML: `
        <div id="stepper"></div>
        ${pipLineHTML('', recipe.question)}
        ${segmentedHTML(CHART_TYPES, 'Kind of graph')}
        <div class="graph-layout${partner ? ' graph-layout--two' : ''}">
          <div class="chart-row">${chartBlocks}</div>
          ${reflectionHTML('tell', graphLab.tell)}
          ${reflectionHTML('not-tell', graphLab.notTell)}
        </div>
        <p class="feedback" id="graph-feedback" hidden></p>`,
    }),
  });

  let charts = [];
  let currentType = 'bar';
  const typesTried = new Set(); // for the feedback card: "You tried 3 kinds of graph"

  function renderCharts(type) {
    currentType = type;
    typesTried.add(type);
    charts.forEach((chart) => chart.destroy());
    charts = classes.map((c) => {
      const canvas = document.getElementById(c.canvasId);
      // Screen readers read this label instead of the (silent) picture.
      const who = partner ? `${c.recipe.title}. ` : '';
      canvas.setAttribute('aria-label', who + describeChart(type, c.labels, c.data, c.recipe.unit));
      const config = makeChartConfig(type, c.labels, c.data, c.recipe.unit, sharedMax);
      // Part 21c: a new chart grows in with a little bounce. Chart.js does not
      // follow "reduce motion" by itself, so we switch its animation off then.
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      config.options.animation = reduceMotion ? false : { duration: 800, easing: 'easeOutBack' };
      return new Chart(canvas, config);
    });

  }

  let firstChart = true;
  wireChoiceCards(document.querySelector('.segmented'), '.segment', (btn) => {
    const type = btn.dataset.value;
    // Trying another kind of graph is logged (Graph Explorer badge, thesis).
    if (!firstChart && type !== currentType) {
      logEvent('graph-lab', 'chart-switch', { scenarioId: recipe.id, from: currentType, chartType: type });
    }
    firstChart = false;
    renderCharts(type);
  });

  // "change" fires when the child leaves the box after editing it,
  // so we log the finished answer, not every key press.
  ['tell', 'not-tell'].forEach((id) => {
    document.getElementById(id).addEventListener('change', (event) => {
      logEvent('graph-lab', 'reflection', {
        scenarioId: recipe.id, chartType: currentType, prompt: id, text: event.target.value.trim(),
      });
    });
  });

  // The hints sit in the action bar while their question is on screen.
  const hints = {
    tell: createHint('graph-tell', 'graph-lab', graphLab.tellHints),
    'not-tell': createHint('graph-not-tell', 'graph-lab', graphLab.notTellHints),
  };
  Object.entries(hints).forEach(([id, { list }]) => document.getElementById(`${id}-hints`).append(list));

  const bar = setupActionBar({ back: null, primary: { label: '' } });
  const pipLines = [
    partner ? 'Two classes, same question. Try each kind of graph!' : 'Same data, different graphs. Try each one!',
    'Look at the graph. What does it show?',
    'Now the tricky one. What is missing?',
  ];
  const answered = (id) => document.getElementById(id).value.trim().length >= MIN_REFLECTION;
  let step = 0;

  function showStep(n) {
    step = n;
    document.getElementById('stepper').innerHTML = miniStepperHTML(STEP_LABELS, n);
    document.querySelectorAll('.reflection').forEach((el) => { el.hidden = Number(el.dataset.step) !== n; });
    document.querySelector('.graph-layout').classList.toggle('graph-layout--asking', n > 0);
    pipSay(pipLines[n]);
    bar.setBack(n === 0 ? { label: 'Data Hub', href: 'data-hub.html' } : { label: 'Back', onClick: () => showStep(n - 1) });
    bar.setHint(n === 1 ? hints.tell.button : n === 2 ? hints['not-tell'].button : null);
    refreshPrimary();
    if (n > 0) document.getElementById(n === 1 ? 'tell' : 'not-tell').focus();
  }

  // The ONE primary button. Graph Lab is done when both answers are real and
  // the child taps "I'm done" (so the feedback card never pops up mid-sentence).
  function refreshPrimary() {
    const toNumberLab = { label: '🔢 Next: Number Lab →', ready: true, onClick: () => { location.href = 'number-lab.html'; } };
    if (step === 0) {
      bar.setPrimary(isPhaseDone('graph') ? toNumberLab : { label: 'Next: What it tells →', ready: true, onClick: () => showStep(1) });
    } else if (step === 1) {
      bar.setPrimary(answered('tell')
        ? { label: 'Next: What it can NOT tell →', ready: true, onClick: () => showStep(2) }
        : { label: '', enabled: false, whyDisabled: '✏️ Write your idea first' });
    } else if (isPhaseDone('graph')) {
      bar.setPrimary(toNumberLab);
    } else if (!answered('tell')) {
      bar.setPrimary({ label: '', enabled: false, whyDisabled: '✏️ Answer the first question too' });
    } else {
      bar.setPrimary(answered('not-tell')
        ? { label: "✅ I'm done", onClick: finish }
        : { label: '', enabled: false, whyDisabled: '✏️ Write your idea first' });
    }
  }
  ['tell', 'not-tell'].forEach((id) => document.getElementById(id).addEventListener('input', refreshPrimary));

  function finish() {
    const feedback = document.getElementById('graph-feedback');
    feedback.textContent = '✅ Great thinking! Number Lab is open.';
    feedback.hidden = false;
    finishPhase('graph', {
      typesTried: typesTried.size,
      notTellWords: countWords(document.getElementById('not-tell').value),
    });
    refreshPrimary();
  }

  document.querySelector('.segment[data-value="bar"]').click();
  showStep(0);
}

init();
