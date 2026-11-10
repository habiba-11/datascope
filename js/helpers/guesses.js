// Helper layer: the two guesses (Part 50, Round 4 pilot: the children mixed up
// the Plan guess and the Number Lab guess). Habiba chose option A (7 Nov 2026):
// - Plan asks for a PREDICTION before any data ("most kids slept...").
// - Number Lab asks for an ESTIMATE of the mean after seeing the data, and
//   reminds the child of their prediction.
// - Games has no mean, so Number Lab checks the Plan prediction against the
//   mode instead of asking the same question again.
// The log keeps its fields ("prediction", "revision"); metrics and badges are
// unchanged. No DOM here, so it is tested (tests/guesses.test.js).
import { valueText } from './charts.js';

// This child's newest Plan prediction for this scenario, or null. Filtered by
// code (a shared device holds other children's work too) and by room (Number
// Lab logs "prediction" as well).
export function planPrediction(entries, code, scenarioId) {
  const mine = entries.filter((e) => e.code === code && e.room === 'question-studio'
    && e.type === 'prediction' && e.scenarioId === scenarioId);
  return mine.length ? mine[mine.length - 1].guess : null;
}

// What Number Lab calls the child's guess: games check the prediction, the
// number scenarios make an estimate.
export function guessWord(kind) {
  return kind === 'category' ? 'prediction' : 'estimate';
}

// The reminder above Number Lab's question, or '' when there is no prediction.
export function planReminder(guess, recipe) {
  if (guess === null || guess === undefined || guess === '') return '';
  return `:crystal-ball: Before the survey, you predicted: ${valueText(guess, recipe)}.`; // :name: = icon (Part 54c)
}
