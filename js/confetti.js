// Shell layer: realistic confetti on a canvas over the page (8 Nov 2026,
// Habiba). Two party-popper blasts from the bottom corners; each piece is
// paper, a ribbon or a dot, flips (its back is darker) and sways as it falls.
// The physics is in helpers/confetti.js (tested). The canvas never takes a tap,
// only draws while pieces are in the air, and is emptied when they are gone.
import { createPiece, stepPiece, pieceAlpha, flipSquash, isGone } from './helpers/confetti.js';

const COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude']; // the 5 step colours
const PIECES_PER_SIDE = 80;

let canvas = null;
let ctx = null;
let pieces = [];
let drawing = false;
let lastTime = 0;

function setupCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
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

// The real colours from css/theme.css, so the confetti matches the steps.
function themeColours() {
  const style = getComputedStyle(document.documentElement);
  return COLOURS.map((name) => style.getPropertyValue(`--color-${name}`).trim() || '#FFC531');
}

// Two blasts, one from each bottom corner.
export function blastConfetti() {
  setupCanvas();
  const colours = themeColours();
  for (const side of ['left', 'right']) {
    for (let i = 0; i < PIECES_PER_SIDE; i++) {
      pieces.push(createPiece(side, innerWidth, innerHeight, colours[i % colours.length]));
    }
  }
  if (!drawing) {
    drawing = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
}

function drawPiece(p) {
  const squash = flipSquash(p);
  ctx.save();
  ctx.globalAlpha = pieceAlpha(p);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.turn);
  ctx.scale(1, Math.abs(squash) < 0.08 ? 0.08 : Math.abs(squash)); // thin when edge-on
  ctx.fillStyle = p.colour;
  if (p.shape === 'dot') {
    ctx.beginPath();
    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  }
  // The back of the paper is in shadow: a little darker.
  if (squash < 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    if (p.shape === 'dot') ctx.fill();
    else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  }
  ctx.restore();
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); // a slow frame never makes pieces jump
  lastTime = now;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => !isGone(stepPiece(p, dt), innerHeight));
  pieces.forEach(drawPiece);
  if (pieces.length) {
    requestAnimationFrame(frame);
  } else {
    drawing = false;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}
