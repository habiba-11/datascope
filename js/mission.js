// Shell layer: the mission (Round 4 pilot feedback, 5 Nov 2026).
// Part 42a: Pip's Mission card opens after the child picks a scenario, so they
// know what they are trying to find out and what they make at the end.
// Part 42b: the mission bar under the step bar keeps the goal and the step in
// sight on every room; tapping it shows the Mission card again.
// Words: data/content (mission) and helpers/mission.js. Text goes in with
// textContent only.
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { MISSION_WORDS, stepLine } from './helpers/mission.js';

function el(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// `content`: the scenario's content file. `via`: 'pick' (after choosing the
// scenario) or 'bar' (the child tapped the mission bar). Resolves when closed.
export function showMissionCard(content, via = 'pick') {
  const body = document.createElement('div');
  body.className = 'mission-card';
  body.append(
    el('p', MISSION_WORDS.hello, 'mission-hello'),
    el('p', `🎯 ${content.mission.goal}`, 'mission-goal m-pop'),
    el('p', `🏁 ${MISSION_WORDS.end}`, 'mission-line'),
  );
  logEvent(via === 'bar' ? 'shell' : 'question-studio', 'mission-seen', { scenarioId: content.scenarioId, via });
  return openModal({
    icon: '🎯',
    title: MISSION_WORDS.title,
    accent: 'ask',
    body,
    buttons: [{ label: via === 'bar' ? 'Back to work →' : MISSION_WORDS.button, value: 'go', main: true }],
  });
}

// ---------- Part 42b: the mission bar ----------

// The empty bar; js/app.js puts it under the step bar. It stays hidden until
// a scenario's mission is known (fillMissionBar).
export const MISSION_BAR_HTML = `
  <div class="mission-row">
    <button class="mission-bar" id="mission-bar" type="button" hidden>
      <span class="mission-bar-goal" id="mission-bar-goal"></span>
      <span class="mission-bar-step" id="mission-bar-step"></span>
    </button>
  </div>`;

let barContent = null; // the scenario content the bar shows

// Shows the bar with this scenario's mission and the current step.
export function fillMissionBar(content, stepId) {
  const bar = document.getElementById('mission-bar');
  if (!bar || !content || !content.mission) return;
  if (!barContent) bar.addEventListener('click', () => showMissionCard(barContent, 'bar'));
  barContent = content;
  document.getElementById('mission-bar-goal').textContent = `🎯 Mission: ${content.mission.short}`;
  setMissionBarStep(stepId);
  bar.setAttribute('aria-label', `Mission: ${content.mission.short} ${stepLine(stepId)}. Tap to see your mission.`);
  bar.hidden = false;
}

// The step changed (Question Studio: Ask, then Plan).
export function setMissionBarStep(stepId) {
  const step = document.getElementById('mission-bar-step');
  if (step) step.textContent = stepLine(stepId);
}

// Question Studio hides it while the child is still picking a question.
export function hideMissionBar() {
  const bar = document.getElementById('mission-bar');
  if (bar) bar.hidden = true;
}
