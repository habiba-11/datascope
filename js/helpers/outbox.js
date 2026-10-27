// Layer 3: the rules for sending the reasoning log to the online database
// (Part 22). Pure, tested in Node (tests/outbox.test.js). The sending itself
// is in js/storage/sync.js.
import { isValidCode, newId } from './log.js';

// The fixed fields; everything else in an entry goes into the row's "details".
const FIXED = ['id', 'code', 'time', 'room', 'type', 'scenarioId'];

// A log entry -> a database row (columns of backend/schema.sql).
export function toRow(entry) {
  const details = {};
  for (const [key, value] of Object.entries(entry)) {
    if (!FIXED.includes(key)) details[key] = value;
  }
  return {
    id: entry.id,
    code: entry.code,
    time: entry.time,
    room: entry.room,
    type: entry.type,
    scenario_id: entry.scenarioId ?? null,
    details,
  };
}

// A database row -> the same log entry the app made (for the teacher dashboard).
export function fromRow(row) {
  const entry = { id: row.id, code: row.code, time: row.time, room: row.room, type: row.type };
  if (row.scenario_id !== null && row.scenario_id !== undefined) entry.scenarioId = row.scenario_id;
  return { ...entry, ...row.details };
}

// Entries made before Part 22 have no id: they get one (the others stay the same).
export function withIds(entries) {
  return entries.map((entry) => (entry.id ? entry : { id: newId(), ...entry }));
}

// The entries still to send: they have an id, a valid explorer code (the
// database refuses others), and are not sent yet.
export function pendingEntries(entries, sentIds) {
  return entries.filter((e) => e.id && isValidCode(e.code || '') && !sentIds.has(e.id));
}

// Splits a list into groups of at most `size` (one request each).
export function batches(list, size = 50) {
  const groups = [];
  for (let i = 0; i < list.length; i += size) groups.push(list.slice(i, i + size));
  return groups;
}

// The teacher dashboard reads all entries from the database and groups them
// into one "file" per child, the same shape as an imported file (Part 20).
export function groupByCode(entries) {
  const byCode = new Map();
  for (const entry of entries) {
    if (!byCode.has(entry.code)) byCode.set(entry.code, []);
    byCode.get(entry.code).push(entry);
  }
  return [...byCode.entries()].map(([code, list]) => ({
    code,
    entries: [...list].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0)),
    progress: {}, // online, "done" comes from the phase-complete entries themselves
  }));
}

// teacher_tags rows -> { "OWL-07": ["equally-likely", ...], ... }
export function tagsByCode(rows) {
  const tags = {};
  for (const { code, tag } of rows) (tags[code] = tags[code] || []).push(tag);
  return tags;
}
