// Part 59f: the Evidence Board's place, a detective office (our own SVG,
// after docs/design/datascope-rooms-ui.html): a corkboard with three notes
// (Claim, Proof, Sure?) joined by red string, a desk with a paper and a
// magnifier, and a plant, on purple walls. A still picture; a few dust specks
// move. Left out: the hanging lamp (it would sit in the top bar, as in 59c).
import { floor, plant } from './parts.js';

const NAVY = '#17324D';
const NOTES = [
  [30, 24, '#fff', -5, 'Claim'],
  [150, 18, '#FFE27A', 4, 'Proof'],
  [90, 92, '#C9F2B5', -2, 'Sure?'],
];

// The corkboard sits on the left wall, above Sara and Pip.
function corkboard() {
  const notes = NOTES.map(([x, y, colour, turn, word]) => `<g transform="translate(${x} ${y}) rotate(${turn})">
    <rect width="72" height="52" fill="${colour}" stroke="${NAVY}" stroke-opacity=".4" stroke-width="1.6"/>
    <circle cx="36" cy="7" r="5" fill="#E94B3C"/>
    <text x="36" y="38" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="17" fill="${NAVY}">${word}</text></g>`).join('');
  return `<g transform="translate(6 108)">
    <rect width="240" height="160" rx="8" fill="#C99443" stroke="#8C5B2D" stroke-width="3"/>
    <rect x="9" y="9" width="222" height="142" fill="url(#ds-cork)"/>
    <path d="M66 32 L186 26 L126 98 Z" stroke="#E94B3C" stroke-width="2.4" fill="none" stroke-linejoin="round"/>${notes}</g>`;
}

// A desk with a sheet of paper and a magnifying glass.
function desk() {
  return `<g transform="translate(14 306)">
    <rect width="220" height="64" rx="8" fill="url(#ds-wood-top)" stroke="#8C5B2D" stroke-width="3"/>
    <rect x="14" y="14" width="46" height="36" rx="4" fill="#fff" stroke="${NAVY}" stroke-width="2.4"/>
    <path d="M22 26 H52 M22 34 H48 M22 42 H40" stroke="#9CC6E6" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="150" cy="30" r="20" fill="#9ED8FF" stroke="${NAVY}" stroke-width="3"/>
    <circle cx="150" cy="30" r="12" fill="#fff" opacity=".5"/>
    <path d="M165 44 L190 62" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/></g>`;
}

export function office() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall-purple)"/>
  <rect y="270" width="960" height="108" fill="url(#ds-panel)"/>
  <rect y="266" width="960" height="7" fill="#fff" opacity=".8"/>
  ${floor(378)}
  ${corkboard()}
  ${desk()}
  ${plant(900, 372, 1.1)}`;
}
