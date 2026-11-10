// Teacher dashboard: one child's page (Part 20; layout 27 Oct 2026).
// Their phases, the exact words they wrote, the teacher's tags, a timestamped
// timeline of every log moment (folded away), and delete (online only).
// Shown with textContent only: a log can hold anything a child typed.
import { PHASES } from '../helpers/progress.js';
import { sourceLabel } from '../helpers/thesis.js';
import { twoTapButton } from './two-tap.js';
import { setIconLine } from '../icon-text.js';

const PHASE_NAMES = {
  ask: ':question: Ask', plan: ':map: Plan', collect: ':clipboard: Collect', graph: ':chart: Graph Lab',
  number: ':numbers: Number Lab', chance: ':die: Chance Lab', conclude: ':flag: Conclude',
};
const BASIC_FIELDS = ['id', 'code', 'time', 'room', 'type'];

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  setIconLine(element, text); // our texts name icons as :name: (Part 54h)
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
  const back = el('button', '← All children', 'btn btn-quiet');
  back.type = 'button';
  back.addEventListener('click', onBack);

  const heading = el('h2', `${row.code} · ${scenarioTitle}`);
  const badges = el('p', '', 'detail-badges');
  setIconLine(badges, [
    row.demo ? ':masks: DEMO' : '',
    row.preview ? ':magnifier: preview run' : '',
    `${row.finished ? ':check: finished' : `${row.phasesDone} of 7 phases`}`,
    `:star: ${row.totalStars} stars`,
    `:bulb: ${row.hintsUsed} hints`,
    `:tap: answers tapped in: ${row.suggestionsUsed}`,
  ].filter(Boolean).join(' · '));

  const phases = table(['Phase', 'Done', 'Stars', 'Minutes'], PHASES.map((phase) => [
    [PHASE_NAMES[phase]],
    [row[`${phase}Done`] ? ':check: yes' : '– not yet'],
    [show(row[`${phase}Stars`])],
    [show(row[`${phase}Minutes`])],
  ]), 'phase-table');

  // The child's words, then where they came from (own words, or from a hint).
  const withSource = (text, source) => {
    const label = sourceLabel(source);
    return label && text !== null ? `${text} (${label})` : text;
  };
  const claimSources = [
    sourceLabel(row.claimSource) && `I think: ${sourceLabel(row.claimSource)}`,
    sourceLabel(row.becauseSource) && `because: ${sourceLabel(row.becauseSource)}`,
  ].filter(Boolean).join('; ');
  const words = definitionList([
    ['Plan guess', row.planGuess],
    ['Number Lab guess → mean', row.numberGuess === null ? null : `${row.numberGuess} → ${show(row.mean)} (off by ${show(row.predictionError)})`],
    ['Number Lab puzzles', `:check: ${row.tasksFirstTry} first try · :bulb: ${row.tasksAfterHint} after another try · :cross: ${row.tasksUnsolved} unsolved`],
    ['Changed mind after the data', row.revised === null ? null : `${row.revised ? 'yes' : 'no'}${row.revisionReason ? `, because ${withSource(`"${row.revisionReason}"`, row.revisionReasonSource)}` : ''}`],
    ['Graph: what it shows', withSource(row.graphTell, row.graphTellSource)],
    ['Graph: what it can NOT show', withSource(row.graphNotTell, row.graphNotTellSource)],
    ['Chance Lab', row.chanceRating ? `${row.chanceDevice}: "${row.chanceRating}" because ${withSource(`"${row.chanceReason}"`, row.chanceReasonSource)}` : null],
    ['Biggest test', row.biggestRun === null ? null : `${row.biggestRun} tries, ${row.biggestRunPct}%`],
    ['Claim', row.claim === null ? null : `I think ${row.claim} because ${row.because}.${claimSources ? ` (${claimSources})` : ''}`],
    ['Evidence used', row.evidenceCount],
    ['How sure', row.certainty === null ? null : `${row.certainty}: ${withSource(row.certaintyReason, row.certaintyReasonSource)}`],
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
    section(':chart: Phases', phases),
    section(':speech: Their answers and words', words),
  );
  if (tagsNode) container.append(section(':pin: Misconception tags', tagsNode));
  container.append(section(':clock: Timeline', timeline));

  // Privacy: the teacher can delete one child's data (two taps, never by accident).
  if (onDelete) {
    const remove = el('button', `:cross: Delete all of ${row.code}'s data`, 'btn btn-secondary');
    remove.type = 'button';
    twoTapButton(remove, `:warning: Tap again to delete ${row.code} for good`, () => onDelete(row.code));
    container.append(section(':lock: Privacy', remove));
  }
  container.hidden = false;
  back.focus();
}
