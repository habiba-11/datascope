// Welcome page: the child types the anonymous code their teacher gave them.
import { normalizeCode, isValidCode } from './helpers/log.js';
import {
  getExplorerCode, setExplorerCode, hasSeenTutorial, markTutorialSeen,
  hasSeenWardrobeIntro, markWardrobeIntroSeen,
} from './storage/save.js';
import { pipSVG } from './pip.js';
import { LOGO_SVG } from './icons.js';
import { openStory } from './story.js';
import { mountSky } from './ambient.js';
import { fillIcons, setIconText, iconHTML } from './icon-text.js';
import { openModal } from './modal.js';
import { openWardrobe } from './wardrobe.js';
import { FEATURES } from './config.js';

// Part 43a: the living background (clouds only on the start page).
mountSky('welcome');
fillIcons(); // Part 54b: our icons instead of emoji

// Pip greets the child on the start page (cheering, wings up).
document.getElementById('mascot').innerHTML = pipSVG('Pip the owl explorer');
document.querySelector('#mascot .pip').classList.replace('pip--happy', 'pip--cheer');
document.getElementById('logo').innerHTML = `${LOGO_SVG}<span>Data<span class="logo-accent">Scope</span></span>`;

const form = document.getElementById('code-form');
const input = document.getElementById('code-input');
const help = document.getElementById('code-help');

// Coming back on the same device: the code is already filled in.
const savedCode = getExplorerCode();
if (savedCode) input.value = savedCode;

// The story (Part 44, Round 4; it replaced the film of Part 34): by itself the
// first time in this browser, then from "Watch the story again" under the
// green button. When it ends, the child types their code.
const storyWords = fetch('data/content/story.json').then((r) => r.json());
const seeHow = document.getElementById('see-how');
seeHow.addEventListener('click', async () => openStory(await storyWords, seeHow));

if (!hasSeenTutorial()) {
  markTutorialSeen();
  storyWords.then((words) => openStory(words, input));
}

// The code in the box, saved; or null (then the child is told how codes look).
function takeCode(message = 'Codes look like OWL-07 (letters, a dash and numbers). Ask your teacher for yours!') {
  const code = normalizeCode(input.value);
  if (!isValidCode(code)) {
    setIconText(help, 'warning', message);
    help.classList.add('warn');
    input.focus();
    return null;
  }
  setExplorerCode(code);
  return code;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stay in our app; we move to the next page ourselves
  if (!takeCode()) return;

  // Part 58e (Habiba): the first time, a pop-up introduces Pip's Wardrobe,
  // here at the start, so it never interrupts a task.
  if (FEATURES.wardrobe && !hasSeenWardrobeIntro()) {
    markWardrobeIntroSeen();
    if (await introduceWardrobe() === 'dress') {
      await openWardrobe(); // then the child presses Start exploring when ready
      return;
    }
  }
  window.location.href = 'rooms/question-studio.html';
});

// ---------- Part 58e: Pip's Wardrobe on the start page ----------

// "Dress Pip" under Pip. Pip remembers his outfit per explorer code, so the
// code is needed first.
if (FEATURES.wardrobe) {
  const dress = document.createElement('button');
  dress.type = 'button';
  dress.className = 'btn pip-dress-btn';
  dress.innerHTML = `${iconHTML('owl')} Dress Pip`; // our own icon and words
  dress.addEventListener('click', () => {
    if (takeCode('Type your explorer code first, so Pip can remember his outfit!')) openWardrobe();
  });
  document.getElementById('dress-slot').append(dress);
}

// The one-time pop-up: Pip dressed up, three short lines, two buttons.
function introduceWardrobe() {
  const body = document.createElement('div');
  body.className = 'wd-intro';
  body.innerHTML = `<div class="wd-intro-pip">${pipSVG('Pip in a party hat, sunglasses and a bow tie', { head: 'party', face: 'sunglasses', neck: 'bow', held: 'magnifier' })}</div>`;
  const list = document.createElement('ul');
  for (const [icon, text] of [
    ['party', 'Dress Pip with hats, glasses and more.'],
    ['medal', 'Good thinking opens new things for Pip.'],
    ['bag', 'It is just for fun. Find "Dress Pip" next to Pip or in your backpack.'],
  ]) {
    const item = document.createElement('li');
    setIconText(item, icon, text);
    list.append(item);
  }
  body.append(list);
  return openModal({
    icon: 'owl',
    title: "New: Pip's Wardrobe!",
    body,
    accent: 'plan',
    buttons: [
      { label: 'Dress Pip now', value: 'dress', icon: 'owl' },
      { label: 'Start exploring →', value: 'start', main: true },
    ],
  });
}
