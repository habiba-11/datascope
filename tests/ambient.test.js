import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  skyPlan, moverCount, blinkLoops, ROOM_TOUCH, MAX_MOVERS, MIN_BLINK_SECONDS,
} from '../js/helpers/ambient.js';

const ROOMS = [...Object.keys(ROOM_TOUCH), 'welcome'];

test(`at most ${MAX_MOVERS} things move on any page (fast on a school laptop)`, () => {
  for (const room of ROOMS) assert.ok(moverCount(skyPlan(room)) <= MAX_MOVERS, room);
});

test('nothing blinks faster than once a second (limit: 3 flashes a second)', () => {
  for (const room of ROOMS) {
    for (const seconds of blinkLoops(skyPlan(room))) assert.ok(seconds >= MIN_BLINK_SECONDS, `${room}: ${seconds}s`);
  }
});

test("a room's touch stays in the side margins, away from the card", () => {
  for (const room of ROOMS) {
    for (const t of skyPlan(room).touches) assert.ok(t.x < 12 || t.x > 88, `${room}: x ${t.x}vw`);
  }
});

test('each room gets its own touch in its colour; the start page gets none', () => {
  assert.equal(skyPlan('chance').touches[0].shape, 'star');
  assert.equal(skyPlan('graph').touches[0].shape, 'bars');
  assert.equal(skyPlan('welcome').touches.length, 0);
});

test('Number Lab shows shapes, never digits (the games scenario has no numbers)', () => {
  assert.doesNotMatch(ROOM_TOUCH.number.shape, /digit|number/);
});

test('clouds drift slowly, and every mover has a still place for reduced motion', () => {
  const plan = skyPlan('ask');
  for (const c of plan.clouds) assert.ok(c.seconds >= 30, `cloud crosses in ${c.seconds}s`);
  for (const m of [...plan.clouds, ...plan.birds]) assert.equal(typeof m.restX, 'number');
});

test('on the start page (no card) the birds stay above the title, in the top 100px', () => {
  // A bird is 60px tall at scale 1 and waves 14px up and down.
  for (const b of skyPlan('welcome').birds) assert.ok(b.top + 60 * b.scale + 14 <= 100, `top ${b.top}`);
});
