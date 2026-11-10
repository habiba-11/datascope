// Developer tool (never shipped to children): the WHOLE SCAN. A bot plays
// DataScope like a child, from the start page to My journey, for each of the 4
// scenarios, and writes down everything that goes wrong:
//   page errors, console errors, missing files, sideways scrolling, the main
//   button off screen, a screen where the bot got stuck, and (with reduced
//   motion) anything that still moves.
// Run:  node dev/scan.mjs            (all 4 scenarios at 1366 x 768)
//       node dev/scan.mjs --wide     (+ 768 x 1024 and reduced motion)
// Report: dev/scan/report.md, with a picture of every stuck screen.
// The database is blocked, so no test rows ever reach Supabase.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dev', 'scan');
const PORT = 5640;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const data = await readFile(join(ROOT, path.endsWith('/') ? `${path}index.html` : path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT);

const SCENARIOS = ['sleep-hours', 'shoe-sizes', 'playground-game', 'reading-minutes-class-a'];
const WIDE = process.argv.includes('--wide');
const RUNS = [
  ...SCENARIOS.map((s) => ({ scenario: s, w: 1366, h: 768, reduced: false })),
  ...(WIDE ? [
    ...SCENARIOS.map((s) => ({ scenario: s, w: 768, h: 1024, reduced: false })),
    { scenario: 'sleep-hours', w: 1366, h: 768, reduced: true },
    { scenario: 'playground-game', w: 1366, h: 768, reduced: true },
  ] : []),
];

const problems = []; // { run, where, what }
const log = [];

async function scenarioWords(id) {
  const content = JSON.parse(await readFile(join(ROOT, 'data', 'content', `${id}.json`), 'utf8'));
  const recipe = JSON.parse(await readFile(join(ROOT, 'data', 'scenarios', `${id}.json`), 'utf8'));
  const pool = [...new Set(recipe.valuePool)];
  return {
    goodQuestion: content.fixIts[1].fix,
    guess: recipe.answerType === 'number' ? String(pool[Math.floor(pool.length / 2)]) : null,
    reason: recipe.answerType === 'number'
      ? `most kids said ${pool[Math.floor(pool.length / 2)]}, the tallest bar shows it`
      : `most kids picked ${pool[0]}, the tallest bar shows it`,
  };
}

// What is on screen now: the page, the step chip, the main button, a pop-up title.
async function screenKey(page) {
  return page.evaluate(() => {
    const t = (sel) => document.querySelector(sel)?.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || '';
    const dlg = document.querySelector('dialog[open]');
    return [location.pathname.split('/').pop(), t('.stepper-chip--now'), t('#action-primary'), dlg ? `DIALOG:${dlg.querySelector('h2, .modal-title')?.textContent.trim().slice(0, 30)}` : ''].join(' | ');
  });
}

async function checkScreen(page, run, where) {
  const r = await page.evaluate(() => {
    const out = {};
    out.sideways = document.documentElement.scrollWidth - innerWidth;
    const p = document.getElementById('action-primary');
    if (p && p.offsetParent) {
      const b = p.getBoundingClientRect();
      out.primaryOff = b.bottom > innerHeight + 1 || b.top < 0 ? Math.round(b.bottom - innerHeight) : 0;
    }
    // Tap targets: visible buttons and links smaller than 44 px tall (the rule is 48; 44 leaves room for borders).
    out.small = [...document.querySelectorAll('button, a.btn, [role=radio]')].filter((el) => {
      if (!el.offsetParent || el.closest('.story, .teacher')) return false;
      // offsetHeight: the real size, not shrunk by an entrance animation.
      return el.offsetHeight > 0 && el.offsetHeight < 44 && el.offsetWidth > 0;
    }).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 24)}" ${el.offsetHeight}px`).slice(0, 6);
    out.running = document.getAnimations().filter((a) => a.playState === 'running').length;
    return out;
  });
  run = run.name;
  if (r.sideways > 0) problems.push({ run, where, what: `sideways scroll ${r.sideways}px` });
  if (r.primaryOff) problems.push({ run, where, what: `main button off screen by ${r.primaryOff}px` });
  if (r.small.length) problems.push({ run, where, what: `small tap targets: ${r.small.join('; ')}`, kind: 'small' });
  if (/reduced/.test(run) && r.running > 0) problems.push({ run, where, what: `${r.running} animations running with reduced motion` });
}

