// Part 59e: the Chance Lab's place, a funfair tent (our own SVG, after
// docs/design/datascope-rooms-ui.html): striped canvas, a scalloped edge,
// bunting, a prize shelf with balls and dice, and a striped pole. A still
// picture; only the small flag on the pole waves (see `ambient` in index.js).
import { floor, STEP_COLOURS } from './parts.js';

const NAVY = '#17324D';

// Coral and cream stripes that narrow towards the back of the tent.
function canvas() {
  const stripes = Array.from({ length: 12 }, (_, i) => {
    const left = i * 80;
    const far = (x) => Math.round(480 + (x - 480) * 0.75);
    return `<path d="M${left} 0 H${left + 80} L${far(left + 80)} 330 H${far(left)}Z" fill="${i % 2 ? '#FF7A6B' : '#FFF3E0'}"/>`;
  }).join('');
  let scallops = 'M0 330';
  for (let x = 0; x < 960; x += 80) scallops += ` Q${x + 40} 372 ${x + 80} 330`;
  return `${stripes}<rect width="960" height="330" fill="url(#ds-shade)" opacity=".35"/>
    <path d="${scallops} V320 H0Z" fill="#FFC531" stroke="${NAVY}" stroke-width="2.4"/>`;
}

// A string of little flags across the tent.
function bunting() {
  const flags = Array.from({ length: 16 }, (_, i) => `<path transform="translate(${20 + i * 60} ${Math.round(150 + Math.sin(i * 0.9) * 10)})" d="M-14 0 L14 0 L0 28Z" fill="${STEP_COLOURS[i % 5]}" stroke="${NAVY}" stroke-width="2"/>`).join('');
  return `<path d="M0 150 Q480 194 960 150" stroke="${NAVY}" stroke-width="2" fill="none" opacity=".5"/>${flags}`;
}

// Prizes: five balls on the top shelf, four dice below.
function prizeShelf() {
  const balls = STEP_COLOURS.map((colour, i) => `<g transform="translate(${34 + i * 38} 54)"><circle r="15" fill="${colour}" stroke="${NAVY}" stroke-width="2.4"/><circle cx="-5" cy="-5" r="4" fill="#fff" opacity=".6"/></g>`).join('');
  const dice = Array.from({ length: 4 }, (_, i) => `<g transform="translate(${52 + i * 40} 98) rotate(${i * 14})"><rect x="-13" y="-13" width="26" height="26" rx="5" fill="#fff" stroke="${NAVY}" stroke-width="2.4"/><circle r="3" fill="${NAVY}"/></g>`).join('');
  const boards = [0, 1, 2].map((i) => `<rect x="12" y="${14 + i * 40}" width="186" height="8" fill="#8C5B2D" opacity=".5"/>`).join('');
  return `<g transform="translate(34 232)"><rect width="210" height="140" rx="8" fill="url(#ds-wood-top)" stroke="#8C5B2D" stroke-width="3"/>${boards}${balls}${dice}</g>`;
}

// A red and white striped pole; the waving flag sits on its top.
function pole() {
  const stripes = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="-6" y="${-150 + i * 25}" width="12" height="12" fill="#FF7A6B"/>`).join('');
  return `<g transform="translate(16 372)"><rect x="-6" y="-150" width="12" height="150" rx="5" fill="#fff" stroke="${NAVY}" stroke-width="2.4"/>${stripes}<circle cy="-156" r="8" fill="#FFC531" stroke="${NAVY}" stroke-width="2.4"/></g>`;
}

export function funfair() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall-tent)"/>
  ${canvas()}
  ${floor(372, 'ds-floor-sand')}
  ${bunting()}
  ${prizeShelf()}
  ${pole()}`;
}
