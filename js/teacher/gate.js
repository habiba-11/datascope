// Teacher dashboard: who may come in. The dashboard code is only loaded after
// the teacher is let in: email + password login (cloud.js, Part 22). The
// database itself refuses children's data to anyone not logged in.
// The PIN for a switched-off database was removed on 12 Nov 2026 (Habiba):
// with the database off, the page says how to switch it on.
import { backendReady } from '../config.js';
import { isLoggedIn, logIn } from './cloud.js';
import './calm-icons.js'; // first: only warning icons in the teacher view
import { setIconLine, fillIcons } from '../icon-text.js';

fillIcons(); // the page's <span data-icon> icons (Part 54h)

async function openDashboard() {
  document.getElementById('login-gate').hidden = true;
  document.getElementById('dashboard').hidden = false;
  await import('./dashboard.js');
}

function showMessage(id, text) {
  const message = document.getElementById(id);
  setIconLine(message, text); // :name: = icon (Part 54h)
  message.hidden = false;
}

function setupLogin() {
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
        ? ':cloud-off: No internet connection. Connect and try again.'
        : `:lock: ${error.message}. Check the email and password.`);
    } finally {
      button.disabled = false;
    }
  });
  if (isLoggedIn()) openDashboard();
  else document.getElementById('login-email').focus();
}

// The database is switched off (js/config.js): there is nothing to log in to.
function explainNoDatabase() {
  document.getElementById('login-form').hidden = true;
  showMessage('login-message', ':cloud-off: The teacher view needs the online database. Switch it on in js/config.js (enabled: true).');
}

if (backendReady()) setupLogin();
else explainNoDatabase();
