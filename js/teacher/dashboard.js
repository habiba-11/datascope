// Teacher dashboard (Part 20, Prof's comment 6; layout 27 Oct 2026).
// A top bar (who is logged in, Refresh / Import, Log out) and 4 tabs:
//   📊 Class        the big picture: key numbers and two charts
//   👧 Children     a short list; "Open" shows one child's page (detail.js)
//   📥 Thesis data  optional downloads, and the DEMO switch
//   ⚙️ Settings     this device: clear it, preview the rooms
// Where the children's work comes from:
// - online database ON (Part 22): read straight from the database (cloud.js),
//   nothing to import; loaded by gate.js after the email + password login.
// - online database OFF: the teacher imports the files children saved.
// Text from a log is shown with textContent only: it can hold anything a child typed.
import { parseExportFile, MISCONCEPTION_TAGS, tagEntries } from '../helpers/summary.js';
import { childRows, classOverview } from '../helpers/metrics.js';
import { PHASES } from '../helpers/progress.js';
import { PICKABLE_SCENARIOS, loadRecipe, loadContent } from '../helpers/scenarios.js';
import { toCSV, downloadFile, exportFileName } from '../storage/export.js';
import { thesisCSV, dictionaryCSV, exportableRows } from '../helpers/thesis.js';
import { makeDemoFiles } from '../helpers/demo.js';
import { directLabelsPlugin } from '../helpers/charts.js';
import {
  getTeacherImports, setTeacherImports, getTeacherTags, setTeacherTags, clearChildData,
  getPreviewAll, setPreviewAll,
} from '../storage/save.js';
import { renderDetail } from './detail.js';
import { twoTapButton } from './two-tap.js';
import { setupTabs } from './tabs.js';
import { backendReady } from '../config.js';
import {
  fetchChildren, fetchTags, addTag, removeTag, deleteChild, logOut, teacherEmail,
} from './cloud.js';

const cloud = backendReady(); // true: the work comes from the online database

let imports = cloud ? {} : getTeacherImports(); // { "OWL-07": file, ... }
let tags = cloud ? {} : getTeacherTags();       // { "OWL-07": ["equally-likely", ...], ... }
const titles = {};                 // scenario id -> card title, e.g. "How much do we sleep?"
const partners = {};               // reading Class A -> Class B (not a scenario of its own)
// DEMO children: in memory only, never saved with the real imports, never exported.
const demoFiles = makeDemoFiles();
let showDemo = false;
let charts = [];

Chart.register(directLabelsPlugin);

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

// ---------- the rows (one per child per scenario) ----------

// The files on show: the real ones, plus the DEMO children when switched on.
function shownFiles() {
  return [...Object.values(imports), ...(showDemo ? demoFiles : [])];
}

function currentRows() {
  const rows = childRows(shownFiles(), partners).sort((a, b) => (a.code > b.code ? 1 : -1));
  return filter.value ? rows.filter((r) => r.scenarioId === filter.value) : rows;
}

// ---------- 📊 Class ----------

function renderClass(rows) {
  const o = classOverview(rows);
  // The 4 numbers that matter most; the rest in one quiet line underneath.
  const tiles = [
    ['👧 Children', o.children],
    ['🏁 Finished', `${o.finished} of ${o.investigations}`],
    ['🧩 Puzzles right first time', o.firstTryRate === null ? null : `${o.firstTryRate}%`],
    ['🔄 Changed mind after data', o.revisedRate === null ? null : `${o.revisedRate}%`],
  ];
  document.getElementById('overview').replaceChildren(...tiles.map(([label, value]) => {
    const tile = el('div', '', 'tile');
    tile.append(el('span', show(value), 'tile-value'), el('span', label, 'tile-label'));
    return tile;
  }));
  document.getElementById('overview-more').textContent =
    `🎯 Average guess error: ${show(o.avgPredictionError)} · 💡 Hints used: ${o.hintsUsed}`;

  document.getElementById('funnel-rows').replaceChildren(...PHASES.map((phase) => {
    const tr = el('tr');
    const name = el('th', PHASE_NAMES[phase]);
    name.scope = 'row';
    tr.append(name, el('td', `${o.funnel[phase]} of ${o.investigations}`), el('td', show(o.avgMinutes[phase])));
    return tr;
  }));
  renderCharts(o);
}

// Two bar charts for thesis figures: the funnel, and average minutes per phase.
// Numbers are written on the bars (directLabelsPlugin), like in Graph Lab.
function renderCharts(o) {
  charts.forEach((chart) => chart.destroy());
  const labels = PHASES.map((p) => PHASE_NAMES[p].split(' ').slice(1).join(' '));
  const bar = (id, title, data, colour) => {
    const canvas = document.getElementById(id);
    canvas.setAttribute('aria-label', `${title}: ${labels.map((l, i) => `${l} ${data[i] ?? 'no data'}`).join(', ')}`);
    return new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: colour, borderColor: '#17324D', borderWidth: 2 }] },
      options: {
        animation: false,
        layout: { padding: { top: 24 } },
        plugins: { legend: { display: false }, title: { display: true, text: title, font: { size: 16 } } },
        // grace: room above the tallest bar, so its number never hits the title.
        scales: { y: { beginAtZero: true, grace: '20%', ticks: { precision: 0 } } },
      },
    });
  };
  charts = [
    bar('funnel-chart', `Finished each phase (of ${o.investigations})`, PHASES.map((p) => o.funnel[p]), '#38B6FF'),
    bar('minutes-chart', 'Average minutes per phase', PHASES.map((p) => o.avgMinutes[p]), '#4CC26B'),
  ];
}

