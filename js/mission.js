// Shell layer: Pip's Mission card (Part 42a). It opens after the child picks a
// scenario, so they know what they are trying to find out and what they make
// at the end. Words: data/content (mission) and helpers/mission.js.
// Text goes in with textContent only.
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { MISSION_WORDS } from './helpers/mission.js';
import { setIconText } from './icon-text.js';

function el(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// The same, with one of our illustrations before the words (Part 54b).
function withIcon(tag, icon, text, className) {
  const element = el(tag, '', className);
  setIconText(element, icon, text);
  return element;
}

// `content`: the scenario's content file. Resolves when the child closes it.
export function showMissionCard(content) {
  const body = document.createElement('div');
  body.className = 'mission-card';
  body.append(
    el('p', MISSION_WORDS.hello, 'mission-hello'),
    withIcon('p', 'target', content.mission.goal, 'mission-goal m-pop'),
    withIcon('p', 'flag', MISSION_WORDS.end, 'mission-line'),
  );
  logEvent('question-studio', 'mission-seen', { scenarioId: content.scenarioId });
  return openModal({
    icon: 'target',
    title: MISSION_WORDS.title,
    accent: 'ask',
    body,
    buttons: [{ label: MISSION_WORDS.button, value: 'go', main: true }],
  });
}
