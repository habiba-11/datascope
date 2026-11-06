import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  skyPlan, moverCount, blinkLoops, ROOM_SHAPES, MAX_MOVERS, MIN_BLINK_SECONDS, PIP_TOP_VH,
} from '../js/helpers/ambient.js';

const ROOMS = [...Object.keys(ROOM_SHAPES), 'welcome'];

test(`at most ${MAX_MOVERS} things move on any page (fast on a school laptop)`, () => {
  for (const room of ROOMS) assert.ok(moverCount(skyPlan(room)) <= MAX_MOVERS, room);
});

test('nothing blinks faster than once a second (limit: 3 flashes a second)', () => {
  for (const room of ROOMS) {
    for (const seconds of blinkLoops(skyPlan(room))) assert.ok(seconds >= MIN_BLINK_SECONDS, `${room}: ${seconds}s`);
  }
});

test("a room's shapes stay in the side margins, away from the card", () => {
  for (const room of ROOMS) {
    for (const t of skyPlan(room).touches) assert.ok(t.x < 12 || t.x > 88, `${room}: x ${t.x}vw`);
  }
});

test('every room shows all its different shapes, in its colour, in different sizes', () => {
  for (const [room, set] of Object.entries(ROOM_SHAPES)) {
    const touches = skyPlan(room).touches;
    assert.deepEqual(new Set(touches.map((t) => t.shape)), new Set(set.shapes), room);
    assert.ok(touches.every((t) => t.colour === set.colour), room);
    assert.ok(new Set(touches.map((t) => t.size)).size >= 3, `${room}: sizes vary`);
  }
});

test('only clouds on the start page (Habiba: no birds, sun or flowers)', () => {
  const plan = skyPlan('welcome');
  assert.equal(plan.touches.length, 0);
  assert.deepEqual(Object.keys(plan), ['clouds', 'touches']);
});

test('Number Lab shows plain shapes, never digits (the games scenario has no numbers)', () => {
  for (const shape of ROOM_SHAPES.number.shapes) assert.doesNotMatch(shape, /digit|number|\d/);
});

test('only stars twinkle; clouds drift slowly and rest in view with reduced motion', () => {
  for (const room of ROOMS) {
    for (const t of skyPlan(room).touches) assert.equal(t.motion === 'twinkle', t.shape === 'star', `${room}: ${t.shape}`);
  }
  for (const c of skyPlan('ask').clouds) {
    assert.ok(c.seconds >= 30, `cloud crosses in ${c.seconds}s`);
    assert.equal(typeof c.restX, 'number');
  }
});

test('the left shapes stay above Pip, who stands at the bottom of the left margin', () => {
  for (const room of Object.keys(ROOM_SHAPES)) {
    for (const t of skyPlan(room).touches.filter((s) => s.x < 50)) {
      // y is the top of the shape (vh); its size is at most 46px (about 6vh at 768px).
      assert.ok(t.y + 6 <= PIP_TOP_VH, `${room}: left shape at ${t.y}vh`);
    }
  }
});
