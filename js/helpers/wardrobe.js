// Layer 3 (Part 58a, 10 Nov 2026): Pip's Wardrobe, the rules. Pure functions
// (no page), so they are tested in Node (tests/wardrobe.test.js).
// Items are unlocked by good reasoning (badges) or by finishing a step, never
// by speed, points or a shop. Using a hint never blocks an item: the badges
// already count hint answers (see js/helpers/badges.js).
// An outfit is { slot: itemId }, at most one item per slot.

// The slots, drawn back to front on Pip (js/pip.js), with the tab names.
export const SLOTS = [
  { slot: 'back', tab: 'Back' },
  { slot: 'neck', tab: 'Neck' },
  { slot: 'face', tab: 'Face' },
  { slot: 'head', tab: 'Hats' },
  { slot: 'held', tab: 'Hold' },
];
export const SLOT_NAMES = SLOTS.map((s) => s.slot);

// What Pip wears before a child changes anything: Pip as children know him.
export const DEFAULT_OUTFIT = Object.freeze({ head: 'explorer', held: 'magnifier' });

// The steps a child has finished in ANY investigation. `progress` is
// { scenarioId: ['ask', 'plan', ...] } (save.js getAllProgress). Explore is
// finished when Graph Lab, Number Lab and Chance Lab are all done for one question.
export function finishedSteps(progress) {
  const steps = new Set();
  for (const done of Object.values(progress || {})) {
    for (const step of ['ask', 'plan', 'collect', 'conclude']) if (done.includes(step)) steps.add(step);
    if (['graph', 'number', 'chance'].every((room) => done.includes(room))) steps.add('explore');
  }
  return steps;
}

// Is this item open for the child?
export function isUnlocked(item, earnedBadgeIds, steps) {
  const { type, ref } = item.unlock;
  if (type === 'starter') return true;
  if (type === 'badge') return new Set(earnedBadgeIds).has(ref);
  if (type === 'step') return new Set(steps).has(ref);
  return false;
}

// The ids of every item the child may wear.
export function availableItems(items, earnedBadgeIds, steps) {
  return items.filter((item) => isUnlocked(item, earnedBadgeIds, steps)).map((item) => item.id);
}

// Tap an item: wear it (it replaces what was in its slot), or, if Pip already
// wears it, take it off. Returns a NEW outfit.
export function toggleItem(outfit, item) {
  const next = { ...outfit };
  if (next[item.slot] === item.id) delete next[item.slot];
  else next[item.slot] = item.id;
  return next;
}

// A saved outfit, made safe: only known slots, only items that are open now,
// and each item in its own slot.
export function cleanOutfit(outfit, items, availableIds) {
  const open = new Set(availableIds);
  const clean = {};
  for (const [slot, id] of Object.entries(outfit || {})) {
    const item = items.find((i) => i.id === id);
    if (item && item.slot === slot && open.has(id)) clean[slot] = id;
  }
  return clean;
}

// "Surprise me": a hat always, then each other slot about 6 times in 10.
// `random` is a function giving 0..1 (Math.random in the app, fixed in tests).
export function surpriseOutfit(items, availableIds, random = Math.random) {
  const outfit = {};
  for (const slot of SLOT_NAMES) {
    const options = items.filter((i) => i.slot === slot && availableIds.includes(i.id));
    if (options.length && (slot === 'head' || random() < 0.6)) {
      outfit[slot] = options[Math.floor(random() * options.length)].id;
    }
  }
  return outfit;
}

// Items the child can wear but has not looked at yet: they get "New!".
export function newItems(availableIds, seenIds, items) {
  const seen = new Set(seenIds);
  return availableIds.filter((id) => !seen.has(id) && items.find((i) => i.id === id)?.unlock.type !== 'starter');
}

// What changed between two outfits, one entry per slot, for the log
// ("outfit-changed" { slot, itemId }; itemId null = taken off).
export function outfitChanges(before, after) {
  return SLOT_NAMES
    .filter((slot) => (before[slot] || null) !== (after[slot] || null))
    .map((slot) => ({ slot, itemId: after[slot] || null }));
}

// The tabs on the Wardrobe screen, in Habiba's order (not the drawing order).
export const TABS = ['head', 'face', 'neck', 'back', 'held'].map((slot) => SLOTS.find((s) => s.slot === slot));
