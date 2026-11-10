// Layer 3: "My findings", the summary a child sees before writing their
// claim in Evidence Board (Round 2, Habiba's feedback 26 Oct 2026), laid out
// like the f11 design (Part 37d, 4 Nov 2026) in 3 parts: our question,
// the data (drawn), my thinking (the child's own words, in order).
// Pure, tested in Node (tests/findings.test.js). The numbers come from stats.js.
import { formatMean, compareValues } from './stats.js';

// The short meaning under each number tile (the same kid words as the recap).
export const TILE_WORDS = {
  Mean: 'fair share',
  Median: 'the middle one',
  Mode: 'most common',
  Range: 'biggest − smallest',
};

const modeText = (modes) => (modes.length ? modes.join(' and ') : 'none');

// The 4 tiles for one class.
function tiles(s) {
  return [
    ['Mean', formatMean(s.mean)],
    ['Median', s.median],
    ['Mode', modeText(s.mode)],
    ['Range', s.range],
  ].map(([label, value]) => ({ label, value: String(value), meaning: TILE_WORDS[label] }));
}

// How many kids gave each answer, most first. `pct` = the bar's width
// (count ÷ the biggest count), so the top answer fills its bar.
export function votes(values) {
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  const list = [...counts.entries()].sort((a, b) => b[1] - a[1] || compareValues(a[0], b[0]));
  const biggest = list.length ? list[0][1] : 1;
  return list.map(([value, count]) => ({ value: String(value), count, pct: Math.round((count / biggest) * 100) }));
}

// The data: bars for words, tiles + a number line for numbers, two sets of
// tiles for two classes.
function dataPart(kind, values, stats) {
  if (kind === 'category') {
    return { kind, classSize: values.length, votes: votes(values), mode: modeText(stats.mode) };
  }
  if (kind === 'compare') {
    const b = { mean: stats.meanB, median: stats.medianB, mode: stats.modeB, range: stats.rangeB };
    const sameMean = formatMean(stats.mean) === formatMean(b.mean);
    const a = tiles(stats);
    const bTiles = tiles(b);
    return {
      kind,
      a,
      b: bTiles,
      // One row per number, Class A beside Class B, and whether they are the
      // same (4 Nov 2026: comparing 8 tiles was not clear).
      rows: a.map((tile, i) => ({
        label: tile.label,
        meaning: tile.meaning,
        a: tile.value,
        b: bTiles[i].value,
        same: tile.value === bTiles[i].value,
      })),
      // "Same mean, different spread" is the lesson, so it is said in words.
      note: sameMean && stats.range !== b.range
        ? `Same mean (${formatMean(stats.mean)}), but the range is ${stats.range} vs ${b.range}.`
        : null,
    };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    kind,
    classSize: values.length,
    tiles: tiles(stats),
    line: { min, max, mean: formatMean(stats.mean), meanPct: max === min ? 50 : Math.round(((stats.mean - min) / (max - min)) * 100) },
  };
}

// My thinking: the child's own words, in the order they happened.
// "Your guess matched" is only for words (guess = a mode); never a score.
function thinkingPart(kind, stats, journey) {
  const { plan, number, graph } = journey.phases;
  const rows = [];
  if (plan.guess !== null) {
    rows.push({
      icon: 'question', color: 'plan', label: 'Your first guess', text: String(plan.guess),
      matched: kind === 'category' && stats.mode.includes(plan.guess),
    });
  }
  if (number.revision && number.revision.changed) {
    rows.push({
      icon: 'pencil', color: 'ask-light', label: 'You changed your mind',
      text: `From ${number.guess} to ${number.revision.newGuess}`, because: number.revision.reason,
    });
  }
  if (graph.tell) rows.push({ icon: 'chart', color: 'explore', label: 'You said the graph shows', text: `"${graph.tell}"` });
  if (graph.notTell) rows.push({ icon: 'magnifier', color: 'conclude', label: "And what it can't show", text: `"${graph.notTell}"` });
  return rows;
}

// `stats` comes from classStats() in number-tasks.js; `journey` from buildJourney().
export function buildFindings({ kind, question, values, stats, journey }) {
  return {
    question,
    data: dataPart(kind, values, stats),
    thinking: thinkingPart(kind, stats, journey),
    noGuess: journey.phases.plan.guess === null,
  };
}
