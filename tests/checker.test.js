import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { checkQuestion } from '../js/helpers/checker.js';

test('a clear, well-formed question has no warnings', () => {
  assert.deepEqual(checkQuestion('What did you eat for breakfast this morning?'), []);
});

test('catches a yes/no-only question with no timeframe', () => {
  const warnings = checkQuestion('Do you like pizza?');
  assert.equal(warnings.length, 2);
});

test('catches a negative, leading, yes/no question with no timeframe', () => {
  const warnings = checkQuestion("Don't you think school is good?");
  assert.ok(warnings.length >= 3, `expected several warnings, got ${warnings.length}`);
});

test('a missing question mark is the only warning on an otherwise good question', () => {
  const warnings = checkQuestion('How many hours did you sleep last night');
  assert.deepEqual(warnings, ['Questions usually end with a "?".']);
});

test('every scenario question passes our own checker (zero warnings)', () => {
  // Reads every file in the folder, so a new scenario is checked automatically.
  const folder = new URL('../data/scenarios/', import.meta.url);
  for (const file of readdirSync(folder)) {
    const recipe = JSON.parse(readFileSync(new URL(file, folder), 'utf8'));
    assert.deepEqual(checkQuestion(recipe.question), [], `${file}: "${recipe.question}"`);
  }
});

test('a number counts as a timeframe signal', () => {
  const warnings = checkQuestion('How many pets have you owned in the last 5 years?');
  assert.ok(!warnings.some((w) => w.includes('Which time')));
});
