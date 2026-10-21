import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExport, exportFileName, toCSV } from '../js/storage/export.js';

const when = new Date('2026-10-22T09:30:00Z');
const entries = [
  { code: 'OWL-07', time: '2026-10-22T09:00:00.000Z', room: 'number-lab', type: 'prediction', guess: 9 },
  {
    code: 'OWL-07', time: '2026-10-22T09:10:00.000Z', room: 'evidence-board', type: 'claim',
    claim: 'kids sleep 9 hours, mostly', evidence: ['Median: 9', 'Mode: 9'],
  },
];

test('the JSON export holds the code, a synthetic-data note and every entry', () => {
  const file = buildExport('OWL-07', entries, when);
  assert.equal(file.code, 'OWL-07');
  assert.equal(file.exportedAt, '2026-10-22T09:30:00.000Z');
  assert.match(file.note, /synthetic/);
  assert.equal(file.entries.length, 2);
});

test('file names use the code and the date, never a name', () => {
  assert.equal(exportFileName('OWL-07', 'json', when), 'datascope-OWL-07-2026-10-22.json');
  assert.equal(exportFileName(null, 'csv', when), 'datascope-NO-CODE-2026-10-22.csv');
});

test('file names use the local date, even just after midnight', () => {
  const justAfterMidnight = new Date(2026, 9, 23, 0, 30); // 23 Oct, 00:30 on this computer's clock
  assert.equal(exportFileName('OWL-07', 'json', justAfterMidnight), 'datascope-OWL-07-2026-10-23.json');
});

test('CSV: fixed first columns, then one column per detail', () => {
  const [header] = toCSV(entries).split('\r\n');
  assert.equal(header, 'code,time,room,type,guess,claim,evidence');
});

test('CSV: commas are quoted and lists are joined', () => {
  const rows = toCSV(entries).split('\r\n');
  assert.equal(rows[2], 'OWL-07,2026-10-22T09:10:00.000Z,evidence-board,claim,,"kids sleep 9 hours, mostly",Median: 9; Mode: 9');
});

test('CSV: quotes are doubled and formulas are made harmless', () => {
  const csv = toCSV([{ code: 'OWL-07', time: 't', room: 'r', type: 'claim', claim: 'she said "hi"', because: '=SUM(A1)' }]);
  const row = csv.split('\r\n')[1];
  assert.ok(row.includes('"she said ""hi"""'));
  assert.ok(row.includes("'=SUM(A1)"));
});
