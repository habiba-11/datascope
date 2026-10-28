// Shell layer: celebrates good reasoning. When the log earns a NEW badge patch
// (helpers/badges.js checkBadges), it is logged once as "badge-earned", the
// "You found a badge!" pop-up shows it (js/badge-popup.js), and when it lands
// in the backpack the counter goes up. A level-up gets Pip's words, confetti
// and a fanfare. All sounds live in js/sounds.js (off by default).
import { checkBadges, earnedPatches, findBadge, levelFor } from './helpers/badges.js';
import { readLog, logEvent } from './helpers/log.js';
import { getExplorerCode, getSoundOn, setSoundOn } from './storage/save.js';
import { playSound } from './sounds.js';
import { pipReacts, confetti } from './motion.js';
import { setupBadgeShelf } from './badge-shelf.js';
import { showBadgePopup } from './badge-popup.js';
import { BACKPACK_SVG } from './icons.js';
import { currentPhase } from './phase-progress.js';
import { pipSay } from './pip.js';

// How many patches the child has (the backpack counter and the level use this).
export function countBadges() {
  return earnedPatches(readLog(), getExplorerCode()).length;
}

// What the backpack button in the top bar shows: the backpack and the badge
// count. Its name for screen readers says it in words (backpackLabel).
// The level and its bar are inside the backpack shelf (js/badge-shelf.js).
export function counterHTML(count) {
  return `${BACKPACK_SVG}<span class="badge-count">${count}</span>`;
}

export function backpackLabel(count) {
  return `My backpack: ${count} badge${count === 1 ? '' : 's'}. ${levelFor(count).name}.`;
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

// A badge landed: the counter pops +1 and the backpack bumps.
function landInBackpack(count) {
  const counter = document.getElementById('badge-counter');
  const levelBefore = levelFor(count - 1).name;
  const level = levelFor(count);
  counter.innerHTML = counterHTML(count);
  counter.setAttribute('aria-label', backpackLabel(count));
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
  pipSay(message);
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
