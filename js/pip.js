// Shell layer: Pip, our original mascot (Part 21b): a round owl explorer with a
// yellow explorer hat and a magnifying glass. Drawn as SVG, so it is sharp at
// any size and its parts can move. Moods: 'happy' (default), 'think', 'cheer'.
// The mood styles and the blink are in base.css; reduced motion stops the movement.
// Part 59p: redrawn in the rooms mockup's look (see pipSVG below).
import { withoutIcons } from './icon-text.js';
import { OUTFIT_ART } from './art/pip-outfits.js';
import { DEFAULT_OUTFIT } from './helpers/wardrobe.js';
import { getOutfit } from './storage/save.js';
import { FEATURES } from './config.js';
import { mountSceneDefs } from './scenes/defs.js';

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
// Part 59p (Habiba, 10 Nov 2026): Pip in the richer look of the rooms mockup
// (docs/design/datascope-rooms-ui.html): soft brown outlines, shading, amber
// eyes, a two-part beak. The mockup draws him in a 140 x 150 box; here every
// number is that drawing at 85% size, moved so his eyes, body and beak sit
// exactly where they were. So all Wardrobe items still fit him unchanged.
// The colours are written in the drawing; the gradients (url(#ds-pip-...))
// are in js/scenes/defs.js. Class names stay the same, so every mood and
// move in css/base.css and css/shell.css still works.
const LINE = 'stroke="#4A2D14" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const SOFT = 'stroke="#4A2D14" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55"';
const feather = (x, y) => `M${x} ${y} q5.1 6 10.2 0`;
const BODY_FEATHERS = [[29.4, 86.9], [39.6, 97.1], [70.2, 97.1], [80.4, 86.9], [34.5, 75], [75.3, 75]]
  .map(([x, y]) => feather(x, y)).join(' ');
const BELLY_FEATHERS = (y) => `M41.3 ${y} q4.7 6 9.35 0 q4.7 6 9.35 0 q4.7 6 9.35 0 q4.7 6 9.35 0`;
// One eye: the iris and pupil (in .pip-pupils, so they can look up) are drawn separately.
const iris = (cx) => `<circle cx="${cx}" cy="59.7" r="10.2" fill="url(#ds-pip-iris)"/><circle class="pip-pupil" cx="${cx}" cy="59.7" r="5.4" fill="#1B1008"/><circle class="pip-shine" cx="${cx + 3.4}" cy="55.5" r="3.1" fill="#fff"/><circle cx="${cx - 3.4}" cy="64" r="1.4" fill="#fff"/>`;
// A small arched upper eyelid: its lower edge curves UP, so Pip looks alert
// and friendly (not sleepy). Static: the blink lids (.pip-lids) close over it.
const eyelid = (cx) => `<path d="M${cx - 13} 49.9 A15.3 15.3 0 0 1 ${cx + 13} 49.9 Q${cx} 46.5 ${cx - 13} 49.9Z" fill="#B98456" stroke="#4A2D14" stroke-width="1.7" stroke-linejoin="round"/>`;
// Pip's face (Habiba's own Pip SVG, pasted 10 Nov 2026, drawn here at 85%
// like the rest of him): rounded ear tufts, a small arched eyelid on each eye,
// the iris a little low, soft eyebrows and pink cheeks. It replaces the
// versions tried before (droopy lids, lines or light cheeks under the eyes, a
// smile under the beak). Her SVG's blur filter and wing-flap animation are
// left out: soft see-through cheeks instead, and Pip's moods move his wings.

const WING_LEFT = `<path d="M26 61.4 Q2.2 80.1 12.4 112.4 Q29.4 107.3 34.5 83.5Z" fill="#7C4E27" ${LINE}/><path d="M12.4 112.4 Q15.8 100.5 20.9 93.7 M19.2 110.7 Q22.6 98.8 26.9 92" ${SOFT}/>`;
const WING_RIGHT = `<path d="M94 61.4 Q117.8 80.1 107.6 112.4 Q90.6 107.3 85.5 83.5Z" fill="#7C4E27" ${LINE}/><path d="M107.6 112.4 Q104.2 100.5 99.1 93.7 M100.8 110.7 Q97.4 98.8 93.1 92" ${SOFT}/>`;

