// Shell layer (Part 54a, 8 Nov 2026): puts one of our illustrations
// (js/illustrations.js) in front of a text, where an emoji used to be.
// The icon is our own SVG; the text always goes in as plain text, so a
// child's own words can never be read as code. Sized by css/base.css (.ds-icon):
// 1.25 times the text, on the text line, like the emoji it replaces.
import { illustration, ILLUSTRATIONS } from './illustrations.js';

// Part 54c: OUR texts (code and data/content, never a child's words) may name
// an icon anywhere as :name:, e.g. ":crystal-ball: Predict!" or "Next: :star: Bonus".
// Only a real icon name counts; anything else stays as it is.
const TOKEN = /:([a-z]+(?:-[a-z]+)*):/g;

// Splits a text into parts: { icon } or { text }. No DOM here, so it is tested.
export function iconParts(text) {
  const parts = [];
  let last = 0;
  for (const m of String(text).matchAll(TOKEN)) {
    if (!ILLUSTRATIONS[m[1]]) continue;
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ icon: m[1] });
    last = m.index + m[0].length;
  }
  if (last < String(text).length) parts.push({ text: String(text).slice(last) });
  return parts;
}

// The same text with its :name: shown as icons, as HTML (for our HTML templates).
export function iconLineHTML(text) {
  return iconParts(text).map((p) => (p.icon ? iconHTML(p.icon) : p.text)).join('');
}

// The same, into an element (the words go in as plain text).
export function setIconLine(element, text) {
  element.replaceChildren(...iconParts(text).map((p) => (p.icon ? iconNode(p.icon) : document.createTextNode(p.text))));
}

// The words alone, without the :name: (e.g. for a log or an aria-label).
export function withoutIcons(text) {
  return iconParts(text).filter((p) => p.text).map((p) => p.text).join('').replace(/\s+/g, ' ').trim();
}

// The icon as HTML, for templates that are already HTML (our own words only).
// `label`: say what the icon means, only when no words next to it say it.
export function iconHTML(name, label = '') {
  return `<span class="ds-icon">${illustration(name, { size: 24, label })}</span>`;
}

// The icon as a page element.
export function iconNode(name, label = '') {
  const span = document.createElement('span');
  span.className = 'ds-icon';
  span.innerHTML = illustration(name, { size: 24, label }); // our own SVG, never child text
  return span;
}

// Plain HTML pages (the start page): every <span data-icon="key"></span>
// inside `root` gets that illustration (decorative: words sit next to it).
export function fillIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((span) => {
    span.classList.add('ds-icon');
    span.innerHTML = illustration(span.dataset.icon, { size: 24 });
  });
}

// Fills `element` with an icon and a text (the text stays plain text).
export function setIconText(element, name, text) {
  element.replaceChildren(iconNode(name), document.createTextNode(` ${text}`));
}
