// Shell layer: "My Explorer Backpack", the badge shelf. Tapping the backpack
// button opens a window with every badge patch: the ones earned, and the
// locked ones with how to earn them, so children can see what good reasoning
// looks like (Part 21b, docs/design/badges-spec.md).
import { backpack, levelFor, levelProgress } from './helpers/badges.js';
import { readLog } from './helpers/log.js';
import { getExplorerCode } from './storage/save.js';
import { flipIn } from './motion.js';
import { patchSVG } from './badge-art.js';

// Called once by setupCelebrations(), after the backpack button exists.
export function setupBadgeShelf() {
  // <dialog> keeps keyboard focus inside while open, and Escape closes it.
  const dialog = document.createElement('dialog');
  dialog.className = 'badge-shelf';
  dialog.setAttribute('aria-labelledby', 'shelf-title');
  document.body.append(dialog);

  document.getElementById('badge-counter').addEventListener('click', () => {
    // Built fresh each time from the log, so it always shows the latest badges.
    dialog.innerHTML = shelfHTML(backpack(readLog(), getExplorerCode()));
    const closeBtn = dialog.querySelector('.shelf-close');
    closeBtn.addEventListener('click', () => dialog.close());
    dialog.showModal();
    // Start at the top of the shelf, even though focus is on Close at the bottom.
    closeBtn.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    // Earned badges flip in. (The whole slot, because GSAP clears inline styles
    // afterwards, and the patch keeps its colours in its own inline style.)
    flipIn(dialog.querySelectorAll('.shelf-slot.earned'));
  });

  // Tapping the dark area around the shelf also closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

// One slot per patch. Earned and locked slots differ in picture (badge or
// lock) AND words (the name, or "Locked" + how to earn it), not only colour.
function shelfHTML(patches) {
  const slots = patches.map((b) => {
    const ribbon = b.earned
      ? `<span class="patch-ribbon" style="--patch: var(--color-${b.color})"><span class="patch-dot"></span>${b.name}</span>`
      : '<span class="patch-ribbon locked">🔒 Locked</span>';
    return `
      <li class="shelf-slot ${b.earned ? 'earned' : 'locked'}">
        ${patchSVG(b, !b.earned)}
        ${ribbon}
        ${b.super && b.earned ? '<span class="shelf-super">★ Super reasoning</span>' : ''}
        <span class="shelf-how">${b.earned ? b.why : b.how}</span>
      </li>
    `;
  }).join('');

  const total = patches.filter((b) => b.earned).length;
  const level = levelFor(total);
  const toGo = level.next ? level.next.min - total : 0;
  const nextText = level.next
    ? `${toGo} more badge${toGo > 1 ? 's' : ''} to become a ${level.next.icon} ${level.next.name}!`
    : "That's the top level. Amazing thinking!";

  return `
    <h2 id="shelf-title" class="shelf-title">🎒 My Explorer Backpack</h2>
    <div class="shelf-inside">
      <p class="shelf-level">You are a <strong>${level.icon} ${level.name}</strong>. ${nextText}</p>
      <span class="level-bar" role="progressbar" aria-label="${level.next ? `Progress to ${level.next.name}` : 'Top level reached'}" aria-valuenow="${levelProgress(total)}" aria-valuemin="0" aria-valuemax="100">
        <span class="level-fill" style="width: ${levelProgress(total)}%"></span>
      </span>
      <p>Badges are for good thinking, not for being fast.</p>
      <ul class="shelf-grid">${slots}</ul>
      <button class="btn btn-main shelf-close" type="button">Close</button>
    </div>
  `;
}
