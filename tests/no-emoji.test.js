// Part 54i (Habiba's spec, points 6a and 6b, 10 Nov 2026): the app shows our
// own illustrations (js/illustrations.js), never keyboard emoji, and every
// icon name used in code and content is a real illustration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { findEmoji, ALLOWED } from '../dev/emoji-scan.mjs';
import { ILLUSTRATIONS } from '../js/illustrations.js';
import { ICONS } from '../js/icons.js';

test('6a: no emoji or emoji-style symbol anywhere in the source (js, css, html, data)', () => {
  const hits = findEmoji().map((h) => `${h.file}:${h.line} ${h.symbol}  ${h.text.slice(0, 80)}`);
  assert.deepEqual(hits, [], `Use illustration() / :name: instead:\n${hits.join('\n')}`);
  // Only these plain text characters are allowed (they look the same everywhere).
  assert.deepEqual([...ALLOWED].sort(), ['○', '←', '→', '▲', '▼', '★', '☆', '✓', '✕'].sort());
});

// ---------- 6b: every icon name exists ----------
const ROOT = new URL('..', import.meta.url);
const ROOT_PATH = decodeURIComponent(ROOT.pathname).replace(/^\/([A-Za-z]:)/, '$1');
const SKIP = new Set(['node_modules', '.git', 'vendor', 'tests', 'docs', 'dev', 'fonts', 'screenshots']);
function files(dir = ROOT_PATH) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return ['.js', '.html', '.json'].includes(extname(name)) ? [path] : [];
  });
}

// Every icon name written out in the code or content, with where it is.
function namesUsed() {
  const used = [];
  const PATTERNS = [
    /:([a-z]+(?:-[a-z]+)*):/g, // :name: in our texts (only real names turn into icons, so a typo would show as text)
    /(?:iconHTML|iconNode|illustration)\(\s*'([a-z-]+)'/g,
    /setIconText\([^,]+,\s*'([a-z-]+)'/g,
    /data-icon="([a-z-]+)"/g,
    /\bicon:\s*'([a-z-]+)'/g, // { icon: 'trophy' } in code
    /"icon":\s*"([a-z-]+)"/g, // "icon": "moon" in content
  ];
  for (const path of files()) {
    const file = relative(ROOT_PATH, path).split(sep).join('/');
    if (file === 'js/illustrations.js' || file === 'js/icons.js') continue;
    const text = readFileSync(path, 'utf8');
    for (const pattern of PATTERNS) {
      for (const [whole, name] of text.matchAll(pattern)) {
        // :name: also matches times like "10:30:" and CSS-like text; only names that look like icons count.
        if (pattern === PATTERNS[0] && !/^[a-z]+(-[a-z]+)*$/.test(name)) continue;
        if (name === 'name') continue; // ":name:" written in comments to explain the idea
        used.push({ file, name, whole });
      }
    }
  }
  return used;
}

test('6b: every icon name used in code and content is one of our illustrations', () => {
  const used = namesUsed();
  assert.ok(used.length > 150, `found ${used.length} icon names`);
  const missing = used.filter(({ file, name, whole }) => {
    if (ILLUSTRATIONS[name]) return false;
    // The step bar keeps its navy line icons (js/icons.js), as Habiba asked.
    if (file === 'js/app.js' && whole.startsWith('icon:') && ICONS[name]) return false;
    return true;
  });
  assert.deepEqual(missing.map((m) => `${m.file}: ${m.whole}`), []);
});

test('6b: a made-up icon name would be caught', () => {
  assert.equal(ILLUSTRATIONS['no-such-icon'], undefined);
  assert.ok(Object.keys(ILLUSTRATIONS).length >= 70);
});
