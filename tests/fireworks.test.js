import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBurst, stepSpark, sparkAlpha, rocketY, RISE_SECONDS, SPARKS, MAX_LIFE, GLITTER,
} from '../js/helpers/fireworks.js';
import { FIREWORK_RISE } from '../js/sounds.js';

const run = (spark, seconds, dt = 1 / 60) => {
  let alive = true;
  for (let t = 0; t < seconds && alive; t += dt) alive = stepSpark(spark, dt);
  return alive;
};

test('the same burst number always makes the same burst', () => {
  assert.deepEqual(createBurst(100, 100, 7), createBurst(100, 100, 7));
  assert.notDeepEqual(createBurst(100, 100, 7), createBurst(100, 100, 8));
});

test('a burst has one main colour plus gold glitter, and a sensible number of sparks', () => {
  const sparks = createBurst(0, 0, 3);
  assert.equal(sparks.length, SPARKS);
  const colours = new Set(sparks.map((s) => s.colour));
  assert.ok(colours.size === 2 && colours.has(GLITTER), [...colours].join(', '));
});

test('sparks slow down in the air and droop with gravity, like real ones', () => {
  const spark = createBurst(0, 0, 1).find((s) => Math.abs(s.vx) > 100);
  const fastX = Math.abs(spark.vx);
  run(spark, 0.8);
  assert.ok(Math.abs(spark.vx) < fastX * 0.5, 'slowed down');
  const up = { x: 0, y: 0, vx: 0, vy: -200, colour: '#fff', width: 2, life: 2, age: 0 };
  run(up, 1.5);
  assert.ok(up.vy > 0, 'a spark shot upwards ends up falling');
});

test('every spark fades smoothly (never blinks) and is gone within 2 seconds', () => {
  for (const spark of createBurst(0, 0, 5)) {
    let last = 1;
    let alive = true;
    for (let t = 0; t < MAX_LIFE + 0.1 && alive; t += 1 / 60) {
      alive = stepSpark(spark, 1 / 60);
      const a = sparkAlpha(spark);
      assert.ok(a <= last + 1e-9, 'the brightness only goes down');
      last = a;
    }
    assert.equal(alive, false, 'burnt out');
  }
});

test('the rocket climbs in RISE_SECONDS, and the boom of the sound is timed to the burst', () => {
  assert.equal(rocketY(600, 100, 0), 600);
  assert.equal(rocketY(600, 100, RISE_SECONDS), 100);
  assert.ok(rocketY(600, 100, RISE_SECONDS / 2) < 350, 'fast at first, slower near the top');
  assert.equal(FIREWORK_RISE, RISE_SECONDS);
});
