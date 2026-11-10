// Shell layer: Pip, our original mascot (Part 21b): a round owl explorer with a
// yellow explorer hat and a magnifying glass. Drawn as SVG, so it is sharp at
// any size and its parts can move. Moods: 'happy' (default), 'think', 'cheer'.
// The mood styles and the blink are in base.css; reduced motion stops the movement.
import { setIconText, setIconLine } from './icon-text.js';
import { OUTFIT_ART } from './art/pip-outfits.js';
import { DEFAULT_OUTFIT } from './helpers/wardrobe.js';
import { getOutfit } from './storage/save.js';
import { FEATURES } from './config.js';

// Part 58a (10 Nov 2026): Pip wears the child's outfit (Pip's Wardrobe) on
// every screen. With the wardrobe switched off (js/config.js), or before the
// child changes anything, Pip wears his explorer hat and magnifier.
export function currentOutfit() {
  if (!FEATURES.wardrobe) return { ...DEFAULT_OUTFIT };
  return getOutfit() || { ...DEFAULT_OUTFIT };
}

// One layer of the outfit. Each item is wrapped in "pip-item", so Pip's own
// navy outline style (css/base.css) does not repaint the item's colours.
function layer(outfit, slot) {
  const id = outfit[slot];
  const art = id && OUTFIT_ART[id] && OUTFIT_ART[id][slot];
  // The cape's golden clasp is drawn at the neck, in front of the body.
  const clasp = slot === 'neck' && outfit.back && OUTFIT_ART[outfit.back]?.neck;
  return (clasp ? `<g class="pip-item">${clasp}</g>` : '') + (art ? `<g class="pip-item pip-item-${id}">${art}</g>` : '');
}

// `label`: '' when Pip is decoration next to text (hidden from screen readers).
// `outfit`: { slot: itemId } (the wardrobe screen passes the one being tried).
// Layers, back to front: back, Pip's body and eyes, neck, face, head, the beak
// (after every item, so nothing ever covers it), then the right wing with the
// held item inside it (so it moves when Pip waves or cheers).
export function pipSVG(label = '', outfit = currentOutfit()) {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `
<svg class="pip pip--happy" viewBox="0 0 120 132" ${a11y}>
  <g class="pip-all">
    ${layer(outfit, 'back')}
    <path class="pip-tuft" d="M24 40 L22 14 L42 30 Z"/>
    <path class="pip-tuft" d="M96 40 L98 14 L78 30 Z"/>
    <g class="pip-wing pip-wing-left"><ellipse cx="20" cy="84" rx="10" ry="22"/></g>
    <ellipse class="pip-body" cx="60" cy="78" rx="42" ry="46"/>
    <ellipse class="pip-belly" cx="60" cy="94" rx="27" ry="26"/>
    <path class="pip-feather" d="M47 88 q6.5 7 13 0 q6.5 7 13 0"/>
    <path class="pip-feather" d="M47 100 q6.5 7 13 0 q6.5 7 13 0"/>
    <circle class="pip-eye" cx="43" cy="58" r="15"/>
    <circle class="pip-eye" cx="77" cy="58" r="15"/>
    <g class="pip-pupils">
      <circle class="pip-pupil" cx="43" cy="59" r="7"/>
      <circle class="pip-pupil" cx="77" cy="59" r="7"/>
      <circle class="pip-shine" cx="46" cy="56" r="2.5"/>
      <circle class="pip-shine" cx="80" cy="56" r="2.5"/>
    </g>
    <g class="pip-lids">
      <ellipse cx="43" cy="58" rx="16" ry="16"/>
      <ellipse cx="77" cy="58" rx="16" ry="16"/>
    </g>
    <circle class="pip-blush" cx="28" cy="74" r="5"/>
    <circle class="pip-blush" cx="92" cy="74" r="5"/>
    ${layer(outfit, 'neck')}
    ${layer(outfit, 'face')}
    ${layer(outfit, 'head')}
    <path class="pip-beak" d="M53 70 L67 70 L60 81 Z"/>
    <path class="pip-foot" d="M44 122 l-6 7 h14 Z M76 122 l-6 7 h14 Z"/>
    <g class="pip-wing pip-wing-right"><ellipse cx="100" cy="84" rx="10" ry="22"/>${layer(outfit, 'held')}</g>
    <text class="pip-question" x="100" y="22">?</text>
    <g class="pip-sparkles">
      <path d="M10 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"/>
      <path d="M108 8 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/>
    </g>
  </g>
</svg>`;
}

// Changes Pip's mood everywhere on the page ('happy', 'think' or 'cheer').
export function setPipMood(mood) {
  document.querySelectorAll('svg.pip').forEach((svg) => {
    svg.classList.remove('pip--happy', 'pip--think', 'pip--cheer');
    svg.classList.add(`pip--${mood}`);
  });
}

// A mood for a moment, then back to happy.
let moodTimer = null;
export function pipMoodFor(mood, ms = 1400) {
  setPipMood(mood);
  clearTimeout(moodTimer);
  moodTimer = setTimeout(() => setPipMood('happy'), ms);
}

// Pip says something: in the sidebar bubble (old layout) or in the Pip line
// of the task card (new layout). Both are marked with data-pip-text.
// `icon` (Part 54b): the name of an illustration shown before the words.
export function pipSay(text, icon = '') {
  document.querySelectorAll('[data-pip-text]').forEach((el) => {
    // Part 52e: a Pip moment, so the icon may move.
    if (icon) setIconText(el, icon, text, true);
    else setIconLine(el, text, true); // our texts may name icons as :name:
  });
}

// Part 58b: after the Wardrobe closes, every Pip on the page wears the new
// outfit at once (same place, same mood). The Wardrobe's own Pip is left alone.
export function dressAllPips(outfit = currentOutfit()) {
  const fresh = document.createElement('template');
  fresh.innerHTML = pipSVG('', outfit).trim();
  const inside = fresh.content.firstElementChild.innerHTML;
  document.querySelectorAll('svg.pip').forEach((svg) => {
    if (!svg.closest('.wardrobe')) svg.innerHTML = inside;
  });
}
