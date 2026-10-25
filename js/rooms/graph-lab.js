import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { compareValues } from '../helpers/stats.js';
import { buildFrequencyData, makeChartConfig, directLabelsPlugin, describeChart } from '../helpers/charts.js';
import { loadRecipe, loadPartnerRecipe } from '../helpers/scenarios.js';
import { logEvent } from '../helpers/log.js';
import { addHintButton } from '../helpers/prompts.js';
import { getSelectedScenarioId } from '../storage/save.js';

Chart.register(directLabelsPlugin);

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);

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

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'graph',
    intro: 'graph',
    pipMessage: partner
      ? 'Hoo-hoo! Two classes, same question. Switch the graph type and compare them!'
      : 'Hoo-hoo! Same data, different graphs. Try each button and see what changes!',
    contentHTML: `
      <h1 class="room-title">📊 Graph Lab</h1>
      <p class="room-question">${recipe.question}</p>
      <div class="chart-type-row">
        <button class="btn chart-type-btn" data-type="bar" type="button">Bar</button>
        <button class="btn chart-type-btn" data-type="line" type="button">Line</button>
        <button class="btn chart-type-btn" data-type="pie" type="button">Pie</button>
        <button class="btn chart-type-btn" data-type="dot" type="button">Dot plot</button>
      </div>
      <div class="chart-row">${chartBlocks}</div>
      <div class="reflection">
        <label for="tell">What does ${partner ? 'each' : 'this'} graph tell you?</label>
        <textarea id="tell" rows="2"></textarea>
        <label for="not-tell">What does ${partner ? 'each' : 'this'} graph NOT tell you?</label>
        <textarea id="not-tell" rows="2"></textarea>
      </div>
      <a class="btn btn-main next-room-btn" href="number-lab.html">🔢 Next: Number Lab →</a>
    `,
  });

  let charts = [];
  let currentType = 'bar';

  function renderCharts(type) {
    currentType = type;
    charts.forEach((chart) => chart.destroy());
    charts = classes.map((c) => {
      const canvas = document.getElementById(c.canvasId);
      // Screen readers read this label instead of the (silent) picture.
      const who = partner ? `${c.recipe.title}. ` : '';
      canvas.setAttribute('aria-label', who + describeChart(type, c.labels, c.data, c.recipe.unit));
      return new Chart(canvas, makeChartConfig(type, c.labels, c.data, c.recipe.unit, sharedMax));
    });

    document.querySelectorAll('.chart-type-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
  }

  document.querySelectorAll('.chart-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderCharts(btn.dataset.type));
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

  addHintButton(document.getElementById('tell'), 'graph-tell', 'graph-lab');
  addHintButton(document.getElementById('not-tell'), 'graph-not-tell', 'graph-lab');

  renderCharts('bar');
}

init();
