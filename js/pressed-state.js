// Shell layer: screen readers hear which answer is picked. The rooms mark a
// picked button with the class "active" (or a picked card with "selected");
// this keeps aria-pressed in step with that class, everywhere, in one place.
const PICKABLE = '.choice-btn, .certainty-btn, .scenario-card, .device-card';

function sync(element) {
  // Choice cards that are radios (js/choices.js) say "checked" themselves.
  if (element.getAttribute('role') === 'radio') return;
  const picked = element.classList.contains('active') || element.classList.contains('selected');
  if (element.getAttribute('aria-pressed') !== String(picked)) {
    element.setAttribute('aria-pressed', String(picked));
  }
}

function syncAll(root) {
  if (root.matches && root.matches(PICKABLE)) sync(root);
  if (root.querySelectorAll) root.querySelectorAll(PICKABLE).forEach(sync);
}

let watching = false;

// Called once per page by mountShell(). Watches the whole page (pop-ups too).
export function watchPressedState() {
  if (watching) return;
  watching = true;
  syncAll(document.body);
  new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'attributes' && change.target.matches(PICKABLE)) sync(change.target);
      change.addedNodes.forEach((node) => node.nodeType === 1 && syncAll(node));
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
}
