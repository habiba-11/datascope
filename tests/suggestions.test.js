import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  graphFacts, fillSuggestions, appendAnswer, answerSource,
} from '../js/helpers/suggestions.js';
import { generateClassData } from '../js/helpers/generator.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';
import { countWords } from '../js/helpers/feedback.js';
import { longestSentence } from '../js/helpers/readability.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));

// The real data of a scenario, with its filled-in Graph Lab answers.
function graphAnswers(id) {
  const recipe = read(`scenarios/${id}.json`);
  const partner = recipe.compareWith ? read(`scenarios/${recipe.compareWith}.json`) : null;
  const values = generateClassData(recipe).values;
  const valuesB = partner ? generateClassData(partner).values : null;
  const facts = graphFacts(recipe, values, partner, valuesB);
  const { graphLab } = read(`content/${id}.json`);
  return {
    facts,
    tell: fillSuggestions(graphLab.tellAnswers, facts),
    notTell: fillSuggestions(graphLab.notTellAnswers, facts),
  };
}

test('facts come from the real answers: one mode, two modes, and words', () => {
  const sleep = graphFacts({ valueLabel: '{value} hours' }, [3, 7, 9, 9, 9]);
  assert.equal(sleep.top, '9 hours');
  assert.equal(sleep.topCount, '3 kids');
  assert.equal(sleep.low, '3 hours and 7 hours');
  assert.equal(sleep.lowCount, '1 kid');
  assert.equal(sleep.min, '3 hours');
  assert.equal(sleep.max, '9 hours');

  const shoes = graphFacts({ valueLabel: 'Size {value}' }, [34, 34, 35, 35, 36]);
  assert.equal(shoes.top, 'Size 34 and Size 35');

  const games = graphFacts({ valueLabel: '{value}' }, ['Tag', 'Football', 'Football', 'Swings']);
  assert.equal(games.top, 'Football');
  assert.equal(games.low, 'Swings and Tag');
  assert.equal(games.kinds, 3);
});

test('two classes also get each class\'s spread and mean', () => {
  const reading = { valueLabel: '{value} min' };
  const facts = graphFacts(reading, [18, 22], reading, [5, 35]);
  assert.equal(facts.minB, '5 min');
  assert.equal(facts.maxB, '35 min');
  assert.equal(facts.rangeA, 4);
  assert.equal(facts.rangeB, 30);
  assert.equal(facts.meanA, facts.meanB);
});

test('every Graph Lab question has 3 suggested answers, with every gap filled', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { tell, notTell } = graphAnswers(id);
    for (const list of [tell, notTell]) {
      assert.equal(list.length, 3, id);
      assert.deepEqual(list.map((s) => s.id), ['s1', 's2', 's3']);
      for (const { text } of list) assert.doesNotMatch(text, /[{}]/, `${id}: "${text}"`);
    }
  }
});

test('suggested answers meet the rules: 5+ words, 10+ characters, the Grade 5 rule, no "middle"', () => {
  for (const id of PICKABLE_SCENARIOS) {
    const { tell, notTell } = graphAnswers(id);
    for (const { text } of [...tell, ...notTell]) {
      assert.ok(countWords(text) >= 5, `${id}: "${text}" is under 5 words`);
      assert.ok(text.length >= 10, `${id}: "${text}"`);
      assert.ok(longestSentence(text) <= 12, `${id}: "${text}"`);
      assert.doesNotMatch(text, /middle/i, `${id}: "${text}"`);
    }
  }
});

test('the suggested answers say the real numbers of each scenario', () => {
  const texts = (id) => graphAnswers(id).tell.map((s) => s.text).join(' ');
  assert.match(texts('sleep-hours'), /9 hours is the most common answer, with 6 kids/);
  assert.match(texts('sleep-hours'), /Only 1 kid slept 3 hours/);
  assert.match(texts('shoe-sizes'), /Size 34 and Size 35 are most common, with 5 kids each/);
  assert.match(texts('playground-game'), /Football is the most common answer, with 6 kids/);
  assert.match(texts('playground-game'), /Only 1 kid picked Swings/);
  assert.match(texts('reading-minutes-class-a'), /from 18 min to 22 min/);
  assert.match(texts('reading-minutes-class-a'), /from 5 min to 35 min/);
});

test('the reading answers are true: the same mean, and Class B really is more spread out', () => {
  const { facts } = graphAnswers('reading-minutes-class-a');
  assert.equal(facts.meanA, facts.meanB);
  assert.ok(facts.rangeB > facts.rangeA);
});

test('a tap fills an empty box, and adds to a box that has words', () => {
  assert.equal(appendAnswer('', 'Most kids slept 9 hours.'), 'Most kids slept 9 hours.');
  assert.equal(appendAnswer('I see', 'Most kids slept 9 hours.'), 'I see Most kids slept 9 hours.');
  assert.equal(appendAnswer('I see  ', 'Go.'), 'I see Go.');
});

test('where an answer came from: own, hint or hint-edited', () => {
  assert.equal(answerSource('my own words', []), 'own');
  assert.equal(answerSource('Most kids slept 9 hours.', ['Most kids slept 9 hours.']), 'hint');
  assert.equal(answerSource('  Most kids slept 9 hours. ', ['Most kids slept 9 hours.']), 'hint');
  assert.equal(answerSource('A. B.', ['A.', 'B.']), 'hint');
  assert.equal(answerSource('Most kids slept 9 hours!', ['Most kids slept 9 hours.']), 'hint-edited');
  assert.equal(answerSource('I think Most kids slept 9 hours.', ['Most kids slept 9 hours.']), 'hint-edited');
});
