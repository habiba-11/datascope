const SCENARIO_KEY = 'datascope:selectedScenarioId';
const DEFAULT_SCENARIO_ID = 'sleep-hours';

export function getSelectedScenarioId() {
  return localStorage.getItem(SCENARIO_KEY) || DEFAULT_SCENARIO_ID;
}

export function setSelectedScenarioId(scenarioId) {
  localStorage.setItem(SCENARIO_KEY, scenarioId);
}
