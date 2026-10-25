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

// Sound effects are OFF unless the child turns them on (CLAUDE.md).
const SOUND_KEY = 'datascope:sound';

export function getSoundOn() {
  return readItem(SOUND_KEY) === 'on';
}

export function setSoundOn(on) {
  writeItem(SOUND_KEY, on ? 'on' : 'off');
}

// Phase intro pop-ups each child has already seen (Part 14), kept per code:
// { "OWL-07": ["ask", "plan"], ... }. Children without a code share "NO-CODE".
const INTROS_KEY = 'datascope:introsSeen';

export function hasSeenIntro(phase) {
  const seen = readObject(INTROS_KEY)[getExplorerCode() || 'NO-CODE'] || [];
  return seen.includes(phase);
}

export function markIntroSeen(phase) {
  const all = readObject(INTROS_KEY);
  const code = getExplorerCode() || 'NO-CODE';
  all[code] = [...new Set([...(all[code] || []), phase])];
  writeItem(INTROS_KEY, JSON.stringify(all));
}

// For shared devices: removes the child's code, chosen scenario, reasoning
// log and seen pop-ups from THIS device, so the next child starts clean.
// Teacher data is kept.
export function clearChildData() {
  for (const key of [SCENARIO_KEY, CODE_KEY, LOG_KEY, INTROS_KEY]) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage is blocked: nothing was stored there anyway.
    }
  }
}

// Teacher view: the children's imported files and the teacher's tags,
// both stored as { code: ... } objects on the teacher's device.
const IMPORTS_KEY = 'datascope:teacherImports';
const TAGS_KEY = 'datascope:teacherTags';

function readObject(key) {
  try {
    return JSON.parse(readItem(key)) || {};
  } catch {
    return {};
  }
}

export function getTeacherImports() {
  return readObject(IMPORTS_KEY);
}

export function setTeacherImports(imports) {
  writeItem(IMPORTS_KEY, JSON.stringify(imports));
}

export function getTeacherTags() {
  return readObject(TAGS_KEY);
}

export function setTeacherTags(tags) {
  writeItem(TAGS_KEY, JSON.stringify(tags));
}
