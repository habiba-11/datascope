// Layer 4: everything the app keeps in the browser goes through this file.

const SCENARIO_KEY = 'datascope:selectedScenarioId';
const CODE_KEY = 'datascope:explorerCode';
const LAST_CODE_KEY = 'datascope:lastCode'; // Part 60d: shown again after Exit
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
  writeItem(LAST_CODE_KEY, code);
}

// Part 60d (Habiba): the last code used on this device. Exit keeps it, so the
// start page shows it again (and "Your code was ..." if the box is emptied);
// only "I'm finished" (clearChildData) removes it.
export function getLastCode() {
  return readItem(LAST_CODE_KEY);
}

// "Exit": this device forgets the code (the log itself is kept until sent).
export function clearExplorerCode() {
  memory.delete(CODE_KEY);
  try {
    localStorage.removeItem(CODE_KEY);
  } catch {
    // Storage is blocked: only the in-memory copy existed.
  }
}

// The reasoning log is a list of entries, stored as JSON text.
export function getLogEntries() {
  try {
    return JSON.parse(readItem(LOG_KEY)) || [];
  } catch {
    return []; // damaged text: start a fresh list rather than crash
  }
}

// Replaces the whole log (used once, to give old entries an id: Part 22).
export function setLogEntries(entries) {
  writeItem(LOG_KEY, JSON.stringify(entries));
}

export function addLogEntry(entry) {
  const entries = getLogEntries();
  entries.push(entry);
  writeItem(LOG_KEY, JSON.stringify(entries));
}

// Sound effects are ON unless the child turns them off (Habiba, 5 Nov 2026;
// was off by default). Only a saved "off" switches them off.
const SOUND_KEY = 'datascope:sound';

export function getSoundOn() {
  return readItem(SOUND_KEY) !== 'off';
}

export function setSoundOn(on) {
  writeItem(SOUND_KEY, on ? 'on' : 'off');
}

// The background music has its own switch (Part 43d, Habiba 6 Nov 2026): ON
// by default (and quiet), until the child turns it off.
const MUSIC_KEY = 'datascope:music';

export function getMusicOn() {
  return readItem(MUSIC_KEY) !== 'off';
}

export function setMusicOn(on) {
  writeItem(MUSIC_KEY, on ? 'on' : 'off');
}

// The story's read-aloud has its own switch (Part 44c): ON by default.
const VOICE_KEY = 'datascope:voice';

export function getVoiceOn() {
  return readItem(VOICE_KEY) !== 'off';
}

export function setVoiceOn(on) {
  writeItem(VOICE_KEY, on ? 'on' : 'off');
}

// The ids of log entries already sent to the online database (Part 22),
// so each entry is sent once. Entries that can never be accepted are added too.
const SENT_KEY = 'datascope:sentIds';

export function getSentIds() {
  try {
    return new Set(JSON.parse(readItem(SENT_KEY)) || []);
  } catch {
    return new Set();
  }
}

