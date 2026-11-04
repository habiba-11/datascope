// Shell layer: the "📋 My findings" pop-up in Evidence Board, laid out like
// the f11 design (Part 37d, 4 Nov 2026): ❓ our question, 🔢 the data (bars
// for words, tiles and a number line for numbers, two classes side by side),
// 🧠 my thinking (a timeline of the child's own words).
// The content comes from buildFindings() (helpers/findings.js). The child's
// words go in with textContent only.
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { pipSVG } from './pip.js';

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// One section: a coloured head with an icon, then its body.
function section(icon, title, colour, extraClass = '') {
  const box = el('section', '', `fd-sec ${extraClass} m-rise`);
  box.style.setProperty('--c', `var(--color-${colour})`);
  const head = el('h3', '', 'fd-head');
  const emoji = el('span', icon);
  emoji.setAttribute('aria-hidden', 'true');
  head.append(emoji, title);
  const body = el('div', '', 'fd-body');
  box.append(head, body);
  return { box, body };
}

function tilesNode(tiles) {
  const grid = el('div', '', 'fd-tiles');
  tiles.forEach((t) => {
    const tile = el('div', '', 'fd-tile');
    tile.append(el('span', t.label, 'fd-tile-k'), el('span', t.value, 'fd-tile-v'), el('span', t.meaning, 'fd-tile-d'));
    grid.append(tile);
  });
  return grid;
}

// Bars with word labels and the count as a number (not colour alone).
function votesNode(data) {
  const list = el('div', '', 'fd-votes');
  data.votes.forEach((v, i) => {
    const row = el('div', '', `fd-vote${i === 0 ? ' top' : ''}`);
    const track = el('span', '', 'fd-track');
    track.setAttribute('aria-hidden', 'true');
    const fill = el('i');
    fill.dataset.width = `${v.pct}%`;
    fill.style.transitionDelay = `${300 + i * 120}ms`;
    track.append(fill);
    row.append(el('span', v.value, 'fd-name'), track, el('span', `${v.count} ${v.count === 1 ? 'kid' : 'kids'}`, 'fd-count'));
    list.append(row);
  });
  const mode = el('p', '', 'fd-mode');
  mode.append(el('span', '🏆 Most common (mode): '), el('b', data.mode));
  return [list, mode];
}

// A number line from the smallest to the biggest answer, with the mean marked.
function lineNode(line) {
  const ruler = el('div', '', 'fd-ruler');
  ruler.setAttribute('role', 'img');
  ruler.setAttribute('aria-label', `From ${line.min} to ${line.max}. The mean is ${line.mean}.`);
  const mark = el('span', `Mean ${line.mean}`, 'fd-mark');
  mark.style.left = `${line.meanPct}%`;
  const low = el('span', String(line.min), 'fd-tick');
  const high = el('span', String(line.max), 'fd-tick fd-tick--end');
  ruler.append(el('span', '', 'fd-line'), mark, low, high);
  return ruler;
}

// Two classes (4 Nov 2026): one row per number, Class A and Class B in their
// own coloured columns, and "✓ Same" or "≠ Different" in words, so the
// lesson (same mean, different spread) can be read across each row.
function compareNode(rows) {
  const table = el('table', '', 'fd-table');
  const head = el('tr');
  const corner = el('th');
  corner.setAttribute('scope', 'col');
  head.append(corner);
  [['📖 Class A', 'fd-col-a'], ['📖 Class B', 'fd-col-b'], ['', '']].forEach(([name, className]) => {
    const th = el('th', name, className);
    th.setAttribute('scope', 'col');
    head.append(th);
  });
  const thead = el('thead');
  thead.append(head);
  const tbody = el('tbody');
  rows.forEach((row) => {
    const tr = el('tr', '', row.same ? '' : 'fd-differ');
    const name = el('th');
    name.setAttribute('scope', 'row');
    name.append(el('span', row.label, 'fd-row-name'), el('small', row.meaning));
    const cell = (value, className) => {
      const td = el('td', '', className);
      td.append(el('span', value, value.length > 4 ? 'fd-value fd-value--long' : 'fd-value'));
      return td;
    };
    tr.append(name, cell(row.a, 'fd-col-a'), cell(row.b, 'fd-col-b'),
      el('td', row.same ? '✓ Same' : '≠ Different', 'fd-same'));
    tbody.append(tr);
  });
  table.append(thead, tbody);
  return table;
}

function dataNode(data, wordsNote) {
  let title = 'The data · two classes';
  if (data.kind !== 'compare') title = `The data · ${data.classSize} kids answered`;
  const { box, body } = section('🔢', title, 'collect-light');
  if (data.kind === 'category') {
    body.append(...votesNode(data));
    if (wordsNote) body.append(el('p', `🔤 ${wordsNote}`, 'fd-words'));
  } else if (data.kind === 'compare') {
    body.append(compareNode(data.rows));
    if (data.note) body.append(el('p', data.note, 'fd-note'));
  } else {
    body.append(tilesNode(data.tiles), lineNode(data.line));
  }
  return box;
}

function thinkingNode(rows, noGuess) {
  const { box, body } = section('🧠', 'My thinking', 'plan-light');
  const list = el('ol', '', 'fd-timeline');
  rows.forEach((row, i) => {
    const item = el('li', '', 'm-rise');
    item.style.setProperty('--i', String(4 + i));
    const icon = el('span', row.icon, 'fd-ic');
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--c', `var(--color-${row.color})`);
    const bubble = el('div', '', 'fd-bubble');
    bubble.append(el('small', row.label), el('p', row.text));
    if (row.because) bubble.append(el('em', `because "${row.because}"`));
    if (row.matched) bubble.append(el('span', '✓ Your guess matched the data!', 'fd-match'));
    item.append(icon, bubble);
    list.append(item);
  });
  if (rows.length) body.append(list);
  if (noGuess) body.append(el('p', 'You did not save a first guess this time. That is OK!', 'fd-empty'));
  return box;
}

// Opens the pop-up. `auto` = it opened by itself (it is logged either way).
export function openFindings(findings, { auto, wordsNote }) {
  const body = el('div', '', 'fd');
  const question = section('❓', 'Our question', 'ask-light', 'fd-q');
  question.body.textContent = findings.question;
  const tip = el('p', '', 'fd-tip');
  const pip = el('span', '', 'fd-tip-pip');
  pip.setAttribute('aria-hidden', 'true');
  pip.innerHTML = pipSVG(); // our own drawing
  tip.append(pip, 'Use these facts as proof in your claim.');
  body.append(question.box, dataNode(findings.data, wordsNote), thinkingNode(findings.thinking, findings.noGuess), tip);

  logEvent('evidence-board', 'findings-viewed', { auto });
  return openModal({
    icon: '📋',
    title: 'My findings',
    accent: 'conclude',
    className: 'findings-modal',
    body,
    buttons: [{ label: auto ? "✍️ Let's write my claim" : '↩ Back to my claim', value: 'go', main: true }],
    // The bars grow once the pop-up is really on screen (reduced motion: no growing).
    onOpen: (dialog) => requestAnimationFrame(() => requestAnimationFrame(() => {
      dialog.querySelectorAll('.fd-track i').forEach((fill) => { fill.style.width = fill.dataset.width; });
    })),
  });
}
