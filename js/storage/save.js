const SCENARIO_KEY = 'datascope:selectedScenarioId';
const DEFAULT_SCENARIO_ID = 'sleep-hours';

// Backup copy in memory, used if the browser blocks localStorage
// (e.g. private mode or strict school settings). It only lasts until the page reloads.
let memoryScenarioId = null;

export function getSelectedScenarioId() {
  try {
    return localStorage.getItem(SCENARIO_KEY) || DEFAULT_SCENARIO_ID;
  } catch {
    return memoryScenarioId || DEFAULT_SCENARIO_ID;
  }
}

export function setSelectedScenarioId(scenarioId) {
  memoryScenarioId = scenarioId;
  try {
    localStorage.setItem(SCENARIO_KEY, scenarioId);
  } catch {
    // Storage is blocked: the in-memory copy above is used instead.
  }
}
