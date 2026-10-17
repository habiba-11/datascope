import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { getSelectedScenarioId } from '../storage/save.js';

async function init() {
  const response = await fetch(`../data/scenarios/${getSelectedScenarioId()}.json`);
  const recipe = await response.json();
  const { values } = generateClassData(recipe);

  mountShell({
    step: 'collect',
    accent: 'collect',
    pipMessage: "Hoo-hoo! Our pretend class is ready. Press Run survey to see their answers!",
    contentHTML: `
      <div class="two-panel">
        <section class="panel" style="--panel-accent: var(--color-collect)">
          <header class="panel-header">Data Hub · ${recipe.title}</header>
          <p class="room-question">${recipe.question}</p>
          <button id="run-survey-btn" class="btn btn-run" type="button">▶ Run survey</button>
          <ol id="reveal-list" class="reveal-list" aria-live="polite"></ol>
          <div class="progress-row">
            <div class="progress-track"><div id="progress-fill" class="progress-fill"></div></div>
            <span id="progress-text">0 of ${recipe.classSize} classmates</span>
          </div>
        </section>
        <section class="panel" style="--panel-accent: var(--color-explore)">
          <header class="panel-header">Our tally</header>
          <div id="tally" class="tally"></div>
        </section>
      </div>
    `,
  });

  wireUpSurvey(recipe, values);
}

function wireUpSurvey(recipe, values) {
  const button = document.getElementById('run-survey-btn');
  const list = document.getElementById('reveal-list');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const tally = document.getElementById('tally');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counts = new Map();
  for (const value of recipe.valuePool) counts.set(value, 0);
  for (const value of recipe.mustInclude || []) counts.set(value, 0);

  function renderTally() {
    const maxCount = Math.max(1, ...counts.values());
    const sortedKeys = [...counts.keys()].sort((a, b) => a - b);
    tally.innerHTML = sortedKeys
      .map((key) => {
        const count = counts.get(key);
        const height = (count / maxCount) * 140;
        return `
          <div class="tally-col">
            <span class="tally-count">${count || ''}</span>
            <div class="tally-bar" style="height: ${height}px"></div>
            <span class="tally-label">${key}</span>
          </div>
        `;
      })
      .join('');
  }

  button.addEventListener('click', () => {
    button.disabled = true;
    button.textContent = 'Running...';
    let revealed = 0;

    function revealNext() {
      const value = values[revealed];
      revealed += 1;

      const item = document.createElement('li');
      item.className = 'reveal-item';
      item.innerHTML = `<span class="badge">${revealed}</span> Classmate ${revealed}: ${value} ${recipe.unit || ''}`;
      list.prepend(item);

      counts.set(value, (counts.get(value) || 0) + 1);
      renderTally();

      progressFill.style.width = `${(revealed / values.length) * 100}%`;
      progressText.textContent = `${revealed} of ${values.length} classmates`;

      if (revealed < values.length) {
        setTimeout(revealNext, reduceMotion ? 0 : 400);
      } else {
        button.textContent = 'Survey complete!';
      }
    }

    revealNext();
  });

  renderTally();
}

init();
