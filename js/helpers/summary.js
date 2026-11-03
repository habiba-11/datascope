// Layer 3: helpers for the teacher dashboard: the misconception tags. The
// per-child numbers come from helpers/metrics.js (Part 20).
import { makeEntry } from './log.js';

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

// The teacher's tags become log entries too, so they appear in the class CSV.
export function tagEntries(code, tagIds, now = new Date()) {
  return tagIds.map((id) => {
    const tag = MISCONCEPTION_TAGS.find((t) => t.id === id);
    return makeEntry(code, 'teacher-view', 'teacher-tag', { tag: id, tagLabel: tag ? tag.label : id }, now);
  });
}
