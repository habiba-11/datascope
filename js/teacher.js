// Teacher view (shell layer): import the children's saved files, see one row
// per child, tag misconceptions, and download one class CSV.
// Imported text is shown with textContent only: a file can hold anything a child typed.
import { parseExportFile, summarizeChild, MISCONCEPTION_TAGS, tagEntries } from './helpers/summary.js';
import { toCSV, downloadFile, exportFileName } from './storage/export.js';
import {
  getTeacherImports, setTeacherImports, getTeacherTags, setTeacherTags, clearChildData,
  getPreviewAll, setPreviewAll,
} from './storage/save.js';

let imports = getTeacherImports(); // { "OWL-07": file, ... }
let tags = getTeacherTags();       // { "OWL-07": ["equally-likely", ...], ... }

const feedback = document.getElementById('teacher-feedback');

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

// ---------- the class table ----------

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

function claimText(claim) {
  if (!claim) return '-';
  return `I think ${claim.claim} because ${claim.because}. (${claim.certainty}: ${claim.certaintyReason})`;
}

function render() {
  const rows = document.getElementById('class-rows');
  const children = Object.values(imports).map(summarizeChild).sort((a, b) => (a.code > b.code ? 1 : -1));

  rows.replaceChildren();
  if (children.length === 0) {
    const emptyRow = el('tr');
    const emptyCell = el('td', 'No files yet. Import the files your children saved.');
    emptyCell.colSpan = 7;
    emptyRow.append(emptyCell);
    rows.append(emptyRow);
  }

  for (const child of children) {
    const row = el('tr');
    const codeCell = el('th', child.code, 'no-wrap');
    codeCell.scope = 'row';
    row.append(
      codeCell,
      el('td', child.scenarios.join(', ') || '-'),
      el('td', `✅ ${child.tasksCorrect} · 💡 ${child.tasksAfterHint} · ❌ ${child.tasksIncorrect}`, 'no-wrap'),
      el('td', String(child.hintsUsed)),
      el('td', String(child.certaintyReasons)),
      el('td', claimText(child.lastClaim), 'claim-cell'),
    );
    const tagsTd = el('td');
    tagsTd.append(tagCell(child.code));
    row.append(tagsTd);
    rows.append(row);
  }

  const sum = (key) => children.reduce((total, child) => total + child[key], 0);
  document.getElementById('class-totals').textContent = children.length
    ? `${children.length} children · meaning tasks: ✅ ${sum('tasksCorrect')} first time, 💡 ${sum('tasksAfterHint')} after a hint, ❌ ${sum('tasksIncorrect')} unsolved · hints used: ${sum('hintsUsed')}`
    : '';
}

// ---------- class CSV ----------

document.getElementById('export-class-btn').addEventListener('click', () => {
  const codes = Object.keys(imports).sort();
  if (codes.length === 0) {
    say('Import some files first.');
    return;
  }
  // Every child's log, plus the teacher's tags as extra rows.
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

showPreviewState();
render();
