// Teacher dashboard: who may come in. The dashboard code is only loaded after
// the teacher is let in.
// - Online database ON (Part 22): email + password login (cloud.js). The
//   database itself refuses children's data to anyone not logged in.
// - Online database OFF: the PIN (a speed bump only; the data is on this device).
// Both are remembered until the browser tab is closed (sessionStorage).
import { checkPin } from '../helpers/pin.js';
import { backendReady } from '../config.js';
import { isLoggedIn, logIn } from './cloud.js';

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
  document.getElementById('login-gate').hidden = true;
  document.getElementById('dashboard').hidden = false;
  await import('./dashboard.js');
}

function showMessage(id, text) {
  const message = document.getElementById(id);
  message.textContent = text;
  message.hidden = false;
}

function setupLogin() {
  document.getElementById('pin-gate').hidden = true;
  document.getElementById('login-gate').hidden = false;
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      await logIn(document.getElementById('login-email').value, document.getElementById('login-password').value);
      openDashboard();
    } catch (error) {
      const offline = !navigator.onLine || error instanceof TypeError; // fetch fails without internet
      showMessage('login-message', offline
        ? '📴 No internet connection. Connect and try again.'
        : `🔒 ${error.message}. Check the email and password.`);
    } finally {
      button.disabled = false;
    }
  });
  if (isLoggedIn()) openDashboard();
  else document.getElementById('login-email').focus();
}

function setupPin() {
  const form = document.getElementById('pin-form');
  const input = document.getElementById('pin-input');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (await checkPin(input.value)) {
      rememberUnlock();
      openDashboard();
    } else {
      showMessage('pin-message', '🔒 That PIN is not right. Try again.');
      input.select();
    }
  });
  if (isUnlocked()) openDashboard();
  else input.focus();
}

if (backendReady()) setupLogin();
else setupPin();
