// Loads scenario recipes (JSON files) for the room pages.

// The scenarios a child can pick in Question Studio, in card order.
// Reading minutes is ONE card: Class A is compared with Class B, so Class B
// has no card and no content file of its own.
export const PICKABLE_SCENARIOS = ['sleep-hours', 'shoe-sizes', 'playground-game', 'reading-minutes-class-a'];

export async function loadRecipe(scenarioId) {
  const response = await fetch(`../data/scenarios/${scenarioId}.json`);
  return response.json();
}

// Some scenarios are compared with a second class (e.g. reading minutes:
// Class A vs Class B). Returns that partner recipe, or null if there is none.
export async function loadPartnerRecipe(recipe) {
  return recipe.compareWith ? loadRecipe(recipe.compareWith) : null;
}

// The child-facing words for a scenario (Part 17): fix-it questions, the
// Plan question, and more. The numbers stay in the recipe; answers are
// always computed with stats.js, never written here.
export async function loadContent(scenarioId) {
  const response = await fetch(`../data/content/${scenarioId}.json`);
  return response.json();
}
