// Developer tool (13 Nov 2026, Habiba: "the website is slower on the live link"):
// each page lists ALL the JavaScript files it needs in its <head>, as
// <link rel="modulepreload">. Without the list the browser finds the files
// one layer at a time (a file names the next one), and online every layer
// costs a round trip; with it, it asks for all of them at once.
// No build step: the code stays exactly as written; only the lists change.
//
// Run after adding, removing or renaming a JavaScript file or an import:
//   npm run preload        (tests/preload.test.js fails if a list is out of date)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PAGES = [
  'index.html',
  'rooms/question-studio.html', 'rooms/data-hub.html', 'rooms/graph-lab.html',
  'rooms/number-lab.html', 'rooms/chance-lab.html', 'rooms/evidence-board.html',
  'rooms/my-journey.html', 'teacher/index.html',
];
const START = '<!-- preload:start (made by dev/preload.mjs: do not edit by hand) -->';
const END = '<!-- preload:end -->';

// The static imports of one file: import x from './a.js'; import './b.js'; export ... from './c.js'.
// (A dynamic import('./d.js') is left out on purpose: it loads only when needed.)
function importsOf(file) {
  const code = readFileSync(file, 'utf8');
  const found = [];
  const pattern = /^\s*(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?['"](\.{1,2}\/[^'"]+)['"]/gm;
  for (const m of code.matchAll(pattern)) found.push(resolve(dirname(file), m[1]));
  return found;
}

// Every file a page's module script needs, in a stable order (the page's own folder first).
export function preloadList(page) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  const entry = html.match(/<script type="module" src="([^"]+)"/);
  if (!entry) return [];
  const pageDir = dirname(join(ROOT, page));
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    importsOf(file).forEach(visit);
  };
  visit(resolve(pageDir, entry[1]));
  return [...seen].map((file) => relative(pageDir, file).split(sep).join('/')).sort();
}

export function preloadBlock(page) {
  const links = preloadList(page).map((href) => `  <link rel="modulepreload" href="${href}">`);
  return `${START}\n${links.join('\n')}\n  ${END}`;
}

// The block as it is in the page now (or null if the page has none yet).
export function currentBlock(page) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  return start === -1 || end === -1 ? null : html.slice(start, end + END.length);
}

// Run by hand: writes (or refreshes) the block just before </head>.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const page of PAGES) {
    const file = join(ROOT, page);
    let html = readFileSync(file, 'utf8');
    const block = preloadBlock(page);
    const old = currentBlock(page);
    html = old ? html.replace(old, block) : html.replace('</head>', `  ${block}\n</head>`);
    writeFileSync(file, html);
    console.log(`${page}: ${preloadList(page).length} files`);
  }
}
