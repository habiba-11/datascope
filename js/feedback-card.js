// Shell layer: shows the end-of-phase feedback card in a pop-up (Part 16).
// The content comes from helpers/feedback.js. Built with textContent only.
import { openModal } from './modal.js';
import { STEP_OF_PHASE } from './helpers/progress.js';
import { playSound } from './sounds.js';
import { pipReacts } from './motion.js';

const PHASE_NAMES = {
  ask: 'Ask', plan: 'Plan', collect: 'Collect', graph: 'Graph Lab',
  number: 'Number Lab', chance: 'Chance Lab', conclude: 'Conclude',
};

function line(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// Resolves when the child closes the card.
export function showFeedbackCard(phase, card) {
  const body = document.createElement('div');

  // Stars: filled ⭐ and empty ☆ pop in one by one, with the number in
  // words too (so the stars are never the only signal).
  const stars = document.createElement('p');
  stars.className = 'fb-stars';
  for (let i = 1; i <= 3; i++) {
    const star = line('span', i <= card.stars ? '⭐' : '☆', i <= card.stars ? 'fb-star' : 'fb-star empty');
    star.style.animationDelay = `${0.15 * i}s`;
    star.setAttribute('aria-hidden', 'true');
    stars.append(star);
  }
  stars.append(line('span', ` ${card.stars} of 3 stars`, 'fb-star-text'));

  const wins = document.createElement('ul');
  wins.className = 'fb-wins';
  card.wins.forEach((win) => wins.append(line('li', `✅ ${win}`)));

  body.append(
    stars,
    wins,
    line('p', `💡 Next time: ${card.nextTime}`, 'fb-next'),
    line('p', `🧠 ${card.learned}`, 'fb-learned'),
  );

  playSound('done');
  pipReacts('hop');

  return openModal({
    icon: '🎉',
    title: `${PHASE_NAMES[phase]} done!`,
    accent: STEP_OF_PHASE[phase],
    body,
    buttons: [{ label: phase === 'conclude' ? '🎉 Finish' : 'Unlock next phase →', value: 'next', main: true }],
  });
}
