import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOUNDS, FALLING_SOUNDS, FIREWORK_RISE, FIREWORK_CRACKLES } from '../js/sounds.js';
import { PIP_EVENTS } from '../js/helpers/pip-lines.js';

const first = (s) => s.notes[0][0];
const last = (s) => s.notes[s.notes.length - 1][0];

test('only "try again" and the chance devices / stamp go down; every other sound goes up or stays', () => {
  // Bug (Habiba, 6 Nov 2026): the hoot for a new room went down like "try again".
  for (const [name, sound] of Object.entries(SOUNDS)) {
    if (FALLING_SOUNDS.includes(name)) continue;
    assert.ok(last(sound) >= first(sound), `${name} goes down: ${first(sound)} -> ${last(sound)} Hz`);
  }
  assert.ok(last(SOUNDS.tryAgain) < first(SOUNDS.tryAgain), 'try again stays a gentle fall');
});

test('no other sound starts like "try again" (so nothing good sounds like a mistake)', () => {
  const [a, b] = SOUNDS.tryAgain.notes;
  for (const [name, sound] of Object.entries(SOUNDS)) {
    if (name === 'tryAgain' || sound.notes.length < 2) continue;
    const same = sound.notes[0][0] === a[0] && sound.notes[1][0] === b[0];
    assert.equal(same, false, `${name} starts like try again`);
  }
});

test("every sound Pip uses exists, and there is no bird sound (birds were removed)", () => {
  for (const { sound } of Object.values(PIP_EVENTS)) if (sound) assert.ok(SOUNDS[sound], sound);
  assert.equal(Object.keys(SOUNDS).some((n) => /bird|chirp/i.test(n)), false);
});

test('sounds stay gentle: no sound is louder than the badge stamp', () => {
  for (const [name, sound] of Object.entries(SOUNDS)) assert.ok(sound.volume <= 0.2, name);
});

test('a firework always sounds the same: launch, boom after the climb, then a fixed crackle pattern', () => {
  assert.equal(FIREWORK_RISE, 0.6);
  assert.equal(FIREWORK_CRACKLES.length, 28);
  const times = FIREWORK_CRACKLES.map((c) => c.time);
  assert.deepEqual([...times].sort((a, b) => a - b), times, 'in time order');
  assert.ok(FIREWORK_CRACKLES.every((c) => c.time > 0 && c.time < 2 && Math.abs(c.pan) <= 0.8));
});
