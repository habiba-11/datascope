// Shell layer: one friendly pop-up window for the whole app (Part 13).
// Used later by the phase intros, the phase feedback and the maths recap.
// All text goes in with textContent, so nothing typed can ever become HTML.
import { createModalQueue } from './helpers/modal-queue.js';
import { pipSVG } from './pip.js';

const queue = createModalQueue();
let idCounter = 0;
// After the open pop-up closes, the next one in line waits this long (ms).
// Used after a feedback card, so the child first sees the unlock animation.
let pauseBeforeNext = 0;

export function pauseNextModal(ms) {
  pauseBeforeNext = ms;
}

// Opens a pop-up, or puts it in line if one is already open.
// Returns a promise with the `value` of the button pressed ('close' for ✕ or Esc).
//   icon:        emoji next to the title
//   title:       short heading (plain text)
//   body:        plain text, or a DOM node built by our own code
//   buttons:     [{ label, value, main }]; `main` makes it the big green button
//   accent:      room colour name ('ask', 'plan', 'collect', 'explore', 'conclude')
//   dismissible: false hides ✕ and ignores Esc, so a button must be pressed
export function openModal(options) {
  return new Promise((resolve) => {
    const item = { options, resolve };
    if (queue.add(item)) show(item);
  });
}

function show({ options, resolve }) {
  const {
    icon = '', title, body, accent = 'collect', dismissible = true,
    buttons = [{ label: 'OK!', value: 'ok', main: true }],
  } = options;

  // Remember where the child was, so focus can go back there on close.
  const returnFocusTo = document.activeElement;
  idCounter += 1;
  const titleId = `modal-title-${idCounter}`;

  // <dialog> with showModal() makes the page behind it unreachable,
  // so Tab stays inside the pop-up.
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.setAttribute('aria-labelledby', titleId);
  dialog.style.setProperty('--modal-accent', `var(--color-${accent})`);

  const header = document.createElement('header');
  header.className = 'modal-header';
  const pip = document.createElement('span');
  pip.className = 'modal-pip';
  pip.innerHTML = pipSVG(); // our own drawing, no child text
  const heading = document.createElement('h2');
  heading.id = titleId;
  heading.className = 'modal-title';
  heading.textContent = icon ? `${icon} ${title}` : title;
  header.append(pip, heading);

  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => close('close'));
    header.append(closeBtn);
  }

  const content = document.createElement('div');
  content.className = 'modal-body';
  if (typeof body === 'string') {
    const text = document.createElement('p');
    text.textContent = body;
    content.append(text);
  } else if (body) {
    content.append(body);
  }

  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  let mainButton = null;
  for (const b of buttons) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = b.main ? 'btn btn-main' : 'btn';
    button.textContent = b.label;
    button.addEventListener('click', () => close(b.value));
    if (b.main) mainButton = button;
    actions.append(button);
  }

  dialog.append(header, content, actions);
  document.body.append(dialog);

  // Esc fires "cancel". We decide ourselves whether it may close the pop-up.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (dismissible) close('close');
  });

  document.body.classList.add('modal-open'); // stops the page behind from scrolling
  dialog.showModal();
  // Start on the main button (not on ✕), so Enter does the expected thing.
  (mainButton || actions.querySelector('button'))?.focus();

  function close(value) {
    dialog.close();
    dialog.remove();
    document.body.classList.remove('modal-open');
    if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
    resolve(value);
    const next = queue.done();
    const wait = pauseBeforeNext;
    pauseBeforeNext = 0;
    if (next) setTimeout(() => show(next), wait);
  }
}
