// Layer 3: one child's journey through one investigation (Part 19).
// Pure: it reads the reasoning log and returns a summary per phase. The child's
// "My journey" page AND the teacher dashboard (Part 20) both use it, so the two
// can never disagree. Tested in Node (tests/journey.test.js).
import { PHASES } from './progress.js';
import { earnedBadges, levelFor } from './badges.js';

// Which room's log entries belong to each phase.
export const ROOM_OF_PHASE = {
  ask: 'question-studio', plan: 'question-studio', collect: 'data-hub',
  graph: 'graph-lab', number: 'number-lab', chance: 'chance-lab', conclude: 'evidence-board',
};

const last = (list) => (list.length ? list[list.length - 1] : null);
const ofType = (list, type) => list.filter((e) => e.type === type);

// What each phase's log entries tell us, in plain fields.
const DETAILS = {
  ask: () => ({}),
  plan: (es) => ({ guess: last(ofType(es, 'prediction'))?.guess ?? null }),
  collect: (es) => {
    // One entry per class surveyed (two for reading minutes), newest wins.
    const byScenario = new Map(ofType(es, 'data-seen').map((e) => [e.scenarioId, e]));
    return { classes: [...byScenario.values()].map((e) => ({ scenarioId: e.scenarioId, seed: e.seed, classSize: e.classSize })) };
  },
  graph: (es) => {
    const reflections = ofType(es, 'reflection');
    return {
      tell: last(reflections.filter((e) => e.prompt === 'tell'))?.text ?? null,
      notTell: last(reflections.filter((e) => e.prompt === 'not-tell'))?.text ?? null,
    };
  },
  number: (es) => {
    const prediction = last(ofType(es, 'prediction'));
    const revision = last(ofType(es, 'revision'));
    const tasks = ofType(es, 'meaning-task').map((e) => ({ task: e.task, result: e.result }));
    return {
      guess: prediction?.guess ?? null,
      mean: prediction?.mean ?? null,
      median: prediction?.median ?? null,
      mode: prediction?.mode ?? null,
      revision: revision ? { changed: revision.changed, newGuess: revision.newGuess ?? null, reason: revision.reason ?? null } : null,
      tasks,
      firstTry: tasks.filter((t) => t.result === 'correct').length,
      afterHint: tasks.filter((t) => t.result === 'after-hint').length,
      unsolved: tasks.filter((t) => t.result === 'incorrect').length,
    };
  },
  chance: (es) => {
    const certainty = last(ofType(es, 'certainty'));
    const trials = ofType(es, 'trials');
    const biggest = trials.reduce((best, e) => (!best || e.trials >= best.trials ? e : best), null);
    return {
      device: certainty?.device ?? null,
      rating: certainty?.rating ?? null,
      reason: certainty?.reason ?? null,
      runs: trials.map((e) => e.trials),
      biggestRun: biggest
        ? { trials: biggest.trials, outcome: biggest.outcome, pct: biggest.experimentalPct, theory: biggest.theory }
        : null,
    };
  },
  conclude: (es) => ({ claim: last(ofType(es, 'claim')) }),
};

// Start, end and stars of one phase, from the phase events (Parts 15 and 16).
function phaseEvents(mine, phase, scenarioId) {
  const find = (type) => mine.find((e) => e.type === type && e.phase === phase && e.scenarioId === scenarioId);
  const start = find('phase-start');
  const complete = find('phase-complete');
  const feedback = find('phase-feedback');
  return {
    start: start ? start.time : null,
    end: complete ? complete.time : null,
    stars: feedback ? feedback.stars : null,
  };
}

// `partnerId` is the second class's scenario (reading minutes: Class B), or null.
export function buildJourney(entries, code, scenarioId, partnerId = null) {
  const mine = entries.filter((e) => e.code === code);
  const scenarioIds = [scenarioId, partnerId].filter(Boolean);
  const phases = {};

  for (const phase of PHASES) {
    const { start, end, stars } = phaseEvents(mine, phase, scenarioId);
    // This phase's moments: from its room, between its start and end (when the
    // log has them: files from before Part 15 don't), and from this scenario
    // when the entry names one.
    const inPhase = mine.filter((e) => e.room === ROOM_OF_PHASE[phase]
      && (!start || e.time >= start)
      && (!end || e.time <= end)
      && (!e.scenarioId || scenarioIds.includes(e.scenarioId)));

    phases[phase] = {
      done: Boolean(end),
      stars,
      // For the teacher only (decided 25 Oct 2026): the child's page never shows time.
      durationMs: start && end ? Date.parse(end) - Date.parse(start) : null,
      hints: ofType(inPhase, 'hint').length,
      ...DETAILS[phase](inPhase),
    };
  }

  const badgeCount = earnedBadges(entries, code).size;
  return {
    code,
    scenarioId,
    phases,
    phasesDone: PHASES.filter((p) => phases[p].done).length,
    totalStars: PHASES.reduce((sum, p) => sum + (phases[p].stars || 0), 0),
    hintsUsed: PHASES.reduce((sum, p) => sum + phases[p].hints, 0),
    badgeCount,
    level: levelFor(badgeCount),
  };
}
