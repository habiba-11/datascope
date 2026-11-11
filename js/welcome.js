// Welcome page: the child makes an anonymous explorer code (Part 60d), or
// types the code they already have to come back.
import { normalizeCode, isValidCode } from './helpers/log.js';
import {
  getExplorerCode, setExplorerCode, getLastCode, hasSeenTutorial, markTutorialSeen,
  hasSeenWardrobeIntro, markWardrobeIntroSeen,
} from './storage/save.js';
import { pipSVG } from './pip.js';
import { LOGO_SVG } from './icons.js';
import { openStory } from './story.js';
import { mountSky } from './ambient.js';
import { mountScene } from './scenes/index.js';
import { fillIcons, setIconText } from './icon-text.js';
import { openModal } from './modal.js';
import { openWardrobe } from './wardrobe.js';
import { FEATURES } from './config.js';
import { makeCode } from './helpers/code-maker.js';

// Part 59g: the school yard behind the page (scenes off: plain; Part 43a sky as a fallback).
if (!mountScene('welcome')) mountSky('welcome');
fillIcons(); // Part 54b: our icons instead of emoji

// Pip greets the child on the start page (cheering, wings up).
document.getElementById('mascot').innerHTML = pipSVG('Pip the owl explorer');
document.querySelector('#mascot .pip').classList.replace('pip--happy', 'pip--cheer');
document.getElementById('logo').innerHTML = `${LOGO_SVG}<span>Data<span class="logo-accent">Scope</span></span>`;

const form = document.getElementById('code-form');
const input = document.getElementById('code-input');
const help = document.getElementById('code-help');
const mainButton = document.getElementById('code-main');

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

// ---------- Part 60d (Habiba, 11 Nov 2026): the child makes the code ----------
// ONE green button: "Make me a code" while the box is empty, then "Start exploring".
const boxIsEmpty = () => normalizeCode(input.value) === '';
function showMainButton() {
  mainButton.textContent = boxIsEmpty() ? 'Make me a code' : 'Start exploring →';
}

function makeNewCode() {
  const code = makeCode();
  input.value = code;
  setExplorerCode(code); // saved at once: it is also the "last code" from now on
  showMainButton();
  showCodeState('good', '', `Your code is ${code}. Write it on paper now! You need it to come back.`);
  box.classList.remove('m-pop');
  void box.offsetWidth; // restart the pop
  box.classList.add('m-pop');
}

// The box was emptied (by accident?): say what the code was, with a button to
// put it back. Otherwise the calm help line.
function showEmptiedHelp() {
  const last = getLastCode();
  if (!last) {
    showCodeState('', '', HELP_TEXT);
    return;
  }
  showCodeState('', '', `Your code was ${last}. `);
  const putBack = document.createElement('button');
  putBack.type = 'button';
  putBack.className = 'code-put-back';
  putBack.textContent = 'Put it back';
  putBack.addEventListener('click', () => {
    input.value = last;
    showMainButton();
    showCodeState('good', '', `Welcome back, explorer ${last}!`);
  });
  help.append(putBack);
}

input.addEventListener('input', () => {
  showMainButton();
  if (boxIsEmpty()) showEmptiedHelp();
  else showCodeState('', '', 'Tap Start exploring when your code is in the box.');
});

// Coming back on this device (after Exit, or the window was closed): the code
// is in the box again. Only "I'm finished" makes the device forget it.
const savedCode = getExplorerCode() || getLastCode();
if (savedCode) {
  input.value = savedCode;
  showCodeState('good', '', `Welcome back, explorer ${savedCode}! Is this your code? Tap Start exploring.`);
}
showMainButton();

// "I already have a code": the child types the code from their paper.
document.getElementById('have-code').addEventListener('click', () => {
  input.placeholder = 'e.g. FOX-4725';
  showCodeState('', '', 'Type the code from your paper. Never your name!');
  input.focus();
  input.select();
});

// The code in the box, saved; or null (then the child is told what to fix).
function takeCode(emptyMessage = 'Tap Make me a code first.') {
  const code = normalizeCode(input.value);
  if (!code) {
    showCodeState('bad', 'warning', emptyMessage);
    return null;
  }
  if (!isValidCode(code)) {
    showCodeState('bad', 'warning', 'Hmm, that code does not look right. Check each letter and number on your paper.');
    input.focus();
    return null;
  }
  setExplorerCode(code);
  showCodeState('good', '', `Welcome, explorer ${code}! Pip is so happy to see you.`);
  return code;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stay in our app; we move to the next page ourselves
  if (boxIsEmpty()) {
    makeNewCode(); // the first tap makes the code; the next tap starts
    return;
  }
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
  dress.className = 'btn pip-dress-btn pip-dress-btn--big';
  dress.textContent = 'Dress Pip'; // Part 60b (Habiba): bigger, words only
  dress.addEventListener('click', () => {
    if (takeCode('Make your code first (the green button), so Pip can remember his outfit!')) openWardrobe();
  });
  document.getElementById('dress-slot').append(dress);
}

// Part 60b (Habiba: "after Exit the background comes late, it feels glitchy"):
// the page stayed hidden over a sky colour (css/welcome.css) until now. Pip,
// the yard, the logo and the button are drawn, so everything shows at once.
document.documentElement.classList.remove('is-loading');

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
