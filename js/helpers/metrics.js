// Layer 3: thesis metrics for the teacher dashboard (Part 20, Prof's comment 6).
// Pure, tested in Node (tests/metrics.test.js). Every row is built with
// buildJourney, the same function behind the child's "My journey" page, so the
// two can never disagree.
import { buildJourney } from './journey.js';
import { PHASES } from './progress.js';

const round1 = (n) => Math.round(n * 10) / 10;
const minutes = (ms) => (ms === null ? null : round1(ms / 60000));

// The scenarios a child worked on, from their log. `partners` maps a scenario
// to its second class (reading A -> reading B); a second class is not a
// scenario of its own, so it is left out.
export function scenariosIn(entries, partners = {}) {
  const partnerIds = new Set(Object.values(partners));
  const ids = entries.map((e) => e.scenarioId).filter((id) => id && !partnerIds.has(id));
  return [...new Set(ids)];
}

// One row per child per scenario, with everything the thesis needs.
export function childRows(files, partners = {}) {
  const rows = [];
  for (const file of files) {
    for (const scenarioId of scenariosIn(file.entries, partners)) {
      const j = buildJourney(file.entries, file.code, scenarioId, partners[scenarioId] || null);
      const { plan, number, chance, graph, conclude } = j.phases;
      const tasks = number.tasks.length;
      const claim = conclude.claim;
      const numericGuess = typeof number.guess === 'number' && typeof number.mean === 'number';

      const row = {
        code: file.code,
        scenarioId,
        demo: Boolean(file.demo),
        phasesDone: j.phasesDone,
        finished: j.phases.conclude.done,
        totalStars: j.totalStars,
        hintsUsed: j.hintsUsed,
        badges: j.badgeCount,
        level: j.level.name,
        planGuess: plan.guess,
        numberGuess: number.guess,
        mean: number.mean,
        predictionError: numericGuess ? round1(Math.abs(number.guess - number.mean)) : null,
        revised: number.revision ? number.revision.changed : null,
        revisionReason: number.revision && number.revision.changed ? number.revision.reason : null,
        tasksFirstTry: number.firstTry,
        tasksAfterHint: number.afterHint,
        tasksUnsolved: number.unsolved,
        firstTryRate: tasks ? round1((100 * number.firstTry) / tasks) : null,
        graphTell: graph.tell,
        graphNotTell: graph.notTell,
        chanceDevice: chance.device,
        chanceRating: chance.rating,
        chanceReason: chance.reason,
        biggestRun: chance.biggestRun ? chance.biggestRun.trials : null,
        biggestRunPct: chance.biggestRun ? chance.biggestRun.pct : null,
        claim: claim ? claim.claim : null,
        because: claim ? claim.because : null,
        evidenceCount: claim ? (claim.evidence || []).length : null,
        certainty: claim ? claim.certainty : null,
        certaintyReason: claim ? claim.certaintyReason : null,
      };
      for (const phase of PHASES) {
        row[`${phase}Done`] = j.phases[phase].done;
        row[`${phase}Stars`] = j.phases[phase].stars;
        row[`${phase}Minutes`] = minutes(j.phases[phase].durationMs);
      }
      rows.push(row);
    }
  }
  return rows;
}

const average = (list) => (list.length ? round1(list.reduce((a, b) => a + b, 0) / list.length) : null);

// The class at a glance: completion funnel, average minutes per phase, hints,
// first-try rate on Number Lab puzzles, prediction error, how often children
// changed their mind after seeing the data.
export function classOverview(rows) {
  const funnel = {};
  const avgMinutes = {};
  for (const phase of PHASES) {
    funnel[phase] = rows.filter((r) => r[`${phase}Done`]).length;
    avgMinutes[phase] = average(rows.map((r) => r[`${phase}Minutes`]).filter((m) => m !== null));
  }
  const firstTry = rows.reduce((sum, r) => sum + r.tasksFirstTry, 0);
  const allTasks = rows.reduce((sum, r) => sum + r.tasksFirstTry + r.tasksAfterHint + r.tasksUnsolved, 0);
  const decided = rows.filter((r) => r.revised !== null);
  return {
    children: new Set(rows.map((r) => r.code)).size,
    investigations: rows.length,
    finished: rows.filter((r) => r.finished).length,
    funnel,
    avgMinutes,
    hintsUsed: rows.reduce((sum, r) => sum + r.hintsUsed, 0),
    firstTryRate: allTasks ? round1((100 * firstTry) / allTasks) : null,
    avgPredictionError: average(rows.map((r) => r.predictionError).filter((e) => e !== null)),
    revisedRate: decided.length ? round1((100 * decided.filter((r) => r.revised).length) / decided.length) : null,
  };
}
