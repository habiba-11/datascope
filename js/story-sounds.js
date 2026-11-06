// Shell layer: the story's scene sound effects (Part 44c), from the approved
// design (docs/design/frames/datascope-story-ui.html): pops as things appear,
// a ding, Sara writing, a yawn, the bars growing, the die rattling, the stamp,
// a fanfare, claps and a chime. Which line gets which: STORY_EFFECTS in
// helpers/story.js (tested). They follow the sound switch like every sound.
import {
  playTune, playClaps, playSound, playYawn, YAWN_SECONDS,
} from './sounds.js';

const EFFECTS = {
  // A quick bubbly pop, rising (something appears).
  pop: (at, f = 560) => playTune({ wave: 'sine', volume: 0.12, notes: [[f, at, 0.06], [Math.round(f * 1.7), at + 0.05, 0.08]] }),
  // Sara's pencil: three tiny ticks.
  ticks: (at) => playTune({ wave: 'square', volume: 0.03, notes: [[900, at, 0.05], [1000, at + 0.06, 0.05], [900, at + 0.12, 0.05]] }),
  // A real-sounding yawn (sounds.js playYawn).
  yawn: (at) => playYawn(at),
  ding: (at) => playTune({ wave: 'sine', volume: 0.12, notes: [[880, at, 0.4], [1320, at + 0.02, 0.4, 0.06]] }),
  // The bars grow: five notes going up.
  grow: (at) => playTune({ wave: 'sine', volume: 0.09, notes: [262, 330, 392, 523, 660].map((f, i) => [f, at + i * 0.2, 0.18]) }),
  // The die rattles: nine little knocks.
  rattle: (at) => playTune({ wave: 'square', volume: 0.03, notes: Array.from({ length: 9 }, (_, i) => [180 + (i % 3) * 40, at + i * 0.1, 0.06]) }),
  stamp: () => playSound('stamp'),
  fanfare: (at) => playTune({
    wave: 'triangle',
    volume: 0.12,
    notes: [[523, at, 0.18], [659, at + 0.13, 0.18], [784, at + 0.26, 0.18], [1047, at + 0.39, 0.7],
      ...Array.from({ length: 6 }, (_, i) => [1500 + i * 220, at + 0.55 + i * 0.07, 0.12, 0.05])],
  }),
  clap: (at) => playClaps(at),
  chime: (at) => playTune({ wave: 'sine', volume: 0.1, notes: [523, 659, 784, 1047, 1318].map((f, i) => [f, at + i * 0.09, 0.3]) }),
};

// Plays a line's effects: a list of [effect, seconds from now, (pop) note].
export function playStoryEffects(effects = []) {
  for (const [name, at, note] of effects) EFFECTS[name](at, note);
}

// How long an effect lasts (for the yawning mouth).
export const EFFECT_SECONDS = { yawn: YAWN_SECONDS };

// The start of the story (a chime) and its happy end (a fanfare).
export function playStoryStart() {
  EFFECTS.chime(0);
}

export function playStoryEnd() {
  EFFECTS.fanfare(0);
}
