// Shell layer: celebrates good reasoning. When a NEW badge is earned, the
// counter goes up, Pip says what was good, stars burst and (if turned on) a
// soft "ding" plays. Badges come from the log (js/helpers/badges.js).
import { badgeKey, earnedBadges, badgeMessage } from './helpers/badges.js';
import { readLog } from './helpers/log.js';
import { getExplorerCode, getSoundOn, setSoundOn } from './storage/save.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function countBadges() {
  return earnedBadges(readLog(), getExplorerCode()).size;
}

// Called once by mountShell(), after the sidebar exists.
export function setupCelebrations() {
  const code = getExplorerCode();
  const earned = earnedBadges(readLog(), code);
  setupSoundToggle();

  window.addEventListener('datascope:logged', (event) => {
    const entry = event.detail;
    const key = badgeKey(entry);
    if (!key || entry.code !== code || earned.has(key)) return;

    earned.add(key);
    document.getElementById('badge-counter').textContent = `⭐ Explorer badges: ${earned.size}`;
    pipSays(badgeMessage(entry));
    starBurst(document.getElementById('badge-counter'));
    if (getSoundOn()) ding();
  });
}

// Pip's speech bubble shows the praise, and Pip does a little hop.
function pipSays(message) {
  document.querySelector('.speech-bubble').textContent = message;
  const pip = document.querySelector('.pip-mascot');
  pip.classList.remove('hop');
  void pip.offsetWidth; // restart the animation if it is already running
  pip.classList.add('hop');
}

// Eight stars fly out from the badge counter and fade away.
function starBurst(anchor) {
  if (reduceMotion()) return;
  for (let i = 0; i < 8; i++) {
    const star = document.createElement('span');
    star.className = 'burst-star';
    star.textContent = '⭐';
    star.setAttribute('aria-hidden', 'true');
    const angle = (i / 8) * 2 * Math.PI;
    star.style.setProperty('--dx', `${Math.cos(angle) * 70}px`);
    star.style.setProperty('--dy', `${Math.sin(angle) * 70}px`);
    anchor.append(star);
    star.addEventListener('animationend', () => star.remove());
  }
}

// A soft two-note "ding" made by the browser itself (no sound file needed).
function ding() {
  try {
    const audio = new AudioContext();
    [660, 880].forEach((frequency, i) => {
      const note = audio.createOscillator();
      const volume = audio.createGain();
      const start = audio.currentTime + i * 0.12;
      note.frequency.value = frequency;
      volume.gain.setValueAtTime(0.15, start);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      note.connect(volume).connect(audio.destination);
      note.start(start);
      note.stop(start + 0.3);
    });
  } catch {
    // No sound support: the stars and Pip's message still show.
  }
}

// The "Sound: off / on" button in the sidebar. Off by default.
function setupSoundToggle() {
  const button = document.getElementById('sound-toggle');
  function show() {
    const on = getSoundOn();
    button.textContent = on ? '🔊 Sound: on' : '🔇 Sound: off';
    button.setAttribute('aria-pressed', String(on));
  }
  button.addEventListener('click', () => {
    setSoundOn(!getSoundOn());
    show();
    if (getSoundOn()) ding(); // a sample, so the child knows what it sounds like
  });
  show();
}
