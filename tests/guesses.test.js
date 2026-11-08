import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planPrediction, guessWord, planReminder } from '../js/helpers/guesses.js';

const SLEEP = { valueLabel: '{value} hours' };
const GAMES = { valueLabel: '{value}' };

test('the Plan prediction: this child, this scenario, Question Studio only, the newest', () => {
  const log = [
    { code: 'OWL-07', room: 'question-studio', type: 'prediction', scenarioId: 'sleep-hours', guess: 7 },
    { code: 'OWL-07', room: 'question-studio', type: 'prediction', scenarioId: 'sleep-hours', guess: 9 },
    { code: 'OWL-07', room: 'number-lab', type: 'prediction', scenarioId: 'sleep-hours', guess: 8 },
    { code: 'FOX-11', room: 'question-studio', type: 'prediction', scenarioId: 'sleep-hours', guess: 5 },
    { code: 'OWL-07', room: 'question-studio', type: 'prediction', scenarioId: 'shoe-sizes', guess: 34 },
  ];
  assert.equal(planPrediction(log, 'OWL-07', 'sleep-hours'), 9);
  assert.equal(planPrediction(log, 'OWL-07', 'playground-game'), null);
});

test('Number Lab estimates a mean, but checks the prediction for games', () => {
  assert.equal(guessWord('number'), 'estimate');
  assert.equal(guessWord('compare'), 'estimate');
  assert.equal(guessWord('category'), 'prediction');
});

test('the reminder shows the prediction in the scenario\'s words, or nothing', () => {
  assert.equal(planReminder(9, SLEEP), ':crystal-ball: Before the survey, you predicted: 9 hours.');
  assert.equal(planReminder('Football', GAMES), ':crystal-ball: Before the survey, you predicted: Football.');
  assert.equal(planReminder(null, SLEEP), '');
});