export function addSentIds(ids) {
  const all = getSentIds();
  ids.forEach((id) => all.add(id));
  writeItem(SENT_KEY, JSON.stringify([...all]));
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

// The start-page story (Part 44; before it, the film of Part 34) opens by itself
// once per browser: the child has not typed a code yet, so it cannot be
// remembered per child.
const TUTORIAL_KEY = 'datascope:tutorialSeen';

export function hasSeenTutorial() {
  return readItem(TUTORIAL_KEY) === 'yes';
}

export function markTutorialSeen() {
  writeItem(TUTORIAL_KEY, 'yes');
}

// Finished phases (Part 15), per child code AND scenario, so each
// investigation has its own progress:
// { "OWL-07": { "sleep-hours": ["ask", "plan"], "shoe-sizes": ["ask"] } }.
const PROGRESS_KEY = 'datascope:progress';

export function getDonePhases(scenarioId = getSelectedScenarioId()) {
  const byScenario = readObject(PROGRESS_KEY)[getExplorerCode() || 'NO-CODE'] || {};
  return byScenario[scenarioId] || [];
}

// All of this child's progress, for the file they save for the teacher.
export function getAllProgress() {
  return readObject(PROGRESS_KEY)[getExplorerCode() || 'NO-CODE'] || {};
}

// Returns true if the phase is newly done, false if it was done already.
export function markPhaseDone(phase, scenarioId = getSelectedScenarioId()) {
  const all = readObject(PROGRESS_KEY);
  const code = getExplorerCode() || 'NO-CODE';
  all[code] = all[code] || {};
  const done = all[code][scenarioId] || [];
  if (done.includes(phase)) return false;
  all[code][scenarioId] = [...done, phase];
  writeItem(PROGRESS_KEY, JSON.stringify(all));
  return true;
}

// Pip's Wardrobe (Part 58a, 10 Nov 2026), per child code, only in this browser
// (Habiba's choice: children never read the database). Online, the
// "outfit-changed" log entries record what Pip wore.
// { "OWL-07": { "worn": { "head": "party" }, "seen": ["scarf"] } }
const WARDROBE_KEY = 'datascope:wardrobe';

function wardrobeOf(code = getExplorerCode() || 'NO-CODE') {
  return readObject(WARDROBE_KEY)[code] || {};
}

function saveWardrobe(changes) {
  const all = readObject(WARDROBE_KEY);
  const code = getExplorerCode() || 'NO-CODE';
  all[code] = { ...(all[code] || {}), ...changes };
  writeItem(WARDROBE_KEY, JSON.stringify(all));
}

// The saved outfit ({ slot: itemId }), or null when the child never changed it.
export function getOutfit() {
  return wardrobeOf().worn || null;
}

export function setOutfit(outfit) {
  saveWardrobe({ worn: { ...outfit } });
}

// Items the child has already looked at (they lose their "New!").
export function getSeenItems() {
  return wardrobeOf().seen || [];
}

export function markItemsSeen(ids) {
  saveWardrobe({ seen: [...new Set([...getSeenItems(), ...ids])] });
}

// The pop-up that introduces Pip's Wardrobe (Part 58e) is shown once per child.
export function hasSeenWardrobeIntro() {
  return wardrobeOf().introSeen === true;
}

export function markWardrobeIntroSeen() {
  saveWardrobe({ introSeen: true });
}

// Teacher's switch: open every room on this device (to preview or test).
// Kept when a child's work is cleared, because it belongs to the teacher.
const PREVIEW_KEY = 'datascope:previewAll';

export function getPreviewAll() {
  return readItem(PREVIEW_KEY) === 'on';
}

export function setPreviewAll(on) {
  writeItem(PREVIEW_KEY, on ? 'on' : 'off');
}

// For shared devices ("I'm finished", and the teacher's "Clear this device"):
// removes the child's code, last code, chosen scenario, reasoning log, seen
// pop-ups, tutorial, progress and Pip's outfit from THIS device, so the next
// child starts clean. Teacher data is kept.
// Part 60d: log entries NOT yet sent stay, so they still go to the database
// later (each entry carries its own code); they are invisible to the next child.
export function clearChildData() {
  const sent = getSentIds();
  const notSent = getLogEntries().filter((entry) => !entry.id || !sent.has(entry.id));
  for (const key of [SCENARIO_KEY, CODE_KEY, LAST_CODE_KEY, LOG_KEY, INTROS_KEY, TUTORIAL_KEY, PROGRESS_KEY, SENT_KEY, WARDROBE_KEY, ROOMS_KEY]) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage is blocked: nothing was stored there anyway.
    }
  }
  if (notSent.length) setLogEntries(notSent);
}

// "Start a new investigation" (My journey): this child's trail starts again
// at Ask. Only the saved progress and the chosen question are reset; the
// reasoning log keeps everything (the thesis data and the badges stay).
export function startNewInvestigation() {
  const all = readObject(PROGRESS_KEY);
  delete all[getExplorerCode() || 'NO-CODE'];
  writeItem(PROGRESS_KEY, JSON.stringify(all));
  const rooms = readObject(ROOMS_KEY); // Part 60e: the rooms start empty again too
  delete rooms[getExplorerCode() || 'NO-CODE'];
  writeItem(ROOMS_KEY, JSON.stringify(rooms));
  memory.delete(SCENARIO_KEY);
  try {
    localStorage.removeItem(SCENARIO_KEY);
  } catch {
    // Storage is blocked: nothing was stored there anyway.
  }
}

// Part 60e (Habiba, 11 Nov 2026): where the child was in each room and what
// they had answered, so going back to a room opens it at the same step with
// the answers still there: { code: { room: { scenarioId, ...state } } }.
// A state saved for another scenario is ignored (the room starts afresh).
// Only in this browser; restoring never logs anything again.
const ROOMS_KEY = 'datascope:rooms';

export function loadRoomState(room, scenarioId) {
  const saved = (readObject(ROOMS_KEY)[getExplorerCode() || 'NO-CODE'] || {})[room];
  return saved && saved.scenarioId === scenarioId ? saved : null;
}

export function saveRoomState(room, scenarioId, state) {
  const all = readObject(ROOMS_KEY);
  const code = getExplorerCode() || 'NO-CODE';
  all[code] = { ...all[code], [room]: { ...state, scenarioId } };
  writeItem(ROOMS_KEY, JSON.stringify(all));
}

// Teacher view with the database switched off: the teacher's tags, stored as
// { code: [...] } on the teacher's device. (Online, the tags are in the database.)
const TAGS_KEY = 'datascope:teacherTags';

function readObject(key) {
  try {
    return JSON.parse(readItem(key)) || {};
  } catch {
    return {};
  }
}

export function getTeacherTags() {
  return readObject(TAGS_KEY);
}

export function setTeacherTags(tags) {
  writeItem(TAGS_KEY, JSON.stringify(tags));
}
