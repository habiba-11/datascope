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

// Part 42c: "Why this room?" (data/content/phases.json). Returns the why line
// and the bullets for this phase. A words scenario (games, kind 'category')
// uses its own words where a phase has them, so it never talks about numbers
// (Part 51: the title too, e.g. Number Lab's "Find the statistics").
export function roomWhy(intro, kind) {
  const words = kind === 'category';
  return {
    title: (words && intro.titleWords) || intro.title,
    why: (words && intro.whyWords) || intro.why,
    bullets: (words && intro.bulletsWords) || intro.bullets,
  };
}
