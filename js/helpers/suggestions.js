// Layer 3: hints that give answers (Prof's comment 3). A child can tap or drag a
// suggested answer into the box, change it, or write their own. Pure, tested in
// Node (tests/suggestions.test.js). The numbers come from the data with stats.js;
// the words come from data/content, with {gaps} filled in here.
import { mean, range, formatMean } from './stats.js';
import { buildFrequencyData, valueText, countText } from './charts.js';
import { fillTemplate } from './number-tasks.js';

// "Size 34", "Size 34 and Size 35", "A, B and C".
function joinWords(words) {
  if (words.length < 2) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

// The facts Graph Lab's suggested answers can use, from the class's real answers.
export function graphFacts(recipe, values, partner = null, valuesB = null) {
  const { labels, data } = buildFrequencyData(values);
  const most = Math.max(...data);
  const least = Math.min(...data);
  const valuesWith = (count) => labels.filter((_, i) => data[i] === count).map((v) => valueText(v, recipe));
  const facts = {
    top: joinWords(valuesWith(most)),
    topCount: countText(most),
    low: joinWords(valuesWith(least)),
    lowCount: countText(least),
    kinds: labels.length,
    min: valueText(labels[0], recipe),
    max: valueText(labels[labels.length - 1], recipe),
  };
  if (partner) {
    const b = buildFrequencyData(valuesB).labels;
    Object.assign(facts, {
      minB: valueText(b[0], partner),
      maxB: valueText(b[b.length - 1], partner),
      meanA: formatMean(mean(values)),
      meanB: formatMean(mean(valuesB)),
      rangeA: range(values),
      rangeB: range(valuesB),
    });
  }
  return facts;
}

// The suggested answers for one question, each with an id for the reasoning log.
export function fillSuggestions(templates, facts) {
  return templates.map((template, i) => ({ id: `s${i + 1}`, text: fillTemplate(template, facts) }));
}

// A tap adds to what is already in the box, so a child's own words are never lost.
export function appendAnswer(current, text) {
  const own = current.trimEnd();
  return own ? `${own} ${text}` : text;
}

// Where the answer in a box came from (for the thesis, never for rewards here):
//   own          typed by the child (or nothing was tapped)
//   hint         exactly the tapped answer(s)
//   hint-edited  a tapped answer that the child changed or added to
// `tapped`: the suggestions put into the box since it was last empty.
export function answerSource(text, tapped) {
  if (tapped.length === 0) return 'own';
  return text.trim() === tapped.join(' ') ? 'hint' : 'hint-edited';
}
