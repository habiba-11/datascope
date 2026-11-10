// Part 59a: the Data Hub's place, a classroom (our own SVG, after
// docs/design/datascope-rooms-ui.html). Drawn on a 960 x 600 stage; the
// window and the floor are on the left, where Sara and Pip stand.
// It is a still picture: the only things that move are the dust specks
// (separate small elements, see `ambient` in js/scenes/index.js).
// Left out on purpose: the sun (Round 4 rule), a ticking clock (it looks
// like a timer), the blur filters (slow on school laptops) and the wall
// posters (they sat right behind the step bar's words).
import { floor } from './parts.js';

const NAVY = '#17324D';

function windowWithCurtains() {
  const bushes = Array.from({ length: 9 }, (_, i) => `<circle cx="${50 + i * 30}" cy="${214 + (i % 3) * 5}" r="${12 + (i % 3) * 3}" fill="#6DBB88"/>`).join('');
  return `
  <rect x="38" y="62" width="266" height="196" fill="url(#ds-win-sky)"/>
  <g fill="#fff" opacity=".9"><ellipse cx="120" cy="104" rx="35" ry="9"/><circle cx="105" cy="99" r="11"/><circle cx="123" cy="93" r="14"/></g>
  <path d="M38 210 Q100 170 170 200 T304 190 V258 H38Z" fill="#B9E3C8"/>
  <path d="M38 232 Q120 206 200 226 T304 222 V258 H38Z" fill="#8FD0A5"/>${bushes}
  <path d="M38 62 V258 M304 62 V258 M171 62 V258 M38 160 H304" stroke="#fff" stroke-width="9"/>
  <rect x="34" y="58" width="274" height="204" fill="none" stroke="#fff" stroke-width="10"/>
  <rect x="34" y="58" width="274" height="204" fill="none" stroke="${NAVY}" stroke-width="2" opacity=".15"/>
  <path d="M42 66 L120 66 L60 160Z" fill="#fff" opacity=".22"/>
  <rect x="22" y="262" width="298" height="14" rx="3" fill="url(#ds-wood-top)"/>
  <rect x="22" y="274" width="298" height="4" fill="${NAVY}" opacity=".15"/>
  <path d="M30 56 H66 Q74 150 60 262 H30Z" fill="url(#ds-curtain)"/>
  <path d="M276 56 H312 V262 H282 Q268 150 276 56Z" fill="url(#ds-curtain)"/>
  <path d="M66 150 Q80 160 66 172 M276 150 Q262 160 276 172" stroke="#FFC531" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M30 52 H312" stroke="#8C5B2D" stroke-width="7" stroke-linecap="round"/>
  <g transform="translate(236 226)">
    <path d="M0 8 L36 8 L31 36 L5 36Z" fill="#E2735A"/>
    <path d="M5 8 Q-14 -16 4 -26 Q10 -4 18 4Z M18 6 Q10 -30 30 -32 Q30 -6 22 6Z M22 6 Q36 -22 54 -14 Q44 0 24 8Z" fill="#4CC26B" stroke="#2F8A4A" stroke-width="1.4"/>
  </g>`;
}

function whiteboard() {
  const pens = [['#FF7A6B', 470], ['#38B6FF', 500], ['#4CC26B', 530], [NAVY, 560]]
    .map(([colour, x]) => `<rect x="${x}" y="258" width="22" height="8" rx="3" fill="${colour}"/>`).join('');
  return `
  <rect x="396" y="62" width="500" height="206" rx="9" fill="#C4CFDA" stroke="#8A9BAD" stroke-width="2"/>
  <rect x="404" y="70" width="484" height="190" rx="4" fill="url(#ds-board)"/>
  <path d="M420 70 L470 70 L404 190 L404 150Z" fill="#fff" opacity=".6"/>
  <path d="M700 70 L730 70 L630 260 L600 260Z" fill="#fff" opacity=".35"/>
  <rect x="440" y="266" width="420" height="10" rx="3" fill="#B0BEC9" stroke="#8A9BAD" stroke-width="1.5"/>${pens}`;
}

export function classroom() {
  return `
  <rect width="960" height="600" fill="url(#ds-wall)"/>
  <rect y="262" width="960" height="112" fill="url(#ds-wains)"/>
  <rect y="258" width="960" height="7" fill="#fff" opacity=".85"/>
  ${floor(372)}
  ${windowWithCurtains()}
  <path d="M60 262 L300 262 L690 520 L330 520Z" fill="url(#ds-beam)" opacity=".5"/>
  ${whiteboard()}`;
}
