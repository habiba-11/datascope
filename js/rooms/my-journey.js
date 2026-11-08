// "My journey" (Part 19, Prof's comment 6), laid out like the f10 design
// (Part 37c, 4 Nov 2026): a slim celebration line, then 3 tabs with
// "🧠 What I learned" first, "🗺️ My journey" (the 7 stops) and "🪪 My ID".
// Built with textContent: most of this is what the child typed.
// Time per phase is NOT shown here (teacher only, decided 25 Oct 2026).
// No files and no Print button (Habiba, 4 Nov 2026): the work goes online by itself.
import { mountShell } from '../app.js';
import { buildJourney } from '../helpers/journey.js';
import { levelFor } from '../helpers/badges.js';
import { loadRecipe, loadContent } from '../helpers/scenarios.js';
import { numberLabKind } from '../helpers/number-tasks.js';
import { CERTAINTY } from '../helpers/certainty.js';
import { readLog } from '../helpers/log.js';
import {
  STOPS, stopLines, showedLine, learnedLine, certaintyLevel, claimSentence,
} from '../helpers/journey-view.js';
import {
  getSelectedScenarioId, getExplorerCode, getDonePhases, startNewInvestigation,
} from '../storage/save.js';
import { guardJourney } from '../phase-progress.js';
import { pipSVG, pipMoodFor } from '../pip.js';
import { confetti, fireworksLoop } from '../motion.js';
import { taskCardHTML } from '../task-card.js';
import { setupActionBar } from '../action-bar.js';
import { setIconLine } from '../icon-text.js';
import { illustration } from '../illustrations.js';

const MAX_STARS = STOPS.length * 3;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Part 54g: our texts here name icons as :name: (only real icon names count,
// and they become our own SVG, so a child's words stay safe as plain text).
function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  setIconLine(element, text);
  if (className) element.className = className;
  return element;
}

// Pip, drawn by us (no child text), in a box of the given class.
function pipBox(className) {
  const box = el('div', '', className);
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = pipSVG();
  return box;
}

// ★★☆ with the words, so the stars are never the only signal.
function starsNode(n) {
  const box = el('span', '', 'j-stars');
  const shown = el('span', '★'.repeat(n), 'j-star-on');
  const empty = el('span', '☆'.repeat(3 - n), 'j-star-off');
  shown.setAttribute('aria-hidden', 'true');
  empty.setAttribute('aria-hidden', 'true');
  box.append(shown, empty, el('span', ` ${n} of 3 stars`, 'j-star-words'));
  return box;
}

// A section with a heading and a short line under it.
function section(title, sub) {
  const box = el('section', '', 'j-sect');
  box.append(el('h2', title));
  if (sub) box.append(el('p', sub, 'j-sub'));
  return box;
}

// ---------- the slim celebration line ----------

function celebrationNode(journey, code) {
  const line = el('section', '', 'j-slim m-pop');
  line.setAttribute('aria-label', 'Well done');
  const all = journey.phasesDone === STOPS.length;
  line.append(
    pipBox('j-slim-pip'),
    el('h2', all ? 'You finished your whole investigation!' : 'Look how far you came!'),
    el('span', `:key: ${code || 'No code yet'}`, 'j-pill'),
    el('span', `:star: ${journey.totalStars} of ${MAX_STARS}`, 'j-pill'),
  );
  return line;
}

// ---------- tab 1: What I learned ----------

function bigIdeaNode(recipe, words) {
  const box = el('section', '', 'j-big m-rise');
  const text = el('div');
  text.append(el('span', 'The big idea', 'j-tag'), el('h3', recipe.teaches), el('p', words.bigIdeaMore));
  box.append(pipBox('j-big-pip'), text);
  return box;
}

