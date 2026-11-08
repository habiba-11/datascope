// Shell layer: the Chance Lab devices as real-looking objects (f12 design,
// 4 Nov 2026): a thick gold coin (owl / feather), a white die with pips, and a
// glossy spinner with a metal needle. Pure CSS 3D + SVG (css/chance-lab.css),
// sized in em, so one drawing makes the small picker version and the big one.
// The devices are decorative (aria-hidden): the result is always in words too.
// playDevice() moves a device to the real result, with its sound at the same time.
import { needleAngle } from './helpers/chance.js';
import { playSound } from './sounds.js';
import { iconHTML } from './icon-text.js';

export const SPINNER_COLOURS = { Red: '#FF7A6B', Blue: '#38B6FF', Green: '#4CC26B', Yellow: '#FFC531' };
export const isSpinner = (device) => device.outcomes.every((o) => SPINNER_COLOURS[o]);

// How long each motion takes (the sounds in sounds.js have the same timing).
const MOTION_MS = { coin: 1300, dice: 1400, spinner: 2400 };

const OWL = '<svg viewBox="0 0 100 100"><path d="M18 78C18 36 34 22 50 22s32 14 32 56c0 14-14 18-32 18S18 92 18 78z" fill="#C98A4B" stroke="#7A5A06" stroke-width="5"/><circle cx="38" cy="50" r="12" fill="#fff" stroke="#7A5A06" stroke-width="4"/><circle cx="62" cy="50" r="12" fill="#fff" stroke="#7A5A06" stroke-width="4"/><circle cx="40" cy="52" r="5" fill="#17324D"/><circle cx="60" cy="52" r="5" fill="#17324D"/><path d="M45 62l5 8 5-8z" fill="#FFC531" stroke="#7A5A06" stroke-width="3"/></svg>';
const FEATHER = '<svg viewBox="0 0 100 100" fill="none" stroke="#7A5A06" stroke-width="5" stroke-linecap="round"><path d="M72 18C40 24 24 50 26 74c24-2 44-20 46-56z" fill="#F7C93E"/><path d="M26 74L66 30M44 58l-2-16M54 46l-2-14M36 66l-14 0"/></svg>';

// Which of the 9 spots on a die face have a pip.
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
// How to turn the cube so face n looks at the child.
const DIE_TURN = { 1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 2: [-90, 0], 5: [90, 0] };
// The coin's resting tilt, so it looks like a thick coin, not a flat circle.
const COIN_TILT = -18;

const shadow = '<span class="cl-shadow"></span>';

function coinHTML() {
  // 9 thin discs make the coin's edge thick.
  const discs = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((z) => `<span class="cl-disc" style="transform: translateZ(${z * 0.1}em)"></span>`).join('');
  return `<span class="cl-dev">${shadow}<span class="cl-persp"><span class="cl-coin">${discs}
    <span class="cl-face" style="transform: translateZ(0.5em)">${OWL}</span>
    <span class="cl-face" style="transform: rotateX(180deg) translateZ(0.5em)">${FEATHER}</span></span></span></span>`;
}

function dieHTML() {
  const face = (n) => `<span class="cl-pips cl-f${n}">${Array.from({ length: 9 }, (_, i) => (PIPS[n].includes(i) ? `<i${n === 1 ? ' class="red"' : ''}></i>` : '<span></span>')).join('')}</span>`;
  return `<span class="cl-dev">${shadow}<span class="cl-persp"><span class="cl-dtilt"><span class="cl-cube">${[1, 2, 3, 4, 5, 6].map(face).join('')}</span></span></span></span>`;
}

// Pie slices from the top, clockwise (needleAngle in helpers/chance.js uses the
// same order), with a thin navy line between them.
function sliceGradient(device) {
  const total = device.weights.reduce((a, b) => a + b, 0);
  let start = 0;
  const parts = device.outcomes.map((o, i) => {
    const end = start + (device.weights[i] / total) * 360;
    const part = `${SPINNER_COLOURS[o]} ${start}deg ${end - 1.2}deg, #17324D ${end - 1.2}deg ${end}deg`;
    start = end;
    return part;
  });
  return `conic-gradient(${parts.join(', ')})`;
}

// `labels`: write each slice's name on it (a slice too small for its word stays empty).
function spinnerHTML(device, labels) {
  const total = device.weights.reduce((a, b) => a + b, 0);
  let start = 0;
  const words = labels ? device.outcomes.map((o, i) => {
    const middle = start + (device.weights[i] / total) * 180;
    start += (device.weights[i] / total) * 360;
    // Upright words (easy to read), in the middle of the slice, 2.1em from the centre.
    const rad = (middle * Math.PI) / 180;
    const x = (Math.sin(rad) * 2.1).toFixed(2);
    const y = (-Math.cos(rad) * 2.1).toFixed(2);
    return device.weights[i] / total > 0.12 ? `<span class="cl-slab" style="left: calc(50% + ${x}em); top: calc(50% + ${y}em)">${o}</span>` : '';
  }).join('') : '';
  return `<span class="cl-dev">${shadow}<span class="cl-spin"><span class="cl-wheel" style="background: ${sliceGradient(device)}"></span>${words}<span class="cl-needle"><b></b></span><span class="cl-hub"></span></span></span>`;
}

