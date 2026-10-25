import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { compareValues } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe } from '../helpers/scenarios.js';
import { logEvent } from '../helpers/log.js';
import { playSound } from '../sounds.js';
import { animate, pipReacts } from '../motion.js';
import { getSelectedScenarioId } from '../storage/save.js';
import { completePhase } from '../phase-progress.js';

const NEXT_ROOM_LINK =
  '<a class="btn btn-main next-room-btn" id="next-room-btn" href="graph-lab.html" hidden>📊 Let\'s draw a graph! →</a>';

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);

  mountShell({
    step: 'collect',
    phase: 'collect',
    accent: 'collect',
    pipMessage: partner
      ? 'Hoo-hoo! Two pretend classes answered the same question. Survey Class A first, then Class B!'
      : 'Hoo-hoo! Our pretend class is ready. Press Run survey to see their answers!',
    contentHTML: partner ? compareLayout(recipe, partner) : singleLayout(recipe),
  });

  // Collect is done when every class has been surveyed.
  const showNextRoom = () => {
    document.getElementById('next-room-btn').hidden = false;
    completePhase('collect');
  };

  if (partner) {
    // Class B unlocks when Class A is done; the next-room link appears after Class B.
    wireUpSurvey(recipe, generateClassData(recipe), 'a', () => {
      document.getElementById('b-run').disabled = false;
    });
    wireUpSurvey(partner, generateClassData(partner), 'b', showNextRoom);
  } else {
    wireUpSurvey(recipe, generateClassData(recipe), 'a', showNextRoom);
  }
}

// The run button, answer list and progress bar for one class.
// `p` is a short prefix ('a' or 'b') so two classes can share one page.
function surveyHTML(p, recipe, buttonText, disabled = false) {
  return `
    <button id="${p}-run" class="btn btn-run" type="button"${disabled ? ' disabled' : ''}>${buttonText}</button>
    <ol id="${p}-list" class="reveal-list" aria-live="polite" tabindex="0" aria-label="Answers so far"></ol>
    <div class="progress-row">
      <div class="progress-track"><div id="${p}-fill" class="progress-fill"></div></div>
      <span id="${p}-text" class="progress-text">0 of ${recipe.classSize} classmates</span>
    </div>
  `;
}

function singleLayout(recipe) {
  return `
    <div class="two-panel">
      <section class="panel" style="--panel-accent: var(--color-collect)">
        <h1 class="panel-header">Data Hub · ${recipe.title}</h1>
        <p class="room-question">${recipe.question}</p>
        ${surveyHTML('a', recipe, '▶ Run survey')}
        ${NEXT_ROOM_LINK}
      </section>
      <section class="panel" style="--panel-accent: var(--color-explore)">
        <header class="panel-header">Our tally</header>
        <div id="a-tally" class="tally"></div>
      </section>
    </div>
  `;
}

// Reading minutes: one panel per class, each with its own survey and tally.
function compareLayout(recipe, partner) {
  return `
    <div class="compare-intro panel" style="--panel-accent: var(--color-collect)">
      <h1 class="panel-header">Data Hub · ${recipe.compareTitle}</h1>
      <p class="room-question">${recipe.question}</p>
    </div>
    <div class="two-panel">
      <section class="panel" style="--panel-accent: var(--color-collect)">
        <header class="panel-header">${recipe.title}</header>
        ${surveyHTML('a', recipe, '▶ Survey Class A')}
        <div id="a-tally" class="tally"></div>
      </section>
      <section class="panel" style="--panel-accent: var(--color-explore)">
        <header class="panel-header">${partner.title}</header>
        ${surveyHTML('b', partner, '▶ Now survey Class B', true)}
        <div id="b-tally" class="tally"></div>
      </section>
    </div>
    ${NEXT_ROOM_LINK}
  `;
}

// `classData` is what the generator returned: { scenarioId, seed, values }.
function wireUpSurvey(recipe, classData, p, onDone) {
  const { values } = classData;
  const button = document.getElementById(`${p}-run`);
  const list = document.getElementById(`${p}-list`);
  const progressFill = document.getElementById(`${p}-fill`);
  const progressText = document.getElementById(`${p}-text`);
  const tally = document.getElementById(`${p}-tally`);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counts = new Map();
  for (const value of recipe.valuePool) counts.set(value, 0);
  for (const value of recipe.mustInclude || []) counts.set(value, 0);

  function renderTally() {
    const maxCount = Math.max(1, ...counts.values());
    // Works for numbers (3, 7, 8...) and text (Basketball, Football...).
    const sortedKeys = [...counts.keys()].sort(compareValues);
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
      // One tick per answer. With reduced motion all answers arrive at once, so no ticks.
      if (!reduceMotion) playSound('tick');

      if (revealed < values.length) {
        setTimeout(revealNext, reduceMotion ? 0 : 400);
      } else {
        button.textContent = 'Survey complete!';
        playSound('done');
        animate(button, 'cheer');
        pipReacts('hop');
        // Scenario + seed recreate exactly the data this child saw (architecture section 5).
        logEvent('data-hub', 'data-seen', {
          scenarioId: classData.scenarioId, seed: classData.seed, classSize: values.length,
        });
        onDone();
      }
    }

    revealNext();
  });

  renderTally();
}

init();
