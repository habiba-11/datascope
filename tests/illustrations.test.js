// Part 54a (8 Nov 2026): our own illustrations replace the emoji.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ILLUSTRATIONS, illustration } from '../js/illustrations.js';
import { iconHTML } from '../js/icon-text.js';

const names = Object.keys(ILLUSTRATIONS);

// A small well-formed check: every tag that opens is closed, in order.
function wellFormed(svg) {
  const stack = [];
  for (const [, close, name, selfClose] of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
    if (close) {
      if (stack.pop() !== name) return false;
    } else if (!selfClose) {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

test('every illustration is one well-formed SVG with the 64x64 viewBox', () => {
  assert.ok(names.length >= 41, `${names.length} icons`);
  for (const name of names) {
    const svg = illustration(name, { size: 48 });
    assert.match(svg, /^<svg [^>]*viewBox="0 0 64 64"[^>]*>/, name);
    assert.ok(svg.endsWith('</svg>'), name);
    assert.ok(wellFormed(svg), `${name} is not well-formed`);
    assert.match(svg, /width="48" height="48"/, name);
  }
});

test('no ids, no gradients, nothing from outside, and each icon is small', () => {
  for (const name of names) {
    const svg = illustration(name);
    assert.doesNotMatch(svg, /\sid=/, `${name} has an id (two copies on one page would clash)`);
    assert.doesNotMatch(svg, /Gradient|url\(|href=|<script|<image/i, name);
    assert.ok(Buffer.byteLength(svg) < 1.5 * 1024, `${name} is ${Buffer.byteLength(svg)} bytes`);
  }
});

test('decorative unless labelled; a label is read out and kept safe', () => {
  const plain = illustration('star');
  assert.match(plain, /aria-hidden="true"/);
  assert.doesNotMatch(plain, /role="img"/);
  const labelled = illustration('star', { label: 'A "gold" star' });
  assert.match(labelled, /role="img" aria-label="A &quot;gold&quot; star"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  assert.equal(illustration('no-such-icon'), '');
});

test('icon names are simple words (used in content files and code)', () => {
  for (const name of names) assert.match(name, /^[a-z]+(-[a-z]+)*$/, name);
});

test('iconHTML wraps the icon for text lines (sized by .ds-icon in base.css)', () => {
  const html = iconHTML('bulb');
  assert.match(html, /^<span class="ds-icon"><svg [^>]*aria-hidden="true"/);
  assert.match(iconHTML('bulb', 'Hint'), /aria-label="Hint"/);
});
