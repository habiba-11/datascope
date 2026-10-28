// Shell layer: our own line icons (24x24 grid, navy stroke), drawn as SVG so
// they stay sharp at any size. Used by the step bar and the badges.
// Each value is only the inside of the <svg>; lineIcon() wraps it.

export const ICONS = {
  question: '<path d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2.2"/><circle cx="12" cy="18" r=".8" fill="currentColor"/>',
  map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h4"/>',
  bars: '<path d="M5 20V12M12 20V5M19 20v-7M3 20h18"/>',
  flag: '<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
  // badge icons (docs/design/badges-spec.md); all our own drawings
  compass: '<circle cx="12" cy="12" r="8"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/>',
  median: '<circle cx="3.5" cy="16" r="1.4"/><circle cx="7.8" cy="16" r="1.4"/><circle cx="12" cy="16" r="3" fill="currentColor"/><circle cx="16.2" cy="16" r="1.4"/><circle cx="20.5" cy="16" r="1.4"/><path d="M12 4v6M9.5 7.5L12 10l2.5-2.5"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>',
  refresh: '<path d="M5 11a7 7 0 0 1 12-4.5L19 8M19 13a7 7 0 0 1-12 4.5L5 16"/><path d="M19 3.5V8h-4.5M5 20.5V16h4.5"/>',
  bubble: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9h8M8 12.5h5"/>',
  magnifier: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7.5h8M8.5 12h0M12 12h0M15.5 12h0M8.5 16h0M12 16h0M15.5 16h0"/>',
  wand: '<path d="M4 20L14 10"/><path d="M16 3v4M14 5h4M19.5 9.5v3M18 11h3M9 4v2M8 5h2"/>',
  lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  backpack: '<path d="M9 6a3 3 0 0 1 6 0"/><rect x="5" y="6" width="14" height="15" rx="4"/><rect x="8.5" y="13" width="7" height="5" rx="1.5"/>',
};

// An icon as a whole <svg>. It is decoration: the word next to it carries the
// meaning, so screen readers skip it.
export function lineIcon(name, size = 24, strokeWidth = 3) {
  return `<svg class="line-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

// The backpack on the badge button (a new badge flies into it).
export const BACKPACK_SVG = `<svg class="backpack-mark" width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M17 12a7 7 0 0 1 14 0" fill="none" style="stroke: var(--color-navy)" stroke-width="4"/>
  <rect x="8" y="12" width="32" height="32" rx="10" style="fill: var(--color-ask); stroke: var(--color-navy)" stroke-width="3.5"/>
  <rect x="15" y="27" width="18" height="12" rx="4" style="fill: var(--color-ask-light); stroke: var(--color-navy)" stroke-width="3"/>
  <path d="M15 31h18" style="stroke: var(--color-navy)" stroke-width="3"/>
</svg>`;

// The DataScope logo: a green hexagon with a magnifying glass.
export const LOGO_SVG = `<svg class="logo-mark" width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M24 4l18 10v20L24 44 6 34V14z" style="fill: var(--color-explore)"/>
  <circle cx="22" cy="22" r="9" style="fill: #FFFFFF; stroke: var(--color-navy)" stroke-width="4"/>
  <line x1="29" y1="29" x2="36" y2="36" style="stroke: var(--color-navy)" stroke-width="5" stroke-linecap="round"/>
</svg>`;
