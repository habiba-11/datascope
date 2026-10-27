// Teacher dashboard: one child's page (Part 20; layout 27 Oct 2026).
// Their phases, the exact words they wrote, the teacher's tags, a timestamped
// timeline of every log moment (folded away), and delete (online only).
// Shown with textContent only: a log can hold anything a child typed.
import { PHASES } from '../helpers/progress.js';
import { twoTapButton } from './two-tap.js';

const PHASE_NAMES = {
  ask: '❓ Ask', plan: '🗺️ Plan', collect: '📋 Collect', graph: '📊 Graph Lab',
  number: '🔢 Number Lab', chance: '🎲 Chance Lab', conclude: '🚩 Conclude',
};
const BASIC_FIELDS = ['id', 'code', 'time', 'room', 'type'];

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

const show = (value) => (value === null || value === undefined || value === '' ? '–' : String(value));

// Everything in a log entry except the fixed fields, as "key: value; ...".
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

function table(headers, rows, className) {
  const wrap = el('div', '', 'table-wrap');
  const t = el('table', '', `class-table ${className}`);
  const headRow = el('tr');
  headers.forEach((h) => headRow.append(Object.assign(el('th', h), { scope: 'col' })));
  t.append(el('thead'));
  t.tHead.append(headRow);
  const body = el('tbody');
  rows.forEach((cells) => {
    const tr = el('tr');
    cells.forEach(([text, cls]) => tr.append(el('td', text, cls || '')));
    body.append(tr);
  });
  t.append(body);
  wrap.append(t);
  return wrap;
}

// One section: a heading, then its content.
function section(title, ...content) {
  const box = el('section', '', 'detail-section');
  box.append(el('h3', title), ...content);
  return box;
}

// `row` comes from childRows(); `entries` is the child's whole log.
// options: tagsNode (the tag checkboxes), onBack (back to the list),
//          onDelete (online database only: deletes everything for this code).
export function renderDetail(container, row, entries, scenarioTitle, { tagsNode = null, onBack, onDelete = null } = {}) {
  const back = el('button', '← All children', 'btn');
  back.type = 'button';
  back.addEventListener('click', onBack);

  const heading = el('h2', `${row.code} · ${scenarioTitle}`);
  const badges = el('p', '', 'detail-badges');
  badges.textContent = [
    row.demo ? '🧪 DEMO' : '',
    row.preview ? '👀 preview run' : '',
    `${row.finished ? '✅ finished' : `${row.phasesDone} of 7 phases`}`,
    `⭐ ${row.totalStars} stars`,
    `💡 ${row.hintsUsed} hints`,
  ].filter(Boolean).join(' · ');

  const phases = table(['Phase', 'Done', 'Stars', 'Minutes'], PHASES.map((phase) => [
    [PHASE_NAMES[phase]],
    [row[`${phase}Done`] ? '✅ yes' : '– not yet'],
    [show(row[`${phase}Stars`])],
    [show(row[`${phase}Minutes`])],
  ]), 'phase-table');

  const words = definitionList([
    ['Plan guess', row.planGuess],
    ['Number Lab guess → mean', row.numberGuess === null ? null : `${row.numberGuess} → ${show(row.mean)} (off by ${show(row.predictionError)})`],
    ['Number Lab puzzles', `✅ ${row.tasksFirstTry} first try · 💡 ${row.tasksAfterHint} after another try · ❌ ${row.tasksUnsolved} unsolved`],
    ['Changed mind after the data', row.revised === null ? null : `${row.revised ? 'yes' : 'no'}${row.revisionReason ? `, because "${row.revisionReason}"` : ''}`],
    ['Graph: what it shows', row.graphTell],
    ['Graph: what it can NOT show', row.graphNotTell],
    ['Chance Lab', row.chanceRating ? `${row.chanceDevice}: "${row.chanceRating}" because "${row.chanceReason}"` : null],
    ['Biggest test', row.biggestRun === null ? null : `${row.biggestRun} tries, ${row.biggestRunPct}%`],
    ['Claim', row.claim === null ? null : `I think ${row.claim} because ${row.because}.`],
    ['Evidence used', row.evidenceCount],
    ['How sure', row.certainty === null ? null : `${row.certainty}: ${row.certaintyReason}`],
  ]);

  // The full timeline is long, so it is folded away until the teacher opens it.
  const timeline = el('details', '', 'more');
  timeline.append(
    el('summary', `Show the timeline (${entries.length} moments)`),
    table(['Time', 'Room', 'Moment', 'Details'], entries.map((entry) => [
      [new Date(entry.time).toLocaleString(), 'no-wrap'],
      [entry.room],
      [entry.type],
      [detailsText(entry)],
    ]), 'timeline'),
  );

  container.replaceChildren(
    back,
    heading,
    badges,
    section('📈 Phases', phases),
    section('💬 Their answers and words', words),
  );
  if (tagsNode) container.append(section('🏷️ Misconception tags', tagsNode));
  container.append(section('🕒 Timeline', timeline));

  // Privacy: the teacher can delete one child's data (two taps, never by accident).
  if (onDelete) {
    const remove = el('button', `🗑️ Delete all of ${row.code}'s data`, 'btn');
    remove.type = 'button';
    twoTapButton(remove, `⚠️ Tap again to delete ${row.code} for good`, () => onDelete(row.code));
    container.append(section('🔒 Privacy', remove));
  }
  container.hidden = false;
  back.focus();
}
