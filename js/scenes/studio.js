// Part 59c: the Question Studio's place, a warm study (our own SVG, after
// docs/design/datascope-rooms-ui.html): a pinboard with sticky notes and red
// string, bookshelves with a globe, and a plant. A still picture; only a few
// specks of dust float. The mockup's hanging lamp was left out: it sat in the
// top bar, between the logo and the step bar.
// The notes carry question words only (no "8 h" as in the mockup: it would
// hint at the sleep answer before the child has picked a question).
import { floor, shelf, plant, bookRow } from './parts.js';

const NAVY = '#17324D';
const NOTES = [
  [18, 20, '#FFE27A', -4, '?'],
  [96, 16, '#FF9ACB', 3, 'Why?'],
  [160, 30, '#9ED8FF', -2, 'How?'],
  [30, 84, '#C9F2B5', 4, 'When?'],
  [112, 86, '#FFD0A8', -3, 'Who?'],
];

// The pinboard sits on the left wall, above Sara and Pip.
function pinboard() {
  const notes = NOTES.map(([x, y, colour, turn, word]) => `<g transform="translate(${x} ${y}) rotate(${turn})">
    <rect width="58" height="48" fill="${colour}" stroke="${NAVY}" stroke-opacity=".35" stroke-width="1.6"/>
    <circle cx="29" cy="6" r="4.6" fill="#E94B3C"/>
    <text x="29" y="34" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="${word.length > 4 ? 15 : 17}" fill="${NAVY}">${word}</text></g>`).join('');
  return `<g transform="translate(6 112)">
    <rect width="236" height="150" rx="8" fill="#C99443" stroke="#8C5B2D" stroke-width="3"/>
    <rect x="8" y="8" width="220" height="134" fill="url(#ds-cork)"/>${notes}
    <path d="M60 50 Q90 70 120 40 T190 66" stroke="#E94B3C" stroke-width="2" fill="none" stroke-dasharray="4 3"/></g>`;
}

const GLOBE = '<g transform="translate(190 0)"><circle cx="36" cy="-22" r="22" fill="#38B6FF" stroke="#17324D" stroke-width="2.4"/><path d="M16 -28 Q36 -40 56 -26 M14 -18 Q36 -8 58 -18" stroke="#4CC26B" stroke-width="5" fill="none"/></g>';

export function studio() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall-warm)"/>
  <rect y="270" width="960" height="108" fill="url(#ds-panel)"/>
  <rect y="266" width="960" height="7" fill="#fff" opacity=".8"/>
  ${floor(378)}
  ${pinboard()}
  ${shelf(8, 318, 250, bookRow(15, 8, 52))}
  ${shelf(8, 364, 250, bookRow(11, 12, 42) + GLOBE)}
  ${plant(900, 372, 1.2)}`;
}
