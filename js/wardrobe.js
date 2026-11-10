// Shell layer (Part 58b, 10 Nov 2026): Pip's Wardrobe, the screen.
// Looks and behaves like Habiba's approved design (docs/design/pip-wardrobe-ui.html):
// big Pip on a stage with a speech bubble, tabs (Hats, Face, Neck, Back, Hold),
// item cards ("wearing" = a tick AND a green frame; locked = a grey silhouette,
// a lock and how to find it), "Take everything off" and "Surprise me".
// It is a pop-up over the page, opened only from the backpack or My journey,
// never inside a task, so nothing the child was doing is lost.
// Every change is saved at once (no Save button) and logged as "outfit-changed".
// Pip's words go in as plain text; the item names come from our own content.
import { pipSVG, dressAllPips } from './pip.js';
import { OUTFIT_ART, OUTFIT_VIEW } from './art/pip-outfits.js';
import {
  TABS, DEFAULT_OUTFIT, finishedSteps, availableItems, toggleItem, cleanOutfit,
  surpriseOutfit, newItems, outfitChanges,
} from './helpers/wardrobe.js';
import { earnedPatches } from './helpers/badges.js';
import { readLog, logEvent } from './helpers/log.js';
import {
  getExplorerCode, getAllProgress, getOutfit, setOutfit, getSeenItems, markItemsSeen,
} from './storage/save.js';
import { FEATURES } from './config.js';
import { illustration } from './illustrations.js';
import { playSound } from './sounds.js';

// The items (data/content/wardrobe.json), loaded once and kept.
let loading = null;
let loaded = null;
export function loadWardrobeItems() {
  loading ||= fetch(new URL('../data/content/wardrobe.json', import.meta.url))
    .then((response) => response.json())
    .then((data) => { loaded = data.items; return loaded; });
  return loading;
}

// The items if they are already loaded (for the badge pop-up, which cannot wait).
export function wardrobeItemsNow() {
  return loaded;
}

// The item a badge opens, if any (for the "New for Pip" line in the badge pop-up).
export function itemForBadge(badgeId) {
  if (!FEATURES.wardrobe || !loaded) return null;
  return loaded.find((item) => item.unlock.type === 'badge' && item.unlock.ref === badgeId) || null;
}

// A small picture of one item (its card, and the badge pop-up).
export function itemPicture(item) {
  return `<svg viewBox="${OUTFIT_VIEW[item.id]}" aria-hidden="true" focusable="false">${Object.values(OUTFIT_ART[item.id]).join('')}</svg>`;
}

