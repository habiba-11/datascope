// Shell layer: our own line icons (24x24 grid, navy stroke), drawn as SVG so
// they stay sharp at any size. Used by the step bar and the badges.
// Each value is only the inside of the <svg>; lineIcon() wraps it.

export const ICONS = {
  question: '<path d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2.2"/><circle cx="12" cy="18" r=".8" fill="currentColor"/>',
  map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h4"/>',
  bars: '<path d="M5 20V12M12 20V5M19 20v-7M3 20h18"/>',
  flag: '<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
};

// An icon as a whole <svg>. It is decoration: the word next to it carries the
// meaning, so screen readers skip it.
export function lineIcon(name, size = 24, strokeWidth = 3) {
  return `<svg class="line-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

// The DataScope logo: a green hexagon with a magnifying glass.
export const LOGO_SVG = `<svg class="logo-mark" width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M24 4l18 10v20L24 44 6 34V14z" fill="var(--color-explore)"/>
  <circle cx="22" cy="22" r="9" fill="#FFFFFF" stroke="var(--color-navy)" stroke-width="4"/>
  <line x1="29" y1="29" x2="36" y2="36" stroke="var(--color-navy)" stroke-width="5" stroke-linecap="round"/>
</svg>`;
