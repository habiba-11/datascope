// Shell layer: the badge shelf. Tapping the badge counter opens a window with
// every kind of badge: the ones earned, and the ones still to find (with where
// to find them), so children can see what good reasoning looks like.
import { earnedBadges, badgeShelf, levelFor } from './helpers/badges.js';
import { readLog } from './helpers/log.js';
import { getExplorerCode } from './storage/save.js';
import { flipIn } from './motion.js';

// Called once by setupCelebrations(), after the sidebar exists.
export function setupBadgeShelf() {
  // <dialog> keeps keyboard focus inside while open, and Escape closes it.
  const dialog = document.createElement('dialog');
  dialog.className = 'badge-shelf';
  dialog.setAttribute('aria-labelledby', 'shelf-title');
  document.body.append(dialog);

  document.getElementById('badge-counter').addEventListener('click', () => {
    // Built fresh each time from the log, so it always shows the latest badges.
    dialog.innerHTML = shelfHTML(badgeShelf(earnedBadges(readLog(), getExplorerCode())));
    dialog.querySelector('.shelf-close').addEventListener('click', () => dialog.close());
    dialog.showModal();
    flipIn(dialog.querySelectorAll('.shelf-card.earned')); // earned badges flip in
  });

  // Tapping the dark area around the shelf also closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

// One card per kind of badge. Earned and "still to find" cards differ in words
// and icon (✓ / 🔒), not only in colour.
function shelfHTML(shelf) {
  const cards = shelf.map((badge) => {
    const earned = badge.count > 0;
    const status = earned
      ? `✓ Earned${badge.count > 1 ? ` × ${badge.count}` : ''}`
      : '🔒 Still to find';
    return `
      <li class="shelf-card ${earned ? 'earned' : 'locked'}">
        <span class="shelf-icon" aria-hidden="true">${badge.icon}</span>
        <strong class="shelf-name">${badge.name}</strong>
        <span class="shelf-status">${status}</span>
        <span class="shelf-text">${earned ? badge.earnedFor : badge.where}</span>
      </li>
    `;
  }).join('');

  const total = shelf.reduce((sum, badge) => sum + badge.count, 0);
  const level = levelFor(total);
  const toGo = level.next ? level.next.min - total : 0;
  const nextText = level.next
    ? `${toGo} more badge${toGo > 1 ? 's' : ''} to become a ${level.next.icon} ${level.next.name}!`
    : "That's the top level. Amazing thinking!";

  return `
    <h2 id="shelf-title">⭐ My badge shelf</h2>
    <p class="shelf-level">You are a <strong>${level.icon} ${level.name}</strong>. ${nextText}</p>
    <p>Badges are for good thinking, not for being fast.</p>
    <ul class="shelf-grid">${cards}</ul>
    <button class="btn btn-main shelf-close" type="button">Close</button>
  `;
}
