// Shell layer: the action bar under the task card (UI guide, zone 3). Always in
// the same place: Back (quiet) on the left, the ONE primary button (green) on
// the right. The Hint button sits under the question (setHint).
// mountShell({ layout: 'card' }) makes the empty bar; each room fills it with setupActionBar().
import { setIconLine } from './icon-text.js';

// back:    { label, href } or { label, onClick }, or null for no Back
// hint:    a button made by prompts.js (placed under the question, see setHint), or null
// primary: see setPrimary below
// Returns { setPrimary, setBack }, so the room can change the buttons as the task goes on.
export function setupActionBar({ back = null, hint = null, primary }) {
  const bar = document.getElementById('action-bar');
  bar.innerHTML = `
    <div class="action-left"></div>
    <div class="action-right"><button class="btn btn-main action-primary" id="action-primary" type="button"></button></div>`;
  const left = bar.querySelector('.action-left');
  const right = bar.querySelector('.action-right');
  const primaryBtn = bar.querySelector('#action-primary');
  let onPrimary = null;
  primaryBtn.addEventListener('click', () => onPrimary && onPrimary());

  function setBack(options) {
    left.innerHTML = '';
    if (!options) return;
    const el = document.createElement(options.href ? 'a' : 'button');
    el.className = 'btn btn-quiet';
    el.textContent = `← ${options.label || 'Back'}`;
    if (options.href) el.href = options.href;
    else {
      el.type = 'button';
      el.addEventListener('click', options.onClick);
    }
    left.append(el);
  }

  // label:       what happens next, e.g. "Run survey"
  // enabled:     false shows `whyDisabled` on the button instead (e.g. "Write your idea first")
  // onClick:     what the button does
  // ready:       true gives it the "press me" nudge: a small hop and a ring
  //              (only once the task is ready; Habiba, 4 Nov 2026)
  function setPrimary({ label, enabled = true, whyDisabled = '', onClick = null, ready = false }) {
    // Part 54c: our labels may name an icon as :name: (js/icon-text.js).
    setIconLine(primaryBtn, enabled || !whyDisabled ? label : whyDisabled);
    primaryBtn.disabled = !enabled;
    primaryBtn.classList.toggle('m-nudge', enabled && ready);
    onPrimary = onClick;
  }

  // The Hint button of the task on screen (or null for none).
  let hintBtn = null;
  // It goes right under the question, at the top of the hint slot of the task
  // on screen (so the button and its answers are together; Habiba, 4 Nov 2026).
  // A page without a hint slot keeps it in the bar.
  function setHint(button) {
    if (hintBtn) hintBtn.remove();
    hintBtn = button;
    if (!button) return;
    button.classList.add('btn-secondary');
    const slot = [...document.querySelectorAll('.hint-list-slot')].find((s) => s.offsetParent !== null);
    if (slot) slot.prepend(button);
    else right.prepend(button);
  }

  setBack(back);
  setHint(hint);
  setPrimary(primary);
  return { setPrimary, setBack, setHint, primaryButton: primaryBtn };
}

