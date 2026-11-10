// Part 58a (10 Nov 2026): Pip's Wardrobe. The rules, the content, the art and saving.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SLOT_NAMES, DEFAULT_OUTFIT, finishedSteps, isUnlocked, availableItems,
  toggleItem, cleanOutfit, surpriseOutfit, newItems,
} from '../js/helpers/wardrobe.js';
import { OUTFIT_ART, OUTFIT_VIEW } from '../js/art/pip-outfits.js';
import { BADGES } from '../js/helpers/badges.js';
import { pipSVG } from '../js/pip.js';
import {
  setExplorerCode, getOutfit, setOutfit, getSeenItems, markItemsSeen, clearChildData,
} from '../js/storage/save.js';

const { items } = JSON.parse(readFileSync(new URL('../data/content/wardrobe.json', import.meta.url), 'utf8'));
const byId = (id) => items.find((i) => i.id === id);
const STARTERS = ['explorer', 'party', 'sunglasses', 'bow', 'magnifier'];

// ---------- the content ----------

test('16 items (Habiba\'s design), each with a slot, art, a name, a line and an unlock rule', () => {
  assert.equal(items.length, 16);
  assert.deepEqual(Object.keys(OUTFIT_ART).sort(), items.map((i) => i.id).sort(), 'art and content list the same items');
  for (const item of items) {
    assert.ok(SLOT_NAMES.includes(item.slot), `${item.id}: slot`);
    assert.ok(OUTFIT_ART[item.id][item.slot], `${item.id}: art for its own slot`);
    assert.ok(OUTFIT_VIEW[item.id], `${item.id}: a card view`);
    assert.ok(item.name && item.say, `${item.id}: name and Pip's line`);
    assert.ok(['starter', 'badge', 'step'].includes(item.unlock.type), `${item.id}: unlock type`);
    if (item.unlock.type !== 'starter') assert.ok(item.hint && item.hint.length < 60, `${item.id}: a short locked hint`);
    assert.ok(Buffer.byteLength(Object.values(OUTFIT_ART[item.id]).join('')) < 2600, `${item.id}: about 2 KB of art`);
  }
  assert.deepEqual(items.filter((i) => i.unlock.type === 'starter').map((i) => i.id), STARTERS);
});

test('every badge an item names is a real badge, and every step is a real step', () => {
  const badgeIds = BADGES.map((b) => b.id);
  for (const item of items.filter((i) => i.unlock.type === 'badge')) {
    assert.ok(badgeIds.includes(item.unlock.ref), `${item.id}: no badge "${item.unlock.ref}"`);
  }
  for (const item of items.filter((i) => i.unlock.type === 'step')) {
    assert.ok(['ask', 'plan', 'collect', 'explore', 'conclude'].includes(item.unlock.ref), item.id);
  }
});

// ---------- unlocking: by reasoning or a finished step, never by anything else ----------

test('a new child can wear the 5 starter items, nothing else', () => {
  assert.deepEqual(availableItems(items, [], new Set()), STARTERS);
});

test('a badge opens its item; a hint answer still earns the badge, so it never blocks an item', () => {
  const open = availableItems(items, ['question-fixer', 'chance-tester'], new Set());
  assert.ok(open.includes('detective') && open.includes('dice'));
  assert.ok(!open.includes('wizard'));
});

test('steps: Explore is finished when Graph, Number and Chance Lab are all done for one question', () => {
  assert.deepEqual([...finishedSteps({ 'sleep-hours': ['ask', 'plan', 'collect', 'graph', 'number'] })].sort(), ['ask', 'collect', 'plan']);
  const steps = finishedSteps({ 'sleep-hours': ['ask'], 'shoe-sizes': ['ask', 'plan', 'collect', 'graph', 'number', 'chance'] });
  assert.ok(steps.has('explore') && !steps.has('conclude'));
  assert.ok(isUnlocked(byId('wings'), [], steps));
  assert.ok(!isUnlocked(byId('cap'), [], steps));
  assert.ok(isUnlocked(byId('cap'), [], finishedSteps({ x: ['conclude'] })));
  assert.equal(finishedSteps(undefined).size, 0);
});

// ---------- wearing ----------

test('one item per slot: wearing a hat replaces the hat; tapping it again takes it off', () => {
  let outfit = { ...DEFAULT_OUTFIT };
  outfit = toggleItem(outfit, byId('party'));
  assert.deepEqual(outfit, { head: 'party', held: 'magnifier' });
  outfit = toggleItem(outfit, byId('sunglasses'));
  assert.deepEqual(outfit, { head: 'party', held: 'magnifier', face: 'sunglasses' });
  outfit = toggleItem(outfit, byId('party'));
  assert.deepEqual(outfit, { held: 'magnifier', face: 'sunglasses' });
  assert.deepEqual(DEFAULT_OUTFIT, { head: 'explorer', held: 'magnifier' }, 'the default is never changed');
});

