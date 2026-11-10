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
import { mountScene } from './scenes/index.js';
import { saraSVG } from './characters.js';
import { fillIcons, setIconText, iconHTML } from './icon-text.js';
import { openModal } from './modal.js';
import { openWardrobe } from './wardrobe.js';
import { FEATURES } from './config.js';

// Part 59g: the school yard behind the page (scenes off: plain; Part 43a sky as a fallback).
if (!mountScene('welcome')) mountSky('welcome');
fillIcons(); // Part 54b: our icons instead of emoji

// Pip greets the child on the start page (cheering, wings up).
document.getElementById('mascot').innerHTML = pipSVG('Pip the owl explorer');
document.querySelector('#mascot .pip').classList.replace('pip--happy', 'pip--cheer');
document.getElementById('sara').innerHTML = saraSVG('cheer'); // Part 59g: Sara cheers beside Pip
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

// Part 59g: the code box shows how it is going (the look of
// datascope-welcome-ui.html): red with a tip when something is wrong, green
// with a tick when the code is right. Words and a tick, not only colour.
const box = document.getElementById('code-box');
const HELP_TEXT = help.textContent;

function showCodeState(state, icon, text) {
  box.classList.toggle('bad', state === 'bad');
  box.classList.toggle('good', state === 'good');
  help.classList.toggle('warn', state === 'bad');
  help.classList.toggle('ok', state === 'good');
  if (icon) setIconText(help, icon, text);
  else help.textContent = text;
}

// Typing again: back to the calm help line.
input.addEventListener('input', () => showCodeState('', '', HELP_TEXT));

// The code in the box, saved; or null (then the child is told what to fix).
function takeCode(message = 'Hmm, that code does not look right. Check each letter and number, then try again.') {
  const code = normalizeCode(input.value);
  if (!code) {
    showCodeState('bad', 'warning', 'Type your code first. It is on the card from your teacher.');
    input.focus();
    return null;
  }
  if (!isValidCode(code)) {
    showCodeState('bad', 'warning', message);
    input.focus();
    return null;
  }
  setExplorerCode(code);
  showCodeState('good', '', `Welcome, explorer ${code}! Pip is so happy to see you.`);
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
