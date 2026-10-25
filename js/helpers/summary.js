// Layer 3: helpers for the teacher dashboard. They check the files children saved
// (js/storage/export.js) and hold the misconception tags. The per-child numbers
// come from helpers/metrics.js (Part 20).
import { isValidCode, makeEntry } from './log.js';
// Files from before Part 15 are version 1; newer ones are version 2.
export const READABLE_VERSIONS = [1, 2];

// Misconceptions a teacher can tag (architecture section 7), each taken from
// docs/literature-key-findings.md. `papers` are the paper numbers.
export const MISCONCEPTION_TAGS = [
  { id: 'median-no-order', label: 'Finds the median without putting the data in order', papers: '7, 9' },
  { id: 'mode-numbers-only', label: 'Thinks the mode only works for numbers, not categories', papers: '7' },
  { id: 'procedure-not-meaning', label: "Can calculate, but can't explain what the measure means", papers: '6, 7, 9' },
  { id: 'equally-likely', label: 'Thinks every outcome is equally likely', papers: '12, 13' },
  { id: 'luck-beliefs', label: 'Explains chance with luck or own experience', papers: '10, 13' },
  { id: 'streak-rare', label: 'Thinks a streak (e.g. four heads in a row) is rare or "due"', papers: '10, 12' },
  { id: 'graph-as-picture', label: 'Reads the graph as a picture', papers: '20' },
  { id: 'sees-expected', label: 'Sees what they expected, not what the data shows', papers: '20' },
];

// Checks a file a child saved. Returns { ok: true, file } or { ok: false, reason }.
export function parseExportFile(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'not a JSON file' };
  }
  if (!file || file.app !== 'DataScope: The Evidence Lab') {
    return { ok: false, reason: 'not a DataScope file' };
  }
  if (!READABLE_VERSIONS.includes(file.formatVersion)) {
    return { ok: false, reason: `unknown file version ${file.formatVersion}` };
  }
  if (!isValidCode(file.code || '') || !Array.isArray(file.entries)) {
    return { ok: false, reason: 'missing code or entries' };
  }
  if (file.entries.some((entry) => entry.code !== file.code)) {
    return { ok: false, reason: 'entries from a different code' };
  }
  return { ok: true, file };
}

// The teacher's tags become log entries too, so they appear in the class CSV.
export function tagEntries(code, tagIds, now = new Date()) {
  return tagIds.map((id) => {
    const tag = MISCONCEPTION_TAGS.find((t) => t.id === id);
    return makeEntry(code, 'teacher-view', 'teacher-tag', { tag: id, tagLabel: tag ? tag.label : id }, now);
  });
}
