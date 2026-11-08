// Developer helper (never shipped to children): finds every file the website
// asks for, so a test can check each one exists with EXACTLY that spelling.
// GitHub Pages runs on Linux, where "Data.json" and "data.json" are different
// files; Windows does not mind, so a wrong capital letter only breaks online.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';

export const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SITE_FOLDERS = ['index.html', 'rooms', 'teacher', 'js', 'css'];
const SKIP = /^(https?:|mailto:|#|data:|\/\/)/;

function walk(path) {
  const full = join(ROOT, path);
  if (statSync(full).isFile()) return [path];
  return readdirSync(full).flatMap((name) => walk(posix.join(path, name)));
}

export function siteFiles() {
  return SITE_FOLDERS.flatMap(walk).filter((f) => /\.(html|js|mjs|css)$/.test(f) && !f.startsWith('js/vendor/'));
}

// Every path a file asks for, resolved from the site root.
// fetch() paths are relative to the PAGE: "../data/..." comes from a page in rooms/.
export function referencesIn(file) {
  const text = readFileSync(join(ROOT, file), 'utf8');
  const here = dirname(file);
  const found = [];
  const add = (raw, from) => {
    const path = raw.split(/[?#]/)[0];
    if (!path || SKIP.test(path) || path.includes('${')) return;
    found.push({ file, raw, path: posix.normalize(posix.join(from, path)) });
  };
  if (file.endsWith('.html')) {
    for (const [, raw] of text.matchAll(/(?:src|href)="([^"]+)"/g)) add(raw, here);
  }
  if (file.endsWith('.js') || file.endsWith('.mjs')) {
    for (const [, raw] of text.matchAll(/(?:from|import)\s*\(?\s*'(\.[^']+)'/g)) add(raw, here);
    for (const [, raw] of text.matchAll(/fetch\(\s*'([^']+)'/g)) add(raw, raw.startsWith('../') ? 'rooms' : '.');
  }
  if (file.endsWith('.css')) {
    // Single, double or no quotes (Part 54f: a built-in data: icon uses double quotes).
    for (const [, raw] of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) add(raw, here);
  }
  return found;
}

// True if `path` exists with exactly this spelling (every folder and the file name).
export function existsExactly(path) {
  let folder = ROOT;
  for (const part of path.split('/')) {
    if (part === '.' || part === '') continue;
    let names;
    try { names = readdirSync(folder); } catch { return false; }
    if (!names.includes(part)) return false;
    folder = join(folder, part);
  }
  return true;
}
