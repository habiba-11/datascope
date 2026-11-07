import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { checkQuestion } from '../js/helpers/checker.js';
import { longestSentence } from '../js/helpers/readability.js';

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
  assert.deepEqual(warnings, ['❓ End it with a ?']);
});

test('every scenario question passes our own checker (zero warnings)', () => {
  // Reads every file in the folder, so a new scenario is checked automatically.
  const folder = new URL('../data/scenarios/', import.meta.url);
  for (const file of readdirSync(folder)) {
    const recipe = JSON.parse(readFileSync(new URL(file, folder), 'utf8'));
    assert.deepEqual(checkQuestion(recipe.question), [], `${file}: "${recipe.question}"`);
  }
});

const asksWhen = (question) => checkQuestion(question).some((w) => w.includes('When?'));

test('a number with a time unit counts as a timeframe', () => {
  assert.ok(!asksWhen('How many pets have you owned in the last 5 years?'));
  assert.ok(!asksWhen('How many books did you read in 5 days?'));
  assert.ok(!asksWhen('How many books did you read in 2026?'));
});

test('a number alone is not a timeframe', () => {
  assert.ok(asksWhen('Which 3 games do you play?'));
  assert.ok(asksWhen('How many hours do you sleep?'));
  assert.ok(asksWhen('Did you sleep for 8 hours?'));
});

test('the checker knows many time words and phrases', () => {
  const phrases = [
    'today', 'yesterday', 'tonight', 'tomorrow', 'right now', 'at the moment',
    'this week', 'last week', 'next week', 'this month', 'last month', 'next month',
    'this year', 'last year', 'next year', 'this school year', 'this term', 'last term', 'this semester',
    'this morning', 'this afternoon', 'this evening', 'last night', 'this weekend', 'last weekend',
    'this summer', 'last summer', 'this winter', 'this holiday',
    'every day', 'each day', 'every week', 'each week', 'every night', 'per week', 'a week', 'a day',
    'in the past week', 'in the last week', 'past month',
    'on Monday', 'last Monday', 'this Friday', 'on Saturday', 'every Sunday',
    'in March', 'in May', 'in summer', 'in the summer', 'during summer',
    'at recess', 'during recess', 'at lunch', 'at night', 'in the morning', 'after school', 'before school',
    'on weekends', 'on the weekend', 'during the holidays', 'two days ago', 'a week ago',
  ];
  for (const phrase of phrases) {
    assert.deepEqual(checkQuestion(`How many books did you read ${phrase}?`), [], phrase);
  }
});

test('capital letters and extra spaces do not hide a time phrase', () => {
  assert.ok(!asksWhen('How many books did you read THIS WEEK?'));
  assert.ok(!asksWhen('How many books did you read this   week?'));
});

test('vague time words still ask "when?" (a survey needs a set timeframe, Paper 28)', () => {
  for (const vague of ['lately', 'recently', 'these days', 'nowadays', 'now', 'so far']) {
    assert.ok(asksWhen(`How many books did you read ${vague}?`), vague);
  }
});

test('"may" and "march" count as months only with a time word in front', () => {
  assert.ok(asksWhen('What may children play?'));
  assert.ok(asksWhen('Where do bands march?'));
});

test('a time word hidden inside another word does not count', () => {
  assert.ok(asksWhen('How many thisweek books did you read?'));
});

test('"right now" is a time, but "right" alone is still a leading word', () => {
  assert.deepEqual(checkQuestion('What is your favourite game right now?'), []);
  assert.ok(checkQuestion('What is the right game to play today?').some((w) => w.includes('"right"')));
});

test('a curly apostrophe is caught too (tablets type them)', () => {
  const warnings = checkQuestion('Don’t you like games today?');
  assert.ok(warnings.some((w) => w.includes("'not'")));
  assert.ok(warnings.some((w) => w.includes('yes or no')));
});

test('more yes/no starters are caught', () => {
  for (const question of ['Am I tall today?', 'Had you eaten today?', 'Might it rain today?', 'Wasn’t it fun today?']) {
    assert.ok(checkQuestion(question).some((w) => w.includes('yes or no')), question);
  }
});

test('a question that is too short gets a warning', () => {
  assert.ok(checkQuestion('today?').some((w) => w.includes('whole question')));
  assert.ok(!checkQuestion('What did you eat today?').some((w) => w.includes('whole question')));
});

test('every warning follows the Grade 5 rule (12 words or fewer per sentence)', () => {
  const all = checkQuestion("Don't you think school is good") // not + leading + no time + yes/no + no ?
    .concat(checkQuestion('Do you like pizza'));
  assert.ok(all.length >= 5);
  for (const warning of all) assert.ok(longestSentence(warning) <= 12, warning);
});

// ---------- Round 4, Part 45: the checklist and ONE tip at a time ----------
import { questionChecklist, firstTip, CHECKLIST } from '../js/helpers/checker.js';

test('the checklist has the 4 ticks from the pilot fix, and "not" counts as a pushy word', () => {
  assert.deepEqual(CHECKLIST.map((c) => c.id), ['mark', 'when', 'open', 'fair']);
  const ticks = (q) => Object.fromEntries(questionChecklist(q).map((c) => [c.id, c.ok]));
  assert.deepEqual(ticks('How many hours did you sleep last night?'), { mark: true, when: true, open: true, fair: true });
  assert.deepEqual(ticks('Do you sleep a lot?'), { mark: true, when: false, open: false, fair: true });
  assert.equal(ticks("Isn't football fun this week?").fair, false);
  assert.equal(ticks('What is the best game this week?').fair, false);
});

test('ONE tip at a time: the first problem only, and none for a good question', () => {
  assert.equal(firstTip("Don't you think school is good"), "🚫 Take out 'not' (like isn't or don't). It pushes people.");
  assert.equal(firstTip('Do you sleep a lot?'), "⏰ When? Say a time, like 'this week' or 'last night'.");
  assert.equal(firstTip('How many hours did you sleep last night?'), null);
});

test('the checklist and the tips use Grade 5 words', () => {
  for (const c of CHECKLIST) assert.ok(longestSentence(c.label) <= 12, c.label);
});
