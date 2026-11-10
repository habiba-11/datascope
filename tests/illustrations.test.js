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

// Part 52a (10 Nov 2026): the 3D icons have gradients. Their ids are written
// with "~", which illustration() makes unique for each copy, so many copies
// can share one page.
const ids = (svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

test('ids are unique per copy, every url(#...) points inside its own icon, nothing from outside', () => {
  const page = names.map((name) => illustration(name)).join('') + illustration('die') + illustration('die');
  const all = ids(page);
  assert.equal(new Set(all).size, all.length, 'two copies would clash: duplicate ids');
  for (const name of names) {
    const svg = illustration(name);
    assert.doesNotMatch(svg, /~/, `${name}: a "~" was not replaced`);
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids(svg).includes(ref), `${name}: url(#${ref}) has no gradient`);
    assert.doesNotMatch(svg, /href=|<script|<image|url\((?!#)/i, name);
  }
});

test('each drawing is small (under 2.5 KB, Habiba\'s rule)', () => {
  for (const name of names) {
    const bytes = Buffer.byteLength(ILLUSTRATIONS[name]);
    assert.ok(bytes < 2.5 * 1024, `${name} is ${bytes} bytes`);
  }
});

test('icons next to words are still; animate: false adds the class that stops all motion', () => {
  assert.match(iconHTML('star'), /class="ds-illo still"/);
  assert.match(iconHTML('star', '', true), /class="ds-illo"/);
  assert.match(illustration('star', { animate: false }), /class="ds-illo still"/);
  assert.match(illustration('star'), /class="ds-illo"/);
  assert.doesNotMatch(illustration('star', { face: false }), /il-eyes/);
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

// ---------- Part 54c: :name: in our own texts ----------
import { iconParts, iconLineHTML, withoutIcons } from '../js/icon-text.js';

test(':name: anywhere in our texts becomes an icon; anything else stays text', () => {
  assert.deepEqual(iconParts(':crystal-ball: Predict!'), [{ icon: 'crystal-ball' }, { text: ' Predict!' }]);
  assert.deepEqual(iconParts('Next: :star: Bonus →'), [{ text: 'Next: ' }, { icon: 'star' }, { text: ' Bonus →' }]);
  assert.deepEqual(iconParts('Meet at 10:30: :nothing: here'), [{ text: 'Meet at 10:30: :nothing: here' }]);
  assert.deepEqual(iconParts('No icons'), [{ text: 'No icons' }]);
  assert.match(iconLineHTML(':star: Bonus'), /^<span class="ds-icon"><svg [\s\S]*<\/svg><\/span> Bonus$/);
  assert.equal(withoutIcons(':crystal-ball: Predict! :star:'), 'Predict!');
});
