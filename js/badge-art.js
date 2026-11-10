// Shell layer: how a badge patch looks (Part 21b, docs/design/badges-spec.md).
// A round explorer patch: an outer circle in the badge colour, a white dashed
// "stitch" ring, a light centre and our colourful illustration (Part 54g; was a
// navy line icon), with a gentle shine sweeping across. Super badges get a gold ring.
// Colours come from css/theme.css through CSS variables (css/badges.css).
import { illustration } from './illustrations.js';

// `badge` is one entry of BADGES (helpers/badges.js).
// `locked`: grey patch with a lock (the words under it say how to earn it).
// `animate`: the icon moves (Part 52a: the shelf shows many badges, so still by default).
export function patchSVG(badge, locked = false, animate = false) {
  const isSuper = badge.super && !locked;
  const colour = locked
    ? '--patch: var(--color-locked); --patch-light: var(--color-locked-light)'
    : `--patch: var(--color-${badge.color}); --patch-light: var(--color-${badge.color}-light)`;
  const label = locked ? `Locked badge: ${badge.name}` : `${badge.name} badge`;
  const rings = isSuper
    ? '<circle class="patch-gold" cx="60" cy="60" r="57" stroke-width="3"/><circle class="patch-outer" cx="60" cy="60" r="49" stroke-width="3"/>'
    : '<circle class="patch-outer" cx="60" cy="60" r="55" stroke-width="4"/>';
  const stitch = isSuper ? 41 : 46;
  const illo = isSuper ? 50 : 58; // the illustration fills the light centre

  return `<svg class="patch${isSuper ? ' patch--super' : ''}${locked ? ' patch--locked' : ''}" style="${colour}" viewBox="0 0 120 120" role="img" aria-label="${label}">
    ${rings}
    <circle class="patch-stitch" cx="60" cy="60" r="${stitch}" stroke-width="3" stroke-dasharray="6 6"/>
    <circle class="patch-inner" cx="60" cy="60" r="${stitch - 8}" stroke-width="3"/>
    <g class="patch-illo" transform="translate(${60 - illo / 2} ${60 - illo / 2})">${illustration(locked ? 'lock' : badge.icon, { size: illo, animate: animate && !locked })}</g>
    ${locked ? '' : '<g transform="rotate(20 60 60)"><rect class="patch-shine" x="-40" y="-20" width="18" height="160"/></g>'}
  </svg>`;
}

// The back of the patch, shown before it flips over: a navy "?" patch.
export const MYSTERY_SVG = `<svg class="patch patch--mystery" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <circle class="mystery-back" cx="60" cy="60" r="55"/>
  <circle class="mystery-ring" cx="60" cy="60" r="46" stroke-width="3" stroke-dasharray="6 6"/>
  <text class="mystery-mark" x="60" y="80" text-anchor="middle">?</text>
</svg>`;
