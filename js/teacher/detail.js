// Teacher dashboard: one child's drill-down (Part 20). Their journey in
// numbers, the exact words they wrote, and a timestamped timeline of every
// log entry. Shown with textContent only: a file can hold anything a child typed.
import { PHASES } from '../helpers/progress.js';
import { twoTapButton } from './two-tap.js';

const PHASE_NAMES = {
  ask: 'Ask', plan: 'Plan', collect: 'Collect', graph: 'Graph Lab',
  number: 'Number Lab', chance: 'Chance Lab', conclude: 'Conclude',
};
const BASIC_FIELDS = ['code', 'time', 'room', 'type'];

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

const show = (value) => (value === null || value === undefined || value === '' ? '–' : String(value));

// Everything in a log entry except the four fixed fields, as "key: value; ...".
function detailsText(entry) {
  return Object.keys(entry)
    .filter((key) => !BASIC_FIELDS.includes(key))
    .map((key) => `${key}: ${Array.isArray(entry[key]) ? entry[key].join(', ') : entry[key]}`)
    .join('; ');
}

function definitionList(pairs) {
  const list = el('dl', '', 'detail-list');
  for (const [label, value] of pairs) list.append(el('dt', label), el('dd', show(value)));
  return list;
}

// `row` comes from childRows(); `entries` is the child's whole log.
// `onDelete` (online database only): deletes everything stored for this code.
export function renderDetail(container, row, entries, scenarioTitle, onDelete = null) {
  const close = el('button', '✕ Close', 'btn');
  close.type = 'button';
  close.addEventListener('click', () => { container.hidden = true; });

  const phaseTable = el('table', '', 'class-table phase-table');
  const head = el('tr');
  ['Phase', 'Done', 'Stars', 'Minutes'].forEach((h) => head.append(el('th', h)));
  phaseTable.append(el('thead'));
  phaseTable.tHead.append(head);
  const body = el('tbody');
  for (const phase of PHASES) {
    const tr = el('tr');
    tr.append(
      el('td', PHASE_NAMES[phase]),
      el('td', row[`${phase}Done`] ? '✅ yes' : '– no'),
      el('td', show(row[`${phase}Stars`])),
      el('td', show(row[`${phase}Minutes`])),
    );
    body.append(tr);
  }
  phaseTable.append(body);

  const words = definitionList([
    ['Plan guess', row.planGuess],
    ['Number Lab guess → mean', row.numberGuess === null ? null : `${row.numberGuess} → ${show(row.mean)} (off by ${show(row.predictionError)})`],
    ['Changed mind after the data', row.revised === null ? null : `${row.revised ? 'yes' : 'no'}${row.revisionReason ? `, because "${row.revisionReason}"` : ''}`],
    ['Graph: what it shows', row.graphTell],
    ['Graph: what it can NOT show', row.graphNotTell],
    ['Chance Lab', row.chanceRating ? `${row.chanceDevice}: "${row.chanceRating}" because "${row.chanceReason}"` : null],
    ['Biggest test', row.biggestRun === null ? null : `${row.biggestRun} tries, ${row.biggestRunPct}%`],
    ['Claim', row.claim === null ? null : `I think ${row.claim} because ${row.because}.`],
    ['Evidence used', row.evidenceCount],
    ['How sure', row.certainty === null ? null : `${row.certainty}: ${row.certaintyReason}`],
  ]);

  const timeline = el('table', '', 'class-table timeline');
  const tHead = el('tr');
  ['Time', 'Room', 'Moment', 'Details'].forEach((h) => tHead.append(el('th', h)));
  timeline.append(el('thead'));
  timeline.tHead.append(tHead);
  const tBody = el('tbody');
  for (const entry of entries) {
    const tr = el('tr');
    tr.append(
      el('td', new Date(entry.time).toLocaleString(), 'no-wrap'),
      el('td', entry.room),
      el('td', entry.type),
      el('td', detailsText(entry)),
    );
    tBody.append(tr);
  }
  timeline.append(tBody);

  container.replaceChildren(
    el('h2', `🔍 ${row.code} · ${scenarioTitle}${row.demo ? ' · DEMO' : ''}`),
    close,
    el('h3', 'Phases'),
    el('div', '', 'table-wrap'),
    el('h3', "The child's own words and numbers"),
    words,
    el('h3', `Timeline (${entries.length} moments)`),
    el('div', '', 'table-wrap'),
  );
  const wraps = container.querySelectorAll('.table-wrap');
  wraps[0].append(phaseTable);
  wraps[1].append(timeline);

  // Privacy: the teacher can delete one child's data (two taps, never by accident).
  if (onDelete) {
    const remove = el('button', `🗑️ Delete all of ${row.code}'s data`, 'btn');
    remove.type = 'button';
    twoTapButton(remove, `⚠️ Tap again to delete ${row.code} for good`, () => onDelete(row.code));
    container.append(el('h3', 'Privacy'), remove);
  }
  container.hidden = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  container.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
