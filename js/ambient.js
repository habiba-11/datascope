// Shell layer: the living background (Part 43a, Round 4 pilot feedback: the
// children all said "it looks boring"). Clouds drift across the sky, and each
// room has its own shapes floating in the side margins, in the room's colour
// (Habiba, 6 Nov 2026: only clouds and the room shapes). The plan (what,
// where, how slow) is in helpers/ambient.js (tested); the motion is in
// css/ambient.css. Everything is decoration: aria-hidden, taps go through it.
import { skyPlan } from './helpers/ambient.js';
import { FEATURES } from './config.js';

const NAVY = '#17324D';

const CLOUD_SVG = `
<svg viewBox="-4 4 140 56" width="100%" height="100%">
  <ellipse cx="60" cy="30" rx="60" ry="22" fill="#fff"/>
  <ellipse cx="30" cy="38" rx="34" ry="16" fill="#fff"/>
  <ellipse cx="96" cy="40" rx="36" ry="16" fill="#fff"/>
</svg>`;

// Each shape is drawn in a 28 x 28 box around (0, 0). `P` paints a part in the
// room's colour with a navy outline; `W` paints a white part; `L` is a navy line.
function shapeSVG(shape, colour) {
  const P = `style="fill: var(--color-${colour})" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"`;
  const W = `fill="#fff" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"`;
  const L = `fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const SHAPES = {
    question: `<text x="0" y="10" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="30" ${P}>?</text>`,
    exclaim: `<text x="0" y="10" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="30" ${P}>!</text>`,
    speech: `<path d="M-10 -8 H10 A3 3 0 0 1 13 -5 V3 A3 3 0 0 1 10 6 H-2 L-8 11 V6 H-10 A3 3 0 0 1 -13 3 V-5 A3 3 0 0 1 -10 -8 Z" ${P}/><path d="M-6 -2 H6" ${L}/>`,
    magnifier: `<circle cx="-3" cy="-3" r="8" ${W}/><circle cx="-3" cy="-3" r="5" ${P}/><path d="M3 3 L11 11" ${L} stroke-width="4"/>`,
    bulb: `<path d="M0 -12 A8 8 0 0 1 5 2 V6 H-5 V2 A8 8 0 0 1 0 -12 Z" ${P}/><rect x="-4" y="6" width="8" height="5" rx="1.5" ${W}/>`,
    pin: `<path d="M0 12 C-8 3 -9 -2 -9 -4 A9 9 0 0 1 9 -4 C9 -2 8 3 0 12 Z" ${P}/><circle cy="-4" r="3" fill="#fff"/>`,
    star: '<path d="M0 -12 L3.5 -4.6 L11.4 -3.7 L5.6 1.8 L7.1 9.7 L0 5.9 L-7.1 9.7 L-5.6 1.8 L-11.4 -3.7 L-3.5 -4.6 Z" '
      + `${P}/>`,
    clipboard: `<rect x="-9" y="-10" width="18" height="22" rx="3" ${P}/><rect x="-5" y="-13" width="10" height="6" rx="2" ${W}/><path d="M-5 -1 H5 M-5 4 H5" ${L}/>`,
    tally: `<path d="M-9 -9 V9 M-4 -9 V9 M1 -9 V9 M6 -9 V9 M-12 6 L10 -6" ${L} stroke-width="3" style="stroke: var(--color-${colour})"/><path d="M-9 -9 V9 M-4 -9 V9 M1 -9 V9 M6 -9 V9 M-12 6 L10 -6" ${L} stroke-width="1"/>`,
    person: `<circle cy="-6" r="5" ${P}/><path d="M-9 11 A9 9 0 0 1 9 11 Z" ${P}/>`,
    bars: `<rect x="-11" y="0" width="6" height="10" ${P}/><rect x="-3" y="-6" width="6" height="16" ${P}/><rect x="5" y="-11" width="6" height="21" ${P}/>`,
    pie: `<circle r="11" ${W}/><path d="M0 0 V-11 A11 11 0 0 1 10.5 3.4 Z" ${P}/>`,
    line: `<path d="M-11 8 L-4 0 L2 4 L11 -8" ${L} stroke-width="3"/><circle cx="-4" cy="0" r="3" ${P}/><circle cx="2" cy="4" r="3" ${P}/><circle cx="11" cy="-8" r="3" ${P}/>`,
    dots: `<circle cx="-6" cy="8" r="3.5" ${P}/><circle cx="0" cy="8" r="3.5" ${P}/><circle cx="0" cy="1" r="3.5" ${P}/><circle cx="6" cy="8" r="3.5" ${P}/><circle cx="0" cy="-6" r="3.5" ${P}/>`,
    circle: `<circle r="10" ${P}/>`,
    triangle: `<path d="M0 -11 L11 9 L-11 9 Z" ${P}/>`,
    square: `<rect x="-9" y="-9" width="18" height="18" rx="3" ${P}/>`,
    diamond: `<path d="M0 -12 L11 0 L0 12 L-11 0 Z" ${P}/>`,
    die: `<rect x="-10" y="-10" width="20" height="20" rx="4" ${W}/><circle cx="-5" cy="-5" r="2" fill="${NAVY}"/><circle r="2" style="fill: var(--color-ask)"/><circle cx="5" cy="5" r="2" fill="${NAVY}"/>`,
    coin: `<circle r="11" ${P}/><circle r="7" fill="none" stroke="${NAVY}" stroke-width="1.5"/>`,
    spinner: `<circle r="11" ${W}/><path d="M0 0 V-11 A11 11 0 0 1 11 0 Z" ${P}/><path d="M0 0 H-11 A11 11 0 0 1 0 -11 Z" style="fill: var(--color-collect)" stroke="${NAVY}" stroke-width="2"/><path d="M0 0 L5 -7" ${L}/>`,
    flag: `<path d="M-8 12 V-11" ${L} stroke-width="3"/><path d="M-8 -11 H9 L5 -5 L9 1 H-8 Z" ${P}/>`,
    check: `<circle r="11" ${P}/><path d="M-5 0 L-1 4 L6 -4" ${L} stroke-width="3"/>`,
    trophy: `<path d="M-8 -10 H8 V-3 A8 8 0 0 1 -8 -3 Z" ${P}/><path d="M-3 4 H3 V8 H-3 Z M-7 8 H7 V12 H-7 Z" ${P}/>`,
  };
  return `<svg viewBox="-14 -14 28 28" width="100%" height="100%">${SHAPES[shape]}</svg>`;
}

// One moving thing: a positioned box with its settings as CSS variables.
function mover(className, vars, inner) {
  const style = Object.entries(vars).map(([k, v]) => `--${k}: ${v}`).join('; ');
  return `<div class="${className}" style="${style}">${inner}</div>`;
}

// Puts the background on the page, behind the hills and the task card.
// `room`: 'ask', 'collect', 'graph', ... (see helpers/ambient.js ROOM_SHAPES).
export function mountSky(room) {
  if (document.querySelector('.sky')) return; // only once per page
  // Part 59: scenes switched off = a plain background, nothing moving.
  if (!FEATURES.richScenes) {
    document.documentElement.classList.add('scenes-off');
    return;
  }
  const plan = skyPlan(room);

  const sky = document.createElement('div');
  sky.className = 'sky';
  sky.setAttribute('aria-hidden', 'true');
  sky.innerHTML = [
    ...plan.clouds.map((c) => mover('sky-cloud', {
      top: `${c.top}px`, scale: c.scale, seconds: `${c.seconds}s`, delay: `${c.delay}s`, 'rest-x': `${c.restX}vw`,
    }, CLOUD_SVG)),
    ...plan.touches.map((t) => mover(`sky-touch sky-touch--${t.motion}`, {
      x: `${t.x}vw`, y: `${t.y}vh`, size: `${t.size}px`, seconds: `${t.seconds}s`, delay: `${t.delay}s`, turn: t.turn,
    }, shapeSVG(t.shape, t.colour))),
  ].join('');
  document.body.prepend(sky);

  // A hidden tab does not need to animate: css/ambient.css pauses on this class
  // (the room pages also set it in js/app.js; the start page needs it here).
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });
}
