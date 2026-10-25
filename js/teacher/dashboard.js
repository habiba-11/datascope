// Hidden teacher dashboard (Part 20, Prof's comment 6). Import the children's
// saved files, see the class at a glance (completion funnel, averages), one row
// per child per scenario, drill into one child, tag misconceptions, download CSVs.
// Hidden = no link from any child page. On a static site that is a speed bump,
// not security; real protection needs a login (optional Part 22).
// Imported text is shown with textContent only: a file can hold anything a child typed.
import { parseExportFile, MISCONCEPTION_TAGS, tagEntries } from '../helpers/summary.js';
import { childRows, classOverview } from '../helpers/metrics.js';
import { PHASES } from '../helpers/progress.js';
import { PICKABLE_SCENARIOS, loadRecipe, loadContent } from '../helpers/scenarios.js';
import { toCSV, downloadFile, exportFileName } from '../storage/export.js';
import {
  getTeacherImports, setTeacherImports, getTeacherTags, setTeacherTags, clearChildData,
  getPreviewAll, setPreviewAll,
} from '../storage/save.js';
import { renderDetail } from './detail.js';

let imports = getTeacherImports(); // { "OWL-07": file, ... }
let tags = getTeacherTags();       // { "OWL-07": ["equally-likely", ...], ... }
const titles = {};                 // scenario id -> card title, e.g. "How much do we sleep?"
const partners = {};               // reading Class A -> Class B (not a scenario of its own)

const PHASE_NAMES = {
  ask: '❓ Ask', plan: '🗺️ Plan', collect: '📋 Collect', graph: '📊 Graph Lab',
  number: '🔢 Number Lab', chance: '🎲 Chance Lab', conclude: '🚩 Conclude',
};

const feedback = document.getElementById('teacher-feedback');
const filter = document.getElementById('scenario-filter');

