// Shell layer: every sound effect in DataScope, in one place.
// Sounds are made by the browser (Web Audio), so there are no sound files.
// They play unless the child turned sound off (on by default, CLAUDE.md).
import { getSoundOn } from './storage/save.js';
import { RISE_SECONDS, seededRandom } from './helpers/fireworks.js';

let audio = null; // one shared AudioContext, made on the first sound

// Each sound is a short list of notes: [frequency in Hz, start in seconds, length in seconds].
// "wave" changes the feel: 'sine' is soft, 'triangle' is a bit brighter.
export const SOUNDS = {
  correct: { wave: 'triangle', volume: 0.12, notes: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.25]] },
  tryAgain: { wave: 'sine', volume: 0.1, notes: [[392, 0, 0.15], [330, 0.15, 0.25]] }, // gentle, not a buzzer
  badge: { wave: 'sine', volume: 0.15, notes: [[660, 0, 0.3], [880, 0.12, 0.3]] },
  badgeFound: { wave: 'triangle', volume: 0.18, notes: [[523, 0, 0.5], [659, 0.12, 0.5], [784, 0.24, 0.5]] }, // a badge pop-up's stamp
  tick: { wave: 'sine', volume: 0.06, notes: [[880, 0, 0.04]] },
  levelUp: { wave: 'triangle', volume: 0.12, notes: [[392, 0, 0.1], [523, 0.1, 0.1], [659, 0.2, 0.1], [784, 0.3, 0.1], [1047, 0.4, 0.2], [784, 0.6, 0.1], [1047, 0.7, 0.4]] },
  done: { wave: 'triangle', volume: 0.12, notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.35]] },
  // The sounds below follow a motion, so their timing matches it (4 Nov 2026).
  // The motions are in js/chance-devices.js (MOTION_MS).
  // Spinner: the needle turns for 2.4 s and slows down (cubic-bezier .12,.7,.15,1).
  // A tick each time it passes a slice line, so the ticks get further apart,
  // then a note when it has stopped.
  spin: {
    wave: 'triangle',
    volume: 0.07,
    notes: [[520, 0, 0.04], [520, 0.06, 0.04], [520, 0.12, 0.04], [520, 0.2, 0.04], [520, 0.3, 0.04], [520, 0.37, 0.04],
      [520, 0.46, 0.04], [520, 0.59, 0.04], [520, 0.78, 0.04], [520, 1.11, 0.04], [784, 2.35, 0.25]],
  },
  // Coin: 1.3 s, highest at 0.58 s (rising whoosh), falling, then one clack when it lands.
  flip: {
    wave: 'triangle',
    volume: 0.07,
    notes: [[400, 0, 0.1], [500, 0.15, 0.1], [600, 0.3, 0.1], [700, 0.45, 0.12], [600, 0.72, 0.1], [500, 0.95, 0.1], [262, 1.27, 0.14]],
  },
  // Dice: 1.4 s of tumbling (clicks), then a clack when it lands.
  roll: {
    wave: 'triangle',
    volume: 0.07,
    notes: [[330, 0, 0.05], [370, 0.16, 0.05], [330, 0.34, 0.05], [370, 0.52, 0.05], [330, 0.72, 0.05], [370, 0.94, 0.05], [262, 1.37, 0.14]],
  },
  land: { wave: 'triangle', volume: 0.07, notes: [[784, 0, 0.2]] }, // reduced motion: the result just appears
  stamp: { wave: 'sine', volume: 0.2, notes: [[180, 0, 0.12], [120, 0.03, 0.2]] }, // a soft thud
  // Every confetti burst plays this sparkle (motion.js confetti), so confetti is
  // never silent (Habiba, 4 Nov 2026: "sometimes it has sound, sometimes not").
  confetti: { wave: 'triangle', volume: 0.08, notes: [[1047, 0, 0.12], [1319, 0.07, 0.12], [1568, 0.14, 0.12], [2093, 0.21, 0.3]] },
  // Part 43c: Pip's own sounds with a line (helpers/pip-lines.js PIP_EVENTS).
  // A soft owl "hoo-HOO" going UP (a room opens). It used to go down, from the
  // same note to the same note as tryAgain, so a new room sounded like a
  // mistake (Habiba, 6 Nov 2026). Now only "try again" goes down (tested).
  hoot: { wave: 'sine', volume: 0.1, notes: [[440, 0, 0.18], [587, 0.22, 0.3]] },
  // Part 44: Sara's little chirp with her lines in the story (when read-aloud is off).
  sara: { wave: 'triangle', volume: 0.07, notes: [[620, 0, 0.07], [780, 0.08, 0.07], [700, 0.16, 0.09]] },
  // Pip winks when a hint is used: a quick bright blink of sound.
  wink: { wave: 'triangle', volume: 0.06, notes: [[1319, 0, 0.06], [1568, 0.08, 0.09]] },
  // Part 43d: a very soft tap for every button press, and a whoosh when a new room opens.
  tap: { wave: 'sine', volume: 0.04, notes: [[700, 0, 0.05]] },
  whoosh: { wave: 'sine', volume: 0.05, notes: [[300, 0, 0.06], [420, 0.04, 0.06], [560, 0.08, 0.06], [740, 0.12, 0.07], [960, 0.16, 0.1]] },
  // Every badge that lands in the backpack: a soft "pop" in.
  badgeLand: { wave: 'sine', volume: 0.15, notes: [[440, 0, 0.08], [880, 0.06, 0.2]] },
};

