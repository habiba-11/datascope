import { mountShell } from '../app.js';
import { generateClassData } from '../helpers/generator.js';
import { compareValues, mode } from '../helpers/stats.js';
import { loadRecipe, loadPartnerRecipe, loadContent } from '../helpers/scenarios.js';
import { logEvent, readLog } from '../helpers/log.js';
import { playSound } from '../sounds.js';
import { animate, pipReacts, pop, bounceBar } from '../motion.js';
import { getSelectedScenarioId, getExplorerCode } from '../storage/save.js';
import { finishPhase } from '../phase-progress.js';

// CLAUDE.md: the data is synthetic, and the app must say so where the data appears.
const PRETEND_NOTE = '<p class="pretend-note">🎭 This is a pretend class. It is made up, just for learning.</p>';

const NEXT_ROOM_LINK =
  '<a class="btn btn-main next-room-btn" id="next-room-btn" href="graph-lab.html" hidden>📊 Let\'s draw a graph! →</a>';

async function init() {
  const recipe = await loadRecipe(getSelectedScenarioId());
  const partner = await loadPartnerRecipe(recipe);
  const { cardTitle } = await loadContent(recipe.id);

  mountShell({
    step: 'collect',
    phase: 'collect',
    accent: 'collect',
    pipMessage: partner
      ? 'Hoo-hoo! Two pretend classes answered. Survey Class A, then Class B!'
      : 'Hoo-hoo! Our pretend class is ready. Tap Run survey!',
    contentHTML: partner ? compareLayout(recipe, partner, cardTitle) : singleLayout(recipe, cardTitle),
  });

  const classA = generateClassData(recipe);
  const classB = partner ? generateClassData(partner) : null;

  // Collect is done when every class has been surveyed.
  const showNextRoom = () => {
    document.getElementById('next-room-btn').hidden = false;
    finishPhase('collect', {
      classSizes: [classA, classB].filter(Boolean).map((c) => c.values.length),
      // Two classes have two different "most common" answers, so none is named.
      mostCommon: partner ? null : mode(classA.values).join(' and ') || null,
      guess: lastPrediction(recipe.id),
    });
  };

  if (partner) {
    // Class B unlocks when Class A is done; the next-room link appears after Class B.
    wireUpSurvey(recipe, classA, 'a', () => {
      document.getElementById('b-run').disabled = false;
    });
    wireUpSurvey(partner, classB, 'b', showNextRoom);
  } else {
    wireUpSurvey(recipe, classA, 'a', showNextRoom);
  }
}

// This child's Plan guess for this scenario (the newest one), or null.
// Filtered by code: on a shared device the log also holds other children's work.
function lastPrediction(scenarioId) {
  const code = getExplorerCode();
  const guesses = readLog().filter((e) => e.code === code && e.type === 'prediction' && e.scenarioId === scenarioId);
  return guesses.length ? guesses[guesses.length - 1].guess : null;
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

function singleLayout(recipe, cardTitle) {
  return `
    <div class="two-panel">
      <section class="panel" style="--panel-accent: var(--color-collect)">
        <h1 class="panel-header">📋 Data Hub · ${cardTitle}</h1>
        <p class="room-question">${recipe.question}</p>
        ${PRETEND_NOTE}
        ${surveyHTML('a', recipe, '▶ Run survey')}
        ${NEXT_ROOM_LINK}
      </section>
      <section class="panel" style="--panel-accent: var(--color-explore)">
        <header class="panel-header">📊 Our tally</header>
        <div id="a-tally" class="tally"></div>
      </section>
    </div>
  `;
}

// Reading minutes: one panel per class, each with its own survey and tally.
function compareLayout(recipe, partner, cardTitle) {
  return `
    <div class="compare-intro panel" style="--panel-accent: var(--color-collect)">
      <h1 class="panel-header">📋 Data Hub · ${cardTitle}</h1>
      <p class="room-question">${recipe.question}</p>
      ${PRETEND_NOTE}
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
          <div class="tally-col" data-key="${key}">
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
    button.textContent = '⏳ Asking...';
    let revealed = 0;

    function revealNext() {
      const value = values[revealed];
      revealed += 1;

      const item = document.createElement('li');
      item.className = 'reveal-item';
      item.innerHTML = `<span class="badge">${revealed}</span> Classmate ${revealed}: ${value} ${recipe.unit || ''}`;
      list.prepend(item);
      pop(item); // each classmate's answer springs in

      counts.set(value, (counts.get(value) || 0) + 1);
      renderTally();
      bounceBar([...tally.querySelectorAll('.tally-col')].find((col) => col.dataset.key === String(value))?.querySelector('.tally-bar'));

      progressFill.style.width = `${(revealed / values.length) * 100}%`;
      progressText.textContent = `${revealed} of ${values.length} classmates`;
      // One tick per answer. With reduced motion all answers arrive at once, so no ticks.
      if (!reduceMotion) playSound('tick');

      if (revealed < values.length) {
        setTimeout(revealNext, reduceMotion ? 0 : 400);
      } else {
        button.textContent = '✅ Survey done!';
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
