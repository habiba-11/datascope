// Part 59 (scenes): each room is a PLACE. This file puts the room's scene
// behind the task card. Big Pip stands in the left column (Habiba, 10 Nov
// 2026: Pip is the main character in the rooms; Sara is only in the story).
// The plan (which scene, what moves) is plain data here, so it is
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
import { schoolyard } from './schoolyard.js';

// Room (phase id) -> its place. Rooms move to scenes one part at a time;
// a room not listed here keeps the Round 4 sky (js/ambient.js).
// `ambient`: what moves in the scene
// (x, y in % of the 960 x 600 stage).
export const ROOM_SCENES = {
  collect: {
    draw: classroom,
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
    // Dust in the light from the window.
    ambient: [
      { kind: 'dust', x: 8, y: 44, seconds: 10, delay: 0 },
      { kind: 'dust', x: 14, y: 48, seconds: 12, delay: -4 },
      { kind: 'dust', x: 20, y: 42, seconds: 11, delay: -8 },
    ],
  },
  chance: {
    draw: funfair,
    // The one thing that moves: a small flag waving on top of the striped pole.
    ambient: [
      { kind: 'flag', x: 2.3, y: 36.4, seconds: 2.4, delay: 0 },
    ],
  },
  conclude: {
    draw: office,
    // Dust over the desk.
    ambient: [
      { kind: 'dust', x: 8, y: 46, seconds: 10, delay: 0 },
      { kind: 'dust', x: 14, y: 50, seconds: 12, delay: -4 },
      { kind: 'dust', x: 20, y: 44, seconds: 11, delay: -8 },
    ],
  },
  number: {
    draw: workshop,
    // A little chalk dust drifting up from the chalkboard's tray.
    ambient: [
      { kind: 'dust', x: 18, y: 46, seconds: 10, delay: 0 },
      { kind: 'dust', x: 21, y: 44, seconds: 12, delay: -4 },
      { kind: 'dust', x: 24, y: 47, seconds: 11, delay: -8 },
    ],
  },
  // The start page (Part 59g): big Pip stands in the page itself (js/welcome.js).
  // Clouds drift (w = width in % of the stage); the school flag waves.
  welcome: {
    draw: schoolyard,
    cast: false,
    ambient: [
      { kind: 'cloud', x: 8, y: 8, w: 18, seconds: 150, delay: -40 },
      { kind: 'cloud', x: 46, y: 20, w: 12, seconds: 210, delay: -130 },
      { kind: 'cloud', x: 74, y: 4, w: 9, seconds: 260, delay: -210 },
      { kind: 'banner', x: 94.9, y: 18.8, w: 4.9, seconds: 2.2, delay: 0 },
    ],
  },
};

// What goes inside a moving thing (dust is just a round speck).
const AMBIENT_INNER = {
  cloud: '<svg viewBox="-90 -40 180 85" aria-hidden="true" focusable="false"><ellipse cx="0" cy="30" rx="84" ry="12" fill="#B9D2E8" opacity=".45"/><g fill="url(#ds-cloud)"><ellipse cx="0" cy="18" rx="72" ry="20"/><circle cx="-36" cy="10" r="24"/><circle cx="0" cy="-5" r="33"/><circle cx="38" cy="8" r="27"/><circle cx="64" cy="17" r="16"/></g></svg>',
  banner: '<svg viewBox="0 -4 48 38" aria-hidden="true" focusable="false"><path d="M0 6 Q24 -4 47 6 V32 Q24 22 0 32Z" fill="#4CC26B"/><circle cx="23" cy="18" r="6" fill="#fff" opacity=".85"/></svg>',
  flag: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><path d="M1 1 L29 10 L1 19Z" fill="#4CC26B" stroke="#17324D" stroke-width="2" stroke-linejoin="round"/></svg>',
};

// The CSS variables of one moving thing. A cloud also gets where its drift
// starts and ends (--from, --to: in % of its own width, from just off the left
// edge of the stage to just off the right edge); with reduced motion it rests at x.
export function ambientStyle(a) {
  let style = `--x: ${a.x}%; --y: ${a.y}%; --seconds: ${a.seconds}s; --delay: ${a.delay}s`;
  if (a.w) style += `; --w: ${a.w}%`;
  if (a.kind === 'cloud') {
    style += `; --from: ${Math.round((-a.w - a.x) / a.w * 100)}%; --to: ${Math.round((100 - a.x) / a.w * 100)}%`;
  }
  return style;
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
    ${plan.ambient.map((a) => `<span class="scene-${a.kind}" style="${ambientStyle(a)}">${AMBIENT_INNER[a.kind] || ''}</span>`).join('')}`;
  document.body.prepend(scene);
  html.classList.add('has-scene');

  // Big Pip gets the left column beside the card (wide screens, css/scenes.css).
  if (plan.cast !== false) html.classList.add('has-cast');
  return true;
}
