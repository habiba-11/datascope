import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { recapCardIds, exampleLines, exampleAnswer } from '../js/helpers/recap.js';
import { mean, median, mode, range, formatMean } from '../js/helpers/stats.js';
import { generateClassData } from '../js/helpers/generator.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';
import { numberLabKind } from '../js/helpers/number-tasks.js';
import { longestSentence, allStrings } from '../js/helpers/readability.js';
import { makeEntry } from '../js/helpers/log.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
const recap = read('content/recap.json');
const card = (id) => recap.cards.find((c) => c.id === id);

test('words (games) only get the mode card', () => {
  assert.deepEqual(recapCardIds('category'), ['mode']);
  assert.deepEqual(recapCardIds('number'), ['mean', 'median', 'mode', 'range']);
});

test('every card has a meaning line, 3 steps and an example', () => {
  for (const id of recapCardIds('number')) {
    const c = card(id);
    assert.ok(c.what, id);
    assert.equal(c.steps.length, 3, id);
    assert.equal(exampleLines(id, c.example).length, 3, id);
  }
});

test('worked examples are computed correctly', () => {
  assert.deepEqual(exampleLines('mean', [2, 4, 6, 8, 10]), ['2 + 4 + 6 + 8 + 10 = 30', 'There are 5 numbers.', '30 ÷ 5 = 6. The mean is 6.']);
  assert.equal(exampleLines('median', [7, 3, 11, 1, 5])[0], 'In order: 1, 3, 5, 7, 11');
  assert.equal(exampleLines('median', [4, 1, 3, 2])[2], 'Halfway between them is 2.5. The median is 2.5.');
  assert.equal(exampleLines('mode', [2, 3, 3, 4, 5])[2], 'The mode is 3.');
  assert.equal(exampleLines('range', [3, 12, 5, 6])[2], '12 − 3 = 9. The range is 9.');
});

test("the recap never gives away a scenario's real answers (guess first!)", () => {
  for (const id of PICKABLE_SCENARIOS) {
    const recipe = read(`scenarios/${id}.json`);
    if (numberLabKind(recipe) === 'category') continue;
    const classes = [recipe, recipe.compareWith && read(`scenarios/${recipe.compareWith}.json`)].filter(Boolean);
    for (const r of classes) {
      const { values } = generateClassData(r);
      const real = { mean: formatMean(mean(values)), median: median(values), mode: mode(values), range: range(values) };
      for (const stat of ['mean', 'median', 'range']) {
        assert.notEqual(exampleAnswer(stat, card(stat).example), real[stat], `${r.id}: ${stat}`);
      }
      assert.ok(!real.mode.includes(exampleAnswer('mode', card('mode').example)), `${r.id}: mode`);
    }
  }
});

test('recap texts follow the Grade 5 rule and never say "middle"', () => {
  for (const text of allStrings({ cards: recap.cards, wordsNote: recap.wordsNote })) {
    assert.ok(longestSentence(text) <= 12, text);
    assert.doesNotMatch(text, /middle/i, text);
  }
  for (const c of recap.cards) {
    for (const line of exampleLines(c.id, c.example)) assert.doesNotMatch(line, /middle/i, line);
  }
});

test('recap-viewed is a known log event', () => {
  assert.equal(makeEntry('OWL-07', 'number-lab', 'recap-viewed', { auto: true, cardsViewed: ['mean'] }).type, 'recap-viewed');
});

test('words get a word example for the mode, which gives nothing away', () => {
  const words = card('mode').wordExample;
  assert.deepEqual(exampleLines('mode', words).slice(1), ['Red comes up the most.', 'The mode is Red.']);
  const games = generateClassData(read('scenarios/playground-game.json')).values;
  const lunches = read('content/playground-game.json').numberLab.realLife.items;
  assert.ok(!mode(games).includes('Red') && !mode(lunches).includes('Red'));
});
