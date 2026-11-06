// Shell layer: the living background (Part 43a, Round 4 pilot feedback: the
// children all said "it looks boring"). Clouds drift, the sun glows, birds fly
// across now and then, flowers sway on the hills and a butterfly flutters,
// plus one small touch in the room's colour. The plan (what, where, how slow)
// is in helpers/ambient.js (tested); the motion is in css/ambient.css.
// The drawings follow the approved story design (docs/design/frames/datascope-story-ui.html).
// Everything is decoration: aria-hidden, and taps go straight through it.
import { skyPlan } from './helpers/ambient.js';

const NAVY = '#17324D';

// The sun is 3 stacked layers (glow, turning rays, smiling face), so each one
// moves as a whole picture and the browser never has to redraw it (fast).
const SUN_HTML = `
<div class="sky-glow"></div>
<svg class="sky-rays" viewBox="-60 -60 120 120" width="100%" height="100%" stroke="#FFC531" stroke-width="6" stroke-linecap="round">
  <line x1="0" y1="-52" x2="0" y2="-38"/><line x1="0" y1="52" x2="0" y2="38"/>
  <line x1="-52" y1="0" x2="-38" y2="0"/><line x1="52" y1="0" x2="38" y2="0"/>
  <line x1="-37" y1="-37" x2="-27" y2="-27"/><line x1="37" y1="37" x2="27" y2="27"/>
  <line x1="-37" y1="37" x2="-27" y2="27"/><line x1="37" y1="-37" x2="27" y2="-27"/>
</svg>
<svg class="sky-face" viewBox="-60 -60 120 120" width="100%" height="100%">
  <circle r="28" fill="#FFC531" stroke="${NAVY}" stroke-width="4"/>
  <path d="M-10 4 Q0 14 10 4" stroke="${NAVY}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="-9" cy="-5" r="3" fill="${NAVY}"/><circle cx="9" cy="-5" r="3" fill="${NAVY}"/>
</svg>`;

const CLOUD_SVG = `
<svg viewBox="-4 4 140 56" width="100%" height="100%">
  <ellipse cx="60" cy="30" rx="60" ry="22" fill="#fff"/>
  <ellipse cx="30" cy="38" rx="34" ry="16" fill="#fff"/>
  <ellipse cx="96" cy="40" rx="36" ry="16" fill="#fff"/>
</svg>`;

// A far-away flock: three small "flapping" lines.
const FLOCK_SVG = `
<svg viewBox="-4 -16 110 34" width="100%" height="100%" fill="none" stroke="${NAVY}" stroke-width="3" stroke-linecap="round">
  <path class="sky-vflap" d="M0 0 Q6 -8 12 0 Q18 -8 24 0"/>
  <path class="sky-vflap" style="animation-delay:-0.3s" d="M40 12 Q46 4 52 12 Q58 4 64 12"/>
  <path class="sky-vflap" style="animation-delay:-0.5s" d="M78 -4 Q84 -12 90 -4 Q96 -12 102 -4"/>
</svg>`;

const BIRD_COLOURS = {
  purple: { body: '#A596FF', dark: '#8A7AE6', belly: '#E3DEFF' },
  coral: { body: '#FF7A6B', dark: '#C94A3D', belly: '#FFD9D4' },
};

// A real bird: tail, far wing, body, belly, head, beak, eye, near wing.
function birdSVG(colour) {
  const c = BIRD_COLOURS[colour];
  return `
<svg viewBox="-12 -20 84 52" width="100%" height="100%">
  <g>
    <path d="M12 20 L-8 13 L-4 22 L-8 29 L12 26 Z" fill="${c.dark}" stroke="${NAVY}" stroke-width="2.5" stroke-linejoin="round"/>
    <g class="sky-wing" style="animation-delay:-0.12s"><path d="M32 18 C28 0 16 -12 2 -14 C10 -4 12 8 18 20 Z" fill="${c.dark}" stroke="${NAVY}" stroke-width="2.5" stroke-linejoin="round"/></g>
    <ellipse cx="30" cy="22" rx="20" ry="11" fill="${c.body}" stroke="${NAVY}" stroke-width="3"/>
    <ellipse cx="34" cy="26" rx="13" ry="6" fill="${c.belly}"/>
    <circle cx="51" cy="16" r="8.5" fill="${c.body}" stroke="${NAVY}" stroke-width="3"/>
    <path d="M58 14 L68 18 L58 21 Z" fill="#FFC531" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="53.5" cy="14.5" r="1.8" fill="${NAVY}"/>
    <g class="sky-wing"><path d="M30 18 C26 -2 12 -14 -2 -16 C8 -4 10 8 16 21 Z" fill="${c.body}" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/><path d="M12 -2 Q18 6 20 16" stroke="${c.dark}" stroke-width="2" fill="none" stroke-linecap="round"/></g>
  </g>
</svg>`;
}

const BUTTERFLY_SVG = `
<svg viewBox="-24 -18 48 40" width="100%" height="100%">
  <g class="sky-flutter">
    <path d="M0 0 C-14 -16 -22 -4 -11 4 C-19 11 -8 19 0 7 Z" fill="#FFC531" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M0 0 C14 -16 22 -4 11 4 C19 11 8 19 0 7 Z" fill="#FFC531" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
  </g>
  <ellipse cx="0" cy="3" rx="2.2" ry="8" fill="${NAVY}"/>
</svg>`;

