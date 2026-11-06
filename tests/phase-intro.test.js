import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeEntry } from '../js/helpers/log.js';
import { longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import { taskCardHTML } from '../js/task-card.js';
import { setExplorerCode, hasSeenIntro, markIntroSeen, clearChildData } from '../js/storage/save.js';

const phases = JSON.parse(readFileSync(new URL('../data/content/phases.json', import.meta.url), 'utf8'));
const PHASE_IDS = ['ask', 'plan', 'collect', 'graph', 'number', 'chance', 'conclude'];
const ROOM_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

test('every phase has an intro with an icon, a title and a room colour', () => {
  for (const id of PHASE_IDS) {
    const intro = phases[id];
    assert.ok(intro, `missing intro for ${id}`);
    assert.ok(intro.icon && intro.title, `${id} needs an icon and a title`);
    assert.ok(ROOM_COLOURS.includes(intro.accent), `${id} has an unknown colour`);
  }
});

test('intros are short: 1 to 3 bullets (games words too), each under 10 words', () => {
  for (const id of PHASE_IDS) {
    for (const bullets of [phases[id].bullets, phases[id].bulletsWords].filter(Boolean)) {
      assert.ok(bullets.length >= 1 && bullets.length <= 3, `${id} has ${bullets.length} bullets`);
      for (const bullet of bullets) {
        const words = bullet.split(/\s+/).length;
        assert.ok(words < 10, `"${bullet}" has ${words} words`);
      }
    }
  }
});

test('every phase says when it is done, in Grade 5 words', () => {
  for (const id of PHASE_IDS) {
    const { doneWhen } = phases[id];
    assert.ok(doneWhen, `${id} needs doneWhen`);
    // It follows "You are done when:", so it is shown as one sentence with those words.
    assert.ok(longestSentence(`You are done when ${doneWhen}`) <= MAX_SENTENCE_WORDS, doneWhen);
  }
});

test('every task card has the About tab, closed until tapped and hidden until a phase is known', () => {
  const html = taskCardHTML({ title: 'Collect', bodyHTML: '<p>Task</p>' });
  assert.match(html, /About this room/);
  assert.match(html, /id="about-tab"[^>]*aria-expanded="false"[^>]*aria-controls="about-panel"[^>]*hidden/);
  assert.match(html, /id="about-panel" hidden/);
  // The same spot with Explore tabs: outside the strip, so it is never mistaken for a room.
  const explore = taskCardHTML({ tabsHTML: '<nav>rooms</nav>', bodyHTML: '' });
  assert.ok(explore.indexOf('</header>') < explore.indexOf('about-tab'));
});

test('the (i) button is gone: the pop-up points to the tab instead', () => {
  const source = (file) => readFileSync(new URL(`../js/${file}`, import.meta.url), 'utf8');
  assert.doesNotMatch(source('phase-intro.js'), /\(i\)/);
  assert.match(source('phase-intro.js'), /Tap 📖 About this room/);
  assert.doesNotMatch(source('app.js'), /info-btn/);
});

test('a seen intro is remembered for that child only', () => {
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(hasSeenIntro('collect'), false);
  markIntroSeen('collect');
  assert.equal(hasSeenIntro('collect'), true);

  setExplorerCode('FOX-12'); // another child on the same device
  assert.equal(hasSeenIntro('collect'), false);
});

test('clearing the device makes the intros show again', () => {
  setExplorerCode('OWL-07');
  markIntroSeen('ask');
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(hasSeenIntro('ask'), false);
});

test('popup-seen is a known log event', () => {
  const entry = makeEntry('OWL-07', 'shell', 'popup-seen', { phase: 'ask', auto: true });
  assert.equal(entry.type, 'popup-seen');
  assert.equal(entry.auto, true);
});

test('Part 42c: every task card has the "Why?" line next to the About tab, hidden until a phase is known', () => {
  const html = taskCardHTML({ title: 'Collect', bodyHTML: '<p>Task</p>' });
  assert.match(html, /class="about-row">\s*<p class="why-line" id="why-line" hidden><\/p>/);
});
