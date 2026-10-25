// Shell layer: the maths recap pop-up (Part 18, Prof's comment 5).
// Cards for mean, median, mode and range: what each one tells you, 3 steps,
// and a worked example that appears one step at a time ("Next step").
// Words: data/content/recap.json. Numbers: helpers/recap.js (stats.js).
import { openModal } from './modal.js';
import { logEvent } from './helpers/log.js';
import { recapCardIds, exampleLines } from './helpers/recap.js';
import { hasSeenIntro, markIntroSeen } from './storage/save.js';

let recapPromise = null;

function loadRecap() {
  if (!recapPromise) recapPromise = fetch('../data/content/recap.json').then((r) => r.json());
  return recapPromise;
}

function el(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

// One card: title, meaning, steps. Step 1 shows at once; "Next step" shows the rest.
// For words (games), the mode card uses its word example.
function cardNode(card, useWords) {
  const example = useWords && card.wordExample ? card.wordExample : card.example;
  const box = el('div', '', 'recap-card');
  box.append(el('h3', `${card.icon} ${card.title}`), el('p', card.what, 'recap-what'));

  const list = el('ol', '', 'recap-steps');
  const lines = exampleLines(card.id, example);
  card.steps.forEach((step, i) => {
    const item = el('li');
    item.append(el('strong', step), el('span', lines[i], 'recap-example'));
    item.hidden = i > 0;
    list.append(item);
  });

  const next = el('button', '▶ Next step', 'btn recap-next');
  next.type = 'button';
  next.addEventListener('click', () => {
    const hiddenStep = list.querySelector('li[hidden]');
    if (hiddenStep) {
      hiddenStep.hidden = false;
      hiddenStep.classList.add('recap-pop');
    }
    if (!list.querySelector('li[hidden]')) {
      next.textContent = '✅ All steps shown';
      next.disabled = true;
    }
  });

  box.append(el('p', `Example: ${example.join(', ')}`, 'recap-numbers'), list, next);
  return box;
}

// Opens the recap. `kind` is Number Lab's kind ('number', 'category', 'compare').
export async function openRecap({ kind, auto, room }) {
  const recap = await loadRecap();
  const cards = recapCardIds(kind).map((id) => recap.cards.find((c) => c.id === id));
  const viewed = new Set([cards[0].id]);

  const body = el('div', '', 'recap');
  const area = el('div');
  if (cards.length > 1) {
    // One tab per card (at most 4 choices), with aria-pressed for screen readers.
    const tabs = el('div', '', 'recap-tabs');
    cards.forEach((card, i) => {
      const tab = el('button', `${card.icon} ${card.title}`, 'btn choice-btn recap-tab');
      tab.type = 'button';
      tab.setAttribute('aria-pressed', String(i === 0));
      if (i === 0) tab.classList.add('active');
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.recap-tab').forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-pressed', String(t === tab));
        });
        viewed.add(card.id);
        area.replaceChildren(cardNode(card, false));
      });
      tabs.append(tab);
    });
    body.append(tabs);
  } else {
    body.append(el('p', recap.wordsNote, 'recap-note'));
  }
  area.append(cardNode(cards[0], kind === 'category'));
  body.append(area);

  await openModal({
    icon: '📘',
    title: 'Maths recap',
    accent: 'explore',
    body,
    buttons: [{ label: "I'm ready! →", value: 'ready', main: true }],
  });
  logEvent(room, 'recap-viewed', { auto, cardsViewed: [...viewed] });
}

// Opens the recap by itself the first time this child reaches Number Lab
// ("seen" is kept like the phase intros, under the id 'recap').
export function autoOpenRecap(kind) {
  if (hasSeenIntro('recap')) return;
  markIntroSeen('recap');
  openRecap({ kind, auto: true, room: 'number-lab' });
}

// Adds a "📘 Maths recap" button after `anchor` (the room title).
export function addRecapButton(anchor, kind, room) {
  const button = el('button', '📘 Maths recap', 'btn recap-btn');
  button.type = 'button';
  button.addEventListener('click', () => openRecap({ kind, auto: false, room }));
  anchor.after(button);
}
