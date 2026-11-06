// Shell layer: realistic fireworks on a canvas behind the cards (Round 4;
// changed 6 Nov 2026, Habiba: the first ones looked cartoonish). A rocket
// rises with a glowing trail, then bursts into sparks that streak out, slow
// down, droop and fade, with gold glitter. No outlines. The physics is in
// helpers/fireworks.js (tested); the sound in sounds.js playFirework.
// The canvas sits behind the cards (z-index -1) and never takes a tap. It only
// draws while something is in the air, and the browser pauses it in a hidden tab.
import {
  createBurst, stepSpark, sparkAlpha, rocketY, RISE_SECONDS,
} from './helpers/fireworks.js';

let canvas = null;
let ctx = null;
let sparks = [];
let rockets = [];
let drawing = false;
let lastTime = 0;

function setupCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'firework-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas); // after the hills, so the sparks show over them
  ctx = canvas.getContext('2d');
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
}

// A rocket launches at screen point (x) and bursts at height y, `delay` seconds from now.
// `seed` picks the burst (its colour and shape), so the same number looks the same.
export function launchFirework(x, y, seed, delay = 0) {
  setupCanvas();
  setTimeout(() => {
    rockets.push({ x, fromY: innerHeight + 10, toY: y, age: 0, seed });
    startDrawing();
  }, delay * 1000);
}

function startDrawing() {
  if (drawing) return;
  drawing = true;
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); // a slow frame never makes sparks jump
  lastTime = now;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.lineCap = 'round';

  // Rockets: a bright head with a fading gold trail; at the top, they burst.
  rockets = rockets.filter((r) => {
    r.age += dt;
    const y = rocketY(r.fromY, r.toY, r.age);
    const trail = ctx.createLinearGradient(r.x, y, r.x, y + 46);
    trail.addColorStop(0, 'rgba(255, 197, 49, 0.95)');
    trail.addColorStop(1, 'rgba(255, 197, 49, 0)');
    ctx.strokeStyle = trail;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r.x, y + 46);
    ctx.lineTo(r.x, y);
    ctx.stroke();
    if (r.age < RISE_SECONDS) return true;
    sparks.push(...createBurst(r.x, r.toY, r.seed));
    return false;
  });

  // Sparks: a short streak along their path, fading as they burn out.
  sparks = sparks.filter((s) => {
    const alive = stepSpark(s, dt);
    if (!alive) return false;
    ctx.globalAlpha = sparkAlpha(s);
    ctx.strokeStyle = s.colour;
    ctx.lineWidth = s.width;
    // A soft glow around each spark, so it shines on the light sky.
    ctx.shadowColor = s.colour;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(s.x - s.vx * 0.05, s.y - s.vy * 0.05);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    return true;
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  if (rockets.length || sparks.length) requestAnimationFrame(frame);
  else {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    drawing = false; // nothing in the air: stop drawing until the next rocket
  }
}
