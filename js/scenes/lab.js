// Part 59d: the Graph Lab's place, a bright science lab (our own SVG, after
// docs/design/datascope-rooms-ui.html): a window, a shelf of coloured beakers
// and a plant, on mint walls. A still picture; only a few dust specks move.
// Left out: the sun in the window (Round 4 rule) and the "Wash hands!" sign
// (no room under the shelf once the window moved below the top bar).
import { floor, shelf, plant } from './parts.js';

const NAVY = '#17324D';

function labWindow() {
  return `<g transform="translate(6 132)">
    <rect width="224" height="128" fill="url(#ds-win-sky)" stroke="#fff" stroke-width="9"/>
    <g fill="#fff" opacity=".9"><ellipse cx="160" cy="44" rx="30" ry="8"/><circle cx="148" cy="39" r="10"/><circle cx="164" cy="34" r="12"/></g>
    <path d="M0 108 Q60 80 120 100 T224 92 V128 H0Z" fill="#8FD0A5"/>
    <path d="M112 0 V128 M0 64 H224" stroke="#fff" stroke-width="7"/></g>`;
}

// Four glass beakers, each with a different colour inside.
function beakers() {
  return [[16, '#FF7A6B'], [64, '#38B6FF'], [112, '#4CC26B'], [160, '#FFC531']].map(([x, colour], i) => `
    <g transform="translate(${x} -62)">
      <path d="M2 40 H38 L44 58 H-4Z" fill="${colour}" opacity=".9"/>
      <path d="M10 0 H30 V18 L44 58 H-4 L10 18Z" fill="#fff" fill-opacity=".35" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="14" cy="${28 - (i % 2) * 6}" r="3" fill="#fff" opacity=".8"/></g>`).join('');
}

export function lab() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall-mint)"/>
  <rect y="270" width="960" height="108" fill="#BFE7E0"/>
  <rect y="266" width="960" height="7" fill="#fff" opacity=".8"/>
  ${floor(378, 'ds-floor-mint')}
  ${labWindow()}
  ${shelf(8, 330, 232, beakers())}
  ${plant(900, 372, 1.1)}`;
}
