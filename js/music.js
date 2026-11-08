// Shell layer: the calm background music (Part 43d, Round 4 pilot feedback).
// The score is in helpers/music-score.js (tested). Habiba's choice: music ON
// by default but quiet, with its own 🎵 switch, separate from the sound effects.
// Made by the browser (Web Audio), so there are no music files. The story
// (Part 44) plays the same loop and turns it down while someone speaks (duckMusic).
import { audioContext } from './sounds.js';
import { getMusicOn, setMusicOn } from './storage/save.js';
import { stepNotes, STEP_SECONDS } from './helpers/music-score.js';
import { setIconText } from './icon-text.js';

export const MUSIC_VOLUME = 0.3; // quiet: about a third of the sound effects
const LOOK_AHEAD = 0.35; // seconds of music planned ahead
const FADE = 1.5; // seconds to fade in or out

let bus = null; // the music's own volume knob
let timer = null;
let step = 0;
let nextTime = 0;

function tone(c, { freq, seconds, volume, wave }, t) {
  const note = c.createOscillator();
  const gain = c.createGain();
  note.type = wave;
  note.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  note.connect(gain).connect(bus);
  note.start(t);
  note.stop(t + seconds + 0.05);
}

// A soft kick: a low note that drops quickly.
function kick(c, t) {
  const note = c.createOscillator();
  const gain = c.createGain();
  note.frequency.setValueAtTime(130, t);
  note.frequency.exponentialRampToValueAtTime(45, t + 0.14);
  gain.gain.setValueAtTime(0.28, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  note.connect(gain).connect(bus);
  note.start(t);
  note.stop(t + 0.2);
}

// A very light hi-hat: a tiny burst of high noise.
function hat(c, t) {
  const length = Math.floor(c.sampleRate * 0.04);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.035, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  source.connect(filter).connect(gain).connect(bus);
  source.start(t);
}

function playStep(c, i, t) {
  for (const n of stepNotes(i)) {
    if (n.part === 'kick') kick(c, t);
    else if (n.part === 'hat') hat(c, t);
    else tone(c, n, t);
  }
}

export function startMusic() {
  if (timer || !getMusicOn()) return;
  const c = audioContext();
  if (!c) return;
  if (c.state !== 'running') c.resume().catch(() => {});
  if (!bus) {
    bus = c.createGain();
    bus.connect(c.destination);
  }
  bus.gain.cancelScheduledValues(c.currentTime);
  bus.gain.setValueAtTime(0.0001, c.currentTime);
  bus.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, c.currentTime + FADE);
  nextTime = c.currentTime + 0.1;
  timer = setInterval(() => {
    // Sound still asleep (no tap yet): wait, and do not pile up notes.
    if (c.state !== 'running') {
      nextTime = c.currentTime + 0.1;
      return;
    }
    while (nextTime < c.currentTime + LOOK_AHEAD) {
      playStep(c, step, nextTime);
      step += 1;
      nextTime += STEP_SECONDS;
    }
  }, 100);
}

export function stopMusic() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  const c = audioContext();
  if (c && bus) bus.gain.setTargetAtTime(0.0001, c.currentTime, FADE / 4);
}

// The story turns the music down by about 70 percent while someone speaks.
export function duckMusic(on) {
  const c = audioContext();
  if (c && bus && timer) bus.gain.setTargetAtTime(on ? MUSIC_VOLUME * 0.3 : MUSIC_VOLUME, c.currentTime, 0.15);
}

// The Music switch in the status line (js/app.js), and starting the music.
export function setupMusic(button) {
  function show() {
    const on = getMusicOn();
    setIconText(button, 'music', on ? 'Music: on' : 'Music: off');
    button.setAttribute('aria-pressed', String(on));
  }
  button.addEventListener('click', () => {
    setMusicOn(!getMusicOn());
    if (getMusicOn()) startMusic(); else stopMusic();
    show();
  });
  show();

  startMusic(); // plays now if the browser allows it, otherwise after the first tap
  document.addEventListener('pointerdown', startMusic, { once: true });
  document.addEventListener('keydown', startMusic, { once: true });
  // No music while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMusic(); else startMusic();
  });
}
