// Shell layer: the end-of-phase summary card (Part 16; design f7b,
// docs/design/frames/f7b-phase-summary.html). One pop-up after each of the 7
// phases: big stars with words, the child's own work, the wins, one tip, one
// thing learned, the 7-stop trail and ONE button. Content: helpers/feedback.js.
// Text goes in with textContent only (a child's answer is shown here); the SVG
// drawings are our own. Motion: css/modal.css; reduced motion shows it all at once.
import { openModal } from './modal.js';
import { STEP_OF_PHASE, PHASES } from './helpers/progress.js';
import { SOURCE_CHIPS } from './helpers/feedback.js';
import { playSound } from './sounds.js';
import { pipReacts } from './motion.js';

const PHASE_NAMES = {
  ask: 'Ask', plan: 'Plan', collect: 'Collect', graph: 'Graph Lab',
  number: 'Number Lab', chance: 'Chance Lab', conclude: 'Conclude',
};
const STEP_ORDER = ['ask', 'plan', 'collect', 'explore', 'conclude'];

const STAR_PATH = 'M20 3l5 10.2 11.2 1.6-8.1 7.9 1.9 11.2L20 28.6l-10 5.3 1.9-11.2-8.1-7.9L15 13.2z';
const ICONS = {
  tick: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L19 7"/></svg>',
  bulb: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  brain: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4a3 3 0 0 0-5.5 1.6A3.5 3.5 0 0 0 4 9a3.5 3.5 0 0 0 1.5 6A3 3 0 0 0 9 19a3 3 0 0 0 3 1V4zM12 4a3 3 0 0 1 5.5 1.6A3.5 3.5 0 0 1 20 9a3.5 3.5 0 0 1-1.5 6A3 3 0 0 1 15 19a3 3 0 0 1-3 1"/></svg>',
  lock: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>',
  open: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 6.6-1.6"/></svg>',
};

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// Each part rises in at its moment in the f7b timeline (ms), unless motion is reduced.
function at(element, ms, motion = 'ps-rise') {
  element.classList.add(motion);
  element.style.setProperty('--d', `${ms}ms`);
  return element;
}

// Three stars, the middle one bigger, popping in 300 ms apart. An empty star
// is dashed (a shape, not only a colour). The number is said in words below.
function starsNode(count) {
  const row = el('div', '', 'ps-stars');
  row.setAttribute('role', 'img');
  row.setAttribute('aria-label', `${count} out of 3 thinking stars`);
  for (let i = 0; i < 3; i++) {
    const size = i === 1 ? 96 : 76;
    const on = i < count;
    row.insertAdjacentHTML('beforeend', `<svg class="ps-star${on ? ' on' : ''}" style="--i:${i}" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`);
  }
  return row;
}

// A coloured box with an icon and words: "Next time" (yellow), "I learned" (blue).
function tipBox(icon, label, text, className, ms) {
  const box = at(el('div', '', `ps-box ${className}`), ms);
  box.insertAdjacentHTML('afterbegin', ICONS[icon]);
  const words = el('p');
  words.append(el('b', `${label} `), text);
  box.append(words);
  return box;
}

// The 7 stops: done ✓, this one glows, the rest dashed with their number.
function trailNode(phase) {
  const here = PHASES.indexOf(phase);
  const trail = el('div', '', 'ps-trail');
  trail.setAttribute('role', 'img');
  trail.setAttribute('aria-label', `Step ${here + 1} of ${PHASES.length} done`);
  PHASES.forEach((p, i) => {
    if (i > 0) trail.append(el('span', '', `ps-seg${i <= here ? ' on' : ''}`));
    const state = i < here ? 'done' : i === here ? 'now' : 'lock';
    const dot = at(el('span', i < here ? '✓' : String(i + 1), `ps-dot ${state}`), 3200 + i * 60, i === here ? 'ps-glow' : 'ps-pop');
    dot.title = PHASE_NAMES[p];
    trail.append(dot);
  });
  return trail;
}

// Resolves when the child closes the card.
export function showFeedbackCard(phase, card) {
  const next = PHASES[PHASES.indexOf(phase) + 1];
  const body = el('div', '', 'ps-body');

  const starWords = at(el('p', '', 'ps-starword'), 1600);
  starWords.append(el('b', card.starWord), el('span', `${card.stars} of 3 stars · Stars are for great thinking, not speed.`));
  body.append(starsNode(card.stars), starWords);

  // "Your work": the child's own answer (plain text), and where it came from.
  if (card.yourWork) {
    const work = at(el('div', '', 'ps-box ps-you'), 1800);
    work.append(el('h3', `✏️ ${card.yourWork.label}`), el('p', `"${card.yourWork.text}"`, 'ps-quote'));
    if (SOURCE_CHIPS[card.yourWork.source]) work.append(el('span', SOURCE_CHIPS[card.yourWork.source], 'ps-source'));
    body.append(work);
  }

  const wins = el('div', '', 'ps-box ps-wins');
  wins.append(el('h3', 'You did great'));
  const list = el('ul');
  card.wins.forEach((win, i) => {
    const item = at(el('li'), 2100 + i * 140);
    item.insertAdjacentHTML('afterbegin', ICONS.tick);
    item.append(el('span', win));
    list.append(item);
  });
  wins.append(list);
  body.append(
    wins,
    tipBox('bulb', 'Next time:', card.nextTime, 'ps-next', 2800),
    tipBox('brain', 'I learned:', card.learned, 'ps-learn', 3000),
    trailNode(phase),
  );

  // The next stop: its lock shakes, fades, and an open circle in the next
  // room's colour pops in. The words say it too.
  if (next) {
    const row = at(el('div', '', 'ps-nextrow'), 3200);
    row.style.setProperty('--next-colour', `var(--color-${STEP_OF_PHASE[next]})`);
    const orb = el('span', '', 'ps-orb');
    orb.insertAdjacentHTML('beforeend', `<span class="ps-open">${ICONS.open}</span><span class="ps-lock">${ICONS.lock}</span>`);
    row.append(el('span', 'Next stop:', 'ps-next-label'), orb, el('span', PHASE_NAMES[next], 'ps-next-name'));
    body.append(row);
  } else {
    const done = at(el('div', '', 'ps-box ps-done-all'), 3200);
    done.append(el('h3', '🎉 Your whole journey is done!'), el('p', 'You asked, planned, collected, explored and concluded.'));
    body.append(done);
  }

  playSound('done');
  pipReacts('hop');

  return openModal({
    title: `${PHASE_NAMES[phase]}: done!`,
    accent: STEP_OF_PHASE[phase],
    className: 'phase-summary',
    body,
    buttons: [{ label: next ? `Unlock ${PHASE_NAMES[next]} →` : '🎉 Finish', value: 'next', main: true }],
    onOpen: (dialog) => {
      // "Step 3 of 5" in the header, and the one button gently pulses when it is ready.
      const step = el('span', `Step ${STEP_ORDER.indexOf(STEP_OF_PHASE[phase]) + 1} of ${STEP_ORDER.length}`, 'ps-step');
      dialog.querySelector('.modal-header').append(step);
      at(dialog.querySelector('.modal-actions'), 4500);
      dialog.querySelector('.modal-actions .btn-main').classList.add('ps-pulse');
    },
  });
}
