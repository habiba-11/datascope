// Developer tool (Part 54i, 8-10 Nov 2026): finds every emoji or emoji-style
// symbol in the app's own source (js, css, html, data), so the app only uses
// our illustrations (js/illustrations.js). Used by tests/no-emoji.test.js.
// Not checked: tests/, docs/, dev/, node_modules/ and js/vendor/ (other people's code).
// Run by hand: node dev/emoji-scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'vendor', 'tests', 'docs', 'dev', 'fonts', 'screenshots']);
const TYPES = new Set(['.js', '.mjs', '.css', '.html', '.json']);

// Plain text characters that look the same on every device, kept on purpose
// (Habiba, 8 Nov 2026): arrows, tick, cross, circle, stars, triangles.
export const ALLOWED = new Set(['→', '←', '✓', '✕', '○', '★', '☆', '▼', '▲']);

// Emoji (with skin tones and joined sequences) and the symbol blocks that
// often turn into emoji: arrows, technical, geometric shapes, misc symbols, dingbats.
const EMOJI = /(\p{Extended_Pictographic}|[←-⇿⌀-⏿■-◿☀-➿⬀-⯿])️?(‍\p{Extended_Pictographic}️?)*/gu;
// The same written as an HTML entity or a \u code (only in that range).
const CODES = /&#x(1F[0-9A-F]{3}|2[3-7B][0-9A-F]{2});|&#(1[2-3]\d{4});|\\u\{1F[0-9A-Fa-f]{3}\}|\\uD83[C-E]/g;

function sourceFiles(dir = ROOT) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return TYPES.has(extname(name)) ? [path] : [];
  });
}

// Every hit: { file, line, symbol, text }.
export function findEmoji() {
  const hits = [];
  for (const path of sourceFiles()) {
    const file = relative(ROOT, path).split(sep).join('/');
    readFileSync(path, 'utf8').split('\n').forEach((text, i) => {
      for (const [symbol] of text.matchAll(EMOJI)) {
        if (!ALLOWED.has(symbol.replace(/️/g, ''))) hits.push({ file, line: i + 1, symbol, text: text.trim() });
      }
      for (const [symbol] of text.matchAll(CODES)) hits.push({ file, line: i + 1, symbol, text: text.trim() });
    });
  }
  return hits;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hits = findEmoji();
  for (const h of hits) console.log(`${h.file}:${h.line}  ${h.symbol}  ${h.text.slice(0, 90)}`);
  console.log(`${hits.length} found`);
}
