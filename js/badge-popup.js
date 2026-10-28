// Shell layer: the "You found a badge!" pop-up (Part 21b, docs/design/badges-spec.md).
// Built on openModal() (js/modal.js), so it waits its turn in the pop-up line:
// two badges at once show one after the other. The look and the timeline
// (drop, flip, stamp, rays, confetti, Pip peeking) are in css/badges.css.
import { openModal, pauseNextModal } from './modal.js';
import { patchSVG, MYSTERY_SVG } from './badge-art.js';
import { playSound } from './sounds.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TITLE = 'You found a badge!';
const STAMP_MS = 1350; // when the badge lands after its flip (same as css/badges.css)
const FLIGHT_MS = 800; // the flight into the backpack
const ROOM_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

// Shows the pop-up for one badge (an entry of BADGES in helpers/badges.js).
// `onLanded` runs once the badge is in the backpack: after its flight, or
// straight away with reduced motion. It also runs if the child presses Esc.
export function showBadgePopup(badge, onLanded) {
  let flyFrom = null;

  // Each letter of the title bounces in a little after the one before.
  // Screen readers skip them: the badge name is the dialog's real title.
  const title = document.createElement('p');
  title.className = 'bp-title';
  title.setAttribute('aria-hidden', 'true');
  [...TITLE].forEach((ch, i) => {
    const letter = document.createElement('span');
    letter.textContent = ch === ' ' ? ' ' : ch;
    letter.style.animationDelay = `${(0.3 + i * 0.035).toFixed(3)}s`;
    title.append(letter);
  });

  // The stage: rays and confetti behind the patch, which flips from "?" to the badge.
  const stage = document.createElement('div');
  stage.className = 'bp-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = `
    <div class="bp-rays"></div>
    <div class="bp-burst">${burstHTML(badge.super ? 28 : 16)}</div>
    <div class="bp-stamp"><div class="bp-flip"><div class="bp-flip-inner">
      <div class="bp-face bp-back">${MYSTERY_SVG}</div>
      <div class="bp-face bp-front">${patchSVG(badge)}</div>
    </div></div></div>`; // our own drawings only, no child text

  const why = document.createElement('p');
  why.className = 'bp-why';
  why.textContent = badge.why;

  // A fragment (no wrapper), so css/badges.css can put each part in order.
  const body = document.createDocumentFragment();
  body.append(title, stage);
  if (badge.super) {
    const tag = document.createElement('p');
    tag.className = 'bp-super';
    tag.textContent = '★ Super reasoning badge ★';
    body.append(tag);
  }
  body.append(why);

  const done = openModal({
    title: badge.name,
    body,
    accent: badge.color,
    className: `badge-modal${badge.super ? ' super' : ''}`,
    buttons: [{ label: 'Put it in my backpack →', value: 'keep', main: true }],
    onOpen: (dialog) => {
      // Pip cheers in the corner of the pop-up (wings up).
      dialog.querySelector('.modal-pip .pip')?.classList.replace('pip--happy', 'pip--cheer');
      // A soft chime when the badge is stamped (only if sound is on: playSound checks).
      setTimeout(() => playSound('badgeFound'), reduceMotion() ? 0 : STAMP_MS);
    },
    // Before the pop-up goes, remember where the badge is, so a copy can fly from there.
    beforeClose: (dialog) => {
      const face = dialog.querySelector('.bp-front svg');
      flyFrom = { svg: face.cloneNode(true), box: face.getBoundingClientRect() };
      // A second badge waits until this one has landed.
      if (!reduceMotion()) pauseNextModal(FLIGHT_MS + 200);
    },
  });

  return done.then(() => {
    if (reduceMotion() || !flyFrom) onLanded();
    else flyToBackpack(flyFrom, onLanded);
  });
}

// Confetti pieces (circles and stars in the 5 room colours), flying out in a ring.
function burstHTML(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const angle = Math.round((360 / count) * i + Math.random() * 12);
    const distance = 95 + Math.round(Math.random() * 55);
    const spin = Math.round(Math.random() * 360);
    const start = (STAMP_MS / 1000 + Math.random() * 0.08).toFixed(2);
    const colour = ROOM_COLOURS[i % ROOM_COLOURS.length];
    html += `<i class="${i % 3 === 0 ? 'star' : ''}" style="--a: ${angle}deg; --d: ${distance}px; --s: ${spin}deg; --c: var(--color-${colour}); --t: ${start}s"></i>`;
  }
  return html;
}

// A copy of the badge flies along an arc into the backpack (Web Animations API).
function flyToBackpack({ svg, box }, onLanded) {
  const target = document.getElementById('badge-counter');
  if (!target || !svg.animate) {
    onLanded();
    return;
  }
  const to = target.getBoundingClientRect();
  svg.classList.add('bp-ghost');
  Object.assign(svg.style, {
    left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`,
  });
  svg.removeAttribute('role'); // a picture in motion, not something to read
  svg.setAttribute('aria-hidden', 'true');
  document.body.append(svg);

  const dx = to.left + to.width / 2 - (box.left + box.width / 2);
  const dy = to.top + to.height / 2 - (box.top + box.height / 2);
  const flight = svg.animate([
    { transform: 'translate(0, 0) scale(1) rotate(0)' },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 140}px) scale(0.75) rotate(-25deg)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.18) rotate(-60deg)`, opacity: 0.8 },
  ], { duration: FLIGHT_MS, easing: 'cubic-bezier(0.45, 0, 0.35, 1)' });
  flight.onfinish = () => {
    svg.remove();
    onLanded();
  };
}
