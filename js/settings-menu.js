// Shell layer, Part 60c (Habiba, 11 Nov 2026): the "Settings" menu beside the
// logo replaces the strip under the card. One gear button opens a small panel
// with the child's code, "Saved online?", Sound, Music and Exit. The buttons
// keep their ids, so celebrate.js (sound), music.js and exit-button.js work as before.
import { getExplorerCode } from './storage/save.js';
import { backendReady } from './config.js';
import { STATUS_TEXT } from './storage/sync.js';
import { EXIT_BUTTON_HTML } from './exit-button.js';
import { iconHTML, setIconText } from './icon-text.js';

export function settingsMenuHTML() {
  const code = getExplorerCode();
  const codeLine = code
    ? `<p class="settings-code">${iconHTML('key')} Your code: <strong>${code}</strong></p>`
    : `<a class="settings-code missing" href="../index.html">${iconHTML('key')} No code yet: tap here</a>`;
  return `
    <div class="settings" id="settings">
      <button class="btn settings-btn" id="settings-btn" type="button" aria-expanded="false" aria-controls="settings-panel">
        ${iconHTML('gear')}<span class="settings-word">Settings</span>
        <span class="settings-alert" id="settings-alert" hidden>!<span class="sr-only"> Not sent yet</span></span>
      </button>
      <div class="settings-panel" id="settings-panel" hidden>
        ${codeLine}
        ${backendReady() ? '<p class="sync-status" id="sync-status" role="status"></p>' : ''}
        <button class="btn btn-quiet sound-toggle" id="sound-toggle" type="button" aria-pressed="true">${iconHTML('speaker')} Sound: on</button>
        <button class="btn btn-quiet sound-toggle" id="music-toggle" type="button" aria-pressed="true">${iconHTML('music')} Music: on</button>
        ${EXIT_BUTTON_HTML}
      </div>
    </div>`;
}

// Opens and closes the panel: the gear button, a tap outside, or Esc.
export function setupSettingsMenu() {
  const menu = document.getElementById('settings');
  if (!menu) return;
  const button = document.getElementById('settings-btn');
  const panel = document.getElementById('settings-panel');
  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('pointerdown', (e) => {
    if (!panel.hidden && !menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });
}

// "Saved online?" inside the panel. When work is not sent (offline or an
// error), a "!" sits on the gear too, so the child sees it without opening.
export function showSyncStatus(status) {
  const label = document.getElementById('sync-status');
  if (!label) return;
  setIconText(label, STATUS_TEXT[status].icon, STATUS_TEXT[status].text);
  label.dataset.status = status;
  document.getElementById('settings-alert').hidden = !(status === 'error' || status === 'offline');
}