// The kind of device: 'coin', 'dice' or 'spinner'.
export function deviceKind(device) {
  if (isSpinner(device)) return 'spinner';
  return device.outcomes.length === 2 ? 'coin' : 'dice';
}

// The drawing for a device. Always decorative: the words say the same.
export function deviceHTML(device, { labels = false } = {}) {
  const kind = deviceKind(device);
  if (kind === 'coin') return coinHTML();
  if (kind === 'dice') return dieHTML();
  return spinnerHTML(device, labels);
}

// A small round token for one outcome: its colour (spinner), owl / feather icons (coin),
// or its number (dice). The name is always written next to it.
export function tokenHTML(outcome) {
  const colour = SPINNER_COLOURS[outcome];
  let inside = '';
  if (outcome === 'Heads') inside = iconHTML('owl'); // Part 54f: our icons
  if (outcome === 'Tails') inside = iconHTML('feather');
  if (/^[1-6]$/.test(outcome)) inside = outcome;
  return `<span class="cl-token" style="--c: ${colour || '#FFFFFF'}" aria-hidden="true">${inside}</span>`;
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let needleTurn = 0; // where the needle stopped last time, so it spins on from there

// Moves the device in `box` to `outcome`. Returns a promise that resolves when
// it has stopped (at once with reduced motion). The sound starts with the motion.
export function playDevice(box, device, outcome) {
  const kind = deviceKind(device);
  const still = reduceMotion() || !Element.prototype.animate;
  const lift = box.querySelector('.cl-persp');

  if (kind === 'spinner') {
    const needle = box.querySelector('.cl-needle');
    const index = device.outcomes.indexOf(outcome);
    // Always forward: 3 more full turns, then stop inside the result's slice.
    needleTurn = Math.ceil(needleTurn / 360) * 360 + needleAngle(device.weights, index, Math.random());
    if (still) {
      needle.style.transform = `rotate(${needleTurn % 360}deg)`;
      playSound('land');
      return Promise.resolve();
    }
    playSound('spin');
    return needle.animate([{ transform: needle.style.transform || 'rotate(0deg)' }, { transform: `rotate(${needleTurn}deg)` }], {
      duration: MOTION_MS.spinner, easing: 'cubic-bezier(.12,.7,.15,1)', fill: 'forwards',
    }).finished.then(() => { needle.style.transform = `rotate(${needleTurn}deg)`; });
  }

  const thing = box.querySelector(kind === 'coin' ? '.cl-coin' : '.cl-cube');
  const end = kind === 'coin'
    ? `rotateX(${COIN_TILT + (outcome === 'Tails' ? 180 : 0)}deg)`
    : `rotateX(${DIE_TURN[outcome][0]}deg) rotateY(${DIE_TURN[outcome][1]}deg)`;
  if (still) {
    thing.style.transform = end;
    playSound('land');
    return Promise.resolve();
  }
  const ms = MOTION_MS[kind];
  playSound(kind === 'coin' ? 'flip' : 'roll');
  // Up in an arc and down again, while it turns many times and lands on the result.
  const turns = kind === 'coin'
    ? `rotateX(${COIN_TILT + (outcome === 'Tails' ? 180 : 0) + 1800}deg)`
    : `rotateX(${DIE_TURN[outcome][0] + 1080}deg) rotateY(${DIE_TURN[outcome][1] + 900}deg)`;
  lift.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1.8em) scale(1.1)', offset: 0.45 }, { transform: 'translateY(0)' }], { duration: ms, easing: 'ease-in-out' });
  box.querySelector('.cl-shadow').animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.5)', opacity: 0.4, offset: 0.45 }, { transform: 'scale(1)', opacity: 1 }], { duration: ms, easing: 'ease-in-out' });
  const start = thing.style.transform || (kind === 'coin' ? `rotateX(${COIN_TILT}deg)` : 'rotateX(0deg) rotateY(0deg)');
  return thing.animate([{ transform: start }, { transform: turns }], {
    duration: ms, easing: 'cubic-bezier(.2,.7,.3,1)',
  }).finished.then(() => { thing.style.transform = end; });
}

// A new device in the box starts at rest (the needle at the top).
export function resetDevice() {
  needleTurn = 0;
}