// ---------- 👧 Children ----------

function renderChildren(rows) {
  const body = document.getElementById('class-rows');
  body.replaceChildren();
  if (rows.length === 0) {
    const emptyRow = el('tr');
    const emptyCell = el('td', cloud
      ? 'No children yet. Their work appears here by itself when they use DataScope.'
      : 'No files yet. Tap "📂 Import files" at the top.');
    emptyCell.colSpan = 6;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  }

  for (const row of rows) {
    const tr = el('tr');
    const label = row.demo ? ' 🧪 DEMO' : (row.preview ? ' 👀 preview' : '');
    const codeCell = el('th', `${row.code}${label}`, 'no-wrap');
    codeCell.scope = 'row';

    // Progress in words AND a small bar (colour is never the only signal).
    const progress = el('td', '', 'no-wrap');
    const bar = el('span', '', 'progress-bar');
    const fill = el('span', '', 'progress-fill');
    fill.style.width = `${(row.phasesDone / 7) * 100}%`;
    bar.append(fill);
    progress.append(el('span', `${row.finished ? '✅ ' : ''}${row.phasesDone} of 7`), bar);

    const open = el('button', '🔍 Open', 'btn no-wrap');
    open.type = 'button';
    open.setAttribute('aria-label', `Open ${row.code}`);
    open.addEventListener('click', () => openChild(row));
    const openCell = el('td');
    openCell.append(open);

    const claim = el('td', '', 'col-claim');
    claim.append(el('span', row.claim === null ? '–' : `I think ${row.claim} because ${row.because}.`, 'claim-cell'));

    tr.append(
      codeCell,
      el('td', titles[row.scenarioId] || row.scenarioId),
      progress,
      el('td', `⭐ ${row.totalStars}`, 'no-wrap'),
      claim,
      openCell,
    );
    body.append(tr);
  }
}

// One child's page replaces the list; "← All children" brings the list back.
function openChild(row) {
  const file = row.demo ? demoFiles.find((f) => f.code === row.code) : imports[row.code];
  document.getElementById('children-list').hidden = true;
  document.getElementById('filter-row').hidden = true; // one child: the filter does nothing here
  renderDetail(document.getElementById('detail'), row, file.entries, titles[row.scenarioId] || row.scenarioId, {
    tagsNode: row.demo ? null : tagBoxes(row.code),
    onBack: closeChild,
    onDelete: cloud && !row.demo ? removeChild : null,
  });
}

function closeChild() {
  document.getElementById('detail').hidden = true;
  document.getElementById('children-list').hidden = false;
  if (!document.getElementById('panel-children').hidden || !document.getElementById('panel-class').hidden) {
    document.getElementById('filter-row').hidden = false;
  }
}

// The misconception tags for one child, as checkboxes (saved online or on this device).
function tagBoxes(code) {
  const box = el('div', '', 'tag-list');
  for (const tag of MISCONCEPTION_TAGS) {
    const label = el('label', '', 'tag-option');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = (tags[code] || []).includes(tag.id);
    input.addEventListener('change', async () => {
      const now = new Set(tags[code] || []);
      if (input.checked) now.add(tag.id); else now.delete(tag.id);
      tags[code] = [...now];
      if (!cloud) {
        setTeacherTags(tags);
        return;
      }
      try {
        if (input.checked) await addTag(code, tag.id); else await removeTag(code, tag.id);
      } catch (error) {
        // Not saved online: undo the tick, so the screen never shows a wrong tag.
        input.checked = !input.checked;
        if (input.checked) now.add(tag.id); else now.delete(tag.id);
        tags[code] = [...now];
        say(`⚠️ The tag was not saved: ${error.message}`);
      }
    });
    const papersWord = tag.papers.includes(',') ? 'Papers' : 'Paper';
    label.append(input, ` ${tag.label} (${papersWord} ${tag.papers})`);
    box.append(label);
  }
  return box;
}

// ---------- drawing everything ----------

function render() {
  const rows = currentRows();
  renderClass(rows);
  renderChildren(rows);
}

filter.addEventListener('change', () => {
  closeChild();
  render();
});

// The scenario filter only matters for Class and Children. Charts are drawn
// again when Class opens, because a chart in a hidden tab has no size.
function onTabChange(tabId) {
  document.getElementById('filter-row').hidden = !['tab-class', 'tab-children'].includes(tabId);
  if (tabId === 'tab-class' && Object.keys(titles).length) renderClass(currentRows());
}

// ---------- importing (online database OFF only) ----------

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