function say(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

// Small helper: makes an element with plain text inside.
function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

const show = (value) => (value === null || value === undefined ? '–' : String(value));

// ---------- importing ----------

document.getElementById('file-input').addEventListener('change', async (event) => {
  let added = 0;
  const skipped = [];

  for (const upload of event.target.files) {
    const result = parseExportFile(await upload.text());
    if (!result.ok) {
      skipped.push(`${upload.name} (${result.reason})`);
      continue;
    }
    // The same child may hand in twice: keep the newest file.
    const old = imports[result.file.code];
    if (!old || old.exportedAt < result.file.exportedAt) imports[result.file.code] = result.file;
    added += 1;
  }

  setTeacherImports(imports);
  event.target.value = ''; // so the same files can be chosen again later
  say(`Imported ${added} file${added === 1 ? '' : 's'}.${skipped.length ? ` Skipped: ${skipped.join(', ')}.` : ''}`);
  render();
});

// ---------- the rows (one per child per scenario) ----------

function currentRows() {
  const rows = childRows(Object.values(imports), partners).sort((a, b) => (a.code > b.code ? 1 : -1));
  return filter.value ? rows.filter((r) => r.scenarioId === filter.value) : rows;
}

function tagCell(code) {
  const chosen = tags[code] || [];
  const details = document.createElement('details');
  details.append(el('summary', `🏷️ Tags (${chosen.length})`));

  for (const tag of MISCONCEPTION_TAGS) {
    const label = el('label', '', 'tag-option');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = chosen.includes(tag.id);
    box.addEventListener('change', () => {
      const now = new Set(tags[code] || []);
      if (box.checked) now.add(tag.id); else now.delete(tag.id);
      tags[code] = [...now];
      setTeacherTags(tags);
      details.querySelector('summary').textContent = `🏷️ Tags (${now.size})`;
    });
    const papersWord = tag.papers.includes(',') ? 'Papers' : 'Paper';
    label.append(box, ` ${tag.label} (${papersWord} ${tag.papers})`);
    details.append(label);
  }
  return details;
}

function renderOverview(rows) {
  const o = classOverview(rows);
  const tiles = [
    ['👧 Children', o.children],
    ['🔎 Investigations', o.investigations],
    ['🏁 Finished', o.finished],
    ['💡 Hints used', o.hintsUsed],
    ['🧩 Puzzles right first time', o.firstTryRate === null ? null : `${o.firstTryRate}%`],
    ['🎯 Average guess error', o.avgPredictionError],
    ['🔄 Changed mind after data', o.revisedRate === null ? null : `${o.revisedRate}%`],
  ];
  document.getElementById('overview').replaceChildren(...tiles.map(([label, value]) => {
    const tile = el('div', '', 'tile');
    tile.append(el('span', show(value), 'tile-value'), el('span', label, 'tile-label'));
    return tile;
  }));

  document.getElementById('funnel-rows').replaceChildren(...PHASES.map((phase) => {
    const tr = el('tr');
    const name = el('th', PHASE_NAMES[phase]);
    name.scope = 'row';
    tr.append(name, el('td', `${o.funnel[phase]} of ${o.investigations}`), el('td', show(o.avgMinutes[phase])));
    return tr;
  }));
}

function render() {
  const rows = currentRows();
  renderOverview(rows);

  const body = document.getElementById('class-rows');
  body.replaceChildren();
  if (rows.length === 0) {
    const emptyRow = el('tr');
    const emptyCell = el('td', 'No files yet. Import the files your children saved.');
    emptyCell.colSpan = 11;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  }

  for (const row of rows) {
    const tr = el('tr');
    const codeCell = el('th', row.code, 'no-wrap');
    codeCell.scope = 'row';
    const open = el('button', '🔍 Open', 'btn');
    open.type = 'button';
    open.addEventListener('click', () => {
      renderDetail(document.getElementById('detail'), row, imports[row.code].entries, titles[row.scenarioId] || row.scenarioId);
    });
    const tagsTd = el('td');
    tagsTd.append(tagCell(row.code));
    const openTd = el('td');
    openTd.append(open);

    tr.append(
      codeCell,
      el('td', titles[row.scenarioId] || row.scenarioId),
      el('td', `${row.finished ? '✅ ' : ''}${row.phasesDone} of 7`, 'no-wrap'),
      el('td', String(row.totalStars)),
      el('td', `✅ ${row.tasksFirstTry} · 💡 ${row.tasksAfterHint} · ❌ ${row.tasksUnsolved}`, 'no-wrap'),
      el('td', String(row.hintsUsed)),
      el('td', row.numberGuess === null ? '–' : `${row.numberGuess} → ${show(row.mean)}`, 'no-wrap'),
      el('td', row.revised === null ? '–' : (row.revised ? '🔄 yes' : 'no')),
      el('td', row.claim === null ? '–' : `I think ${row.claim} because ${row.because}.`, 'claim-cell'),
      tagsTd,
      openTd,
    );
    body.append(tr);
  }
}

filter.addEventListener('change', render);

// ---------- class CSV (every log entry, plus the teacher's tags) ----------

document.getElementById('export-class-btn').addEventListener('click', () => {
  const codes = Object.keys(imports).sort();
  if (codes.length === 0) {
    say('Import some files first.');
    return;
  }
  const entries = codes.flatMap((code) => [...imports[code].entries, ...tagEntries(code, tags[code] || [])]);
  const fileName = exportFileName('class', 'csv');
  downloadFile(fileName, toCSV(entries), 'text/csv');
  say(`Saved "${fileName}" to Downloads.`);
});

// ---------- removing things (always two taps, so nothing is lost by accident) ----------

// The first tap changes the button to "Tap again..."; a second tap within
// 4 seconds runs `action`. (Browser confirm() boxes are avoided on purpose.)
function twoTapButton(button, warning, action) {
  const normalText = button.textContent;
  let armed = false;
  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      button.textContent = warning;
      setTimeout(() => {
        armed = false;
        button.textContent = normalText;
      }, 4000);
      return;
    }
    armed = false;
    button.textContent = normalText;
    action();
  });
}

twoTapButton(document.getElementById('clear-btn'), '⚠️ Tap again to remove everything', () => {
  imports = {};
  tags = {};
  setTeacherImports(imports);
  setTeacherTags(tags);
  document.getElementById('detail').hidden = true;
  say('All imported files and tags were removed from this device.');
  render();
});

twoTapButton(document.getElementById('clear-device-btn'), '⚠️ Tap again to clear the child\'s work', () => {
  clearChildData();
  say("The child's code and work were cleared from this device. The next child can start fresh.");
});

// ---------- preview: open every room on this device ----------

const previewBtn = document.getElementById('preview-btn');

function showPreviewState() {
  const on = getPreviewAll();
  previewBtn.textContent = on ? '👀 Preview is ON: all rooms open (tap to turn off)' : '🔒 Preview is OFF: tap to open all rooms';
  previewBtn.setAttribute('aria-pressed', String(on));
}

previewBtn.addEventListener('click', () => {
  setPreviewAll(!getPreviewAll());
  showPreviewState();
});

// ---------- start ----------

async function init() {
  // Scenario names for the table and the filter; partners so reading's
  // Class B is not counted as a scenario of its own.
  for (const id of PICKABLE_SCENARIOS) {
    const [recipe, content] = await Promise.all([loadRecipe(id), loadContent(id)]);
    titles[id] = content.cardTitle;
    if (recipe.compareWith) partners[id] = recipe.compareWith;
    filter.append(Object.assign(document.createElement('option'), { value: id, textContent: content.cardTitle }));
  }
  showPreviewState();
  render();
}

init();
