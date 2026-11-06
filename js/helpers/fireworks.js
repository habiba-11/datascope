// Helper layer: realistic fireworks (Round 4, Habiba 6 Nov 2026: "more
// realistic, less cartoonish"). A rocket rises, then bursts into sparks that
// fly out, slow down in the air, droop with gravity and fade, with some gold
// glitter. Only the physics is here (no DOM), so it is tested
// (tests/fireworks.test.js); js/fireworks.js draws it on a canvas.

export const RISE_SECONDS = 0.6; // the rocket climbs, then bursts (the sound's boom is timed to this)
export const GRAVITY = 150; // px per second², pulls the sparks down
export const AIR = 0.3; // how much speed is left after 1 second in the air
export const SPARKS = 70; // per burst
export const MAX_LIFE = 2; // seconds: every spark is gone by then

// Real firework colours (no outlines): one main colour per burst, plus gold glitter.
export const COLOURS = ['#FF5E5B', '#3DCB6C', '#3B9CFF', '#B57BFF', '#FF8FD1', '#FF9F1C'];
export const GLITTER = '#FFC531';

// A small seeded random generator (mulberry32), so the same burst number
// always makes the same burst (tests can check it, and it never looks broken).
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The sparks of one burst at (x, y). Each spark: position, speed (px/s),
// colour, width, life (s), age (s).
export function createBurst(x, y, seed) {
  const random = seededRandom(seed);
  const colour = COLOURS[seed % COLOURS.length];
  const sparks = [];
  for (let i = 0; i < SPARKS; i++) {
    const glitter = random() < 0.25;
    const angle = (i / SPARKS) * 2 * Math.PI + random() * 0.2;
    const speed = (glitter ? 120 : 200) + random() * 130;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      colour: glitter ? GLITTER : colour,
      width: glitter ? 2 : 3.2,
      life: (glitter ? 1.5 : 1.1) + random() * 0.5,
      age: 0,
    });
  }
  return sparks;
}

// Moves a spark on by dt seconds: the air slows it, gravity pulls it down.
// Returns false when it has burnt out.
export function stepSpark(spark, dt) {
  const keep = AIR ** dt;
  spark.vx *= keep;
  spark.vy = spark.vy * keep + GRAVITY * dt;
  spark.x += spark.vx * dt;
  spark.y += spark.vy * dt;
  spark.age += dt;
  return spark.age < spark.life;
}

// How bright a spark is (1 to 0): it fades smoothly, never blinks.
export function sparkAlpha(spark) {
  return Math.max(0, 1 - spark.age / spark.life) ** 1.5;
}

// Where the rocket is after `age` seconds of its climb from `fromY` to `toY`
// (it slows down near the top, like a real rocket).
export function rocketY(fromY, toY, age) {
  const t = Math.min(1, age / RISE_SECONDS);
  return fromY + (toY - fromY) * (1 - (1 - t) ** 2);
}
