// Part 59b: the Number Lab's place, a maths workshop (our own SVG, after
// docs/design/datascope-rooms-ui.html): a chalkboard, a shelf of building
// blocks, an abacus and a plant. A still picture; only chalk dust moves.
// No digits or maths words anywhere (Part 51: the games scenario visits this
// room too, and never talks about numbers), so the chalkboard shows a drawn
// bar chart and a ruler, and the blocks have dots.
import { floor, shelf, plant, STEP_COLOURS } from './parts.js';

const NAVY = '#17324D';

// The chalkboard sits high on the left wall, above Sara and Pip: a bar chart,
// a wave, a pie chart and a ruler, drawn in chalk.
function chalkboard() {
  const bars = [[34, 40], [62, 70], [90, 98], [118, 58]]
    .map(([x, h]) => `<rect x="${x}" y="${128 - h}" width="20" height="${h}" rx="2"/>`).join('');
  const ticks = Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 20} 142 v${i % 2 ? 5 : 9}"/>`).join('');
  return `<g transform="translate(6 112)">
    <rect width="246" height="168" rx="6" fill="#8C5B2D" stroke="#6B4423" stroke-width="3"/>
    <rect x="9" y="9" width="228" height="150" rx="3" fill="#2F5A4C"/>
    <rect x="9" y="9" width="228" height="150" fill="url(#ds-shade)" opacity=".6"/>
    <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85">
      <path d="M28 28 V130 H150"/>${bars}
      <path d="M168 50 q14 -10 26 0 t26 0"/>
      <circle cx="190" cy="98" r="18"/><path d="M190 80 V98 H208"/>
    </g>
    <g stroke="#FFE27A" stroke-width="2.4" stroke-linecap="round" opacity=".9">
      <path d="M36 138 H212" stroke-width="3"/>${ticks}
    </g>
    <rect x="190" y="150" width="30" height="8" rx="2" fill="#fff"/></g>`;
}

// Building blocks with 1 to 3 dots (dots, not digits).
function blocks() {
  const dots = (n) => [[11, 13], [6, 8], [16, 18]].slice(0, n).map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#fff"/>`).join('');
  return Array.from({ length: 9 }, (_, i) => `<g transform="translate(${10 + i * 25} -26)">
    <rect width="22" height="26" rx="4" fill="${STEP_COLOURS[i % 5]}" stroke="${NAVY}" stroke-width="2"/>${dots((i % 3) + 1)}</g>`).join('');
}

function abacus() {
  const rods = STEP_COLOURS.map((colour, i) => {
    const beads = Array.from({ length: i % 2 ? 6 : 4 }, (_, j) => `<circle cx="${14 + i * 40}" cy="${-12 - j * 4.5}" r="5" fill="${colour}" stroke="${NAVY}" stroke-width="1.4"/>`).join('');
    return `<path d="M${14 + i * 40} -34 V-6" stroke="#8C5B2D" stroke-width="3"/>${beads}`;
  }).join('');
  return `<g transform="translate(20 0)"><rect y="-34" width="200" height="6" rx="3" fill="#8C5B2D"/>${rods}</g>`;
}

export function workshop() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall-blue)"/>
  <rect y="270" width="960" height="108" fill="url(#ds-panel)"/>
  <rect y="266" width="960" height="7" fill="#fff" opacity=".8"/>
  ${floor(378)}
  ${chalkboard()}
  ${shelf(8, 318, 240, blocks())}
  ${shelf(8, 364, 240, abacus())}
  ${plant(900, 372, 1.1)}`;
}