// One action, like a child would: returns a short word for the log, or '' when nothing could be done.
async function act(page, words, tried) {
  // 1. A pop-up: press its main button (or Escape).
  const dialog = await page.$('dialog[open]');
  if (dialog) {
    if (await dialog.$('#story-skip')) { await page.keyboard.press('Escape'); return 'closed story'; }
    const start = await dialog.$('button.btn-main:has-text("Start exploring")');
    const main = start || await dialog.$('.btn-main:visible, .modal-main:visible');
    if (main) { await main.click({ timeout: 3000 }).catch(() => {}); return 'dialog main'; }
    await page.keyboard.press('Escape');
    return 'dialog esc';
  }
  // 2. The card sort (Number Lab, real life median): sort with the arrows, then tap the centre.
  const sortDone = await page.evaluate(() => {
    const row = [...document.querySelectorAll('.sort-row')].find((r) => r.offsetParent);
    if (!row) return null;
    const picks = [...row.querySelectorAll('.sort-pick')];
    if (picks.length) {
      if (row.dataset.scanPicked) return null;
      row.dataset.scanPicked = '1';
      picks[Math.floor(picks.length / 2)].click(); // the centre card
      return 'picked';
    }
    const cards = [...row.querySelectorAll('.sort-card')];
    const values = cards.map((c) => parseFloat(c.textContent));
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] > values[i + 1]) {
        cards[i].querySelector('.sort-right')?.click();
        return 'moved';
      }
    }
    return null;
  });
  if (sortDone) return `sort ${sortDone}`;
  // 3. Empty boxes: type into them.
  const filled = await page.evaluate((w) => {
    const visible = (el) => el.offsetParent && !el.disabled && !el.readOnly;
    let n = 0;
    const set = (el, v) => { el.focus(); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); n++; };
    const goal = document.body.textContent.match(/mean must be (\d+(\.\d+)?)/);
    document.querySelectorAll('.build-input').forEach((el) => { if (visible(el) && !el.value) set(el, goal ? goal[1] : '8'); });
    for (const el of document.querySelectorAll('input[type=number], input[type=text], textarea')) {
      if (!visible(el) || el.id === 'code-input' || el.classList.contains('build-input')) continue;
      // Fix 2 starts with the flawed question in the box: write the good one over it.
      if (el.id === 'fixit-2' || el.id === 'own-question') { if (el.value !== w.goodQuestion) set(el, w.goodQuestion); continue; }
      if (el.value) continue;
      if (el.id === 'fixit-2' || el.id === 'own-question') set(el, w.goodQuestion);
      else if (el.type === 'number') set(el, w.guess || '8');
      else if (el.id === 'claim-subject') set(el, 'most kids');
      else set(el, w.reason);
    }
    return n;
  }, words);
  if (filled) return `typed ${filled}`;
  // 4. The main button, when it can be pressed.
  const primary = await page.$('#action-primary:not([disabled])');
  if (primary && await primary.isVisible()) {
    const before = await screenKey(page);
    await primary.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(350);
    if (await screenKey(page) !== before || !(await page.$('#action-primary:not([disabled])'))) return 'primary';
  }
  // 5. Choices: try the next one not tried yet on this screen.
  const key = await screenKey(page);
  const choices = await page.$$('.scenario-card, .fixit-choices button, .choice-btn, .device-card, .outcome-chip, #certainty-scale button, .size-dial, .size-dials button, #graph-toolbar button, .evidence-chip, #bonus-no, #keep-guess-btn, #run-btn, .suggestion-chip, .hint-chip, .predict-choice');
  for (let i = 0; i < choices.length; i++) {
    const id = `${key}#${i}`;
    if (tried.has(id) || !(await choices[i].isVisible()) || await choices[i].isDisabled()) continue;
    tried.add(id);
    await choices[i].click({ timeout: 3000 }).catch(() => {});
    return `choice ${i}`;
  }
  // 6. A hint: open it, so its answers can be tapped next.
  const hint = await page.$('.hint-btn:visible, button:has-text("Need a hint"):visible');
  if (hint && !tried.has(`${key}#hint`)) { tried.add(`${key}#hint`); await hint.click({ timeout: 3000 }).catch(() => {}); return 'hint'; }
  return '';
}

const ORDER = ['question-studio', 'data-hub', 'graph-lab', 'number-lab', 'chance-lab', 'evidence-board', 'my-journey'];

