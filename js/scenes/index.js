// Part 59 (scenes): each room is a PLACE. This file puts the room's scene
// behind the task card, and Sara in the left column next to big Pip.
// The plan (which scene, which pose, what moves) is plain data here, so it is
// tested (tests/scenes.test.js); mountScene() is the only part that needs a page.
//
// Rules (Part 59): the scene is a still picture; only a few small things move
// (transform and opacity only), they pause in a hidden tab, and reduced motion
// stops them (css/base.css). FEATURES.richScenes = false: no scene, a plain
// background and nothing moving (for slow school laptops).
import { FEATURES } from '../config.js';
import { mountSceneDefs } from './defs.js';
import { classroom } from './classroom.js';
import { workshop } from './workshop.js';
import { studio } from './studio.js';
import { lab } from './lab.js';
import { funfair } from './funfair.js';
import { office } from './office.js';
import { saraSVG } from '../characters.js';

// Room (phase id) -> its place. Rooms move to scenes one part at a time;
// a room not listed here keeps the Round 4 sky (js/ambient.js).
// `sara`: her pose in this room. `ambient`: what moves in the scene
// (x, y in % of the 960 x 600 stage).
export const ROOM_SCENES = {
  collect: {
    draw: classroom,
    sara: 'clip',
    // Dust specks floating in the window's light.
    ambient: [
      { kind: 'dust', x: 22, y: 58, seconds: 9, delay: 0 },
      { kind: 'dust', x: 28, y: 66, seconds: 11, delay: -3 },
      { kind: 'dust', x: 34, y: 54, seconds: 10, delay: -6 },
      { kind: 'dust', x: 40, y: 70, seconds: 12, delay: -2 },
      { kind: 'dust', x: 46, y: 62, seconds: 9.5, delay: -7 },
      { kind: 'dust', x: 52, y: 76, seconds: 11.5, delay: -4 },
    ],
  },
  ask: {
    draw: studio,
    sara: 'think',
    // Dust floating over the bookshelves.
    ambient: [
      { kind: 'dust', x: 10, y: 48, seconds: 10, delay: 0 },
      { kind: 'dust', x: 16, y: 44, seconds: 12, delay: -5 },
      { kind: 'dust', x: 22, y: 50, seconds: 11, delay: -8 },
    ],
  },
  graph: {
    draw: lab,
    // Not 'point' (the mockup): big Pip stands in front of her and hid the stick.
    sara: 'idle',
    // Dust in the light from the window.
    ambient: [
      { kind: 'dust', x: 8, y: 44, seconds: 10, delay: 0 },
      { kind: 'dust', x: 14, y: 48, seconds: 12, delay: -4 },
      { kind: 'dust', x: 20, y: 42, seconds: 11, delay: -8 },
    ],
  },
  chance: {
    draw: funfair,
    sara: 'cheer',
    // The one thing that moves: a small flag waving on top of the striped pole.
    ambient: [
      { kind: 'flag', x: 2.3, y: 36.4, seconds: 2.4, delay: 0 },
    ],
  },
  conclude: {
    draw: office,
    sara: 'write',
    // Dust over the desk.
    ambient: [
      { kind: 'dust', x: 8, y: 46, seconds: 10, delay: 0 },
      { kind: 'dust', x: 14, y: 50, seconds: 12, delay: -4 },
      { kind: 'dust', x: 20, y: 44, seconds: 11, delay: -8 },
    ],
  },
  number: {
    draw: workshop,
    sara: 'think',
    // A little chalk dust drifting up from the chalkboard's tray.
    ambient: [
      { kind: 'dust', x: 18, y: 46, seconds: 10, delay: 0 },
      { kind: 'dust', x: 21, y: 44, seconds: 12, delay: -4 },
      { kind: 'dust', x: 24, y: 47, seconds: 11, delay: -8 },
    ],
  },
};

// What goes inside a moving thing (dust is just a round speck).
const AMBIENT_INNER = {
  flag: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><path d="M1 1 L29 10 L1 19Z" fill="#4CC26B" stroke="#17324D" stroke-width="2" stroke-linejoin="round"/></svg>',
};

// Sara cheers when the room is finished, then goes back to her room pose.
const CHEER_MS = 4000;

export function hasScene(room) {
  return FEATURES.richScenes && Boolean(ROOM_SCENES[room]);
}

// Puts the scene on the page. Returns true when the page needs nothing else
// behind the card (a scene, or the plain background when scenes are off);
// false means "this room has no scene yet: draw the old sky".
export function mountScene(room) {
  const html = document.documentElement;
  if (!FEATURES.richScenes) {
    html.classList.add('scenes-off'); // css/scenes.css: plain colour, no hills
    return true;
  }
  const plan = ROOM_SCENES[room];
  if (!plan || document.querySelector('.scene')) return false;

  mountSceneDefs();
  const scene = document.createElement('div');
  scene.className = 'scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `
    <svg viewBox="0 0 960 600" preserveAspectRatio="none" focusable="false">${plan.draw()}</svg>
    ${plan.ambient.map((a) => `<span class="scene-${a.kind}" style="--x: ${a.x}%; --y: ${a.y}%; --seconds: ${a.seconds}s; --delay: ${a.delay}s">${AMBIENT_INNER[a.kind] || ''}</span>`).join('')}`;
  document.body.prepend(scene);
  html.classList.add('has-scene');

  // Sara stands in the left column beside big Pip (wide screens only, css/scenes.css).
  const cast = document.createElement('div');
  cast.className = 'scene-cast';
  cast.setAttribute('aria-hidden', 'true');
  cast.innerHTML = saraSVG(plan.sara);
  document.body.append(cast);
  html.classList.add('has-cast');

  // A finished room: Sara cheers with Pip for a moment.
  window.addEventListener('datascope:logged', (e) => {
    if (e.detail.type !== 'phase-complete') return;
    cast.innerHTML = saraSVG('cheer');
    setTimeout(() => { cast.innerHTML = saraSVG(plan.sara); }, CHEER_MS);
  });
  return true;
}
