import { mountShell, exploreCardTabsHTML } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { compareValues } from '../helpers/stats.js';
import {
  buildFrequencyData, makeChartConfig, directLabelsPlugin, describeChart, pieKeyPosition, lineFits, valueText, countText, tallestIndex,
} from '../helpers/charts.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import { logEvent } from '../helpers/log.js';
import { createAnswerHint } from '../helpers/prompts.js';
import { answerFacts, fillSuggestions } from '../helpers/suggestions.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { finishPhase, isPhaseDone } from '../phase-progress.js';
import { countWords } from '../helpers/feedback.js';
import { pipSay } from '../pip.js';
import { taskCardHTML, pipLineHTML, miniStepperHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { wireChoiceCards } from '../choices.js';

// Graph Lab in the 3-zone layout (UI guide), laid out like the f13 design
// (4 Nov 2026): 4 big chart tiles, charts in white boxes with WHAT (blue) and
// HOW MANY (yellow) axis pills, a tap-to-read helper, and in steps 2 and 3 the
// question in a panel above the chart (4 Nov 2026). Three steps, ONE primary button.
const STEP_LABELS = ['Look', 'What it tells', 'What it can NOT tell'];

// Each tile: a tiny drawing of the chart (decorative), its name and what it is good for.
const ICON = (inner) => `<svg viewBox="0 0 52 44" aria-hidden="true">${inner}</svg>`;
const CHART_TYPES = [
  { value: 'bar', name: 'Bar', use: 'compare heights', icon: ICON('<rect x="4" y="22" width="11" height="18" rx="2" fill="#FF7A6B" stroke="#17324D" stroke-width="3"/><rect x="20" y="8" width="11" height="32" rx="2" fill="#FFC531" stroke="#17324D" stroke-width="3"/><rect x="36" y="28" width="11" height="12" rx="2" fill="#38B6FF" stroke="#17324D" stroke-width="3"/>') },
  { value: 'line', name: 'Line', use: 'follow the shape', icon: ICON('<path d="M4 34L18 18L32 26L48 8" fill="none" stroke="#17324D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="34" r="4.5" fill="#fff" stroke="#17324D" stroke-width="3"/><circle cx="18" cy="18" r="4.5" fill="#fff" stroke="#17324D" stroke-width="3"/><circle cx="32" cy="26" r="4.5" fill="#fff" stroke="#17324D" stroke-width="3"/><circle cx="48" cy="8" r="4.5" fill="#FFC531" stroke="#17324D" stroke-width="3"/>') },
  { value: 'pie', name: 'Pie', use: 'parts of the whole', icon: ICON('<circle cx="26" cy="22" r="17" fill="#38B6FF" stroke="#17324D" stroke-width="3"/><path d="M26 22V5A17 17 0 0 1 43 22z" fill="#FFC531" stroke="#17324D" stroke-width="3" stroke-linejoin="round"/><path d="M26 22L43 22A17 17 0 0 1 32 38z" fill="#FF7A6B" stroke="#17324D" stroke-width="3" stroke-linejoin="round"/>') },
  { value: 'dot', name: 'Dot plot', use: 'one dot per kid', icon: ICON('<g fill="#38B6FF" stroke="#17324D" stroke-width="2.5"><circle cx="10" cy="34" r="5"/><circle cx="10" cy="22" r="5"/><circle cx="26" cy="34" r="5"/><circle cx="26" cy="22" r="5"/><circle cx="26" cy="10" r="5"/><circle cx="42" cy="34" r="5"/></g>') },
];
// What to tap, in the helper's words.
const TAP_WORD = { bar: 'bar', line: 'dot', pie: 'slice', dot: 'column of dots' };

// Game names stay level on a chart at least this wide (px); narrower, they may slant.
const LEVEL_WORDS_WIDTH = 520;

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
    index: i,
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

  // The axis titles as coloured pills (f13): WHAT we asked (blue), HOW MANY kids (yellow).
  const chartBlocks = classes.map((c) => `
    <div class="chart-box">
      ${partner ? `<h2 class="chart-title">📖 ${c.recipe.title}</h2>` : ''}
      <div class="chart-frame">
        <span class="axis-pill axis-pill--many" aria-hidden="true">HOW MANY: kids</span>
        <div class="chart-wrap" tabindex="0" data-class="${c.index}"><canvas id="${c.canvasId}" role="img"></canvas></div>
      </div>
      <span class="axis-pill axis-pill--what" aria-hidden="true">WHAT: ${c.recipe.chartAxis}</span>
    </div>
  `).join('');

  const reflectionHTML = (id, icon, question) => `
    <section class="reflection" data-step="${id === 'tell' ? 1 : 2}" hidden>
      <label for="${id}">${icon} ${question.replace(/^\S+\s/, '')}</label>
      <textarea id="${id}" rows="3" placeholder="Write your idea here..."></textarea>
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
        <div class="kind-tiles" id="kind-tiles" aria-label="Kind of graph">
          ${CHART_TYPES.map((t) => `<button class="kind-tile" data-value="${t.value}" type="button">${t.icon}<span>${t.name}<small>${t.use}</small></span></button>`).join('')}
        </div>
        <div class="graph-layout${partner ? ' graph-layout--two' : ''}">
          <div class="graph-look">
            <p class="careful-note" id="careful-note" hidden><span aria-hidden="true">⚠️</span><span><strong>Careful!</strong> <span id="careful-text"></span></span></p>
            <div class="chart-row" id="chart-row">${chartBlocks}</div>
            <div class="read-out" id="read-out" aria-live="polite"></div>
          </div>
          <div class="ask-panel" id="ask-panel" hidden>
            ${reflectionHTML('tell', '📊', graphLab.tell)}
            ${reflectionHTML('not-tell', '🔍', graphLab.notTell)}
          </div>
        </div>
        <p class="feedback" id="graph-feedback" hidden></p>`,
    }),
  });

  let charts = [];
  let currentType = 'bar';
  const typesTried = new Set(); // for the feedback card: "You tried 3 kinds of graph"
  const chartRow = document.getElementById('chart-row');
  const readOut = document.getElementById('read-out');

  // ---------- tap (or arrow keys) to read a value ----------

  // The answers with kids, in order: what the arrow keys step through.
  const answered = (c) => c.labels.filter((_, i) => c.data[i] > 0);

  // Which drawn element shows `value` (a bar, a slice, or the top dot of a column).
  function elementFor(chart, value) {
    const dataset = chart.data.datasets[0];
    if (dataset.values) return dataset.values.indexOf(value);
    // Dot plot / number line: the points carry their value as x. The top dot of a column.
    const points = dataset.data;
    let found = -1;
    points.forEach((p, i) => { if (p.x === value && (found === -1 || p.y > points[found].y)) found = i; });
    return found;
  }

  function showReading(c, value) {
    const count = c.data[c.labels.indexOf(value)];
    const tallest = tallestIndex(c.data) === c.labels.indexOf(value);
    readOut.replaceChildren();
    const chip = (kind, small, big) => {
      const box = document.createElement('span');
      box.className = `read-chip read-chip--${kind}`;
      const label = document.createElement('small');
      label.textContent = small;
      box.append(label, big);
      return box;
    };
    const arrow = document.createElement('span');
    arrow.className = 'read-arrow';
    arrow.textContent = '→';
    const sentence = document.createElement('span');
    sentence.className = 'read-sentence';
    const who = partner ? `${c.recipe.title}: ` : '';
    sentence.textContent = `${who}${countText(count)} said ${valueText(value, c.recipe)}.${tallest ? ' That is the tallest! 🏆' : ''}`;
    readOut.append(chip('what', 'What', valueText(value, c.recipe)), arrow, chip('many', 'How many kids', countText(count)), sentence);
    // The chosen one is drawn with a thick border (Chart.js "active" style).
    charts.forEach((chart, i) => {
      const index = i === c.index ? elementFor(chart, value) : -1;
      chart.setActiveElements(index >= 0 ? [{ datasetIndex: 0, index }] : []);
      chart.update('none');
    });
    selected = { c: c.index, value };
  }

  function showTapHint() {
    selected = null;
    readOut.innerHTML = `<span class="read-hand" aria-hidden="true">👆</span>
      <span class="read-hint">Tap a ${TAP_WORD[currentType]} to read it.</span>
      <span class="read-legend"><span><i class="key-what"></i>WHAT we asked</span><span><i class="key-many"></i>HOW MANY kids</span></span>`;
  }

  let selected = null;

  function onChartTap(c) {
    return (event, elements, chart) => {
      if (!elements.length) return;
      const { index } = elements[0];
      const dataset = chart.data.datasets[0];
      const value = dataset.values ? dataset.values[index] : dataset.data[index].x;
      if (c.data[c.labels.indexOf(value)] > 0) showReading(c, value);
    };
  }

  // Keyboard: the chart is one Tab stop; the arrow keys move from answer to answer.
  document.querySelectorAll('.chart-wrap').forEach((wrap) => {
    wrap.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const c = classes[Number(wrap.dataset.class)];
      const list = answered(c);
      const at = selected && selected.c === c.index ? list.indexOf(selected.value) : -1;
      const next = event.key === 'ArrowRight' ? (at + 1) % list.length : (at - 1 + list.length) % list.length;
      showReading(c, list[next]);
    });
  });

  // ---------- the charts ----------

  function renderCharts(type) {
    currentType = type;
    typesTried.add(type);
    charts.forEach((chart) => chart.destroy());
    // Two classes as dot plots: one ABOVE the other on the same number line, so
    // each is full width (big dots) and the spreads line up (Habiba, 4 Nov 2026).
    chartRow.classList.toggle('chart-row--stacked', type === 'dot' && Boolean(partner));
    chartRow.classList.toggle('chart-row--pie', type === 'pie');
    const careful = type === 'line' && !lineFits(classes[0].labels);
    document.getElementById('careful-note').hidden = !careful;
    document.getElementById('careful-text').textContent = careful ? graphLab.noLine : '';

    charts = classes.map((c) => {
      const canvas = document.getElementById(c.canvasId);
      // Screen readers read this label instead of the (silent) picture.
      const who = partner ? `${c.recipe.title}. ` : '';
      canvas.setAttribute('aria-label', who + describeChart(type, c.labels, c.data, c.recipe));
      const config = makeChartConfig(type, c.labels, c.data, c.recipe, sharedMax);
      // The axis titles are the coloured pills around the chart instead.
      if (config.options.scales) {
        config.options.scales.x.title.display = false;
        config.options.scales.y.title.display = false;
        // Level words are easier for children to read than slanted ones (games).
        // Many numbers may still slant, so they never run into each other.
        // On a narrow chart (a phone) they may slant, so they never run into each other.
        if (typeof c.labels[0] === 'string' && canvas.parentElement.clientWidth >= LEVEL_WORDS_WIDTH) config.options.scales.x.ticks.maxRotation = 0;
      }
      // A pie's key goes beside it, or under it on a narrow chart.
      if (type === 'pie') config.options.plugins.legend.position = pieKeyPosition(canvas.parentElement.clientWidth);
      config.options.onClick = onChartTap(c);
      // A new chart grows in with a little bounce. Chart.js does not follow
      // "reduce motion" by itself, so we switch its animation off then.
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      config.options.animation = reduceMotion ? false : { duration: 800, easing: 'easeOutBack' };
      return new Chart(canvas, config);
    });
    showTapHint();
  }

  let firstChart = true;
  wireChoiceCards(document.getElementById('kind-tiles'), '.kind-tile', (btn) => {
    const type = btn.dataset.value;
    // Trying another kind of graph is logged (Graph Explorer badge, thesis).
    if (!firstChart && type !== currentType) {
      logEvent('graph-lab', 'chart-switch', { scenarioId: recipe.id, from: currentType, chartType: type });
    }
    firstChart = false;
    renderCharts(type);
  });

  // The hints give answers built from the class's real numbers. Their button
  // sits in the action bar while their question is on screen.
  const facts = answerFacts(recipe, classes[0].values, partner, partner ? classes[1].values : null);
  const answerHint = (id, key, templates) => createAnswerHint(
    key, 'graph-lab', fillSuggestions(templates, facts), document.getElementById(id),
  );
  const hints = {
    tell: answerHint('tell', 'graph-tell', graphLab.tellAnswers),
    'not-tell': answerHint('not-tell', 'graph-not-tell', graphLab.notTellAnswers),
  };
  Object.entries(hints).forEach(([id, { list }]) => document.getElementById(`${id}-hints`).append(list));

  // "change" fires when the child leaves the box after editing it (or a hint
  // fills it), so we log the finished answer, not every key press.
  ['tell', 'not-tell'].forEach((id) => {
    document.getElementById(id).addEventListener('change', (event) => {
      logEvent('graph-lab', 'reflection', {
        scenarioId: recipe.id, chartType: currentType, prompt: id, text: event.target.value.trim(), ...hints[id].answerFields(),
      });
    });
  });

  const bar = setupActionBar({ back: null, primary: { label: '' } });
  const pipLines = [
    partner ? 'Two classes, same question. Try each kind of graph!' : 'Same data, different graphs. Try each one!',
    'Look at the graph. What does it show?',
    'Now the tricky one. What is missing?',
  ];
  const wrote = (id) => document.getElementById(id).value.trim().length >= MIN_REFLECTION;
  let step = 0;

  function showStep(n) {
    step = n;
    document.getElementById('stepper').innerHTML = miniStepperHTML(STEP_LABELS, n);
    // Step 1 is for trying the 4 kinds; steps 2 and 3 keep the chart the child chose.
    document.getElementById('kind-tiles').hidden = n > 0;
    document.getElementById('ask-panel').hidden = n === 0;
    document.querySelectorAll('.reflection').forEach((el) => { el.hidden = Number(el.dataset.step) !== n; });
    document.querySelector('.graph-layout').classList.toggle('graph-layout--asking', n > 0);
    charts.forEach((chart) => chart.resize()); // the chart's box changed width
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
      bar.setPrimary(wrote('tell')
        ? { label: 'Next: What it can NOT tell →', ready: true, onClick: () => showStep(2) }
        : { label: '', enabled: false, whyDisabled: '✏️ Write your idea first' });
    } else if (isPhaseDone('graph')) {
      bar.setPrimary(toNumberLab);
    } else if (!wrote('tell')) {
      bar.setPrimary({ label: '', enabled: false, whyDisabled: '✏️ Answer the first question too' });
    } else {
      bar.setPrimary(wrote('not-tell')
        ? { label: "✅ I'm done", ready: true, onClick: finish }
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
      // For "Your work" on the card (only words; the stars ignore the source).
      notTellText: document.getElementById('not-tell').value.trim(),
      notTellSource: hints['not-tell'].answerFields().answerSource,
      // Part 42d: "For your mission" names the most common answer (one class only).
      top: partner ? null : facts.top,
    });
    refreshPrimary();
  }

  // A chart is drawn once, on a canvas: wait for the chart font, or the labels
  // stay in a fallback font (Part 36: the fonts are local, so this is quick).
  await document.fonts.load('bold 18px Nunito').catch(() => {});
  document.querySelector('.kind-tile[data-value="bar"]').click();
  showStep(0);
}

init();
