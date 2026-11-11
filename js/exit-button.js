// Shell layer: the "Exit" button in the quiet status line (Habiba, 4 Nov 2026).
// It asks first, sends any work that is still waiting, then forgets the code on
// this device and goes back to the start page. The work stays online, so the
// same code later carries on. Anything not sent yet stays in the browser and
// goes the next time a room opens (storage/sync.js).
import { openModal } from './modal.js';
import { sendWaiting } from './storage/sync.js';
import { clearExplorerCode, clearChildData, getExplorerCode } from './storage/save.js';
import { iconHTML, setIconText } from './icon-text.js';

// Sending should not keep a child waiting: after 4 seconds we leave anyway.
const MAX_WAIT_MS = 4000;
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export const EXIT_BUTTON_HTML = `<button class="btn btn-quiet exit-btn" id="exit-btn" type="button">${iconHTML('door')} Exit</button>`;

export function setupExitButton() {
  const button = document.getElementById('exit-btn');
  if (!button) return;
  button.addEventListener('click', async () => {
    const body = document.createElement('p');
    body.textContent = 'Your work is saved. Next time, type the same code to carry on.';
    const choice = await openModal({
      icon: 'door',
      title: 'Leave DataScope?',
      accent: 'ask',
      body,
      buttons: [
        { label: 'Stay here', value: 'stay' },
        { label: 'Yes, exit', value: 'exit', main: true, icon: 'door' },
      ],
    });
    if (choice !== 'exit') return;
    button.disabled = true;
    setIconText(button, 'clock', 'Saving...');
    await Promise.race([sendWaiting(), wait(MAX_WAIT_MS)]);
    clearExplorerCode();
    location.href = '../index.html';
  });
}

// ---------- Part 60d (Habiba, 11 Nov 2026): "I'm finished" ----------
// For shared computers: the child says they are done for good. A big warning
// shows their code to write down, then the work still waiting is sent, and
// this computer forgets the child (save.js clearChildData: work not sent yet
// stays and goes later). The same code typed again later carries on online,
// but the trail starts again at Ask (children cannot read the database).
export const FINISH_BUTTON_HTML = `<button class="btn btn-quiet finish-btn" id="finish-btn" type="button">${iconHTML('flag')} I'm finished</button>`;

export function setupFinishButton(button = document.getElementById('finish-btn')) {
  if (!button) return;
  button.addEventListener('click', async () => {
    if (await askFinished() !== 'finish') return;
    button.disabled = true;
    setIconText(button, 'clock', 'Saving...');
    await Promise.race([sendWaiting(), wait(MAX_WAIT_MS)]);
    clearChildData();
    location.href = '../index.html';
  });
}

function askFinished() {
  const code = getExplorerCode();
  const body = document.createElement('div');
  body.className = 'finish-warning';
  body.innerHTML = `
    <p>This computer will <strong>forget you</strong>, so the next explorer can start fresh.</p>
    ${code ? `<p class="finish-code-label">Your code:</p><p class="finish-code">${code}</p>` : ''}
    <p class="finish-must">${iconHTML('warning')} Write your code on paper NOW. Without it, you cannot come back to your work.</p>`;
  return openModal({
    icon: 'warning',
    title: 'Are you really finished?',
    accent: 'ask',
    body,
    buttons: [
      { label: 'Not yet', value: 'stay' },
      { label: "Yes, I'm finished", value: 'finish', main: true },
    ],
  });
}
