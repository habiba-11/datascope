// Layer 3: the reasoning log, a "diary of thinking moments" (architecture section 7).
// Every entry carries only the anonymous explorer code, never a name.
import { getExplorerCode, addLogEntry, getLogEntries } from '../storage/save.js';

// The kinds of moments we record.
export const EVENT_TYPES = [
  'data-seen',    // which scenario and seed the child's data came from
  'prediction',   // a guess made before seeing the data
  'revision',     // the child changed a guess after seeing the data
  'certainty',    // a certainty rating plus the reason written
  'meaning-task', // a Number Lab meaning task: correct, after a hint, or incorrect
  'trials',       // a Chance Lab run: device, number of trials, what happened
  'hint',         // the child asked for a hint on an open question
  'reflection',   // what a graph tells / does NOT tell
  'claim',        // the final Evidence Board claim
];

export const TASK_RESULTS = ['correct', 'after-hint', 'incorrect'];

// Codes look like "OWL-07": capital letters, digits and dashes, 3 to 10
// characters, with at least one letter AND one digit. Needing a digit
// stops a child from typing their real name by mistake.
export function normalizeCode(text) {
  return text.trim().toUpperCase().replace(/\s+/g, '');
}

export function isValidCode(code) {
  return /^[A-Z0-9-]{3,10}$/.test(code) && /[A-Z]/.test(code) && /\d/.test(code);
}

// Builds one log entry. Throws on mistakes in OUR code (unknown type or
// result), so they show up in testing instead of quietly spoiling the data.
export function makeEntry(code, room, type, details = {}, now = new Date()) {
  if (!EVENT_TYPES.includes(type)) {
    throw new Error(`Unknown log event type: "${type}"`);
  }
  if (type === 'meaning-task' && !TASK_RESULTS.includes(details.result)) {
    throw new Error(`Unknown meaning-task result: "${details.result}"`);
  }
  return { code, time: now.toISOString(), room, type, ...details };
}

// Records one moment for the current child.
export function logEvent(room, type, details) {
  addLogEntry(makeEntry(getExplorerCode(), room, type, details));
}

export function readLog() {
  return getLogEntries();
}

// The result of a meaning task (architecture section 7):
// solved first time = correct, solved after wrong tries (each one shows a
// hint) = after-hint, left without solving = incorrect.
export function meaningTaskResult(wrongTries, solved) {
  if (!solved) return 'incorrect';
  return wrongTries === 0 ? 'correct' : 'after-hint';
}

// Tasks the child started (at least one wrong try) but has not solved yet.
const unsolvedTasks = new Set();

// Follows one meaning task. Call wrong() after each wrong answer and
// solved() when it is right. The result is logged only once.
export function trackMeaningTask(room, task) {
  let wrongTries = 0;
  let done = false;

  const tracker = {
    wrong() {
      wrongTries += 1;
      unsolvedTasks.add(tracker);
    },
    solved() {
      finish(true);
    },
    leftUnsolved() {
      finish(false);
    },
  };

  function finish(solved) {
    if (done) return;
    done = true;
    unsolvedTasks.delete(tracker);
    logEvent(room, 'meaning-task', { task, result: meaningTaskResult(wrongTries, solved), wrongTries });
  }

  watchForLeaving();
  return tracker;
}

// When the child leaves the page, started-but-unsolved tasks count as incorrect.
let watching = false;
function watchForLeaving() {
  if (watching || typeof window === 'undefined') return; // Node tests have no window
  watching = true;
  window.addEventListener('pagehide', () => {
    [...unsolvedTasks].forEach((tracker) => tracker.leftUnsolved());
  });
}
