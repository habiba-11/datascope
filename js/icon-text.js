// Shell layer (Part 54a, 8 Nov 2026): puts one of our illustrations
// (js/illustrations.js) in front of a text, where an emoji used to be.
// The icon is our own SVG; the text always goes in as plain text, so a
// child's own words can never be read as code. Sized by css/base.css (.ds-icon):
// 1.25 times the text, on the text line, like the emoji it replaces.
import { illustration } from './illustrations.js';

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
