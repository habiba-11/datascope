// Layer 3: the rules for which phases a child may open (Part 15).
// Pure logic: it gets the list of finished phases and answers questions.
// Tested in Node (tests/progress.test.js).

// The order a child works through. Explore is three rooms, one after another.
export const PHASES = ['ask', 'plan', 'collect', 'graph', 'number', 'chance', 'conclude'];

// Which of the 5 steps on the step bar each phase belongs to.
export const STEP_OF_PHASE = {
  ask: 'ask', plan: 'plan', collect: 'collect',
  graph: 'explore', number: 'explore', chance: 'explore',
  conclude: 'conclude',
};

// The page where each phase happens (Ask and Plan share Question Studio).
export const PAGE_OF_PHASE = {
  ask: 'question-studio.html', plan: 'question-studio.html', collect: 'data-hub.html',
  graph: 'graph-lab.html', number: 'number-lab.html', chance: 'chance-lab.html',
  conclude: 'evidence-board.html',
};

// Open phases: Ask always, then each phase that comes right after a finished one.
export function unlockedPhases(done) {
  const open = [];
  for (const phase of PHASES) {
    open.push(phase);
    if (!done.includes(phase)) break;
  }
  return open;
}

export function isUnlocked(phase, done) {
  return unlockedPhases(done).includes(phase);
}

// The newest open phase: where a child is sent from a locked room.
export function furthestPhase(done) {
  const open = unlockedPhases(done);
  return open[open.length - 1];
}

// The steps shown on the step bar, in order (no repeats: Explore is one step).
export function visibleSteps(done) {
  return [...new Set(unlockedPhases(done).map((phase) => STEP_OF_PHASE[phase]))];
}

// A step is done when all its phases are done (Explore: all three rooms).
export function isStepDone(step, done) {
  return PHASES.filter((phase) => STEP_OF_PHASE[phase] === step).every((phase) => done.includes(phase));
}

// Route guard: null if the page may open, otherwise the page to send the child to.
// `previewAll` is the teacher's "open all rooms" switch on this device.
export function guardRedirect(phase, done, previewAll = false) {
  if (previewAll || isUnlocked(phase, done)) return null;
  return PAGE_OF_PHASE[furthestPhase(done)];
}

// "My journey" (Part 19) opens only once Conclude is DONE.
export function journeyRedirect(done, previewAll = false) {
  if (previewAll || done.includes('conclude')) return null;
  return PAGE_OF_PHASE[furthestPhase(done)];
}
