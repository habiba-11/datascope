// Helper layer: the child's mission (Part 42, Round 4 pilot feedback, 5 Nov 2026).
// The pilot children did not know what they were trying to reach, so each
// scenario has a mission (data/content/<scenario>.json, "mission"). No DOM
// here, so it is tested.

// The words on the Mission card that are the same for every scenario.
export const MISSION_WORDS = {
  title: 'Your mission',
  hello: 'Hoo-hoo! You are a data detective now.',
  end: 'At the end, you make your Evidence Card.',
  button: 'Start my mission →',
};

// Part 42b: the mission bar says where the child is, in the 5 steps.
// The same step names as the step bar (js/app.js), in the same order.
export const STEP_LINES = {
  ask: 'ask a good question',
  plan: 'make a guess',
  collect: 'collect the data',
  explore: 'explore the data',
  conclude: 'show your proof',
};

// "Step 3 of 5: collect the data", or '' for a step that is not one of the 5.
export function stepLine(stepId) {
  const steps = Object.keys(STEP_LINES);
  const index = steps.indexOf(stepId);
  return index === -1 ? '' : `Step ${index + 1} of ${steps.length}: ${STEP_LINES[stepId]}`;
}