// The browser may keep sound "asleep" on a page until the child taps it. Each
// page wakes it on its first tap, so the sounds after that always play.
globalThis.document?.addEventListener('pointerdown', () => {
  if (!getSoundOn()) return;
  try {
    audio = audio || new AudioContext();
    if (audio.state === 'suspended') audio.resume();
  } catch {
    // No sound support.
  }
}, { once: true });

// If the sound is still asleep, it gets a short moment to wake up. It is never
// played late: the waiting time is taken off every note, and a note whose
// moment has passed is skipped (so the sound always matches its motion).
const WAKE_MS = 250;

// The only sounds that may end lower than they start: a gentle "try again",
// and the chance devices and the stamp landing with a thud. Every other sound
// means "good" or "here we go", so it goes up or stays (tests/sounds.test.js).
export const FALLING_SOUNDS = ['tryAgain', 'stamp', 'flip', 'roll'];

// The one shared AudioContext (js/music.js plays the music on it too), or null.
export function audioContext() {
  try {
    audio = audio || new AudioContext();
    return audio;
  } catch {
    return null;
  }
}

// Part 44c: a little tune made on the spot (the story's scene sound effects,
// js/story-sounds.js), with the same rules as every sound here.
export function playTune(sound) {
  play(sound);
}

// Part 44c: claps (the class cheers Sara): short soft bursts of noise.
export function playClaps(at = 0, count = 6) {
  if (!getSoundOn()) return;
  const c = audioContext();
  if (!c || c.state !== 'running') return;
  try {
    for (let i = 0; i < count; i++) noiseBurst(c, c.destination, c.currentTime + at + i * 0.14, 0.07, 0.2, 'bandpass', 1800, 900);
  } catch {
    // No sound support.
  }
}

export function playSound(name) {
  play(SOUNDS[name]);
}

// The stars on the end-of-phase card (feedback-card.js): all 3 stars pop in,
// at 0.75 s, 1.05 s and 1.35 s, and each pop has a note: a bright rising one
// for an earned star, a soft low one for an empty star. So every card has the
// same rhythm, and the notes are timed together by the sound clock (exact),
// not by 3 separate timers (they can drift). Reduced motion: one "done" tune.
export const STAR_TIMES = [0.75, 1.05, 1.35];
const STAR_NOTES = [659, 784, 1047];

export function playStars(count) {
  play({
    wave: 'triangle',
    volume: 0.1,
    notes: STAR_TIMES.map((time, i) => (i < count ? [STAR_NOTES[i], time, i === 2 ? 0.3 : 0.18] : [262, time, 0.12, 0.04])),
  });
}

// A real firework, heard from a little way off (Round 4; changed 6 Nov 2026,
// Habiba: the first one, a whistle tone and a bang, was "unrealistic and
// annoying"). Made from noise, not tones: a soft launch thump and an airy hiss
// as the rocket climbs, then a deep boom with an echo (reverb), then scattered
// crackles spread left and right. The crackles come from a fixed pattern, so
// every firework sounds the same (the same moment always sounds the same).
// `at`: seconds from now when the rocket LAUNCHES (the boom is FIREWORK_RISE
// later, when the sparks burst). `far`: true for the gentle, far-off finale loop.
export const FIREWORK_RISE = RISE_SECONDS;
const crackleRandom = seededRandom(2026);
export const FIREWORK_CRACKLES = Array.from({ length: 28 }, () => ({
  time: 0.3 + crackleRandom() * 1.3,
  pan: crackleRandom() * 1.6 - 0.8,
})).sort((a, b) => a.time - b.time);

let noiseBuffer = null;
let echo = null; // one reverb for every firework

function noiseSource(c) {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); // 2 s of noise, made once
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = noiseBuffer;
  return source;
}

