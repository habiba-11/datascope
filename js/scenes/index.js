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
    ${plan.ambient.map((a) => `<span class="scene-${a.kind}" style="--x: ${a.x}%; --y: ${a.y}%; --seconds: ${a.seconds}s; --delay: ${a.delay}s"></span>`).join('')}`;
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
