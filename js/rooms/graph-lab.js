import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { buildFrequencyData, makeChartConfig, directLabelsPlugin } from '../helpers/charts.js';
import { getSelectedScenarioId } from '../storage/save.js';

Chart.register(directLabelsPlugin);

async function init() {
  const response = await fetch(`../data/scenarios/${getSelectedScenarioId()}.json`);
  const recipe = await response.json();
  const { values } = generateClassData(recipe);
  const { labels, data } = buildFrequencyData(values);

  mountShell({
    step: 'explore',
    accent: 'explore',
    explorePage: 'graph',
    pipMessage: "Hoo-hoo! Same data, different graphs. Try each button and see what changes!",
    contentHTML: `
      <h2>📊 Graph Lab</h2>
      <p class="room-question">${recipe.question}</p>
      <div class="chart-type-row">
        <button class="btn chart-type-btn" data-type="bar" type="button">Bar</button>
        <button class="btn chart-type-btn" data-type="line" type="button">Line</button>
        <button class="btn chart-type-btn" data-type="pie" type="button">Pie</button>
        <button class="btn chart-type-btn" data-type="dot" type="button">Dot plot</button>
      </div>
      <div class="chart-wrap"><canvas id="graph-canvas"></canvas></div>
      <div class="reflection">
        <label for="tell">What does this graph tell you?</label>
        <textarea id="tell" rows="2"></textarea>
        <label for="not-tell">What does this graph NOT tell you?</label>
        <textarea id="not-tell" rows="2"></textarea>
      </div>
    `,
  });

  let chart;

  function renderChart(type) {
    const canvas = document.getElementById('graph-canvas');
    if (chart) chart.destroy();
    chart = new Chart(canvas, makeChartConfig(type, labels, data, recipe.unit));

    document.querySelectorAll('.chart-type-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
  }

  document.querySelectorAll('.chart-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderChart(btn.dataset.type));
  });

  renderChart('bar');
}

init();
