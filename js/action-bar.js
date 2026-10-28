// Shell layer: the action bar under the task card (UI guide, zone 3). Always in
// the same place: Back (quiet) on the left; Hint (white) and the ONE primary
// button (green) on the right. mountShell({ layout: 'card' }) makes the empty
// bar; each room fills it with setupActionBar().

// back:    { label, href } or { label, onClick }, or null for no Back
// hint:    a button made by prompts.js addHintButton (moved into the bar), or null
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

  // label:       what happens next, e.g. "▶ Run survey"
  // enabled:     false shows `whyDisabled` on the button instead (e.g. "Write your idea first")
  // onClick:     what the button does
  // ready:       true makes it breathe gently (only once the task is ready)
  function setPrimary({ label, enabled = true, whyDisabled = '', onClick = null, ready = false }) {
    primaryBtn.textContent = enabled || !whyDisabled ? label : whyDisabled;
    primaryBtn.disabled = !enabled;
    primaryBtn.classList.toggle('m-pulse', enabled && ready);
    onPrimary = onClick;
  }

  setBack(back);
  if (hint) right.prepend(hint);
  setPrimary(primary);
  return { setPrimary, setBack, primaryButton: primaryBtn };
}
