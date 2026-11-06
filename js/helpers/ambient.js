// Helper layer: the living background (Part 43a, Round 4 pilot feedback:
// "it looks boring"). This file only PLANS what moves, where and how slowly;
// js/ambient.js draws it and css/ambient.css moves it. No DOM here, so the
// rules below are tested (tests/ambient.test.js).
//
// Habiba's choice (6 Nov 2026): only clouds drifting, plus each room's own
// shapes in the side margins (no birds, sun, flowers or butterfly).
//
// Rules (Habiba's Round 4 limits):
// - Only transform and opacity move, behind the card (never over a question or a button).
// - Nothing that blinks (changes opacity) is faster than one cycle per second
//   (the limit is "no flashing faster than 3 times a second").
// - The room's shapes stay in the side margins (left of 12vw or right of 88vw).
// - At most MAX_MOVERS moving things, so it stays fast on a school laptop.

export const MAX_MOVERS = 14;
export const MIN_BLINK_SECONDS = 1;

// Clouds drift from left to right in a loop. `top` in px from the top of the
// screen, `scale` its size, `seconds` one crossing, `delay` negative so each
// starts part-way across, `restX` where it rests with reduced motion (vw).
const CLOUDS = [
  { top: 6, scale: 1, seconds: 62, delay: -10, restX: 30 },
  { top: 150, scale: 0.7, seconds: 88, delay: -44, restX: 2 },
  { top: 64, scale: 0.5, seconds: 120, delay: -90, restX: 80 },
];

// Each room's shapes: small pictures of what the room is about, in its colour.
// `motion`: 'float' (bobs and tilts), 'spin' (turns slowly) or 'twinkle' (stars).
// Number Lab shows plain shapes, never digits: the games scenario visits it too.
export const ROOM_SHAPES = {
  ask: { colour: 'ask', shapes: ['question', 'speech', 'exclaim', 'magnifier'] },
  plan: { colour: 'plan', shapes: ['bulb', 'pin', 'question', 'star'] },
  collect: { colour: 'collect', shapes: ['speech', 'clipboard', 'tally', 'person'] },
  graph: { colour: 'explore', shapes: ['bars', 'pie', 'line', 'dots'] },
  number: { colour: 'explore', shapes: ['circle', 'triangle', 'square', 'diamond'] },
  chance: { colour: 'plan', shapes: ['star', 'die', 'coin', 'spinner'] },
  conclude: { colour: 'conclude', shapes: ['star', 'flag', 'check', 'trophy'] },
};

// Shapes that turn slowly as a whole (they look the same from every side),
// and shapes that twinkle. All the others float.
const SPINNERS = new Set(['circle', 'triangle', 'square', 'diamond', 'spinner', 'coin', 'die']);
const TWINKLERS = new Set(['star']);

// Where the 10 shapes sit: 5 down each side margin, at different heights and
// sizes (px), each with its own speed, so they never move in step.
const SPOTS = [
  { x: 4, y: 24, size: 30, seconds: 4.2, delay: 0 },
  { x: 10, y: 38, size: 44, seconds: 5.6, delay: -1.2 },
  { x: 3, y: 54, size: 36, seconds: 4.8, delay: -2.6 },
  { x: 9, y: 68, size: 26, seconds: 3.8, delay: -0.6 },
  { x: 5, y: 76, size: 40, seconds: 6.2, delay: -3.1 },
  { x: 92, y: 22, size: 38, seconds: 5.2, delay: -0.9 },
  { x: 96, y: 36, size: 28, seconds: 4.0, delay: -2.0 },
  { x: 90, y: 50, size: 46, seconds: 6.0, delay: -3.4 },
  { x: 96, y: 66, size: 32, seconds: 4.6, delay: -1.6 },
  { x: 91, y: 76, size: 30, seconds: 5.0, delay: -2.8 },
];

function motionFor(shape) {
  if (TWINKLERS.has(shape)) return 'twinkle';
  return SPINNERS.has(shape) ? 'spin' : 'float';
}

// The whole plan for one page. `room`: a key of ROOM_SHAPES, or anything else
// (e.g. 'welcome') for clouds only.
export function skyPlan(room) {
  const set = ROOM_SHAPES[room];
  const touches = set
    ? SPOTS.map((spot, i) => {
      const shape = set.shapes[i % set.shapes.length];
      return { ...spot, shape, colour: set.colour, motion: motionFor(shape), turn: i % 2 ? 1 : -1 };
    })
    : [];
  return { clouds: CLOUDS, touches };
}

// How many things move at once (each cloud and each shape).
export function moverCount(plan) {
  return plan.clouds.length + plan.touches.length;
}

// The loops that change opacity (the twinkling stars), with their length in seconds.
export function blinkLoops(plan) {
  return plan.touches.filter((t) => t.motion === 'twinkle').map((t) => t.seconds);
}