export function pipSVG(label = '', outfit = currentOutfit()) {
  if (typeof document !== 'undefined') mountSceneDefs(); // his gradients, once per page
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `
<svg class="pip pip--happy" viewBox="0 0 120 132" ${a11y}>
  <ellipse cx="60" cy="127" rx="38" ry="4.5" fill="#17324D" opacity=".16"/>
  <g class="pip-all">
    ${layer(outfit, 'back')}
    <path class="pip-foot" d="M37.9 120.9 l-6.8 6.8 h6.8 l3.4 -3.4 l3.4 3.4 h6.8 Z M73.6 120.9 l-6.8 6.8 h6.8 l3.4 -3.4 l3.4 3.4 h6.8 Z" fill="#F08A12" stroke="#B2600A" stroke-width="1.3" stroke-linejoin="round"/>
    <g class="pip-wing pip-wing-left">${WING_LEFT}</g>
    <path class="pip-tuft" d="M24.3 41 Q14.1 13.8 31.1 15.5 Q41.3 18.9 43 30.8Z" fill="#8A5A30" ${LINE}/>
    <path class="pip-tuft" d="M95.7 41 Q105.9 13.8 88.9 15.5 Q78.7 18.9 77 30.8Z" fill="#8A5A30" ${LINE}/>
    <ellipse class="pip-body" cx="60" cy="76.7" rx="42.5" ry="45.9" fill="url(#ds-pip-body)" ${LINE}/>
    <ellipse cx="60" cy="76.7" rx="42.5" ry="45.9" fill="url(#ds-shine)" opacity=".5"/>
    <path d="M26 61.4 Q29.4 49.5 39.6 47.8 M94 61.4 Q90.6 49.5 80.4 47.8 ${BODY_FEATHERS}" ${SOFT}/>
    <ellipse class="pip-belly" cx="60" cy="92" rx="27.2" ry="28.1" fill="url(#ds-pip-belly)"/>
    <path class="pip-feather" d="${BELLY_FEATHERS(83.5)} ${BELLY_FEATHERS(93.7)} ${BELLY_FEATHERS(103.9)}" stroke="#C99443" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="60" cy="58" rx="35.7" ry="25.5" fill="#C49660" opacity=".35"/>
    <circle class="pip-eye" cx="43" cy="58" r="15.3" fill="#FFFBEF" ${LINE}/>
    <circle class="pip-eye" cx="77" cy="58" r="15.3" fill="#FFFBEF" ${LINE}/>
    <g class="pip-pupils">${iris(43)}${iris(77)}</g>
    <g class="pip-eyelids">${eyelid(43)}${eyelid(77)}</g>
    <g class="pip-lids">
      <ellipse cx="43" cy="58" rx="16" ry="16" fill="#9A6A3A" ${LINE}/>
      <ellipse cx="77" cy="58" rx="16" ry="16" fill="#9A6A3A" ${LINE}/>
    </g>
    <path class="pip-brows" d="M28.6 41 Q43 32.5 55.8 41 M64.3 41 Q77 32.5 91.5 41" stroke="#4A2D14" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle class="pip-blush" cx="24.3" cy="73.3" r="6" fill="#FF9A8B" opacity=".45"/>
    <circle class="pip-blush" cx="95.7" cy="73.3" r="6" fill="#FF9A8B" opacity=".45"/>
    ${layer(outfit, 'neck')}
    ${layer(outfit, 'face')}
    ${layer(outfit, 'head')}
    <g class="pip-beak">
      <path d="M53.2 69.9 L66.8 69.9 L60 82.7Z" fill="url(#ds-pip-beak)" stroke="#B2600A" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M54.9 79.3 L65.1 79.3 L60 86.9Z" fill="#E27A10" stroke="#B2600A" stroke-width="1.4" stroke-linejoin="round"/>
    </g>
    <g class="pip-wing pip-wing-right">${WING_RIGHT}${layer(outfit, 'held')}</g>
    <text class="pip-question" x="100" y="22">?</text>
    <g class="pip-sparkles" stroke="#17324D" stroke-width="2" stroke-linejoin="round">
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
// Habiba, 11 Nov 2026: Pip's lines are words only (Pip stands right there).
export function pipSay(text) {
  document.querySelectorAll('[data-pip-text]').forEach((el) => {
    el.textContent = withoutIcons(text);
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