function flowerSVG(colour) {
  return `
<svg viewBox="-12 -14 24 44" width="100%" height="100%">
  <line x1="0" y1="28" x2="0" y2="4" stroke="#217A3B" stroke-width="4"/>
  <circle cx="0" cy="0" r="8" style="fill: var(--color-${colour})" stroke="${NAVY}" stroke-width="3"/>
</svg>`;
}

// The room's touch: simple shapes in the room's colour, with a navy outline.
const STAR_PATH = 'M0 -10 L2.9 -3.8 L9.5 -3.1 L4.7 1.5 L5.9 8.1 L0 4.9 L-5.9 8.1 L-4.7 1.5 L-9.5 -3.1 L-2.9 -3.8 Z';
const NUMBER_SHAPES = [
  '<circle r="8"/>',
  '<path d="M0 -9 L9 7 L-9 7 Z"/>',
  '<rect x="-7" y="-7" width="14" height="14" rx="2"/>',
  '<path d="M0 -10 L9 0 L0 10 L-9 0 Z"/>',
];

function touchSVG(shape, colour, i) {
  const paint = `style="fill: var(--color-${colour})" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"`;
  const parts = {
    question: `<text x="0" y="9" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="28" ${paint}>?</text>`,
    pin: `<path d="M0 11 C-8 2 -9 -3 -9 -5 A9 9 0 0 1 9 -5 C9 -3 8 2 0 11 Z" ${paint}/><circle cy="-5" r="3" fill="#fff"/>`,
    speech: `<path d="M-10 -8 H10 A3 3 0 0 1 13 -5 V3 A3 3 0 0 1 10 6 H-2 L-8 11 V6 H-10 A3 3 0 0 1 -13 3 V-5 A3 3 0 0 1 -10 -8 Z" ${paint}/>`,
    bars: `<rect x="-10" y="0" width="5" height="9" ${paint}/><rect x="-2.5" y="-6" width="5" height="15" ${paint}/><rect x="5" y="-10" width="5" height="19" ${paint}/>`,
    shapes: `<g ${paint}>${NUMBER_SHAPES[i % NUMBER_SHAPES.length]}</g>`,
    star: `<path d="${STAR_PATH}" ${paint}/>`,
  };
  return `<svg viewBox="-14 -14 28 28" width="100%" height="100%">${parts[shape]}</svg>`;
}

// One moving thing: a positioned box with its settings as CSS variables.
function mover(className, vars, inner) {
  const style = Object.entries(vars).map(([k, v]) => `--${k}: ${v}`).join('; ');
  return `<div class="${className}" style="${style}">${inner}</div>`;
}

// Puts the background on the page: the sky behind the hills, and the flowers
// and butterfly on top of the hills. Both stay behind the task card.
// `room`: 'ask', 'collect', 'graph', ... (see helpers/ambient.js ROOM_TOUCH).
export function mountSky(room) {
  if (document.querySelector('.sky')) return; // only once per page
  const plan = skyPlan(room);

  const back = document.createElement('div');
  back.className = 'sky';
  back.setAttribute('aria-hidden', 'true');
  back.innerHTML = [
    mover('sky-sun', { glow: `${plan.sun.glowSeconds}s`, rays: `${plan.sun.raysSeconds}s` }, SUN_HTML),
    ...plan.clouds.map((c) => mover('sky-cloud sky-travel', {
      top: `${c.top}px`, scale: c.scale, seconds: `${c.seconds}s`, delay: `${c.delay}s`, 'rest-x': `${c.restX}vw`,
    }, CLOUD_SVG)),
    ...plan.birds.map((b) => mover(`sky-${b.kind} sky-travel`, {
      top: `${b.top}px`, scale: b.scale, seconds: `${b.seconds}s`, delay: `${b.delay}s`, 'rest-x': `${b.restX}vw`,
    }, b.kind === 'flock' ? FLOCK_SVG : `<div class="sky-wave">${birdSVG(b.colour)}</div>`)),
    ...plan.touches.map((t, i) => mover(`sky-touch sky-touch--${t.motion}`, {
      x: `${t.x}vw`, y: `${t.y}vh`, seconds: `${t.seconds}s`, delay: `${t.delay}s`,
    }, touchSVG(t.shape, t.colour, i))),
  ].join('');

  const front = document.createElement('div');
  front.className = 'sky sky--front';
  front.setAttribute('aria-hidden', 'true');
  front.innerHTML = [
    ...plan.flowers.map((f) => mover('sky-flower', { x: `${f.x}vw`, seconds: `${f.seconds}s` }, flowerSVG(f.colour))),
    mover('sky-butterfly', { x: `${plan.butterfly.x}vw`, bottom: `${plan.butterfly.bottom}px`, seconds: `${plan.butterfly.seconds}s` }, BUTTERFLY_SVG),
  ].join('');

  // The sky goes first (behind the hills); the front goes after the hills.
  document.body.prepend(back);
  document.body.append(front);

  // A hidden tab does not need to animate: css/ambient.css pauses on this class
  // (the room pages also set it in js/app.js; the start page needs it here).
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });
}
