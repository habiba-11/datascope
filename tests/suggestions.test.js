import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  answerFacts, fillSuggestions, chanceAnswers, becauseText, appendAnswer, answerSource,
} from '../js/helpers/suggestions.js';
import { generateClassData } from '../js/helpers/generator.js';
import { PICKABLE_SCENARIOS } from '../js/helpers/scenarios.js';
import { countWords, buildPhaseFeedback } from '../js/helpers/feedback.js';
import { longestSentence } from '../js/helpers/readability.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));

// The real data of a scenario, with its filled-in Graph Lab answers.
function graphAnswers(id) {
  const recipe = read(`scenarios/${id}.json`);
  const partner = recipe.compareWith ? read(`scenarios/${recipe.compareWith}.json`) : null;
  const values = generateClassData(recipe).values;
  const valuesB = partner ? generateClassData(partner).values : null;
  const facts = answerFacts(recipe, values, partner, valuesB);
  const { graphLab } = read(`content/${id}.json`);
  return {
    facts,
    tell: fillSuggestions(graphLab.tellAnswers, facts),
    notTell: fillSuggestions(graphLab.notTellAnswers, facts),
  };
}

test('facts come from the real answers: one mode, two modes, and words', () => {
  const sleep = answerFacts({ valueLabel: '{value} hours' }, [3, 7, 9, 9, 9]);
  assert.equal(sleep.top, '9 hours');
  assert.equal(sleep.topCount, '3 kids');
  assert.equal(sleep.low, '3 hours and 7 hours');
  assert.equal(sleep.lowCount, '1 kid');
  assert.equal(sleep.min, '3 hours');
  assert.equal(sleep.max, '9 hours');

  const shoes = answerFacts({ valueLabel: 'Size {value}' }, [34, 34, 35, 35, 36]);
  assert.equal(shoes.top, 'Size 34 and Size 35');

  const games = answerFacts({ valueLabel: '{value}' }, ['Tag', 'Football', 'Football', 'Swings']);
  assert.equal(games.top, 'Football');
  assert.equal(games.low, 'Swings and Tag');
  assert.equal(games.kinds, 3);
});

test('two classes also get each class\'s spread and mean', () => {
  const reading = { valueLabel: '{value} min' };
  const facts = answerFacts(reading, [18, 22], reading, [5, 35]);
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

// Every other room's answers, filled in with each scenario's real data.
function roomAnswers(id) {
  const recipe = read(`scenarios/${id}.json`);
  const partner = recipe.compareWith ? read(`scenarios/${recipe.compareWith}.json`) : null;
  const values = generateClassData(recipe).values;
  const valuesB = partner ? generateClassData(partner).values : null;
  const facts = answerFacts(recipe, values, partner, valuesB);
  const content = read(`content/${id}.json`);
  return {
    facts,
    claim: fillSuggestions(content.evidenceBoard.claimAnswers, facts),
    because: fillSuggestions(content.evidenceBoard.becauseAnswers, facts),
    reason: fillSuggestions(content.numberLab.reasonAnswers, facts),
    sure: fillSuggestions(read('content/answers.json').certaintyWhy, facts),
  };
}

const DEVICES = [
  { outcomes: ['Heads', 'Tails'], weights: [1, 1], target: 'Heads' },
  { outcomes: ['1', '2', '3', '4', '5', '6'], weights: [1, 1, 1, 1, 1, 1], target: '6' },
  { outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [1, 1, 1, 1], target: 'Blue' },
  { outcomes: ['Red', 'Blue', 'Green', 'Yellow'], weights: [4, 1, 1, 1], target: 'Red' },
];

test('every other box has 3 answers that meet the rules, with every gap filled', () => {
  const allLists = PICKABLE_SCENARIOS.flatMap((id) => {
    const { claim, because, reason, sure } = roomAnswers(id);
    return [claim, because, reason, sure];
  });
  const whyWords = read('content/answers.json').chanceWhy;
  allLists.push(...DEVICES.map((device) => chanceAnswers(whyWords, device)));
  for (const list of allLists) {
    assert.equal(list.length, 3);
    for (const { text } of list) {
      assert.doesNotMatch(text, /[{}]|undefined/, `"${text}"`);
      assert.ok(countWords(text) >= 5, `"${text}" is under 5 words`);
      assert.ok(text.length >= 10, `"${text}"`);
      assert.ok(longestSentence(text) <= 12, `"${text}"`);
      assert.doesNotMatch(text, /middle/i, `"${text}"`);
    }
  }
});

test('Chance Lab answers come from the device: its chance, and fair or unfair', () => {
  const whyWords = read('content/answers.json').chanceWhy;
  const coin = chanceAnswers(whyWords, DEVICES[0]).map((s) => s.text);
  assert.deepEqual(coin, [
    'Because there are 2 things that could happen.',
    'Because the chance of Heads is 1 in 2.',
    'Because every outcome has the same chance.',
  ]);
  const unfair = chanceAnswers(whyWords, DEVICES[3]).map((s) => s.text);
  assert.equal(unfair[1], 'Because the chance of Red is 4 in 7.');
  assert.equal(unfair[2], 'Because the Red part is bigger than the others.');
});

test('Evidence Board and Number Lab answers say the real numbers of each scenario', () => {
  const text = (id, list) => roomAnswers(id)[list].map((s) => s.text).join(' | ');
  assert.match(text('sleep-hours', 'because'), /the median is 9 hours/);
  assert.match(text('sleep-hours', 'because'), /the mode is 9 hours/);
  assert.match(text('sleep-hours', 'because'), /the mean is 8\.4 hours/);
  assert.match(text('shoe-sizes', 'because'), /the modes are Size 34 and Size 35/);
  assert.match(text('shoe-sizes', 'because'), /the median size is Size 35/);
  assert.match(text('playground-game', 'because'), /6 kids picked Football, the most of all/);
  assert.match(text('reading-minutes-class-a', 'because'), /Class B's range is 30, and Class A's is 4/);
  assert.match(text('reading-minutes-class-a', 'reason'), /the mean of both classes is 20/);
  assert.match(text('sleep-hours', 'sure'), /we only asked 20 pretend kids/);
  assert.match(text('reading-minutes-class-a', 'sure'), /we only asked 36 pretend kids/);
});

test('an "I think" answer fits its one-line box', () => {
  for (const id of PICKABLE_SCENARIOS) {
    for (const { text } of roomAnswers(id).claim) assert.ok(text.length <= 45, `${id}: "${text}"`);
  }
});

test('a hint never costs a star: a tapped answer earns the same stars as typed words', () => {
  for (const id of PICKABLE_SCENARIOS) {
    for (const { text } of graphAnswers(id).notTell) {
      const card = buildPhaseFeedback('graph', { typesTried: 2, notTellWords: countWords(text) });
      assert.equal(card.stars, 3, `${id}: "${text}"`);
    }
    for (const { text } of roomAnswers(id).sure) {
      const card = buildPhaseFeedback('conclude', { evidenceCount: 2, certaintyReasonWords: countWords(text) });
      assert.equal(card.stars, 3, `${id}: "${text}"`);
    }
  }
});

test('the Evidence Card says "because" only once', () => {
  assert.equal(becauseText('we asked 20 kids'), 'because we asked 20 kids');
  assert.equal(becauseText('Because we asked 20 kids'), 'Because we asked 20 kids');
  assert.equal(becauseText('because of the data'), 'because of the data');
  assert.equal(becauseText('becausethe'), 'because becausethe');
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
