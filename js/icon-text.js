// Shell layer (Part 54a, 8 Nov 2026): puts one of our illustrations
// (js/illustrations.js) in front of a text, where an emoji used to be.
// The icon is our own SVG; the text always goes in as plain text, so a
// child's own words can never be read as code. Sized by css/base.css (.ds-icon):
// 1.25 times the text, on the text line, like the emoji it replaces.
import { illustration, ILLUSTRATIONS, installIllustrationStyles } from './illustrations.js';

// Part 52a (10 Nov 2026): every page imports this file, so the icons' motion
// styles are added here, once. Icons next to words stay STILL (a child is
// reading); pass animate = true only for rewards, headers, hints and Pip.
installIllustrationStyles();

// Part 54c: OUR texts (code and data/content, never a child's words) may name
// an icon anywhere as :name:, e.g. ":crystal-ball: Predict!" or "Next: :star: Bonus".
// Only a real icon name counts; anything else stays as it is.
const TOKEN = /:([a-z]+(?:-[a-z]+)*):/g;

// Fewer icons (Habiba, 11 Nov 2026): a page may show only some icons. The
// teacher view is an adult tool, so it keeps only the warning icon
// (js/teacher/calm-icons.js). null = every icon.
let onlyIcons = null;
export function showOnlyIcons(names) { onlyIcons = names ? new Set(names) : null; }
const shown = (name) => !onlyIcons || onlyIcons.has(name);

// Splits a text into parts: { icon } or { text }. No DOM here, so it is tested.
export function iconParts(text) {
  const parts = [];
  let last = 0;
  for (const m of String(text).matchAll(TOKEN)) {
    if (!ILLUSTRATIONS[m[1]]) continue;
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    if (shown(m[1])) parts.push({ icon: m[1] });
    // A hidden icon takes its space with it.
    last = m.index + m[0].length + (shown(m[1]) ? 0 : (text[m.index + m[0].length] === ' ' ? 1 : 0));
  }
  if (last < String(text).length) parts.push({ text: String(text).slice(last) });
  return parts;
}

// The same text with its :name: shown as icons, as HTML (for our HTML templates).
// `animate` (Part 52e): true only for room headers, Pip and hints.
export function iconLineHTML(text, animate = false) {
  return iconParts(text).map((p) => (p.icon ? iconHTML(p.icon, '', animate) : p.text)).join('');
}

// The same, into an element (the words go in as plain text).
export function setIconLine(element, text, animate = false) {
  element.replaceChildren(...iconParts(text).map((p) => (p.icon ? iconNode(p.icon, '', animate) : document.createTextNode(p.text))));
}

// The words alone, without the :name: (e.g. for a log or an aria-label).
export function withoutIcons(text) {
  return iconParts(text).filter((p) => p.text).map((p) => p.text).join('').replace(/\s+/g, ' ').trim();
}

// The icon as HTML, for templates that are already HTML (our own words only).
// `label`: say what the icon means, only when no words next to it say it.
export function iconHTML(name, label = '', animate = false) {
  if (!shown(name)) return '';
  return `<span class="ds-icon">${illustration(name, { size: 24, label, animate })}</span>`;
}

// The icon as a page element.
export function iconNode(name, label = '', animate = false) {
  const span = document.createElement('span');
  span.className = 'ds-icon';
  span.innerHTML = illustration(name, { size: 24, label, animate }); // our own SVG, never child text
  return span;
}

// Plain HTML pages (the start page): every <span data-icon="key"></span>
// inside `root` gets that illustration (decorative: words sit next to it).
export function fillIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((span) => {
    if (!shown(span.dataset.icon)) { span.remove(); return; }
    span.classList.add('ds-icon');
    span.innerHTML = illustration(span.dataset.icon, { size: 24, animate: false });
  });
}

// Fills `element` with an icon and a text (the text stays plain text).
export function setIconText(element, name, text, animate = false) {
  if (!shown(name)) { element.textContent = text; return; }
  element.replaceChildren(iconNode(name, '', animate), document.createTextNode(` ${text}`));
}

// ---------- Part 52e (10 Nov 2026): motion, kept calm ----------

// A reward moment: the icons inside `root` do their happy jump (twice), after
// `delay` ms, then go back to their own small motion. Reduced motion: the CSS
// switches every animation off, so nothing moves.
export function cheer(root, delay = 0) {
  if (!root) return;
  setTimeout(() => {
    const icons = root.matches?.('svg.ds-illo') ? [root] : [...root.querySelectorAll('svg.ds-illo')];
    icons.forEach(restLater); // a reward wakes the icon for another 8 seconds
    icons.forEach((svg) => svg.classList.add('cheer'));
    setTimeout(() => icons.forEach((svg) => svg.classList.remove('cheer')), 1200);
  }, delay);
}

// Habiba's rule: never more than 12 icons moving on one screen. Icons in an
// open pop-up come first (they are on top); every moving icon after the 12th
// gets "ds-calm" (no motion) until there is room again.
export const MAX_MOVING = 12;

// Which icons may move: the first `max`, pop-up icons first. No DOM here, so it is tested.
export function pickMoving(icons, max = MAX_MOVING) {
  const inPopUp = icons.filter((i) => i.inPopUp);
  const rest = icons.filter((i) => !i.inPopUp);
  return new Set([...inPopUp, ...rest].slice(0, max));
}

// Habiba chose A (10 Nov 2026): an icon moves for 8 seconds after it appears,
// then rests ("ds-rest": its still pose). It moves again while the pointer is on
// it (or a finger has just tapped it), and cheer() wakes it for another 8 seconds.
// Lively when it matters, and it saves the Chromebook's battery.
export const MOVE_MS = 8000;
const restTimers = new WeakMap();
function restLater(svg) {
  clearTimeout(restTimers.get(svg));
  svg.classList.remove('ds-rest');
  restTimers.set(svg, setTimeout(() => svg.classList.add('ds-rest'), MOVE_MS));
}

function calmExtras() {
  const icons = [...document.querySelectorAll('svg.ds-illo:not(.still):not(.ds-rest)')]
    .filter((svg) => svg.getClientRects().length) // hidden icons do not count
    .map((svg) => ({ svg, inPopUp: !!svg.closest('dialog, [role="dialog"]') }));
  const moving = pickMoving(icons);
  icons.forEach((icon) => icon.svg.classList.toggle('ds-calm', !moving.has(icon)));
  // Each icon that starts moving gets its 8 seconds (once; cheer() gives more).
  moving.forEach((icon) => { if (!restTimers.has(icon.svg)) restLater(icon.svg); });
}

// Checked again (once per frame at most) whenever the page adds or removes something.
if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  let queued = false;
  const check = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; calmExtras(); });
  };
  // (Also when a panel is shown or hidden, or a pop-up opens: 'hidden' / 'open'.)
  new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
  check();
}
