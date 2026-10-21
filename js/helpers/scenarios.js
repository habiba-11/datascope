// Loads scenario recipes (JSON files) for the room pages.

export async function loadRecipe(scenarioId) {
  const response = await fetch(`../data/scenarios/${scenarioId}.json`);
  return response.json();
}

// Some scenarios are compared with a second class (e.g. reading minutes:
// Class A vs Class B). Returns that partner recipe, or null if there is none.
export async function loadPartnerRecipe(recipe) {
  return recipe.compareWith ? loadRecipe(recipe.compareWith) : null;
}