test('a saved outfit is made safe: unknown, locked or wrong-slot items are dropped', () => {
  const open = availableItems(items, [], new Set());
  assert.deepEqual(cleanOutfit({ head: 'crown', face: 'sunglasses', neck: 'magnifier', back: 'nope' }, items, open), { face: 'sunglasses' });
  assert.deepEqual(cleanOutfit(null, items, open), {});
});

test('"Surprise me" only picks open items, always a hat, one per slot', () => {
  const open = availableItems(items, ['graph-explorer'], new Set());
  for (let seed = 0; seed < 20; seed++) {
    let n = seed;
    const random = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
    const outfit = surpriseOutfit(items, open, random);
    assert.ok(outfit.head);
    for (const [slot, id] of Object.entries(outfit)) {
      assert.ok(open.includes(id), id);
      assert.equal(byId(id).slot, slot);
    }
  }
});

test('"New!" is for opened items the child has not looked at yet (never the starters)', () => {
  const open = availableItems(items, ['graph-explorer', 'brave-guesser'], new Set());
  assert.deepEqual(newItems(open, [], items), ['scarf', 'compass']);
  assert.deepEqual(newItems(open, ['scarf'], items), ['compass']);
});

// ---------- Pip ----------

test('with the default outfit Pip looks as before: his explorer hat and magnifier', () => {
  const svg = pipSVG('', DEFAULT_OUTFIT);
  assert.match(svg, /pip-hat-top/);
  assert.match(svg, /class="pip-glass"/);
  assert.doesNotMatch(pipSVG('', {}), /pip-hat-top|pip-glass/, 'everything off: no hat, no glass');
});

test('nothing covers the beak: it is drawn after every item, and held items sit in the right wing', () => {
  for (const item of items) {
    const outfit = item.slot === 'back' && item.id === 'cape' ? { back: 'cape' } : { [item.slot]: item.id };
    const svg = pipSVG('', outfit);
    const beak = svg.indexOf('class="pip-beak"');
    const art = svg.indexOf(`pip-item-${item.id}`);
    assert.ok(art > 0, `${item.id} is drawn`);
    if (item.slot === 'held') {
      const wing = svg.indexOf('pip-wing-right');
      assert.ok(art > wing && art < svg.indexOf('pip-question'), `${item.id} is inside the right wing`);
    } else {
      assert.ok(art < beak, `${item.id} is drawn before (under) the beak`);
    }
  }
  // The back items go behind Pip's body.
  assert.ok(pipSVG('', { back: 'wings' }).indexOf('pip-item-wings') < pipSVG('', { back: 'wings' }).indexOf('pip-body'));
});

test('held items stay right of the beak (x over 67) in Pip\'s space', () => {
  // Every held item is placed at the wing (translate 104 94) and drawn from x = -8,
  // or is Pip's own glass (x 96 to 118). The beak spans x 53 to 67.
  for (const item of items.filter((i) => i.slot === 'held')) {
    const art = OUTFIT_ART[item.id].held;
    const shift = art.match(/translate\((\d+) (\d+)\)/);
    const xs = [...art.matchAll(/\b(?:cx|x|x1|x2)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    const left = Math.min(...xs) + (shift ? Number(shift[1]) : 0) - 12; // 12 = the biggest radius
    assert.ok(left > 67, `${item.id} reaches x ${left}`);
  }
});

// ---------- saving (per child code, in this browser) ----------

test('the outfit and the seen items are saved per child code, and cleared with the child\'s data', () => {
  setExplorerCode('OWL-07');
  assert.equal(getOutfit(), null, 'nothing saved yet: Pip wears the default');
  setOutfit({ head: 'party', face: 'sunglasses' });
  markItemsSeen(['scarf']);
  markItemsSeen(['scarf', 'compass']);
  assert.deepEqual(getOutfit(), { head: 'party', face: 'sunglasses' });
  assert.deepEqual(getSeenItems(), ['scarf', 'compass']);
  setExplorerCode('FOX-12');
  assert.equal(getOutfit(), null, 'another child has their own Pip');
  setExplorerCode('OWL-07');
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(getOutfit(), null);
  assert.deepEqual(getSeenItems(), []);
});
