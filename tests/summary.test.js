import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tagEntries, MISCONCEPTION_TAGS } from '../js/helpers/summary.js';

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
