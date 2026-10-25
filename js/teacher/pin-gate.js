// Teacher dashboard: asks for the PIN before showing anything. The dashboard
// code is only loaded after the right PIN. The PIN is remembered until the
// browser tab is closed (sessionStorage), so it is not asked again on reload.
import { checkPin } from '../helpers/pin.js';

const UNLOCK_KEY = 'datascope:teacherUnlocked';

function isUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === 'yes';
  } catch {
    return false; // storage blocked: just ask for the PIN each time
  }
}

function rememberUnlock() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, 'yes');
  } catch {
    // storage blocked: the PIN is asked again next time
  }
}

async function openDashboard() {
  document.getElementById('pin-gate').hidden = true;
  document.getElementById('dashboard').hidden = false;
  await import('./dashboard.js');
}

const form = document.getElementById('pin-form');
const input = document.getElementById('pin-input');
const message = document.getElementById('pin-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (await checkPin(input.value)) {
    rememberUnlock();
    openDashboard();
  } else {
    message.textContent = '🔒 That PIN is not right. Try again.';
    message.hidden = false;
    input.select();
  }
});

if (isUnlocked()) openDashboard();
else input.focus();
