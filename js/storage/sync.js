// Layer 4: sends the reasoning log to the online database (Part 22).
// "Save first, send later": every moment is already saved in the browser
// (save.js); this file sends what is waiting whenever it can, so nothing is
// lost when the school Wi-Fi drops. It talks to Supabase with plain fetch().
// The rules (what is waiting, row shape) are in helpers/outbox.js.
import { BACKEND, backendReady } from '../config.js';
import { getLogEntries, setLogEntries, getSentIds, addSentIds } from './save.js';
import { toRow, withIds, pendingEntries, batches } from '../helpers/outbox.js';

// What the child sees in the sidebar.
export const STATUS_TEXT = {
  saved: '☁️ Saved online',
  sending: '⏳ Sending...',
  offline: '📴 Offline: saved here, will send later',
  error: '⚠️ Not sent yet: will try again',
};

const RETRY_MS = 30 * 1000;
let status = 'saved';
let sending = false;
let retryTimer = null;
let soonTimer = null;
const listeners = [];

function setStatus(next) {
  status = next;
  listeners.forEach((listen) => listen(next));
}

// Adds rows to the log_entries table. Children may only ADD (backend/schema.sql).
// Returns the HTTP status: 201 = added, 409 = already there, 400 = breaks a rule.
async function postRows(rows) {
  const response = await fetch(`${BACKEND.url}/rest/v1/log_entries`, {
    method: 'POST',
    headers: {
      apikey: BACKEND.publishableKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  return response.status;
}

// A whole batch failed with 409 or 400: one entry in it is already there, or
// can never be saved. Sending them one by one finds it, and the rest still go.
async function sendOneByOne(batch) {
  for (const entry of batch) {
    const code = await postRows([toRow(entry)]);
    if (code === 400) console.warn('DataScope: the database refused this entry, skipping it:', entry);
    if (code < 300 || code === 409 || code === 400) addSentIds([entry.id]);
    else throw new Error(`The database answered ${code}`);
  }
}

// Sends everything that is waiting. Safe to call often: it never sends twice.
export async function sendWaiting() {
  if (!backendReady() || sending) return;
  sending = true;
  try {
    // Entries from before Part 22 have no id yet: give them one (saved), once.
    const entries = getLogEntries();
    if (entries.some((e) => !e.id)) setLogEntries(withIds(entries));

    const waiting = pendingEntries(getLogEntries(), getSentIds());
    if (waiting.length === 0) {
      setStatus('saved');
      return;
    }
    if (!navigator.onLine) throw new Error('offline');

    setStatus('sending');
    for (const batch of batches(waiting)) {
      const code = await postRows(batch.map(toRow));
      if (code >= 200 && code < 300) addSentIds(batch.map((e) => e.id));
      else if (code === 409 || code === 400) await sendOneByOne(batch);
      else throw new Error(`The database answered ${code}`); // e.g. 401: wrong key
    }
    setStatus('saved');
  } catch (error) {
    // No internet (fetch fails) or a problem on the database side: try again later.
    setStatus(navigator.onLine ? 'error' : 'offline');
    if (navigator.onLine) console.warn('DataScope: could not send the log yet:', error.message);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(sendWaiting, RETRY_MS);
  } finally {
    sending = false;
  }
}

// Starts sending, once per page: now, a moment after each new log entry, and
// as soon as the internet comes back. `onStatus(status)` updates the sidebar.
let started = false;
export function startSync(onStatus) {
  if (!backendReady()) return;
  if (onStatus) {
    listeners.push(onStatus);
    onStatus(status);
  }
  if (started) return;
  started = true;
  window.addEventListener('datascope:logged', () => {
    clearTimeout(soonTimer);
    soonTimer = setTimeout(sendWaiting, 1500); // a few moments together = one request
  });
  window.addEventListener('online', sendWaiting);
  window.addEventListener('offline', () => setStatus('offline'));
  sendWaiting();
}