// The echo of an open sky: a short, softly fading reverb.
function echoInput(c) {
  if (!echo) {
    const seconds = 2.2;
    const impulse = c.createBuffer(2, c.sampleRate * seconds, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
    }
    echo = c.createConvolver();
    echo.buffer = impulse;
    const wet = c.createGain();
    wet.gain.value = 0.5;
    echo.connect(wet).connect(c.destination);
  }
  return echo;
}

// A burst of filtered noise from t for `seconds`, fading out, into `out`.
function noiseBurst(c, out, t, seconds, volume, type, from, to, pan = 0) {
  const source = noiseSource(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + seconds);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  let node = source.connect(filter).connect(gain);
  if (pan && c.createStereoPanner) {
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    node = node.connect(panner);
  }
  node.connect(out);
  source.start(t, Math.random()); // a different slice of the noise each time
  source.stop(t + seconds + 0.05);
}

export function playFirework(at = 0, far = false) {
  if (!getSoundOn()) return;
  const c = audioContext();
  if (!c) return;
  if (c.state !== 'running') {
    c.resume().catch(() => {}); // still asleep (no tap yet): this one is skipped, never late
    return;
  }
  try {
    const t = c.currentTime + at;
    // Everything goes through one soft "distance" filter: far away = duller and quieter.
    const out = c.createGain();
    out.gain.value = far ? 0.45 : 0.8;
    const distance = c.createBiquadFilter();
    distance.type = 'lowpass';
    distance.frequency.value = far ? 1800 : 5000;
    out.connect(distance);
    distance.connect(c.destination);
    distance.connect(echoInput(c));

    // Launch: a soft low thump, then an airy hiss while the rocket climbs.
    const launch = c.createOscillator();
    const launchGain = c.createGain();
    launch.frequency.setValueAtTime(140, t);
    launch.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    launchGain.gain.setValueAtTime(0.12, t);
    launchGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    launch.connect(launchGain).connect(out);
    launch.start(t);
    launch.stop(t + 0.2);
    noiseBurst(c, out, t + 0.02, FIREWORK_RISE, 0.03, 'bandpass', 1200, 3200);

    // The boom: deep noise and a sub-bass drop, with the echo of the open sky.
    const boom = t + FIREWORK_RISE;
    noiseBurst(c, out, boom, 1.4, 0.5, 'lowpass', 1400, 120);
    const sub = c.createOscillator();
    const subGain = c.createGain();
    sub.frequency.setValueAtTime(75, boom);
    sub.frequency.exponentialRampToValueAtTime(35, boom + 0.6);
    subGain.gain.setValueAtTime(0.0001, boom);
    subGain.gain.exponentialRampToValueAtTime(0.35, boom + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.0001, boom + 0.7);
    sub.connect(subGain).connect(out);
    sub.start(boom);
    sub.stop(boom + 0.75);

    // The crackles: tiny sharp pops as the glitter burns, spread left and right.
    for (const { time, pan } of FIREWORK_CRACKLES) noiseBurst(c, out, boom + time, 0.025, 0.12, 'highpass', 3000, 5000, pan);
  } catch {
    // No sound support: the fireworks still show.
  }
}

function play(sound) {
  if (!sound || !getSoundOn()) return;
  try {
    audio = audio || new AudioContext();
    if (audio.state !== 'running') {
      const asked = performance.now();
      const waking = audio.resume().catch(() => {});
      Promise.race([waking, new Promise((r) => { setTimeout(r, WAKE_MS); })])
        .then(() => { if (audio.state === 'running') playNotes(sound, (performance.now() - asked) / 1000); });
      return;
    }
    playNotes(sound, 0);
  } catch {
    // No sound support: everything else still works.
  }
}

// Each note: [frequency in Hz, start in seconds, length in seconds, volume (optional)].
// `late`: how many seconds have passed since the sound was asked for.
function playNotes(sound, late) {
  try {
    for (const [frequency, offset, length, noteVolume] of sound.notes) {
      if (offset < late) continue; // its moment has passed: skipped, never late
      const note = audio.createOscillator();
      const volume = audio.createGain();
      const start = audio.currentTime + offset - late;
      note.type = sound.wave;
      note.frequency.value = frequency;
      volume.gain.setValueAtTime(noteVolume ?? sound.volume, start);
      volume.gain.exponentialRampToValueAtTime(0.001, start + length); // fade out, no click
      note.connect(volume).connect(audio.destination);
      note.start(start);
      note.stop(start + length);
    }
  } catch {
    // No sound support: everything else still works.
  }
}
