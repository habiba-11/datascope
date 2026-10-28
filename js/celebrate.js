// Shell layer: celebrates good reasoning. When the log earns a NEW badge patch
// (helpers/badges.js checkBadges), it is logged once as "badge-earned", the
// "You found a badge!" pop-up shows it (js/badge-popup.js), and when it lands
// in the backpack the counter goes up. A level-up gets Pip's words, confetti
// and a fanfare. All sounds live in js/sounds.js (off by default).
import { checkBadges, earnedPatches, findBadge, levelFor, levelProgress } from './helpers/badges.js';
import { readLog, logEvent } from './helpers/log.js';
import { getExplorerCode, getSoundOn, setSoundOn } from './storage/save.js';
import { playSound } from './sounds.js';
import { pipReacts, confetti, growBar } from './motion.js';
import { setupBadgeShelf } from './badge-shelf.js';
import { showBadgePopup } from './badge-popup.js';
import { BACKPACK_SVG } from './icons.js';
import { currentPhase } from './phase-progress.js';

// How many patches the child has (the backpack counter and the level use this).
export function countBadges() {
  return earnedPatches(readLog(), getExplorerCode()).length;
}

// What the backpack button in the header shows: the backpack, the level, the
// badge count, and a bar showing how close the next level is (words AND a bar).
export function counterHTML(count) {
  const level = levelFor(count);
  const pct = levelProgress(count);
  const barLabel = level.next ? `Progress to ${level.next.name}: ${pct}%` : 'Top level reached';
  return `${BACKPACK_SVG}<span class="backpack-words"><span class="level-name">${level.icon} ${level.name}</span><span>My backpack: <span class="badge-count">${count}</span> badges</span>
    <span class="level-bar" role="progressbar" aria-label="${barLabel}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <span class="level-fill" style="width: ${pct}%"></span>
    </span></span>`;
}

// Called once by mountShell(), after the sidebar exists.
export function setupCelebrations() {
  const code = getExplorerCode();
  setupSoundToggle();
  setupBadgeShelf();
  if (!code) return;

  // An older log may already have earned patches (from before Part 21b).
  // They go in the backpack quietly, marked "backfill", with no pop-up.
  for (const badgeId of checkBadges(readLog(), code)) {
    logEvent('shell', 'badge-earned', { badgeId, phase: currentPhase(), backfill: true });
  }
  let shownCount = countBadges(); // what the counter shows right now

  window.addEventListener('datascope:logged', (event) => {
    const entry = event.detail;
    if (entry.code !== code || entry.type === 'badge-earned') return;
    const newIds = checkBadges(readLog(), code);
    if (newIds.length === 0) return;

    for (const badgeId of newIds) {
      logEvent('shell', 'badge-earned', { badgeId, phase: currentPhase() });
    }
    // Wait a moment, so a feedback card opened by the same tap goes first in
    // the pop-up line (badges-spec.md: badges come after the phase feedback).
    setTimeout(() => {
      for (const badgeId of newIds) {
        showBadgePopup(findBadge(badgeId), () => {
          shownCount += 1;
          landInBackpack(shownCount);
        });
      }
    }, 0);
  });
}

// A badge landed: the counter pops +1, the backpack bumps, the level bar grows.
function landInBackpack(count) {
  const counter = document.getElementById('badge-counter');
  const levelBefore = levelFor(count - 1).name;
  const pctBefore = levelProgress(count - 1);
  const level = levelFor(count);
  counter.innerHTML = counterHTML(count);
  // The bar grows from where it was (a new level starts from 0).
  growBar(counter.querySelector('.level-fill'), level.name !== levelBefore ? 0 : pctBefore);
  restartClass(counter, 'bp-bump');
  restartClass(counter.querySelector('.badge-count'), 'bp-count-pop');

  if (level.name !== levelBefore) {
    pipSays(`Level up: you are now a ${level.icon} ${level.name}!`);
    confetti(); // only now: the badge pop-up (and its own confetti) is closed
    setTimeout(() => playSound('levelUp'), 300);
  }
}

// Plays a CSS animation again, even if it ran before.
function restartClass(element, name) {
  if (!element) return;
  element.classList.remove(name);
  void element.offsetWidth; // makes the browser notice the class came back
  element.classList.add(name);
}

// Pip's speech bubble shows the praise, and Pip does a little hop.
function pipSays(message) {
  document.querySelector('.speech-bubble').textContent = message;
  pipReacts('hop');
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
