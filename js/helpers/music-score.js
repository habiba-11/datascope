// Helper layer: the background music's score (Part 43d, Round 4 pilot
// feedback). The same calm, happy loop as the approved story design
// (frames/datascope-story-ui.html, removed 12 Nov 2026; in Git history): 8 bars of C - Am - F - G at
// about 104 beats a minute, with a melody, soft pad chords, a bass and a very
// light beat. No DOM and no sound here (js/music.js plays it), so it is tested.

export const BPM = 104;
export const STEP_SECONDS = 60 / BPM / 2; // one step = an eighth note (0.2885 s)
export const STEPS_PER_BAR = 8;
export const BARS = 8;

// The 4 chords, one per bar, then again: C, Am, F, G.
export const CHORDS = ['C', 'Am', 'F', 'G'];
const PADS = [[262, 330, 392], [220, 262, 330], [220, 262, 349], [196, 247, 294]];
const BASS = [131, 110, 87, 98];

// The melody: bars 1 to 4 (A) and bars 5 to 8 (B), one note (Hz) or a rest (0) per step.
const MELODY_A = [
  [659, 0, 784, 659, 587, 0, 523, 0],
  [523, 0, 659, 523, 440, 0, 523, 0],
  [440, 0, 523, 587, 523, 0, 440, 0],
  [587, 0, 784, 659, 587, 0, 494, 0],
];
const MELODY_B = [
  [784, 0, 880, 784, 659, 0, 784, 0],
  [659, 0, 784, 659, 523, 0, 659, 0],
  [698, 0, 880, 698, 523, 0, 698, 0],
  [587, 659, 784, 0, 659, 587, 523, 0],
];

// Everything that plays on step `i` of the loop (it loops after 64 steps).
// Each note: { part, freq, seconds, volume, wave }. The beat parts: 'kick' and 'hat'.
export function stepNotes(i) {
  const bar = Math.floor(i / STEPS_PER_BAR) % BARS;
  const step = i % STEPS_PER_BAR;
  const chord = bar % CHORDS.length;
  const notes = [];
  const melody = (bar < 4 ? MELODY_A : MELODY_B)[chord][step];
  if (melody) notes.push({ part: 'melody', freq: melody, seconds: 0.34, volume: 0.085, wave: 'triangle' });
  if (step === 0) PADS[chord].forEach((freq) => notes.push({ part: 'pad', freq, seconds: 2.2, volume: 0.035, wave: 'sine' }));
  if (step === 0 || step === 4) {
    notes.push({ part: 'bass', freq: BASS[chord], seconds: 0.5, volume: 0.13, wave: 'sine' });
    notes.push({ part: 'kick' });
  }
  if (step === 3 || step === 7) notes.push({ part: 'bass', freq: BASS[chord] * 2, seconds: 0.2, volume: 0.06, wave: 'sine' });
  if (step % 2 === 1) notes.push({ part: 'hat' });
  return notes;
}

// The chord name of a bar (for the tests).
export function chordOfBar(bar) {
  return CHORDS[bar % CHORDS.length];
}
