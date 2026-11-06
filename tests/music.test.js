import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BPM, STEP_SECONDS, STEPS_PER_BAR, BARS, stepNotes, chordOfBar,
} from '../js/helpers/music-score.js';

const LOOP = STEPS_PER_BAR * BARS;

test('a calm tempo: about 104 beats a minute, in eighth notes, 8 bars', () => {
  assert.equal(BPM, 104);
  assert.ok(Math.abs(STEP_SECONDS - 0.2885) < 0.001);
  assert.equal(BARS, 8);
});

test('the chords go C - Am - F - G, twice', () => {
  assert.deepEqual([...Array(BARS).keys()].map(chordOfBar), ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G']);
});

test('it loops: step 64 sounds exactly like step 0', () => {
  for (let i = 0; i < LOOP; i++) assert.deepEqual(stepNotes(i + LOOP), stepNotes(i));
});

test('every bar has a melody, pad chords, a bass and a light beat', () => {
  for (let bar = 0; bar < BARS; bar++) {
    const parts = new Set();
    for (let s = 0; s < STEPS_PER_BAR; s++) stepNotes(bar * STEPS_PER_BAR + s).forEach((n) => parts.add(n.part));
    assert.deepEqual([...parts].sort(), ['bass', 'hat', 'kick', 'melody', 'pad'], `bar ${bar + 1}`);
  }
});

test('the music stays soft: no note is louder than a quiet sound effect', () => {
  for (let i = 0; i < LOOP; i++) {
    for (const n of stepNotes(i)) if (n.volume) assert.ok(n.volume <= 0.13, `step ${i} ${n.part}`);
  }
});
