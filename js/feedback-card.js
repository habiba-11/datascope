// Shell layer: shows the end-of-phase feedback card in a pop-up (Part 16).
// The content comes from helpers/feedback.js. Built with textContent only.
import { openModal } from './modal.js';
import { STEP_OF_PHASE, PHASES } from './helpers/progress.js';
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
    star.style.animationDelay = `${0.3 * i}s`; // one by one, 300 ms apart (UI guide)
    star.setAttribute('aria-hidden', 'true');
    stars.append(star);
  }
  stars.append(line('span', ` ${card.stars} of 3 stars`, 'fb-star-text'));

  const wins = document.createElement('ul');
  wins.className = 'fb-wins';
  card.wins.forEach((win, i) => {
    const item = line('li', `✅ ${win}`, 'm-rise');
    item.style.setProperty('--i', 9 + i); // after the stars
    wins.append(item);
  });

  body.append(
    stars,
    line('p', 'Stars are for great thinking, not speed.', 'fb-why-stars'),
    wins,
    line('p', `💡 Next time: ${card.nextTime}`, 'fb-next'),
    line('p', `🧠 ${card.learned}`, 'fb-learned'),
  );

  // The next stop on the trail: its lock opens (in words too: 🔒 -> 🔓).
  const next = PHASES[PHASES.indexOf(phase) + 1];
  if (next) {
    const stop = line('p', `🔒 Next stop: ${PHASE_NAMES[next]}`, 'fb-next-stop m-shake');
    stop.addEventListener('animationend', () => {
      stop.textContent = `🔓 Next stop: ${PHASE_NAMES[next]}`;
      stop.classList.replace('m-shake', 'm-pop');
    }, { once: true });
    // Reduced motion: no animation, so it is shown open straight away.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stop.textContent = `🔓 Next stop: ${PHASE_NAMES[next]}`;
    body.append(stop);
  }

  playSound('done');
  pipReacts('hop');

  return openModal({
    icon: '🎉',
    title: `${PHASE_NAMES[phase]} done!`,
    accent: STEP_OF_PHASE[phase],
    body,
    buttons: [{ label: next ? `Unlock ${PHASE_NAMES[next]} →` : '🎉 Finish', value: 'next', main: true }],
  });
}
