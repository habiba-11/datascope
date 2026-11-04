// Shell layer: every sound effect in DataScope, in one place.
// Sounds are made by the browser (Web Audio), so there are no sound files.
// They play unless the child turned sound off (on by default, CLAUDE.md).
import { getSoundOn } from './storage/save.js';

let audio = null; // one shared AudioContext, made on the first sound

// Each sound is a short list of notes: [frequency in Hz, start in seconds, length in seconds].
// "wave" changes the feel: 'sine' is soft, 'triangle' is a bit brighter.
const SOUNDS = {
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
