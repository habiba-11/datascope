// Part 36: checks that keep the live site working (GitHub Pages).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, siteFiles, referencesIn, existsExactly } from '../dev/site-files.mjs';
import { BACKEND } from '../js/config.js';

const read = (path) => readFileSync(join(ROOT, path), 'utf8');

test('every file the site asks for exists, spelled exactly (Linux is case-sensitive)', () => {
  const refs = siteFiles().flatMap(referencesIn);
  assert.ok(refs.length > 100, `only ${refs.length} references found`);
  const missing = refs.filter((r) => !existsExactly(r.path)).map((r) => `${r.file} -> ${r.raw}`);
  assert.deepEqual(missing, []);
});

test('the scenario and content files the rooms load by name exist, spelled exactly', () => {
  for (const name of readdirSync(join(ROOT, 'data/content'))) assert.ok(existsExactly(`data/content/${name}`), name);
  const ids = JSON.parse(JSON.stringify(read('js/helpers/scenarios.js').match(/PICKABLE_SCENARIOS = \[([^\]]+)\]/)[1]))
    .match(/'[^']+'/g).map((s) => s.slice(1, -1));
  for (const id of ids) {
    assert.ok(existsExactly(`data/scenarios/${id}.json`), id);
    assert.ok(existsExactly(`data/content/${id}.json`), id);
  }
});

test('no page loads anything from the internet (fonts and Chart.js are stored with the app)', () => {
  const pages = siteFiles().filter((f) => f.endsWith('.html'));
  for (const page of pages) {
    const tags = read(page).match(/<(?:script|link)[^>]*>/g) || [];
    for (const tag of tags) assert.doesNotMatch(tag, /https?:\/\//, `${page}: ${tag}`);
  }
  assert.ok(existsExactly('js/vendor/chart.umd.min.js'));
  assert.match(read('css/fonts.css'), /assets\/fonts\/nunito-latin\.woff2/);
});

test('the secret key and the database password are never in the website', () => {
  for (const file of siteFiles()) {
    const text = read(file).replace(/NEVER put the secret key \('sb_secret_\.\.\.'\)/, '');
    assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9]/, file);
    assert.doesNotMatch(text, /service_role/, file);
  }
});

test('the live site starts with the database switched off (until the ethics check)', () => {
  assert.equal(BACKEND.enabled, false);
});

test('GitHub Pages serves every file as it is (no Jekyll)', () => {
  assert.ok(existsExactly('.nojekyll'));
});