function answerNode(claim) {
  const box = section(':flag: My answer', claim ? 'This is what you found out, in your own words.' : 'You will write your answer in Conclude. It will show here.');
  if (!claim) return box;
  const card = el('div', '', 'j-ans');
  const left = el('div');
  const proof = el('div', '', 'j-proof');
  proof.setAttribute('aria-label', 'My proof');
  (claim.evidence || []).forEach((label) => proof.append(el('span', label)));
  left.append(el('p', claimSentence(claim), 'j-claim'), proof);

  // How sure: a 5-step bar (impossible to certain), with the word as well.
  const level = certaintyLevel(claim.certainty);
  const sure = el('div', '', 'j-sure');
  const title = el('h4', 'How sure am I? ');
  title.append(el('span', level.word, 'j-sure-word'));
  const bar = el('div', '', 'j-sure-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `${level.word}: ${level.step} of ${CERTAINTY.length}`);
  CERTAINTY.forEach((c, i) => bar.append(el('i', '', i < level.step ? 'on' : '')));
  const ends = el('div', '', 'j-sure-ends');
  ends.append(el('span', CERTAINTY[0].word), el('span', CERTAINTY[CERTAINTY.length - 1].word));
  sure.append(title, bar, ends);
  if (claim.certaintyReason) sure.append(el('p', `"${claim.certaintyReason}"`, 'j-sure-why'));

  card.append(left, sure);
  box.append(card);
  return box;
}

function skillsNode(journey, words, info) {
  const box = section(':puzzle: Skills I practised', 'One skill for each stop: what you learned, and where you showed it.');
  const grid = el('div', '', 'j-skills');
  STOPS.forEach(({ phase, icon, name, color }, i) => {
    const p = journey.phases[phase];
    const card = el('article', '', `j-skill m-rise${p.done ? '' : ' todo'}`);
    card.style.setProperty('--c', `var(--color-${color})`);
    card.style.setProperty('--i', String(2 + i));
    const head = el('div', '', 'j-card-head');
    head.append(el('span', `:${icon}:`, 'j-icon'), el('h3', p.done ? words.skills[phase].skill : name));
    head.append(el('span', p.done ? '✓ Done' : ':lock: Not yet', p.done ? 'j-pill ok' : 'j-pill'));
    const body = el('div', '', 'j-card-body');
    if (p.done) {
      const learned = el('p', '', 'j-learned');
      learned.append(el('small', 'I learned'), learnedLine(words.skills, phase, info.kind));
      body.append(learned);
      const showed = showedLine(phase, p, info);
      if (showed) {
        const line = el('p', '', 'j-showed');
        line.append(el('small', 'I showed it when: '), showed);
        body.append(line);
      }
    } else {
      body.append(el('p', 'Finish this stop to see what you learned.', 'j-later'));
    }
    card.append(head, body);
    grid.append(card);
  });
  box.append(grid);
  return box;
}

function nextTimeNode(words) {
  const box = el('section', '', 'j-next m-rise');
  box.append(el('h2', ':rocket: Next time I can…'));
  const list = el('ul');
  words.nextTime.forEach((idea, i) => {
    const item = el('li');
    item.append(el('i', String(i + 1)), el('span', idea));
    list.append(item);
  });
  box.append(list);
  return box;
}

function learnedPanel(journey, recipe, words, info) {
  return [
    bigIdeaNode(recipe, words),
    answerNode(journey.phases.conclude.claim),
    skillsNode(journey, words, info),
    nextTimeNode(words),
  ];
}

// ---------- tab 2: My journey (the 7 stops) ----------

function stripNode(journey) {
  const box = section('My journey at a glance');
  const strip = el('div', '', 'j-strip');
  const rail = el('div', '', 'j-rail');
  rail.setAttribute('aria-hidden', 'true');
  rail.append(el('i', '', 'j-rail-fill'));
  strip.append(rail, pipBox('j-walk-pip'));
  STOPS.forEach(({ phase, icon, name, color }) => {
    const p = journey.phases[phase];
    const stop = el('a', '', `j-dot${p.done ? '' : ' todo'}`);
    stop.href = `#stop-${phase}`;
    stop.style.setProperty('--c', `var(--color-${color})`);
    stop.setAttribute('aria-label', p.done ? `${name}, ${p.stars || 0} of 3 stars` : `${name}, not done yet`);
    stop.append(el('span', `:${p.done ? icon : 'lock'}:`, 'j-dot-circle'), el('span', name));
    const stars = el('span', p.done ? '★'.repeat(p.stars || 0) + '☆'.repeat(3 - (p.stars || 0)) : '', 'j-dot-stars');
    stars.setAttribute('aria-hidden', 'true');
    stop.append(stars);
    strip.append(stop);
  });
  box.append(strip);
  return box;
}

function stopCardsNode(journey, info) {
  const box = section('What I did at each stop');
  const grid = el('div', '', 'j-stops');
  STOPS.forEach(({ phase, icon, name, color }) => {
    const p = journey.phases[phase];
    const card = el('article', '', `j-stop${p.done ? '' : ' todo'}`);
    card.id = `stop-${phase}`;
    card.style.setProperty('--c', `var(--color-${color})`);
    const head = el('div', '', 'j-card-head');
    head.append(el('span', `:${icon}:`, 'j-icon'), el('h3', name));
    head.append(el('span', p.done ? '✓ Done' : ':lock: Not done yet', p.done ? 'j-pill ok' : 'j-pill'));
    const body = el('div', '', 'j-card-body');
    if (p.done) {
      body.append(starsNode(p.stars || 0));
      // One line shows; the rest folds away behind "See more" (UI guide).
      const [first, ...more] = stopLines(phase, p, info);
      if (first) body.append(el('p', first, 'j-quote'));
      if (more.length) {
        const details = el('details', '', 'j-more');
        details.append(el('summary', 'See more'));
        more.forEach((line) => details.append(el('p', line)));
        body.append(details);
      }
    } else {
      body.append(el('p', 'You will see your answers here when this stop is done.', 'j-later'));
    }
    card.append(head, body);
    grid.append(card);
  });
  box.append(grid);
  return box;
}

// Pip walks along the rail to the last finished stop (once, the first time
// the tab opens). Reduced motion: Pip is simply there.
function walkPip(journey) {
  const strip = document.querySelector('.j-strip');
  const pip = strip.querySelector('.j-walk-pip');
  const fill = strip.querySelector('.j-rail-fill');
  const dots = [...strip.querySelectorAll('.j-dot')];
  const lastDone = STOPS.map((s) => journey.phases[s.phase].done).lastIndexOf(true);
  const target = dots[Math.max(lastDone, 0)];
  const first = dots[0];
  const centre = (dot) => dot.offsetLeft + dot.offsetWidth / 2 - pip.offsetWidth / 2;
  const railWidth = target.offsetLeft - first.offsetLeft;

  pip.style.left = `${centre(first)}px`;
  fill.style.width = '0px';
  const go = () => {
    pip.style.left = `${centre(target)}px`;
    fill.style.width = `${railWidth}px`;
  };
  if (reduceMotion()) {
    strip.classList.add('no-walk');
    go();
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(() => pipMoodFor('cheer', 2000), 1700);
}

// ---------- tab 3: My ID ----------

function tile(label, value, extra) {
  const box = el('div', '', 'j-tile');
  box.append(el('span', label, 'j-tile-k'), value);
  if (extra) box.append(extra);
  return box;
}

function idPanel(journey, code) {
  const level = levelFor(journey.patches);
  const card = el('section', '', 'j-id');
  card.setAttribute('aria-label', 'My Detective ID card');
  const words = el('div');
  words.append(el('p', ':id-card: My Detective ID'), el('p', `:key: ${code || 'No code yet'}`, 'j-id-code'), el('p', `:${level.icon}: ${level.name}`));
  // The level, big and with a gentle shine (Habiba's spec, point 4).
  const levelPic = el('span', '', 'j-level-pic ds-shine');
  levelPic.innerHTML = illustration(level.icon, { size: 96, label: level.name });
  card.append(pipBox('j-id-pip'), words, levelPic);

  const stars = el('span', String(journey.totalStars), 'j-tile-v');
  stars.append(el('small', ` of ${MAX_STARS}`));
  const badges = el('span', String(journey.patches), 'j-tile-v');

  // The next level, as a meter AND in words.
  let nextTile;
  if (level.next) {
    const toGo = level.next.min - journey.patches;
    const meter = el('div', '', 'j-meter');
    meter.setAttribute('role', 'progressbar');
    meter.setAttribute('aria-valuemin', String(level.min));
    meter.setAttribute('aria-valuemax', String(level.next.min));
    meter.setAttribute('aria-valuenow', String(journey.patches));
    meter.setAttribute('aria-label', `${journey.patches} of ${level.next.min} badges`);
    const fill = el('i');
    fill.style.width = `${Math.round(((journey.patches - level.min) / (level.next.min - level.min)) * 100)}%`;
    meter.append(fill);
    const extra = el('div');
    extra.append(meter, el('span', `${toGo} more ${toGo === 1 ? 'badge' : 'badges'} to go`, 'j-tile-note'));
    nextTile = tile(':arrow-up: Next level', el('span', `:${level.next.icon}: ${level.next.name}`, 'j-tile-v j-tile-v--small'), extra);
  } else {
    nextTile = tile(':trophy: Level', el('span', 'Top level!', 'j-tile-v j-tile-v--small'));
  }

  const tiles = el('div', '', 'j-tiles');
  tiles.append(
    tile(':star: Stars', stars, el('span', 'for great thinking, not speed', 'j-tile-note')),
    tile(':bag: Badges', badges, el('span', 'Tap :bag: at the top to see them', 'j-tile-note')),
    nextTile,
  );
  return [card, tiles, el('p', ':cloud: Your work goes to your teacher by itself. Nothing to save!', 'j-online')];
}

// ---------- the tabs ----------

// role="tablist" with arrow keys, like the design. `onShow(i)` runs when a tab opens.
function tabsNode(tabs, onShow) {
  const wrap = el('div');
  const list = el('div', '', 'j-tabs');
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'My journey');
  const buttons = [];
  const panels = [];

  const select = (index, focus) => {
    buttons.forEach((b, i) => {
      b.setAttribute('aria-selected', String(i === index));
      b.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) buttons[index].focus();
    onShow(index);
  };

  tabs.forEach(({ icon, label, nodes }, i) => {
    const button = el('button', '', 'j-tab');
    button.type = 'button';
    button.id = `j-tab-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `j-panel-${i}`);
    const pic = el('span', `:${icon}:`); // icon: an illustration name
    pic.setAttribute('aria-hidden', 'true');
    button.append(pic, label);
    button.addEventListener('click', () => select(i, false));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') select((i + 1) % tabs.length, true);
      if (event.key === 'ArrowLeft') select((i + tabs.length - 1) % tabs.length, true);
    });
    buttons.push(button);
    list.append(button);

    const panel = el('div', '', 'j-panel');
    panel.id = `j-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.append(...nodes);
    panels.push(panel);
  });

  wrap.append(list, ...panels);
  select(0, false);
  return wrap;
}

// A new investigation starts the trail again at Ask (the log keeps the old one).
function newInvestigation() {
  startNewInvestigation();
  location.href = 'question-studio.html';
}

async function init() {
  if (guardJourney()) return; // not finished yet: sent to the furthest open room

  const recipe = await loadRecipe(getSelectedScenarioId());
  const { cardTitle, icon: scenarioIcon } = await loadContent(recipe.id);
  const words = await fetch('../data/content/journey.json').then((r) => r.json());
  const code = getExplorerCode();
  const journey = buildJourney(readLog(), code, recipe.id, recipe.compareWith || null, getDonePhases(recipe.id));
  const info = { cardTitle, kind: numberLabKind(recipe) };

  mountShell({
    step: 'conclude',
    accent: 'conclude',
    layout: 'card',
    contentHTML: taskCardHTML({
      title: `:map: My journey · :${scenarioIcon}: ${cardTitle}`,
      bodyHTML: '<div class="j-body" id="journey"></div>',
    }),
  });

  // ONE primary: start a new investigation.
  setupActionBar({
    back: { label: 'Evidence Board', href: 'evidence-board.html' },
    primary: { label: ':repeat: Start a new investigation →', ready: true, onClick: newInvestigation },
  });

  let walked = false;
  const tabs = tabsNode([
    { icon: 'brain', label: 'What I learned', nodes: learnedPanel(journey, recipe, words, info) },
    { icon: 'map', label: 'My journey', nodes: [stripNode(journey), stopCardsNode(journey, info)] },
    { icon: 'id-card', label: 'My ID', nodes: idPanel(journey, code) },
  ], (index) => {
    if (index === 1 && !walked) {
      walked = true;
      walkPip(journey);
    }
  });
  document.getElementById('journey').append(celebrationNode(journey, code), tabs);
  // The whole journey is done: the big finale (Part 43b), confetti, then
  // fireworks popping in the background for as long as the page is open
  // (Habiba, 6 Nov 2026). With reduced motion: one firework sound only.
  if (journey.phasesDone === STOPS.length) {
    confetti();
    fireworksLoop();
  }
}

init();
