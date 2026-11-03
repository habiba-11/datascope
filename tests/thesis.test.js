import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THESIS_COLUMNS, thesisCSV, dictionaryCSV, exportableRows, sourceLabel } from '../js/helpers/thesis.js';
import { makeDemoFiles } from '../js/helpers/demo.js';
import { childRows, classOverview } from '../js/helpers/metrics.js';
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
  assert.match(lines[0], /^OWL-07,sleep-hours,false,7,true,/);
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
    assert.ok(file.entries.every((entry) => entry.code === file.code)); // shaped like a real child's work
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

const SOURCE_COLUMNS = [
  'graphTellSource', 'graphNotTellSource', 'chanceReasonSource', 'revisionReasonSource',
  'claimSource', 'becauseSource', 'certaintyReasonSource', 'suggestionsUsed',
];

test('the new columns come last, so older spreadsheets keep their column order', () => {
  const keys = THESIS_COLUMNS.map((c) => c.key);
  assert.deepEqual(keys.slice(-SOURCE_COLUMNS.length), SOURCE_COLUMNS);
  assert.equal(keys[keys.length - SOURCE_COLUMNS.length - 1], 'certaintyReason');
});

test('the dictionary explains the sources, and says what counts as reasoning', () => {
  const meaning = THESIS_COLUMNS.find((c) => c.key === 'claimSource').meaning;
  assert.match(meaning, /own = /);
  assert.match(meaning, /hint-edited = /);
  assert.match(meaning, /Only own and hint-edited answers are evidence/);
  assert.match(THESIS_COLUMNS.find((c) => c.key === 'hintsUsed').meaning, /not directly comparable/);
});

test('each answer\'s source reaches the row', () => {
  const [row] = realRows;
  assert.equal(row.graphTellSource, 'own');
  assert.equal(row.graphNotTellSource, 'hint');
  assert.equal(row.chanceReasonSource, 'hint-edited');
  assert.equal(row.revisionReasonSource, 'own');
  assert.equal(row.claimSource, 'own');
  assert.equal(row.becauseSource, 'hint');
  assert.equal(row.certaintyReasonSource, 'own');
  assert.equal(row.suggestionsUsed, 1);
  assert.equal(row.hintsUsed, 1);
});

test('an older log, with no source fields, leaves the columns empty (never guessed)', () => {
  const stripped = {
    ...real,
    entries: real.entries
      .filter((e) => e.type !== 'hint-picked')
      .map(({ answerSource, claimSource, becauseSource, certaintyReasonSource, suggestions, ...rest }) => rest),
  };
  const [row] = childRows([stripped], PARTNERS);
  for (const key of SOURCE_COLUMNS.slice(0, -1)) assert.equal(row[key], null, key);
  assert.equal(row.suggestionsUsed, 0);
  assert.match(thesisCSV([row]).split('\r\n')[1], /,0$/); // empty cells, then the count
});

test('the teacher sees each source in words', () => {
  assert.match(sourceLabel('own'), /own words/);
  assert.match(sourceLabel('hint'), /unchanged/);
  assert.match(sourceLabel('hint-edited'), /changed/);
  assert.equal(sourceLabel(null), '');
});

test('fixed-column CSV: missing values are empty, and typed formulas are made safe', () => {
  assert.equal(tableCSV(['a', 'b'], [{ a: '=SUM(1)', b: null }]), "a,b\r\n'=SUM(1),");
});