const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function openWardrobe() {
  if (!FEATURES.wardrobe) return;
  const items = await loadWardrobeItems();
  const byId = (id) => items.find((i) => i.id === id);
  const open = availableItems(items, earnedPatches(readLog(), getExplorerCode()), finishedSteps(getAllProgress()));
  let outfit = cleanOutfit(getOutfit() || DEFAULT_OUTFIT, items, open);
  let seen = getSeenItems();
  const isNew = (id) => newItems(open, seen, items).includes(id);
  // Start on the first tab with something new, else on the hats.
  let tab = (TABS.find((t) => items.some((i) => i.slot === t.slot && isNew(i.id))) || TABS[0]).slot;
  logEvent('wardrobe', 'wardrobe-opened', {});

  const dialog = document.createElement('dialog');
  dialog.className = 'wardrobe';
  dialog.setAttribute('aria-labelledby', 'wardrobe-title');
  dialog.innerHTML = `
    <header class="wd-head">
      <h2 id="wardrobe-title">${illustration('owl', { size: 40, animate: false })} Pip's Wardrobe</h2>
      <span class="wd-count">${illustration('star', { size: 28, animate: false })} You found ${open.length} of ${items.length} things</span>
      <button class="btn btn-main wd-done" type="button">Done</button>
    </header>
    <div class="wd-body">
      <div class="wd-stage">
        <p class="wd-bubble" aria-live="polite"></p>
        <div class="wd-platform" aria-hidden="true"></div>
        <div class="wd-pip"></div>
        <div class="wd-actions">
          <button class="btn wd-bare" type="button">Take everything off</button>
          <button class="btn btn-main wd-surprise" type="button">${illustration('sparkle', { size: 26, animate: false })} Surprise me</button>
        </div>
      </div>
      <div class="wd-panel">
        <div class="wd-tabs" role="tablist" aria-label="What to try on"></div>
        <div class="wd-grid" role="tabpanel" id="wd-grid"></div>
        <p class="wd-note">Dressing Pip is just for fun. It never changes your investigation.</p>
      </div>
    </div>`; // our own words and drawings only
  document.body.append(dialog);
  const $ = (selector) => dialog.querySelector(selector);

  // ---------- drawing ----------
  function drawPip() {
    const names = Object.values(outfit).map((id) => byId(id).name.toLowerCase());
    $('.wd-pip').innerHTML = pipSVG(`Pip the owl${names.length ? `, wearing ${names.join(', ')}` : ''}`, outfit);
  }

  function drawTabs() {
    $('.wd-tabs').innerHTML = TABS.map((t) => {
      const fresh = items.filter((i) => i.slot === t.slot && isNew(i.id)).length;
      return `<button type="button" class="wd-tab" role="tab" id="wd-tab-${t.slot}" aria-controls="wd-grid" aria-selected="${t.slot === tab}" tabindex="${t.slot === tab ? 0 : -1}" data-tab="${t.slot}">${t.tab}${fresh ? ` <span class="wd-dot">${fresh} new</span>` : ''}</button>`;
    }).join('');
    $('.wd-grid').setAttribute('aria-labelledby', `wd-tab-${tab}`);
  }

  function drawCards() {
    $('.wd-grid').innerHTML = items.filter((i) => i.slot === tab).map((item) => {
      const unlocked = open.includes(item.id);
      const on = outfit[item.slot] === item.id;
      const label = unlocked ? '' : ` aria-label="${item.name}, locked. ${item.hint.replace(/"/g, '&quot;')}"`;
      return `<button type="button" class="wd-card${unlocked ? '' : ' locked'}" data-id="${item.id}" aria-pressed="${on}"${label}>
        ${on ? `<span class="wd-tick">${TICK}<span class="sr-only"> (wearing)</span></span>` : ''}
        ${unlocked && isNew(item.id) ? '<span class="wd-new">New!</span>' : ''}
        <span class="wd-preview">${itemPicture(item)}</span>
        ${unlocked ? '' : `<span class="wd-lock">${illustration('lock', { size: 30, animate: false })}</span>`}
        <span class="wd-name">${item.name}</span>
      </button>`;
    }).join('');
  }

  function drawAll() {
    drawPip();
    drawTabs();
    drawCards();
  }

  function say(text) {
    const bubble = $('.wd-bubble');
    bubble.textContent = text;
    bubble.classList.remove('wd-pop');
    void bubble.offsetWidth; // restart the pop
    bubble.classList.add('wd-pop');
  }

  // Pip's little jump and a few sparkles (none with reduced motion).
  function celebrate() {
    const pip = $('.wd-pip');
    pip.classList.remove('wd-hop');
    void pip.offsetWidth;
    pip.classList.add('wd-hop');
    playSound('wink');
    if (reduceMotion()) return;
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const spark = document.createElement('span');
      spark.className = 'wd-spark';
      spark.style.setProperty('--x', `${Math.cos(angle) * 110}px`);
      spark.style.setProperty('--y', `${Math.sin(angle) * 110 - 30}px`);
      spark.innerHTML = illustration('sparkle', { size: 26, animate: false });
      $('.wd-stage').append(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  // Wear (or take off), save at once, log only what changed.
  function change(next, line) {
    const changes = outfitChanges(outfit, next);
    outfit = next;
    setOutfit(outfit);
    changes.forEach((c) => logEvent('wardrobe', 'outfit-changed', c));
    drawAll();
    say(line);
    if (Object.keys(outfit).length) celebrate();
  }

  // ---------- tapping ----------
  $('.wd-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    tab = button.dataset.tab;
    drawTabs();
    drawCards();
    $(`#wd-tab-${tab}`).focus();
  });
  // Arrow keys move between the tabs (the usual way for tabs).
  $('.wd-tabs').addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const at = TABS.findIndex((t) => t.slot === tab);
    tab = TABS[(at + step + TABS.length) % TABS.length].slot;
    drawTabs();
    drawCards();
    $(`#wd-tab-${tab}`).focus();
  });

  $('.wd-grid').addEventListener('click', (event) => {
    const card = event.target.closest('[data-id]');
    if (!card) return;
    const item = byId(card.dataset.id);
    if (!open.includes(item.id)) {
      // Locked: one friendly line, never a "no" sound.
      card.classList.remove('wd-shake');
      void card.offsetWidth;
      card.classList.add('wd-shake');
      say(item.hint);
      return;
    }
    if (!seen.includes(item.id)) {
      markItemsSeen([item.id]);
      seen = getSeenItems();
    }
    const wearing = outfit[item.slot] === item.id;
    change(toggleItem(outfit, item), wearing ? 'Okay, that is off. What next?' : item.say);
    $(`[data-id="${item.id}"]`).focus(); // keyboard users stay on the same card
  });

  $('.wd-bare').addEventListener('click', () => change({}, 'Brrr, I feel bare! Dress me again?'));
  $('.wd-surprise').addEventListener('click', () => change(surpriseOutfit(items, open), 'Ta-da! Do you like my new look?'));

  // ---------- open and close ----------
  const returnFocusTo = document.activeElement;
  return new Promise((resolve) => {
    function close() {
      dialog.close();
      dialog.remove();
      dressAllPips(outfit); // every Pip on the page now wears the new outfit
      if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
      resolve(outfit);
    }
    $('.wd-done').addEventListener('click', close);
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); }); // Esc
    drawAll();
    say(items.some((i) => isNew(i.id))
      ? 'Something new is waiting for me! Look for New!'
      : 'Hi! Pick something to dress me up. It is just for fun!');
    dialog.showModal();
    $(`#wd-tab-${tab}`).focus();
  });
}
