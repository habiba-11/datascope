import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPiece, stepPiece, pieceAlpha, flipSquash, isGone, SHAPES,
} from '../js/helpers/confetti.js';

const W = 1366;
const H = 768;
const fixed = (value) => () => value;

// Runs a piece on for `seconds`, in 60 frames per second.
function run(piece, seconds) {
  for (let t = 0; t < seconds; t += 1 / 60) stepPiece(piece, 1 / 60);
  return piece;
}

test('confetti shoots up and inwards from the two bottom corners', () => {
  const left = createPiece('left', W, H, '#f00', fixed(0.5));
  const right = createPiece('right', W, H, '#f00', fixed(0.5));
  assert.ok(left.x < W * 0.05 && right.x > W * 0.95, 'starts in the corners');
  assert.ok(left.y > H && right.y > H, 'starts just below the window');
  assert.ok(left.vy < 0 && right.vy < 0, 'goes up');
  assert.ok(left.vx > 0 && right.vx < 0, 'goes towards the middle');
});

test('it rises high enough to be seen, then falls slowly like paper', () => {
  for (const r of [0, 0.5, 0.99]) {
    const piece = createPiece('left', W, H, '#f00', fixed(r));
    let highest = piece.y;
    for (let t = 0; t < 1.2; t += 1 / 60) {
      stepPiece(piece, 1 / 60);
      highest = Math.min(highest, piece.y);
    }
    assert.ok(highest < H * 0.6, `reaches the upper part of the screen (r=${r}, top=${Math.round(highest)})`);
    assert.ok(highest > -H * 0.2, `does not fly far off the top (r=${r})`);
    run(piece, 1.5);
    assert.ok(piece.vy > 0 && piece.vy < 260, `flutters down slowly (vy=${Math.round(piece.vy)})`);
  }
});

test('each piece flips (its back shows) and fades out at the end of its life', () => {
  const piece = createPiece('right', W, H, '#f00', fixed(0.3));
  const squashes = [];
  for (let t = 0; t < 1; t += 1 / 60) squashes.push(flipSquash(stepPiece(piece, 1 / 60)));
  assert.ok(squashes.some((s) => s < 0) && squashes.some((s) => s > 0), 'shows front and back');
  assert.equal(pieceAlpha(createPiece('left', W, H, '#f00', fixed(0.3))), 1);
  run(piece, piece.life);
  assert.equal(pieceAlpha(piece), 0);
  assert.ok(isGone(piece, H));
});

test('paper, ribbons and dots, mostly paper', () => {
  assert.ok(SHAPES.includes('paper') && SHAPES.includes('ribbon') && SHAPES.includes('dot'));
  assert.ok(SHAPES.filter((s) => s === 'paper').length > SHAPES.length / 2);
});
