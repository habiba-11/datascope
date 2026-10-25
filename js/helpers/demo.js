// Layer 3: DEMO children for showing the teacher dashboard to Prof (Part 20).
// They are made up, clearly labelled DEMO, kept in memory only (never saved
// with the real imports), and NEVER exported (integrity rule: never invent
// pilot results). Tested in Node (tests/thesis.test.js).

// Builds one demo child's log. `steps` lists the phases done, each with the
// moments inside it.
function demoChild(code, scenarioId, minutesPerPhase, steps, start) {
  const entries = [];
  let t = start;
  const add = (room, type, details = {}) => {
    entries.push({ code, time: new Date(t).toISOString(), room, type, ...details });
    t += 20 * 1000; // 20 seconds between moments
  };
  steps.forEach(([phase, stars, moments], i) => {
    add('shell', 'phase-start', { phase, scenarioId });
    (moments || []).forEach(([room, type, details]) => add(room, type, details));
    t += minutesPerPhase[i] * 60 * 1000;
    add('shell', 'phase-complete', { phase, scenarioId });
    add('shell', 'phase-feedback', { phase, scenarioId, stars });
  });
  return { app: 'DataScope: The Evidence Lab', formatVersion: 2, exportedAt: new Date(t).toISOString(), code, demo: true, entries };
}

const S = 'sleep-hours';
const G = 'playground-game';
const R = 'reading-minutes-class-a';

export function makeDemoFiles(now = new Date('2026-10-26T09:00:00Z')) {
  const start = now.getTime();
  return [
    demoChild('DEMO-01', S, [2, 1, 2, 4, 6, 4, 5], [
      ['ask', 3], ['plan', 3, [['question-studio', 'prediction', { scenarioId: S, guess: 9 }]]],
      ['collect', 3, [['data-hub', 'data-seen', { scenarioId: S, seed: 5, classSize: 20 }]]],
      ['graph', 3, [['graph-lab', 'reflection', { scenarioId: S, prompt: 'tell', text: 'DEMO: most kids sleep 9 hours' }],
        ['graph-lab', 'reflection', { scenarioId: S, prompt: 'not-tell', text: 'DEMO: it does not tell us why' }]]],
      ['number', 3, [['number-lab', 'prediction', { scenarioId: S, guess: 9, mean: 8.4, median: 9 }],
        ['number-lab', 'revision', { scenarioId: S, changed: true, oldGuess: 9, newGuess: 8, reason: 'DEMO: one small answer' }],
        ['number-lab', 'meaning-task', { scenarioId: S, task: 'build-mean', result: 'correct' }],
        ['number-lab', 'meaning-task', { scenarioId: S, task: 'find-mias-mistake', result: 'correct' }]]],
      ['chance', 3, [['chance-lab', 'certainty', { device: 'Dice', outcome: '6', rating: 'Unlikely', reason: 'DEMO: 1 of 6' }],
        ['chance-lab', 'trials', { device: 'Dice', outcome: '6', trials: 500, experimentalPct: 17, theory: '1 in 6 (about 16.7%)' }]]],
      ['conclude', 3, [['evidence-board', 'claim', { scenarioId: S, claim: 'DEMO: most kids sleep 9 hours', because: 'the median is 9', evidence: ['Median: 9'], certainty: 'likely', certaintyReason: 'DEMO: we asked everyone' }]]],
    ], start),
    demoChild('DEMO-02', S, [3, 1, 2, 5, 8], [
      ['ask', 2], ['plan', 3, [['question-studio', 'prediction', { scenarioId: S, guess: 7 }]]],
      ['collect', 3, [['data-hub', 'data-seen', { scenarioId: S, seed: 5, classSize: 20 }]]],
      ['graph', 2, [['graph-lab', 'reflection', { scenarioId: S, prompt: 'tell', text: 'DEMO: lots of 9s' }]]],
      ['number', 2, [['number-lab', 'prediction', { scenarioId: S, guess: 6, mean: 8.4, median: 9 }],
        ['number-lab', 'revision', { scenarioId: S, changed: false, oldGuess: 6 }],
        ['number-lab', 'meaning-task', { scenarioId: S, task: 'build-mean', result: 'after-hint' }],
        ['number-lab', 'meaning-task', { scenarioId: S, task: 'find-mias-mistake', result: 'incorrect' }]]],
    ], start),
    demoChild('DEMO-03', G, [2, 1, 2, 3, 4, 4, 4], [
      ['ask', 2], ['plan', 3, [['question-studio', 'prediction', { scenarioId: G, guess: 'Football' }]]],
      ['collect', 3, [['data-hub', 'data-seen', { scenarioId: G, seed: 1, classSize: 15 }]]],
      ['graph', 3], ['number', 3, [['number-lab', 'prediction', { scenarioId: G, guess: 'Football', mode: ['Football'] }],
        ['number-lab', 'meaning-task', { scenarioId: G, task: 'why-no-mean', result: 'correct' }]]],
      ['chance', 2], ['conclude', 2],
    ], start),
    demoChild('DEMO-04', R, [2, 2, 3], [
      ['ask', 2], ['plan', 3, [['question-studio', 'prediction', { scenarioId: R, guess: 20 }]]],
      ['collect', 3, [['data-hub', 'data-seen', { scenarioId: R, seed: 1, classSize: 18 }],
        ['data-hub', 'data-seen', { scenarioId: 'reading-minutes-class-b', seed: 1, classSize: 18 }]]],
    ], start),
  ];
}