// ---------- 📥 Thesis data (real children only: DEMO rows are never exported) ----------

document.getElementById('export-thesis-btn').addEventListener('click', () => {
  // All scenarios, whatever the filter shows, so the file is always complete.
  const rows = exportableRows(childRows(Object.values(imports), partners));
  if (rows.length === 0) {
    say("No children's work yet. (DEMO children are never exported.)");
    return;
  }
  downloadFile('thesis-metrics.csv', thesisCSV(rows), 'text/csv');
  say(`Saved "thesis-metrics.csv" (${rows.length} row${rows.length === 1 ? '' : 's'}: one per child per scenario) to Downloads.`);
});

document.getElementById('export-dictionary-btn').addEventListener('click', () => {
  downloadFile('thesis-metrics-dictionary.csv', dictionaryCSV(), 'text/csv');
  say('Saved "thesis-metrics-dictionary.csv" (what every column means) to Downloads.');
});

document.getElementById('export-class-btn').addEventListener('click', () => {
  const codes = Object.keys(imports).sort();
  if (codes.length === 0) {
    say("No children's work yet.");
    return;
  }
  // Every child's log, plus the teacher's tags as extra rows.
  const entries = codes.flatMap((code) => [...imports[code].entries, ...tagEntries(code, tags[code] || [])]);
  const fileName = exportFileName('class', 'csv');
  downloadFile(fileName, toCSV(entries), 'text/csv');
  say(`Saved "${fileName}" to Downloads.`);
});

const demoBtn = document.getElementById('demo-btn');
demoBtn.addEventListener('click', () => {
  showDemo = !showDemo;
  demoBtn.textContent = showDemo ? '🧪 Hide DEMO data' : '🧪 Show DEMO data';
  demoBtn.setAttribute('aria-pressed', String(showDemo));
  document.getElementById('demo-banner').hidden = !showDemo;
  closeChild();
  render();
});

twoTapButton(document.getElementById('clear-btn'), '⚠️ Tap again to remove everything', () => {
  imports = {};
  tags = {};
  setTeacherImports(imports);
  setTeacherTags(tags);
  closeChild();
  say('All imported files and tags were removed from this device.');
  render();
});

// ---------- ⚙️ Settings ----------

twoTapButton(document.getElementById('clear-device-btn'), '⚠️ Tap again to clear this device', () => {
  clearChildData();
  say("The child's code and work were cleared from this device. The next child can start fresh.");
});

const previewBtn = document.getElementById('preview-btn');

function showPreviewState() {
  const on = getPreviewAll();
  previewBtn.textContent = on ? '👀 Preview is ON (tap to turn off)' : '🔒 Preview is OFF (tap to turn on)';
  previewBtn.setAttribute('aria-pressed', String(on));
}

previewBtn.addEventListener('click', () => {
  setPreviewAll(!getPreviewAll());
  showPreviewState();
});

// ---------- the online database (Part 22) ----------

// Loads every child's work and the tags from the database.
async function loadFromCloud() {
  say('⏳ Loading the children\'s work...');
  try {
    const files = await fetchChildren();
    imports = Object.fromEntries(files.map((file) => [file.code, file]));
    tags = await fetchTags();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    say(`☁️ ${files.length} child${files.length === 1 ? '' : 'ren'} loaded at ${time}.`);
  } catch (error) {
    if (error.message === 'Please log in again.') {
      location.reload(); // the login ran out: back to the login form
      return;
    }
    const offline = !navigator.onLine || error instanceof TypeError;
    say(offline ? '📴 No internet connection. Connect and tap Refresh.' : `⚠️ Could not load: ${error.message}`);
  }
  closeChild();
  render();
}

// Privacy: deletes one child's data from the database, then reloads.
async function removeChild(code) {
  try {
    await deleteChild(code);
    await loadFromCloud();
    say(`🗑️ Everything stored for ${code} was deleted from the database.`);
  } catch (error) {
    say(`⚠️ Could not delete ${code}: ${error.message}`);
  }
}

// The top bar and the texts that depend on where the work comes from.
function setupSource() {
  const who = document.getElementById('dash-who');
  if (!cloud) {
    who.textContent = '📁 Working from files imported on this device.';
    document.getElementById('clear-note').textContent = 'After a child has saved their file, removes their code and work from this device, so the next child starts fresh.';
    return;
  }
  who.textContent = `☁️ Logged in as ${teacherEmail()}. Children's work arrives by itself.`;
  document.getElementById('import-label').hidden = true;
  document.getElementById('imported-box').hidden = true; // nothing is imported online
  document.getElementById('refresh-btn').hidden = false;
  document.getElementById('logout-btn').hidden = false;
  document.getElementById('clear-note').textContent = 'When a child\'s work shows ☁️ Saved online, removes their code from this device, so the next child starts fresh. (Their work stays safe in the database.)';
  document.getElementById('refresh-btn').addEventListener('click', loadFromCloud);
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logOut();
    location.reload();
  });
}

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
  setupSource();
  setupTabs(onTabChange);
  if (cloud) await loadFromCloud();
  else render();
}

init();
