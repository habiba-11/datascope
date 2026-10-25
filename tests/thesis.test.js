import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THESIS_COLUMNS, thesisCSV, dictionaryCSV, exportableRows } from '../js/helpers/thesis.js';
import { makeDemoFiles } from '../js/helpers/demo.js';
import { childRows, classOverview } from '../js/helpers/metrics.js';
import { parseExportFile } from '../js/helpers/summary.js';
import { tableCSV } from '../js/storage/export.js';

const PARTNERS = { 'reading-minutes-class-a': 'reading-minutes-class-b' };
const demoRows = childRows(makeDemoFiles(), PARTNERS);

// One real child, built the same way as a demo child, but without the demo flag.
const real = { ...makeDemoFiles()[0], code: 'OWL-07', demo: undefined };
real.entries = real.entries.map((e) => ({ ...e, code: 'OWL-07' }));
const realRows = childRows([real], PARTNERS);

test('every column the dashboard computes has a meaning in the dictionary', () => {
  const keys = THESIS_COLUMNS.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length, 'no duplicate columns');
  for (const key of keys) assert.ok(key in realRows[0], `${key} is not in the rows`);
  for (const c of THESIS_COLUMNS) assert.ok(c.meaning.length > 10, c.key);
});

test('the thesis CSV keeps the column order, one row per child per scenario', () => {
  const [header, ...lines] = thesisCSV(realRows).split('\r\n');
  assert.equal(header, THESIS_COLUMNS.map((c) => c.key).join(','));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^OWL-07,sleep-hours,7,true,/);
});

test('DEMO children are never exported', () => {
  assert.equal(exportableRows(demoRows).length, 0);
  const csv = thesisCSV([...demoRows, ...realRows]);
  assert.doesNotMatch(csv, /DEMO-\d/); // no demo child codes
  assert.equal(csv.split('\r\n').length, 2); // header + the one real child
});

test('demo files are clearly labelled and look like real files to the dashboard', () => {
  for (const file of makeDemoFiles()) {
    assert.equal(file.demo, true);
    assert.match(file.code, /^DEMO-/);
    assert.equal(parseExportFile(JSON.stringify(file)).ok, true);
  }
  assert.ok(demoRows.every((r) => r.demo));
});

test('the demo class shows a realistic funnel (some children stop early)', () => {
  const o = classOverview(demoRows);
  assert.equal(o.children, 4);
  assert.equal(o.funnel.ask, 4);
  assert.equal(o.funnel.conclude, 2);
});

test('the dictionary file lists every column', () => {
  const lines = dictionaryCSV().split('\r\n');
  assert.equal(lines[0], 'column,meaning');
  assert.equal(lines.length, THESIS_COLUMNS.length + 1);
});

test('fixed-column CSV: missing values are empty, and typed formulas are made safe', () => {
  assert.equal(tableCSV(['a', 'b'], [{ a: '=SUM(1)', b: null }]), "a,b\r\n'=SUM(1),");
});
