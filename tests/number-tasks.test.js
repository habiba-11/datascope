import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  numberLabKind, TASKS_BY_KIND, fillTemplate, buildTarget, buildExample, isAllSame, miaSays, choicesFor, revealMessage, classStats,
} from '../js/helpers/number-tasks.js';
import { mean, median, mode } from '../js/helpers/stats.js';
import { longestSentence } from '../js/helpers/readability.js';
import { generateClassData } from '../js/helpers/generator.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));

test('the worked example is right: the same total and the same mean, before and after', () => {
  const example = buildExample(8);
  assert.equal(example.mean, 4);
  assert.deepEqual(example.start, [4, 4, 4, 4, 4]);
  assert.deepEqual(example.moved, [3, 5, 4, 4, 4]);
  assert.equal(mean(example.start), mean(example.moved));
  assert.equal(example.total, 20);
});

test('the worked example never gives away the answer', () => {
  assert.equal(buildExample(4).mean, 5); // a task with mean 4 gets another example
  for (const id of PICKABLE_SCENARIOS) {
    const recipe = read(`scenarios/${id}.json`);
    if (recipe.answerType !== 'number') continue;
    const target = buildTarget(generateClassData(recipe).values);
    assert.notEqual(buildExample(target).mean, target, id);
  }
});

test('the worked example follows the Grade 5 rule (12 words or fewer per sentence)', () => {
  const { title, startText, movedText, endText } = buildExample(8);
  for (const text of [title, startText, movedText, endText]) assert.ok(longestSentence(text) <= 12, text);
});

test('all the same is noticed; different numbers are not', () => {
  assert.equal(isAllSame([8, 8, 8, 8, 8]), true);
  assert.equal(isAllSame([7, 9, 8, 8, 8]), false);
});

test('each scenario gets the right kind of Number Lab', () => {
  assert.equal(numberLabKind(read('scenarios/sleep-hours.json')), 'number');
  assert.equal(numberLabKind(read('scenarios/playground-game.json')), 'category');
  assert.equal(numberLabKind(read('scenarios/reading-minutes-class-a.json')), 'compare');
});

test('the content file agrees with the recipe about the kind', () => {
  for (const id of PICKABLE_SCENARIOS) {
    assert.equal(read(`content/${id}.json`).numberLab.kind, numberLabKind(read(`scenarios/${id}.json`)), id);
  }
});

test('category scenarios have no mean or median tasks', () => {
  assert.ok(!TASKS_BY_KIND.category.includes('build'));
  assert.ok(TASKS_BY_KIND.category.includes('whyNoMean'));
});

test('fillTemplate fills gaps and leaves unknown ones', () => {
  assert.equal(fillTemplate('Their mean is {target}.', { target: 8 }), 'Their mean is 8.');
  assert.equal(fillTemplate('{x} stays', {}), '{x} stays');
});

test('the Build-it target is the class mean, rounded (sleep: 8.4 -> 8)', () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  assert.equal(buildTarget(values), 8);
});

test('Mia picks the middle number without sorting', () => {
  assert.equal(miaSays([9, 3, 20, 5, 7]), 20);
  assert.equal(median([9, 3, 20, 5, 7]), 7);
});

test('choices are the different values, in order', () => {
  assert.deepEqual(choicesFor([36, 34, 35, 34]), [34, 35, 36]);
  assert.deepEqual(choicesFor(['Rice', 'Pizza', 'Rice']), ['Pizza', 'Rice']);
});

test('every "find the mistake" list really has a mistake to find', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { mistake } = read(`content/${id}.json`).numberLab;
    if (!mistake) continue;
    assert.equal(mistake.numbers.length % 2, 1, `${id}: an odd count has one middle number`);
    assert.notEqual(miaSays(mistake.numbers), median(mistake.numbers), `${id}: Mia must be wrong`);
  }
});

test('every real-life question has one clear answer, and mode and median differ', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { realLife } = read(`content/${id}.json`).numberLab;
    if (!realLife) continue;
    const list = realLife.numbers || realLife.items;
    assert.equal(mode(list).length, 1, `${id}: one mode`);
    if (realLife.numbers) {
      assert.equal(list.length % 2, 1, `${id}: odd count`);
      assert.notEqual(mode(list)[0], median(list), `${id}: repeating the mode must not pass the median question`);
    }
  }
});

test('the "why no mean" question has exactly one right answer and at most 4 options', () => {
  const { whyNoMean } = read('content/playground-game.json').numberLab;
  assert.equal(whyNoMean.options.filter((o) => o.correct).length, 1);
  assert.ok(whyNoMean.options.length <= 4);
});

test('reveal message: sleep data points at the low extreme value', () => {
  const { values } = generateClassData(read('scenarios/sleep-hours.json'));
  const message = revealMessage('number', 6, classStats('number', values));
  assert.match(message, /The mean is 8.4/);
  assert.match(message, /lower than the median/);
});

test('reveal message: two modes are pointed out (shoe sizes)', () => {
  const { values } = generateClassData(read('scenarios/shoe-sizes.json'));
  const message = revealMessage('number', 35, classStats('number', values));
  assert.match(message, /2 modes/);
  // 35.3 vs 35: no extreme value in the shoe data, so Pip must not say one pulls the mean.
  assert.doesNotMatch(message, /pulls/);
});

test('reveal message: same mean, different range (reading)', () => {
  const a = generateClassData(read('scenarios/reading-minutes-class-a.json')).values;
  const b = generateClassData(read('scenarios/reading-minutes-class-b.json')).values;
  const message = revealMessage('compare', 20, classStats('compare', a, b));
  assert.match(message, /Nice guess/);
  assert.match(message, /look at the range/);
});

test('reveal message: category guess right and wrong', () => {
  assert.match(revealMessage('category', 'Football', { mode: ['Football'] }), /Yes! Most kids picked Football/);
  assert.match(revealMessage('category', 'Tag', { mode: ['Football'] }), /not Tag/);
});
