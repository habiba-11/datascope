// Welcome page: the child types the anonymous code their teacher gave them.
import { normalizeCode, isValidCode } from './helpers/log.js';
import { getExplorerCode, setExplorerCode, hasSeenTutorial, markTutorialSeen } from './storage/save.js';
import { pipSVG } from './pip.js';
import { LOGO_SVG } from './icons.js';
import { openTutorial } from './tutorial.js';
import { mountSky } from './ambient.js';

// Part 43a: the living background (sun, clouds, birds, flowers), no room touch here.
mountSky('welcome');

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

// The tutorial (Prof's comment 1): by itself the first time in this browser,
// then from the "See how it works" button under the green one.
const tutorialWords = fetch('data/content/tutorial.json').then((r) => r.json());
const seeHow = document.getElementById('see-how');
seeHow.addEventListener('click', async () => openTutorial(await tutorialWords, seeHow, input));

if (!hasSeenTutorial()) {
  markTutorialSeen();
  tutorialWords.then((words) => openTutorial(words, input, input));
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stay in our app; we move to the next page ourselves

  const code = normalizeCode(input.value);
  if (!isValidCode(code)) {
    help.textContent = '⚠️ Codes look like OWL-07 (letters, a dash and numbers). Ask your teacher for yours!';
    help.classList.add('warn');
    input.focus();
    return;
  }

  setExplorerCode(code);
  window.location.href = 'rooms/question-studio.html';
});
