// Part 59 (scenes): the room scenes and the cast follow the Part 59 rules
// (still pictures, no slow filters, shared gradients that really exist).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_SCENES } from '../js/scenes/index.js';
import { SCENE_DEFS } from '../js/scenes/defs.js';
import { saraSVG, SARA_MOODS, seatKidSVG, KIDS } from '../js/characters.js';
import { pipSVG } from '../js/pip.js';
import { DEFAULT_OUTFIT } from '../js/helpers/wardrobe.js';

const DEFINED = new Set([...SCENE_DEFS.matchAll(/id="(ds-[\w-]+)"/g)].map((m) => m[1]));
const usedIds = (svg) => [...svg.matchAll(/url\(#([\w~-]+)\)/g)].map((m) => m[1]);

const pictures = () => [
  ...Object.entries(ROOM_SCENES).map(([room, plan]) => [`scene ${room}`, plan.draw()]),
  ...SARA_MOODS.map((mood) => [`Sara ${mood}`, saraSVG(mood)]),
  ...KIDS.map((_, i) => [`seat kid ${i}`, seatKidSVG(i, true) + seatKidSVG(i, false)]),
  ['Pip in his explorer outfit', pipSVG('', DEFAULT_OUTFIT)],
];

test('every gradient a scene or character uses is defined once, with a ds- id', () => {
  for (const [name, svg] of pictures()) {
    for (const id of usedIds(svg)) assert.ok(DEFINED.has(id), `${name} uses #${id}`);
  }
  const all = [...SCENE_DEFS.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(all).size, all.length, 'no id twice');
  assert.ok(all.every((id) => id.startsWith('ds-')));
});

test('scenes and characters are cheap: no filters, no blend modes, nothing moves inside them', () => {
  for (const [name, svg] of pictures()) {
    assert.doesNotMatch(svg, /filter|feGaussianBlur|feTurbulence|mix-blend/, name);
    // Pip's moods and blink are CSS classes (css/base.css), never inside the drawing.
    assert.doesNotMatch(svg, /animation|<animate/, name);
  }
});

test("Pip keeps every part his moods and moves need (css/base.css, css/shell.css, css/story.css)", () => {
  const svg = pipSVG('', DEFAULT_OUTFIT);
  for (const part of ['pip-all', 'pip-body', 'pip-belly', 'pip-eye', 'pip-pupils', 'pip-lids', 'pip-wing-left', 'pip-wing-right', 'pip-beak', 'pip-foot', 'pip-question', 'pip-sparkles']) {
    assert.match(svg, new RegExp(`class="[^"]*\\b${part}\\b`), part);
  }
});

test('the Number Lab workshop has no words or digits (Part 51: the games scenario visits it)', () => {
  assert.doesNotMatch(ROOM_SCENES.number.draw(), /<text/);
});

test('the scenes have no sun and no ticking clock (Round 4 rule; no timers)', () => {
  for (const [room, plan] of Object.entries(ROOM_SCENES)) {
    assert.doesNotMatch(plan.draw(), /sun|clock/i, room);
  }
});

test('each room scene: a known Sara pose, and only a few slow things moving inside the stage', () => {
  for (const [room, plan] of Object.entries(ROOM_SCENES)) {
    // The start page has no `sara`: she stands in the page itself (js/welcome.js).
    assert.ok(room === 'welcome' ? plan.sara === null : SARA_MOODS.includes(plan.sara), room);
    assert.ok(plan.ambient.length <= 8, `${room}: ${plan.ambient.length} movers`);
    for (const a of plan.ambient) {
      assert.ok(a.x >= 0 && a.x <= 100 && a.y >= 0 && a.y <= 100, `${room}: inside the stage`);
      assert.ok(a.seconds >= 1, `${room}: never faster than once a second`);
    }
  }
});

test('the characters are decoration, hidden from screen readers', () => {
  for (const [name, svg] of pictures().filter(([n]) => !n.startsWith('scene'))) {
    assert.match(svg, /aria-hidden="true"/, name);
  }
});

test("an answered seat kid wears the colour of the answer's bar; an empty one is grey", () => {
  assert.match(seatKidSVG(0, true), /var\(--seat\)/);
  assert.doesNotMatch(seatKidSVG(0, false), /var\(--seat\)/);
});

test('an unknown Sara pose falls back to standing still', () => {
  assert.equal(saraSVG('flying'), saraSVG('idle'));
});
