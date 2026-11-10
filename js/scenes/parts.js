// Part 59: pieces that several room scenes share (on the 960 x 600 stage).
// Our own SVG, after docs/design/datascope-rooms-ui.html. Still pictures only.
const NAVY = '#17324D';
export const STEP_COLOURS = ['#FF7A6B', '#FFC531', '#38B6FF', '#4CC26B', '#A596FF'];

// A wooden floor from `top` down to the bottom, with boards that run away
// from the viewer, and a white skirting line along the wall.
export function floor(top, gradient = 'ds-floor') {
  let lines = '';
  for (let x = -400; x <= 1360; x += 96) lines += `<path d="M${x} 600 L${Math.round(480 + (x - 480) * 0.3)} ${top}"/>`;
  const boards = [24, 56, 98, 154, 218].map((dy) => `<path d="M0 ${top + dy} H960"/>`).join('');
  return `
  <rect y="${top}" width="960" height="${600 - top}" fill="url(#${gradient})"/>
  <g stroke="#8C5B2D" stroke-width="2" opacity=".24">${lines}${boards}</g>
  <rect y="${top - 6}" width="960" height="9" fill="#FFF7E6"/>
  <rect y="${top}" width="960" height="4" fill="${NAVY}" opacity=".12"/>`;
}

// A wooden shelf at (x, y), `w` wide, with `items` standing on it (drawn above y = 0).
export function shelf(x, y, w, items) {
  return `<g transform="translate(${x} ${y})">${items}
    <rect width="${w}" height="9" rx="3" fill="url(#ds-wood-top)" stroke="#8C5B2D" stroke-width="1.6"/>
    <rect x="6" y="9" width="6" height="14" fill="#8C5B2D"/><rect x="${w - 12}" y="9" width="6" height="14" fill="#8C5B2D"/></g>`;
}

// A row of `n` books standing on a shelf, starting at x0, about `h` tall.
export function bookRow(n, x0, h) {
  return Array.from({ length: n }, (_, i) => {
    const height = h - (i % 3) * 6;
    return `<rect x="${x0 + i * 15}" y="${-height}" width="13" height="${height}" rx="2" fill="${STEP_COLOURS[i % 5]}" stroke="${NAVY}" stroke-width="1.6"/><path d="M${x0 + i * 15 + 3} ${-height + 8} h7" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  }).join('');
}

// A lamp hanging from the ceiling at (x, y), with a soft cone of light.
export function lamp(x, y, colour) {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 -60 V0" stroke="#6E4524" stroke-width="3"/>
    <path d="M-40 52 L0 400 L40 52Z" fill="#FFF3B0" opacity=".13"/>
    <path d="M-26 40 Q-28 6 0 0 Q28 6 26 40Z" fill="${colour}" stroke="${NAVY}" stroke-width="2.6"/>
    <ellipse cy="44" rx="30" ry="9" fill="#FFF3B0" opacity=".9"/></g>`;
}

// A potted plant standing at (x, y), `scale` times its normal size.
export function plant(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-22 0 L22 0 L17 38 L-17 38Z" fill="#E2735A" stroke="${NAVY}" stroke-width="2.4"/>
    <rect x="-24" y="-5" width="48" height="9" rx="3" fill="#F08A7A" stroke="${NAVY}" stroke-width="2.4"/>
    <path d="M0 -5 Q-30 -30 -26 -62 Q-6 -46 0 -5Z M0 -5 Q6 -48 22 -70 Q34 -40 0 -5Z M0 -5 Q-4 -40 4 -76 Q20 -40 0 -5Z" fill="url(#ds-leaf)" stroke="#2F8A4A" stroke-width="1.6"/></g>`;
}
