// Helper layer: the living background (Part 43a, Round 4 pilot feedback:
// "it looks boring"). This file only PLANS what moves, where and how slowly;
// js/ambient.js draws it and css/ambient.css moves it. No DOM here, so the
// rules below are tested (tests/ambient.test.js).
//
// Rules (Habiba's Round 4 limits):
// - Only transform and opacity move, behind the card (never over a question or a button).
// - Nothing that blinks (changes opacity) is faster than one cycle per second
//   (the limit is "no flashing faster than 3 times a second").
// - The room's own touch stays in the side margins (left of 12vw or right of 88vw).
// - At most MAX_MOVERS moving things, so it stays fast on a school laptop.
// The drawings follow the approved story design (docs/design/frames/datascope-story-ui.html).

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

// Two real birds (body, head, beak, tail, two wings that flap in bursts, then
// glide) and a far-away flock. They cross now and then, in a gentle wave.
const BIRDS = [
  { kind: 'flock', top: 40, scale: 0.55, seconds: 60, delay: -12, restX: 60 },
  { kind: 'bird', colour: 'purple', top: 220, scale: 0.72, seconds: 44, delay: -30, restX: 4 },
  { kind: 'bird', colour: 'coral', top: 340, scale: 0.9, seconds: 32, delay: -6, restX: 90 },
];

// The start page has no card to hide behind, so its birds stay up in the sky,
// above the big title (Habiba's rule: nothing moves over the words or buttons).
export const WELCOME_BIRDS = [
  { top: 50, scale: 0.5 },
  { top: 4, scale: 0.6 },
  { top: 40, scale: 0.7 },
];

// Flowers sway on the hills; a butterfly flutters near them (left side).
const FLOWERS = [
  { x: 4, colour: 'ask', seconds: 3.2 },
  { x: 95, colour: 'plan', seconds: 3.4 },
];

// Each room's own small touch, in its colour (only shapes: the games scenario
// visits Number Lab too, so it never shows digits).
export const ROOM_TOUCH = {
  ask: { shape: 'question', colour: 'ask', motion: 'float' },
  plan: { shape: 'pin', colour: 'plan', motion: 'float' },
  collect: { shape: 'speech', colour: 'collect', motion: 'float' },
  graph: { shape: 'bars', colour: 'explore', motion: 'float' },
  number: { shape: 'shapes', colour: 'explore', motion: 'spin' },
  chance: { shape: 'star', colour: 'plan', motion: 'twinkle' },
  conclude: { shape: 'star', colour: 'conclude', motion: 'twinkle' },
};

// Where the 4 touch items sit: in the side margins, at different heights.
const TOUCH_SPOTS = [
  { x: 4, y: 42, seconds: 4.2, delay: 0 },
  { x: 9, y: 68, seconds: 5, delay: -1.5 },
  { x: 90, y: 34, seconds: 4.6, delay: -0.8 },
  { x: 95, y: 62, seconds: 3.8, delay: -2.2 },
];

// The whole plan for one page. `room`: a key of ROOM_TOUCH, or anything else
// (e.g. 'welcome') for no room touch.
export function skyPlan(room) {
  const touch = ROOM_TOUCH[room];
  return {
    sun: { glowSeconds: 3.4, raysSeconds: 40 },
    clouds: CLOUDS,
    birds: room === 'welcome' ? BIRDS.map((b, i) => ({ ...b, ...WELCOME_BIRDS[i] })) : BIRDS,
    flowers: FLOWERS,
    butterfly: { x: 2, bottom: 120, seconds: 24 },
    touches: touch ? TOUCH_SPOTS.map((spot) => ({ ...spot, ...touch })) : [],
  };
}

// How many things move at once (each cloud, bird, flower, touch, the sun and
// the butterfly). Wings and rays move with their own thing, so they don't count.
export function moverCount(plan) {
  return 2 + plan.clouds.length + plan.birds.length + plan.flowers.length + plan.touches.length;
}

// The loops that change opacity (blink or glow), with their length in seconds.
export function blinkLoops(plan) {
  return [
    plan.sun.glowSeconds,
    ...plan.touches.filter((t) => t.motion === 'twinkle').map((t) => t.seconds),
  ];
}
