// Layer 3: the thesis-metrics table (Part 20). One row per child per scenario,
// ready for Excel or SPSS, plus a data dictionary that explains every column.
// Pure, tested in Node (tests/thesis.test.js).
// DEMO rows are NEVER exported (integrity rule: never invent pilot results).
import { PHASES } from './progress.js';
import { tableCSV } from '../storage/export.js';

const PHASE_NAMES = {
  ask: 'Ask', plan: 'Plan', collect: 'Collect', graph: 'Graph Lab',
  number: 'Number Lab', chance: 'Chance Lab', conclude: 'Conclude',
};

// The columns, in order, each with its meaning (this list IS the data dictionary).
export const THESIS_COLUMNS = [
  { key: 'code', meaning: 'Anonymous explorer code (no names).' },
  { key: 'scenarioId', meaning: 'Which synthetic scenario the child investigated.' },
  { key: 'preview', meaning: 'true if this run was done with the teacher preview ("open all rooms") switched on: probably a teacher test, not a child.' },
  { key: 'phasesDone', meaning: 'How many of the 7 phases were finished (0-7).' },
  { key: 'finished', meaning: 'true if the child finished Conclude.' },
  ...PHASES.flatMap((p) => [
    { key: `${p}Done`, meaning: `${PHASE_NAMES[p]}: true if finished.` },
    { key: `${p}Stars`, meaning: `${PHASE_NAMES[p]}: stars on the end-of-phase card (1-3, reasoning only; empty if not finished).` },
    { key: `${p}Minutes`, meaning: `${PHASE_NAMES[p]}: minutes from first entering the phase to finishing it (empty if unknown).` },
  ]),
  { key: 'totalStars', meaning: 'Sum of stars over all phases (0-21).' },
  { key: 'hintsUsed', meaning: 'Hints the child asked for in this investigation (never penalised).' },
  { key: 'badges', meaning: 'Reasoning badges earned (whole log, all scenarios).' },
  { key: 'level', meaning: 'Explorer level reached (from badges).' },
  { key: 'planGuess', meaning: 'The guess made in Plan, before seeing any data.' },
  { key: 'numberGuess', meaning: 'Number Lab: the guess before the numbers were revealed (a number, or a word for games).' },
  { key: 'mean', meaning: 'Number Lab: the real class mean shown after the guess (empty for games).' },
  { key: 'predictionError', meaning: 'Number Lab: how far the guess was from the mean (|guess - mean|; empty for games).' },
  { key: 'revised', meaning: 'Number Lab: true if the child changed their guess after seeing the data, false if they kept it.' },
  { key: 'revisionReason', meaning: 'Number Lab: the reason the child typed for changing their guess.' },
  { key: 'tasksFirstTry', meaning: 'Number Lab puzzles solved on the first try.' },
  { key: 'tasksAfterHint', meaning: 'Number Lab puzzles solved after a wrong try (each wrong try shows a hint).' },
  { key: 'tasksUnsolved', meaning: 'Number Lab puzzles started but left unsolved.' },
  { key: 'firstTryRate', meaning: 'Percent of Number Lab puzzles solved on the first try.' },
  { key: 'graphTell', meaning: 'Graph Lab: what the child wrote the graph tells us.' },
  { key: 'graphNotTell', meaning: 'Graph Lab: what the child wrote the graph can NOT tell us.' },
  { key: 'chanceDevice', meaning: 'Chance Lab: the device the child rated (coin, dice, fair or unfair spinner).' },
  { key: 'chanceRating', meaning: 'Chance Lab: the certainty word chosen (Impossible ... Certain).' },
  { key: 'chanceReason', meaning: 'Chance Lab: the reason the child typed for that rating.' },
  { key: 'biggestRun', meaning: 'Chance Lab: the largest number of trials the child ran.' },
  { key: 'biggestRunPct', meaning: 'Chance Lab: percent of that run that landed on the target outcome.' },
  { key: 'claim', meaning: 'Evidence Board: the claim ("I think ...").' },
  { key: 'because', meaning: 'Evidence Board: the reason ("... because ...").' },
  { key: 'evidenceCount', meaning: 'Evidence Board: how many numbers the child picked as proof.' },
  { key: 'certainty', meaning: 'Evidence Board: how sure (impossible / unlikely / even / likely / certain).' },
  { key: 'certaintyReason', meaning: 'Evidence Board: why the child is that sure.' },
];

const KEYS = THESIS_COLUMNS.map((c) => c.key);

// The rows that may be exported: real children only, never DEMO.
export function exportableRows(rows) {
  return rows.filter((row) => !row.demo);
}

export function thesisCSV(rows) {
  return tableCSV(KEYS, exportableRows(rows));
}

export function dictionaryCSV() {
  return tableCSV(['column', 'meaning'], THESIS_COLUMNS.map((c) => ({ column: c.key, meaning: c.meaning })));
}
