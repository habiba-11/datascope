// Layer 3: "📋 My findings", the summary a child sees before writing their
// claim in Evidence Board (Round 2, Habiba's feedback 26 Oct 2026): their own
// guesses and words from the journey, plus the class's real numbers.
// Pure, tested in Node (tests/findings.test.js). The numbers come from stats.js.
import { formatMean, compareValues } from './stats.js';

const modeText = (modes) => (modes.length ? modes.join(' and ') : 'none');
const numbersLine = (s) => `Mean ${formatMean(s.mean)} · Median ${s.median} · Mode ${modeText(s.mode)} · Range ${s.range}`;

// How many kids gave each answer, most first: "Football 7, Tag 3, ...".
function votes(values) {
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareValues(a[0], b[0]))
    .map(([value, count]) => `${value} ${count}`)
    .join(', ');
}

// Returns [{ icon, label, text }], one line per finding the child has.
// `stats` comes from classStats() in number-tasks.js; `journey` from buildJourney().
export function buildFindings({ kind, question, values, stats, journey }) {
  const lines = [{ icon: '❓', label: 'Our question', text: question }];
  const { plan, number, graph } = journey.phases;

  if (plan.guess !== null) lines.push({ icon: '🤔', label: 'Your first guess', text: String(plan.guess) });

  if (kind === 'category') {
    lines.push({ icon: '🏆', label: 'Mode (most common)', text: modeText(stats.mode) });
    lines.push({ icon: '🗳️', label: 'Votes', text: votes(values) });
  } else if (kind === 'compare') {
    lines.push({ icon: '🔢', label: 'Class A', text: numbersLine(stats) });
    lines.push({
      icon: '🔢',
      label: 'Class B',
      text: numbersLine({ mean: stats.meanB, median: stats.medianB, mode: stats.modeB, range: stats.rangeB }),
    });
  } else {
    lines.push({ icon: '🔢', label: 'The numbers', text: numbersLine(stats) });
  }

  if (number.revision && number.revision.changed) {
    lines.push({
      icon: '✏️',
      label: 'You changed your mind',
      text: `From ${number.guess} to ${number.revision.newGuess}, because "${number.revision.reason}"`,
    });
  }
  if (graph.tell) lines.push({ icon: '📊', label: 'You said the graph shows', text: `"${graph.tell}"` });
  if (graph.notTell) lines.push({ icon: '🔍', label: "And what it can't show", text: `"${graph.notTell}"` });
  return lines;
}
