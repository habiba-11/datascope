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

// ---------- Part 52e (10 Nov 2026): motion, kept calm ----------
import { ILLUSTRATION_CSS } from '../js/illustrations.js';
import { pickMoving, MAX_MOVING } from '../js/icon-text.js';

test('at most 12 icons move at once; icons in a pop-up come first', () => {
  assert.equal(MAX_MOVING, 12);
  const page = Array.from({ length: 15 }, (_, i) => ({ id: i, inPopUp: false }));
  const popUp = [{ id: 'a', inPopUp: true }, { id: 'b', inPopUp: true }];
  const moving = pickMoving([...page, ...popUp]);
  assert.equal(moving.size, 12);
  assert.ok(moving.has(popUp[0]) && moving.has(popUp[1]), 'the pop-up icons move');
  assert.ok(!moving.has(page[10]), 'the 11th page icon is calm');
  assert.equal(pickMoving(page.slice(0, 5)).size, 5, 'fewer than 12: all move');
});

test('room headers, Pip and hints may move; icons next to words stay still', () => {
  assert.match(iconLineHTML(':star: Bonus', true), /class="ds-illo"/);
  assert.match(iconLineHTML(':star: Bonus'), /class="ds-illo still"/);
});

test('reduced motion, a hidden tab and the 12-icon limit all stop the motion', () => {
  assert.match(ILLUSTRATION_CSS, /@media \(prefers-reduced-motion: reduce\)\{\.ds-illo \*\{animation:none!important\}\}/);
  assert.match(ILLUSTRATION_CSS, /\.ds-paused \.ds-illo \*\{animation-play-state:paused!important\}/);
  assert.match(ILLUSTRATION_CSS, /\.ds-illo\.ds-calm \*\{animation:none!important\}/);
});

test('no fading or flashing faster than 3 times a second (one fade per cycle, so a cycle is at least 0.34 s)', () => {
  const fading = new Set([...ILLUSTRATION_CSS.matchAll(/@keyframes ([\w-]+)\{((?:[^{}]|\{[^}]*\})*)\}/g)]
    .filter(([, , body]) => /opacity/.test(body)).map(([, name]) => name));
  assert.ok(fading.size >= 3, 'the check finds the fading animations');
  for (const [, name, seconds] of ILLUSTRATION_CSS.matchAll(/animation:([\w-]+) ([\d.]+)s/g)) {
    if (fading.has(name)) assert.ok(Number(seconds) >= 0.34, `${name} fades every ${seconds} s`);
  }
});

test('Habiba chose A: an icon moves for 8 seconds, then rests; hover or a reward wakes it', async () => {
  const { MOVE_MS } = await import('../js/icon-text.js');
  assert.equal(MOVE_MS, 8000);
  assert.match(ILLUSTRATION_CSS, /\.ds-illo\.ds-rest:not\(:hover\):not\(\.cheer\) \*\{animation:none!important\}/);
});

// Fewer icons (Habiba, 11 Nov 2026): the teacher view shows only the warning icon.
test('a page can show only some icons: the others vanish with their space', async () => {
  const { iconParts, showOnlyIcons, iconHTML } = await import('../js/icon-text.js');
  showOnlyIcons(['warning']);
  try {
    assert.deepEqual(iconParts(':star: 5 stars'), [{ text: '5 stars' }]);
    assert.deepEqual(iconParts(':warning: Could not load'), [{ icon: 'warning' }, { text: ' Could not load' }]);
    assert.equal(iconHTML('cloud'), '');
  } finally {
    showOnlyIcons(null);
  }
  assert.deepEqual(iconParts(':star: 5 stars'), [{ icon: 'star' }, { text: ' 5 stars' }]);
});

// Scan, 11 Nov 2026: a file used iconHTML() without importing it, and only the
// games screens crashed. Every file that calls an icon helper must import it.
test('every file that uses an icon helper imports it', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const HELPERS = ['iconHTML', 'iconNode', 'iconLineHTML', 'setIconText', 'setIconLine', 'withoutIcons', 'fillIcons'];
  const files = [];
  const walk = (dir) => readdirSync(dir).forEach((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== 'vendor') walk(p); } else if (f.endsWith('.js')) files.push(p);
  });
  walk('js');
  for (const file of files) {
    if (file.endsWith('icon-text.js')) continue;
    const code = readFileSync(file, 'utf8');
    const imports = [...code.matchAll(/import\s*\{([^}]*)\}\s*from\s*'[^']*icon-text\.js'/g)].flatMap((m) => m[1].split(',').map((n) => n.trim()));
    for (const helper of HELPERS) {
      const calls = new RegExp(`(^|[^.\\w])${helper}\\(`, 'm');
      if (calls.test(code.replace(/\/\/.*$/gm, ''))) assert.ok(imports.includes(helper), `${file} uses ${helper}() without importing it`);
    }
  }
});
