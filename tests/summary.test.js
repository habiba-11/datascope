import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExportFile, summarizeChild, tagEntries, MISCONCEPTION_TAGS } from '../js/helpers/summary.js';
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

test('other files are refused with a reason', () => {
  assert.equal(parseExportFile('not json').reason, 'not a JSON file');
  assert.equal(parseExportFile('{"app":"Something else"}').reason, 'not a DataScope file');
  const mixed = buildExport('OWL-07', [{ ...entries[0], code: 'FOX-12' }]);
  assert.equal(parseExportFile(JSON.stringify(mixed)).reason, 'entries from a different code');
});

test('summary counts meaning-task results, hints and reasons', () => {
  const child = summarizeChild(JSON.parse(goodFile));
  assert.deepEqual(child.scenarios, ['sleep-hours']);
  assert.equal(child.tasksCorrect, 1);
  assert.equal(child.tasksAfterHint, 1);
  assert.equal(child.tasksIncorrect, 1);
  assert.equal(child.hintsUsed, 1);
  assert.equal(child.certaintyReasons, 1);
  assert.equal(child.lastClaim.claim, 'final');
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