async function play(browser, run) {
  const name = `${run.scenario} ${run.w}x${run.h}${run.reduced ? ' reduced' : ''}`;
  const page = await browser.newPage({ viewport: { width: run.w, height: run.h }, reducedMotion: run.reduced ? 'reduce' : 'no-preference' });
  await page.addInitScript(() => { if (window.speechSynthesis) window.speechSynthesis.speak = () => {}; });
  await page.route('**/*', (route) => (route.request().url().includes('supabase') ? route.abort() : route.continue()));
  page.on('pageerror', (e) => problems.push({ run: name, where: page.url(), what: `PAGE ERROR ${e.message}` }));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/supabase|Failed to load resource: net::ERR_FAILED/.test(m.text() + (m.location().url || ''))) problems.push({ run: name, where: page.url(), what: `console: ${m.text().slice(0, 160)}` });
  });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('favicon')) problems.push({ run: name, where: page.url(), what: `missing file ${r.status()} ${r.url()}` }); });
  const words = await scenarioWords(run.scenario);
  run.name = name;

  // The start page: the story opens by itself the first time; skip it, type a code.
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.waitForTimeout(1200);
  await checkScreen(page, run, 'start (story)');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await checkScreen(page, run, 'start page');
  await page.fill('#code-input', 'TEST-09');
  await page.click('.code-form .btn-main', { timeout: 5000 });
  await page.waitForTimeout(600);
  // The Wardrobe intro (first time): Start exploring.
  const intro = await page.$('dialog[open] .btn-main');
  if (intro) await intro.click({ timeout: 3000 }).catch(() => {});
  await page.waitForURL(/question-studio/, { timeout: 5000 }).catch(() => problems.push({ run: name, where: 'start', what: 'did not reach Question Studio' }));

  const tried = new Set();
  const visited = [];
  let lastKey = '';
  let same = 0;
  for (let step = 0; step < 400; step++) {
    await page.waitForTimeout(run.reduced ? 250 : 650);
    const room = new URL(page.url()).pathname.split('/').pop().replace('.html', '');
    if (!visited.includes(room)) {
      visited.push(room);
    }
    // Question Studio's first screen: choose this run's scenario card.
    const scenarioCard = await page.$(`.scenario-card[data-id="${run.scenario}"]`);
    if (!(await page.$('dialog[open]')) && scenarioCard && await scenarioCard.isVisible() && !tried.has('scenario')) {
      tried.add('scenario');
      await scenarioCard.click({ timeout: 3000 }).catch(() => {});
      continue;
    }
    if (room === 'my-journey') {
      await page.waitForTimeout(1500);
      await checkScreen(page, run, 'my-journey');
      break;
    }
    const key = await screenKey(page);
    if (key !== lastKey) {
      await checkScreen(page, run, key);
      log.push(`${name}: ${key}`);
      lastKey = key;
      same = 0;
    }
    const did = await act(page, words, tried);
    if (!did) same++;
    else same = did.startsWith('choice') || did === 'hint' ? same + 0.25 : 0;
    if (same >= 6) {
      const file = `${run.scenario}-${run.w}-${run.reduced ? 'r-' : ''}${room}-${step}.png`;
      await page.screenshot({ path: join(OUT, file) });
      problems.push({ run: name, where: key, what: `STUCK (picture: dev/scan/${file})` });
      // Go on in the next room, so the rest is still scanned.
      const next = ORDER[ORDER.indexOf(room) + 1];
      if (!next) break;
      await page.evaluate(() => localStorage.setItem('datascope:previewAll', 'on'));
      await page.goto(`http://localhost:${PORT}/rooms/${next}.html`);
      same = 0;
    }
  }
  log.push(`${name}: rooms reached: ${visited.join(' > ')}`);
  if (!visited.includes('my-journey')) problems.push({ run: name, where: '-', what: `never reached My journey (got to ${visited.at(-1)})` });
  await page.close();
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const run of RUNS) await play(browser, run);
await browser.close();
server.close();

// The report: problems grouped (same problem once, with where it happened).
const grouped = new Map();
for (const p of problems) {
  const k = p.kind === 'small' ? p.what : `${p.what}`;
  if (!grouped.has(k)) grouped.set(k, new Set());
  grouped.get(k).add(`${p.run} @ ${p.where}`);
}
const report = [`# Scan report (${new Date().toISOString()})`, '', `Runs: ${RUNS.length}. Problems: ${grouped.size}.`, '',
  ...[...grouped].map(([what, where]) => `- **${what}**\n  - ${[...where].slice(0, 6).join('\n  - ')}`),
  '', '## Screens seen', '', ...log.map((l) => `- ${l}`)].join('\n');
await writeFile(join(OUT, 'report.md'), report);
console.log(`Problems: ${grouped.size}. Report: dev/scan/report.md`);
