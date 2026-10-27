// Teacher dashboard: the 4 tabs (Class, Children, Thesis data, Settings).
// One tab open at a time. Follows the usual keyboard pattern for tabs:
// ← → move between tabs, Home / End jump to the first / last one.
// The open tab is remembered until the browser tab is closed.
const TAB_KEY = 'datascope:teacherTab';

export function setupTabs(onChange) {
  const tabs = [...document.querySelectorAll('.dash-tab')];

  function open(tab, focus = false) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1; // Tab key lands on the open tab only
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
    try {
      sessionStorage.setItem(TAB_KEY, tab.id);
    } catch {
      // storage blocked: the first tab opens next time
    }
    onChange(tab.id);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => open(tab));
    tab.addEventListener('keydown', (event) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      open(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  let saved = null;
  try {
    saved = sessionStorage.getItem(TAB_KEY);
  } catch {
    // storage blocked
  }
  open(document.getElementById(saved) || tabs[0]);
}
