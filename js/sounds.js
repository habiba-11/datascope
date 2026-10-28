// Shell layer: every sound effect in DataScope, in one place.
// Sounds are made by the browser (Web Audio), so there are no sound files.
// They only play if the child turned sound on (off by default, CLAUDE.md).
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
  spin: { wave: 'triangle', volume: 0.07, notes: [[300, 0, 0.05], [360, 0.07, 0.05], [420, 0.14, 0.05], [480, 0.21, 0.05], [540, 0.28, 0.12]] },
};

export function playSound(name) {
  const sound = SOUNDS[name];
  if (!sound || !getSoundOn()) return;
  try {
    audio = audio || new AudioContext();
    for (const [frequency, offset, length] of sound.notes) {
      const note = audio.createOscillator();
      const volume = audio.createGain();
      const start = audio.currentTime + offset;
      note.type = sound.wave;
      note.frequency.value = frequency;
      volume.gain.setValueAtTime(sound.volume, start);
      volume.gain.exponentialRampToValueAtTime(0.001, start + length); // fade out, no click
      note.connect(volume).connect(audio.destination);
      note.start(start);
      note.stop(start + length);
    }
  } catch {
    // No sound support: everything else still works.
  }
}
