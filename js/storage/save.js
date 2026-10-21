// Layer 4: everything the app keeps in the browser goes through this file.

const SCENARIO_KEY = 'datascope:selectedScenarioId';
const CODE_KEY = 'datascope:explorerCode';
const LOG_KEY = 'datascope:log';
const DEFAULT_SCENARIO_ID = 'sleep-hours';

// Backup copies in memory, used if the browser blocks localStorage
// (e.g. private mode or strict school settings). They only last until the page reloads.
// This also lets the Node tests run, because Node has no localStorage.
const memory = new Map();

function readItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.has(key) ? memory.get(key) : null;
  }
}

function writeItem(key, value) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage is blocked: the in-memory copy above is used instead.
  }
}

export function getSelectedScenarioId() {
  return readItem(SCENARIO_KEY) || DEFAULT_SCENARIO_ID;
}

export function setSelectedScenarioId(scenarioId) {
  writeItem(SCENARIO_KEY, scenarioId);
}

// The child's anonymous explorer code (e.g. "OWL-07"), or null if none yet.
export function getExplorerCode() {
  return readItem(CODE_KEY);
}

export function setExplorerCode(code) {
  writeItem(CODE_KEY, code);
}

// The reasoning log is a list of entries, stored as JSON text.
export function getLogEntries() {
  try {
    return JSON.parse(readItem(LOG_KEY)) || [];
  } catch {
    return []; // damaged text: start a fresh list rather than crash
  }
}

export function addLogEntry(entry) {
  const entries = getLogEntries();
  entries.push(entry);
  writeItem(LOG_KEY, JSON.stringify(entries));
}
