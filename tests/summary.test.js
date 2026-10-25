import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExportFile, tagEntries, MISCONCEPTION_TAGS } from '../js/helpers/summary.js';
import { buildExport } from '../js/storage/export.js';

const entries = [
  { code: 'OWL-07', time: 't1', room: 'data-hub', type: 'data-seen', scenarioId: 'sleep-hours', seed: 5 },
  { code: 'OWL-07', time: 't2', room: 'number-lab', type: 'prediction', guess: 9 },
  { code: 'OWL-07', time: 't3', room: 'number-lab', type: 'meaning-task', task: 'a', result: 'correct' },
  { code: 'OWL-07', time: 't4', room: 'number-lab', type: 'meaning-task', task: 'b', result: 'after-hint' },
  { code: 'OWL-07', time: 't5', room: 'number-lab', type: 'meaning-task', task: 'c', result: 'incorrect' },
  { code: 'OWL-07', time: 't6', room: 'graph-lab', type: 'hint', prompt: 'graph-tell', hintNumber: 1 },
  { code: 'OWL-07', time: 't7', room: 'chance-lab', type: 'certainty', rating: 'Likely', reason: 'more red' },
  { code: 'OWL-07', time: 't8', room: 'evidence-board', type: 'claim', claim: 'first' },
  { code: 'OWL-07', time: 't9', room: 'evidence-board', type: 'claim', claim: 'final' },
];
const goodFile = JSON.stringify(buildExport('OWL-07', entries));

test('a file saved by DataScope is accepted', () => {
  const result = parseExportFile(goodFile);
  assert.equal(result.ok, true);
  assert.equal(result.file.code, 'OWL-07');
});

test('both old (version 1) and new (version 2) files are accepted; unknown versions are not', () => {
  const v2 = buildExport('OWL-07', entries, new Date(), { 'sleep-hours': ['ask', 'plan'] });
  assert.equal(v2.formatVersion, 2);
  assert.deepEqual(parseExportFile(JSON.stringify(v2)).file.progress, { 'sleep-hours': ['ask', 'plan'] });

  const v1 = { ...v2, formatVersion: 1 };
  delete v1.progress; // version 1 files had no progress
  assert.equal(parseExportFile(JSON.stringify(v1)).ok, true);

  assert.equal(parseExportFile(JSON.stringify({ ...v2, formatVersion: 3 })).reason, 'unknown file version 3');
});

test('other files are refused with a reason', () => {
  assert.equal(parseExportFile('not json').reason, 'not a JSON file');
  assert.equal(parseExportFile('{"app":"Something else"}').reason, 'not a DataScope file');
  const mixed = buildExport('OWL-07', [{ ...entries[0], code: 'FOX-12' }]);
  assert.equal(parseExportFile(JSON.stringify(mixed)).reason, 'entries from a different code');
});

test('teacher tags become log entries with the readable label', () => {
  const [tag] = tagEntries('OWL-07', ['equally-likely']);
  assert.equal(tag.type, 'teacher-tag');
  assert.equal(tag.code, 'OWL-07');
  assert.equal(tag.tagLabel, 'Thinks every outcome is equally likely');
});

test('every misconception tag names its source papers', () => {
  for (const tag of MISCONCEPTION_TAGS) {
    assert.match(tag.papers, /^\d+(, \d+)*$/, tag.id);
  }
});
