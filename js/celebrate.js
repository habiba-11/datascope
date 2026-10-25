// Shell layer: celebrates good reasoning. When a NEW badge is earned, the
// counter goes up, Pip says what was good, stars burst and (if turned on) a
// soft "ding" plays (all sounds live in js/sounds.js).
// Badges come from the log (js/helpers/badges.js).
import { badgeKey, badgeType, earnedBadges, badgeMessage, levelFor, levelProgress } from './helpers/badges.js';
import { readLog } from './helpers/log.js';
import { getExplorerCode, getSoundOn, setSoundOn } from './storage/save.js';
import { playSound } from './sounds.js';
import { pipReacts, confetti, growBar } from './motion.js';
import { setupBadgeShelf } from './badge-shelf.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function countBadges() {
  return earnedBadges(readLog(), getExplorerCode()).size;
}

// What the badge button in the sidebar shows: the level, the badge count, and
// a bar showing how close the next level is (always words AND a bar).
export function counterHTML(count) {
  const level = levelFor(count);
  const pct = levelProgress(count);
  const barLabel = level.next ? `Progress to ${level.next.name}: ${pct}%` : 'Top level reached';
  return `<span class="level-name">${level.icon} ${level.name}</span><span>⭐ Badges: ${count}</span>
    <span class="level-bar" role="progressbar" aria-label="${barLabel}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <span class="level-fill" style="width: ${pct}%"></span>
    </span>`;
}

// Called once by mountShell(), after the sidebar exists.
export function setupCelebrations() {
  const code = getExplorerCode();
  const earned = earnedBadges(readLog(), code);
  setupSoundToggle();
  setupBadgeShelf();

  window.addEventListener('datascope:logged', (event) => {
    const entry = event.detail;
    const key = badgeKey(entry);
    if (!key || entry.code !== code || earned.has(key)) return;

    const levelBefore = levelFor(earned.size).name;
    const pctBefore = levelProgress(earned.size);
    earned.add(key);
    const level = levelFor(earned.size);
    const counter = document.getElementById('badge-counter');
    counter.innerHTML = counterHTML(earned.size);
    // The bar grows from where it was (a new level starts from 0).
    growBar(counter.querySelector('.level-fill'), level.name !== levelBefore ? 0 : pctBefore);
    starBurst(counter);

    const type = badgeType(key);
    // A short wait before each sound, so it doesn't clash with the room's own "correct" chime.
    if (level.name !== levelBefore) {
      pipSays(`${type.icon} ${type.name} badge! Level up: you are now a ${level.icon} ${level.name}!`);
      confetti();
      setTimeout(() => playSound('levelUp'), 600);
    } else {
      pipSays(`${type.icon} ${type.name} badge! ${badgeMessage(entry)}`);
      setTimeout(() => playSound('badge'), 600);
    }
  });
}

// Pip's speech bubble shows the praise, and Pip does a little hop.
function pipSays(message) {
  document.querySelector('.speech-bubble').textContent = message;
  pipReacts('hop');
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
    playSound('badge'); // a sample, so the child knows what it sounds like
  });
  show();
}
