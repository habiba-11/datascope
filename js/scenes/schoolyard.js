// Part 59g: the start page's place, the school yard (our own SVG, after
// docs/design/datascope-welcome-ui.html): sky, far hills with trees, the
// school, a fence, grass with a path and a big tree. A still picture; the
// clouds and the school flag move (separate elements, see index.js).
// Left out on purpose (Round 4 and Habiba's Part 59 rule): the sun, birds,
// the butterfly, flowers, swaying grass and tree, and the clock on the school.
import { STAGE } from './parts.js';

const NAVY = '#17324D';

// A seeded random number maker, so the picture is the same every time.
function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function farHills(random, { x0, x1 }) {
  let trees = '';
  for (let i = Math.floor(x0 / 22); i < Math.ceil(x1 / 22); i++) {
    const x = i * 22 + random() * 10;
    const y = 296 + random() * 14 - Math.sin(i / 3) * 6;
    trees += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(14 + random() * 12).toFixed(0)}" fill="url(#ds-leaf-far)"/>`;
  }
  return `<path d="M${x0} 300 H0 Q120 236 260 284 T520 266 T760 282 T960 258 H${x1} V400 H${x0}Z" fill="url(#ds-hill-far)"/>${trees}
    <rect x="${x0}" y="282" width="${x1 - x0}" height="64" fill="#fff" opacity=".2"/>`;
}

function school() {
  let windows = '';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 2; j++) {
      if (i === 2 && j === 1) continue; // the door is here
      windows += `<g transform="translate(${38 + i * 52} ${256 + j * 48})"><rect width="38" height="34" rx="3" fill="#F6ECD8"/><rect x="4" y="4" width="30" height="26" fill="url(#ds-glass)"/><path d="M19 4 V30 M4 17 H34" stroke="#F6ECD8" stroke-width="3"/><path d="M6 6 L18 6 L8 20Z" fill="#fff" opacity=".45"/></g>`;
    }
  }
  return `<g transform="translate(590 0)">
    <ellipse cx="160" cy="352" rx="170" ry="10" fill="${NAVY}" opacity=".14"/>
    <rect x="20" y="236" width="280" height="116" fill="url(#ds-brick)"/><rect x="20" y="236" width="280" height="116" fill="url(#ds-shade)" opacity=".6"/>
    <path d="M6 238 L160 176 L314 238Z" fill="url(#ds-roof)"/><path d="M6 238 L160 176 L314 238Z" fill="url(#ds-shade)" opacity=".5"/>
    <rect x="6" y="236" width="308" height="8" fill="#F6ECD8"/>
    <circle cx="160" cy="214" r="16" fill="url(#ds-glass)" stroke="#F6ECD8" stroke-width="4"/>${windows}
    <g transform="translate(138 306)"><rect width="44" height="46" rx="3" fill="#F6ECD8"/><rect x="5" y="5" width="34" height="41" fill="#3F6C9E"/><path d="M22 5 V46" stroke="#F6ECD8" stroke-width="3"/><circle cx="17" cy="28" r="2" fill="#FFC531"/><circle cx="27" cy="28" r="2" fill="#FFC531"/></g>
    <rect x="316" y="120" width="5" height="232" fill="#C9D3DC"/><circle cx="318.5" cy="118" r="5" fill="#FFC531"/></g>`;
}

function fence({ x0, x1 }) {
  let posts = '';
  for (let x = x0 - (x0 % 26 + 26) % 26; x < x1 + 20; x += 26) posts += `<path d="M${x} 400 V372 L${x + 8} 362 L${x + 16} 372 V400Z" fill="#F7E9CC" stroke="#D6BD8E" stroke-width="1.5"/>`;
  return `<rect x="${x0}" y="366" width="${x1 - x0}" height="7" fill="#E6D2AA"/><rect x="${x0}" y="386" width="${x1 - x0}" height="7" fill="#E6D2AA"/>${posts}`;
}

function grass(random, { x0, x1, y1 }) {
  let blades = '';
  const colours = ['#3F9E57', '#58B86B', '#2F8A4A', '#6BCB7A'];
  const count = Math.round(70 * (x1 - x0) / 960);
  for (let i = 0; i < count; i++) {
    const x = x0 + random() * (x1 - x0);
    const y = 404 + random() * 90;
    const h = 10 + random() * 16;
    blades += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q2 -${(h * 0.6).toFixed(0)} ${(random() * 8 - 2).toFixed(0)} -${h.toFixed(0)}" stroke="${colours[i % 4]}"/>`;
  }
  return `<path d="M${x0} 398 H0 Q240 380 480 398 T960 392 H${x1} V${y1} H${x0}Z" fill="url(#ds-grass)"/>
    <path d="M340 600 Q430 500 520 410 L590 410 Q520 510 560 600Z" fill="#EBD3A0" opacity=".85"/>
    <path d="M340 600 Q430 500 520 410" stroke="#CDB07A" stroke-width="2" fill="none" opacity=".6"/>
    <g stroke-width="2.4" fill="none" stroke-linecap="round">${blades}</g>`;
}

function bigTree() {
  const crown = [[96, 150, 62], [44, 190, 48], [150, 190, 50], [70, 230, 46], [128, 232, 46], [96, 210, 54], [34, 120, 34], [160, 120, 36], [96, 100, 40]]
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ds-leaf)"/>`).join('');
  return `<ellipse cx="96" cy="446" rx="86" ry="12" fill="${NAVY}" opacity=".16"/>
    <path d="M70 446 Q80 360 74 290 Q92 280 112 290 Q108 360 124 446Z" fill="url(#ds-trunk)"/>
    <path d="M86 300 Q70 270 56 252 M100 300 Q120 270 138 250" stroke="#6B4423" stroke-width="10" fill="none" stroke-linecap="round"/>${crown}`;
}

// `area`: the edges to draw to (STAGE, or wider in the story).
export function schoolyard(area = STAGE) {
  const { x0, x1, y0, y1 } = area;
  const random = seeded(11);
  return `
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#ds-sky)"/>
  ${farHills(random, area)}
  ${school()}
  <path d="M${x0} 346 H0 Q200 318 420 340 T960 332 H${x1} V420 H${x0}Z" fill="url(#ds-hill-mid)"/>
  ${fence(area)}
  ${grass(random, area)}
  ${bigTree()}`;
}
