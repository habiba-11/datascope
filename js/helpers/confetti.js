// Helper layer: the physics of realistic confetti (8 Nov 2026, Habiba: "more
// realistic", and confetti instead of fireworks in the rooms). Like a party
// popper: pieces shoot up from the two bottom corners, air slows them down,
// then they flutter down, flipping like real paper and swaying side to side.
// No DOM here, so it is tested (tests/confetti.test.js); js/confetti.js draws it.

export const GRAVITY = 650; // px per second², pulls every piece down
export const DRAG = 3; // air: the bigger, the faster a piece slows down
export const FADE_SECONDS = 0.7; // a piece fades out over its last 0.7 s
export const SHAPES = ['paper', 'paper', 'paper', 'ribbon', 'dot']; // mostly paper

// One piece from a corner. `side`: 'left' or 'right'. `width`, `height`: the
// window. `random`: Math.random, or a fixed one in the tests.
export function createPiece(side, width, height, colour, random = Math.random) {
  const scale = Math.max(0.6, height / 768); // a taller window, a higher blast
  const angle = ((50 + random() * 30) * Math.PI) / 180; // 50° to 80° above the ground
  const speed = (1900 + random() * 900) * scale; // strong enough to reach the upper half
  const inward = side === 'left' ? 1 : -1; // towards the middle of the screen
  const shape = SHAPES[Math.floor(random() * SHAPES.length)];
  return {
    x: side === 'left' ? random() * width * 0.04 : width - random() * width * 0.04,
    y: height + 10,
    vx: inward * Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    shape,
    colour,
    w: shape === 'ribbon' ? 4 : 8 + random() * 5,
    h: shape === 'ribbon' ? 16 + random() * 8 : 10 + random() * 6,
    turn: random() * Math.PI * 2, // its angle on the screen
    turnSpeed: (random() - 0.5) * 8,
    flip: random() * Math.PI * 2, // its 3D flip (like a coin spinning)
    flipSpeed: 6 + random() * 8,
    sway: random() * Math.PI * 2,
    swaySpeed: 2 + random() * 3,
    age: 0,
    life: 3.2 + random() * 1.4,
  };
}

// Moves one piece on by `dt` seconds (changes it; returns it).
export function stepPiece(p, dt) {
  const slow = Math.exp(-DRAG * dt);
  p.vy = (p.vy + GRAVITY * dt) * slow; // falls, but the air stops it falling fast
  p.vx *= slow;
  p.sway += p.swaySpeed * dt;
  p.x += (p.vx + Math.sin(p.sway) * 40) * dt; // a gentle side-to-side flutter
  p.y += p.vy * dt;
  p.turn += p.turnSpeed * dt;
  p.flip += p.flipSpeed * dt;
  p.age += dt;
  return p;
}

// How see-through: 1 most of its life, then fading to 0 at the end.
export function pieceAlpha(p) {
  return Math.max(0, Math.min(1, (p.life - p.age) / FADE_SECONDS));
}

// The flip as a squash from -1 to 1 (0 = seen edge-on); below 0, its back shows.
export function flipSquash(p) {
  return Math.cos(p.flip);
}

// Finished: faded out, or fallen below the window.
export function isGone(p, height) {
  return p.age >= p.life || (p.y > height + 40 && p.vy > 0);
}
