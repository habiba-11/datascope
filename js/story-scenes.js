// Shell layer: the pictures of the story's 7 scenes. Part 59s (10 Nov 2026,
// Habiba): the look of docs/design/datascope-story-ui-v2.html, with the same
// 7 scenes and words (data/content/story.json). Each scene has a PLACE (the
// school yard or the classroom of the rooms, js/scenes/) drawn on the stage,
// so the props sit where they should (the graph on the whiteboard), and drawn
// wider than the stage, so it reaches the edges of any window.
// A part marked data-line="n" shows from line n on, and data-before="n" only
// before line n (js/story.js), so things pop in as the story goes on.
// data-says="n" marks the classmates who talk on line n (their mouths move).
// The motions are in css/story.css ("st-" names); reduced motion stops them.
// Changed from v2, on purpose: no sun, birds, flowers or butterfly (Round 4);
// no slow camera push-in and no film grain (Part 59 motion and speed rules);
// no class size ("a pretend class", Habiba 6 Nov 2026); the graph keeps the
// story's numbers, so "the centre number is 9" stays true.
// Our own drawings only: no child text ever goes through here.
import { pipSVG } from './pip.js';
import { saraSVG, kidSVG, KIDS } from './characters.js';
import { classroom } from './scenes/classroom.js';
import { schoolyard } from './scenes/schoolyard.js';
import { ambientStyle } from './scenes/index.js';

const NAVY = '#17324D';

// The place is drawn wider and taller than the 960 x 600 stage.
export const PLACE_AREA = { x0: -420, x1: 1380, y0: -440, y1: 1040 };
const OUTDOOR = new Set(['ask', 'plan', 'mission']);

// The scene's place, with what moves in it outdoors: two clouds and the school flag.
const CLOUD = '<svg viewBox="-90 -40 180 85" aria-hidden="true" focusable="false"><ellipse cx="0" cy="30" rx="84" ry="12" fill="#B9D2E8" opacity=".45"/><g fill="url(#ds-cloud)"><ellipse cx="0" cy="18" rx="72" ry="20"/><circle cx="-36" cy="10" r="24"/><circle cx="0" cy="-5" r="33"/><circle cx="38" cy="8" r="27"/><circle cx="64" cy="17" r="16"/></g></svg>';
const FLAG = '<svg viewBox="0 -4 48 38" aria-hidden="true" focusable="false"><path d="M0 6 Q24 -4 47 6 V32 Q24 22 0 32Z" fill="#4CC26B"/><circle cx="23" cy="18" r="6" fill="#fff" opacity=".85"/></svg>';
export function placeHTML(id) {
  const { x0, x1, y0, y1 } = PLACE_AREA;
  const outdoor = OUTDOOR.has(id);
  const picture = outdoor ? schoolyard(PLACE_AREA) : classroom(PLACE_AREA);
  const moving = outdoor ? [
    `<span class="scene-cloud" style="${ambientStyle({ kind: 'cloud', x: 10, y: 6, w: 16, seconds: 120, delay: -30 })}">${CLOUD}</span>`,
    `<span class="scene-cloud" style="${ambientStyle({ kind: 'cloud', x: 60, y: 16, w: 11, seconds: 170, delay: -110 })}">${CLOUD}</span>`,
    `<span class="scene-banner" style="${ambientStyle({ kind: 'banner', x: 94.9, y: 18.8, w: 4.9, seconds: 2.2, delay: 0 })}">${FLAG}</span>`,
  ].join('') : '';
  return `<svg class="st-place-picture" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" style="left: ${x0}px; top: ${y0}px; width: ${x1 - x0}px; height: ${y1 - y0}px" aria-hidden="true" focusable="false">${picture}</svg>
    <div class="st-place-moving" aria-hidden="true">${moving}</div>`;
}

// ---------- small helpers ----------
const at = (left, top, width, html, extra = '') => `<div class="st-char" style="left: ${left}px; top: ${top}px; width: ${width}px"${extra}>${html}</div>`;
const part = (attrs, html) => `<div class="st-part" ${attrs}>${html}</div>`;
const svg = (inner) => `<svg class="st-props" width="960" height="600" viewBox="0 0 960 600" aria-hidden="true" focusable="false">${inner}</svg>`;
const T = (x, y, size, fill, text, anchor = 'middle', font = "'Baloo 2', sans-serif") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-weight="700" font-size="${size}" fill="${fill}">${text}</text>`;
const pop = (html, delay = 0) => `<g class="st-pop" style="animation-delay: ${delay}s">${html}</g>`;

// Sara (200 x 340) at a size; Pip (120 x 132); a classmate (120 x 170).
const sara = (mood, left, scale = 0.9) => at(left, 436 - 340 * scale, 200 * scale, saraSVG(mood, { story: true }));
const pip = (left, width = 140, cheer = false) => at(left, 436 - width * 1.1, width, cheer ? pipSVG().replace('pip--happy', 'pip--cheer') : pipSVG());
const DESK_X = [480, 600, 720, 840];
const kid = (i, mood, says = '') => at(DESK_X[i] - 63, 190, 126, kidSVG(i, mood, { delay: i * 0.6 }), says ? ` data-says="${says}"` : '');

// Four school desks in front of the classmates.
const desks = () => svg(DESK_X.map((cx, i) => `
  <ellipse cx="${cx}" cy="446" rx="66" ry="8" fill="${NAVY}" opacity=".16"/>
  <rect x="${cx - 54}" y="392" width="7" height="50" fill="#8C5B2D"/><rect x="${cx + 47}" y="392" width="7" height="50" fill="#8C5B2D"/>
  <path d="M${cx - 54} 350 H${cx + 54} L${cx + 62} 386 H${cx - 62}Z" fill="url(#ds-wood-top)" stroke="#8C5B2D" stroke-width="2"/>
  <path d="M${cx - 50} 354 H${cx - 8} L${cx - 14} 372 H${cx - 56}Z" fill="#fff" opacity=".28"/>
  <rect x="${cx - 62}" y="386" width="124" height="12" rx="2" fill="#A86F3B"/>
  ${i % 2 ? `<rect x="${cx + 14}" y="358" width="34" height="18" rx="3" fill="#fff" stroke="#9AA9B8" stroke-width="1.6" transform="rotate(-6 ${cx + 30} 367)"/>` : `<rect x="${cx - 46}" y="360" width="30" height="14" rx="5" fill="#FF7A6B" stroke="${NAVY}" stroke-width="2"/><path d="M${cx - 8} 372 L${cx + 14} 360" stroke="#FFC531" stroke-width="4" stroke-linecap="round"/>`}`).join(''));

// A speech bubble over a classmate.
const bubble = (i, width, text, delay = 0) => `<div class="st-bubble" style="left: ${DESK_X[i] - width / 2}px; top: 128px; width: ${width}px; animation-delay: ${delay}s">${text}</div>`;

// A card with a coloured top: a title and a big number.
const numCard = (x, y, colour, title, value, delay = 0) => pop(`<g transform="translate(${x} ${y})">
  <rect x="3" y="6" width="124" height="118" rx="14" fill="${NAVY}" opacity=".18"/>
  <rect width="124" height="118" rx="14" fill="#fff" stroke="${NAVY}" stroke-width="3.4"/>
  <path d="M0 22 a14 14 0 0 1 14 -14 H110 a14 14 0 0 1 14 14 V34 H0Z" fill="${colour}" stroke="${NAVY}" stroke-width="3.4" stroke-linejoin="round"/>
  ${T(62, 29, 15, NAVY, title)}${T(62, 98, 46, NAVY, value)}</g>`, delay);

// A die, drawn in 3D, that rolls in.
const DIE = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><ellipse cx="32" cy="58" rx="22" ry="4" fill="${NAVY}" opacity=".25"/>
  <path d="M32 6 L54 18 L32 30 L10 18Z" fill="#FFC1B6" stroke="${NAVY}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M10 18 L32 30 L32 54 L10 42Z" fill="#FF7A6B" stroke="${NAVY}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M54 18 L32 30 L32 54 L54 42Z" fill="#C94A3D" stroke="${NAVY}" stroke-width="2.6" stroke-linejoin="round"/>
  <g fill="${NAVY}"><g transform="matrix(22 -12 22 12 10 18)"><ellipse cx=".27" cy=".27" rx=".085" ry=".085"/><ellipse cx=".73" cy=".27" rx=".085" ry=".085"/><ellipse cx=".5" cy=".5" rx=".085" ry=".085"/><ellipse cx=".27" cy=".73" rx=".085" ry=".085"/><ellipse cx=".73" cy=".73" rx=".085" ry=".085"/></g>
  <g transform="matrix(22 12 0 24 10 18)"><ellipse cx=".3" cy=".28" rx=".09" ry=".085"/><ellipse cx=".7" cy=".28" rx=".09" ry=".085"/><ellipse cx=".3" cy=".72" rx=".09" ry=".085"/><ellipse cx=".7" cy=".72" rx=".09" ry=".085"/></g>
  <g transform="matrix(22 -12 0 24 32 30)"><ellipse cx=".3" cy=".3" rx=".09" ry=".085"/><ellipse cx=".5" cy=".5" rx=".09" ry=".085"/><ellipse cx=".7" cy=".7" rx=".09" ry=".085"/></g></g></svg>`;

// The story's graph (the same numbers as before: the centre number is 9).
// 11 Nov 2026 (Habiba: "they overlap"): 13 px per kid (was 15), so "6 kids"
// fits inside the green box; the hour labels sit lower, under the box.
const PX_PER_KID = 13;
const BARS = [[3, 1, '#FF7A6B'], [7, 2, '#38B6FF'], [8, 5, '#4CC26B'], [9, 6, '#4CC26B'], [10, 3, '#38B6FF']];
function graph() {
  const bars = BARS.map(([hours, kids, colour], i) => {
    const x = 452 + i * 84;
    const h = kids * PX_PER_KID;
    return `<g transform="translate(${x} ${222 - h})"><rect class="st-bar" style="animation-delay: ${0.3 + i * 0.12}s" width="52" height="${h}" rx="6" fill="${colour}" stroke="${NAVY}" stroke-width="2.6"/></g>
      ${T(x + 26, 214 - h, 16, NAVY, `${kids} ${kids === 1 ? 'kid' : 'kids'}`, 'middle', "'Nunito', sans-serif")}
      ${T(x + 26, 248, 16, NAVY, `${hours} hours`, 'middle', "'Nunito', sans-serif")}`;
  }).join('');
  return `
    <rect x="430" y="74" width="196" height="28" rx="14" fill="#D3EEFF" stroke="${NAVY}" stroke-width="2.6"/>${T(528, 94, 15, NAVY, 'WHAT: hours of sleep', 'middle', "'Nunito', sans-serif")}
    <rect x="640" y="74" width="160" height="28" rx="14" fill="#FFF0C2" stroke="${NAVY}" stroke-width="2.6"/>${T(720, 94, 15, NAVY, 'HOW MANY: kids', 'middle', "'Nunito', sans-serif")}
    <path d="M440 222 H872" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>${bars}`;
}

const SCENES = {
  // Pip says hello; Sara wonders, and a thought bubble with a "?" pops up.
  ask: () => `
    ${pip(70)}
    ${part('data-before="1"', sara('clip', 410))}
    ${part('data-line="1"', sara('think', 410))}
    ${part('data-line="1"', svg(pop(`<g transform="translate(640 98)">
      <circle cx="-78" cy="104" r="7" fill="#fff" stroke="${NAVY}" stroke-width="3"/><circle cx="-60" cy="78" r="11" fill="#fff" stroke="${NAVY}" stroke-width="3"/>
      <ellipse cx="0" cy="26" rx="82" ry="52" fill="#fff" stroke="${NAVY}" stroke-width="3.4"/>${T(0, 54, 66, '#FF7A6B', '?')}</g>`)))}`,

  // Sara writes her guess on a sticky note; then Pip and a big green tick.
  plan: () => `
    ${sara('write', 330)}
    ${svg(pop(`<g transform="translate(600 150) rotate(-4)">
      <rect x="5" y="8" width="230" height="130" rx="8" fill="${NAVY}" opacity=".16"/>
      <rect width="230" height="130" rx="8" fill="#FFE27A" stroke="#C99A1A" stroke-width="2.4"/>
      <path d="M0 100 Q115 112 230 100 V130 H0Z" fill="#F7CF4D" opacity=".6"/>
      <rect x="85" y="-10" width="60" height="22" rx="3" fill="#fff" opacity=".7" transform="rotate(-2 115 0)"/>
      ${T(115, 44, 22, '#7A5A10', 'My guess')}${T(86, 100, 54, NAVY, '8')}${T(150, 100, 26, NAVY, 'hours')}
      <g transform="translate(196 54)"><path d="M0 0 A18 18 0 1 0 20 26 A14 14 0 1 1 0 0Z" fill="#fff" stroke="#C99A1A" stroke-width="2"/></g></g>`))}
    ${part('data-line="1"', pip(110))}
    ${part('data-line="1"', svg(pop(`<g transform="translate(800 150)"><circle r="24" fill="#4CC26B" stroke="${NAVY}" stroke-width="3.4"/><path d="M-11 0 l8 9 l16 -18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`)))}`,

  // Four classmates behind their desks answer; one is sleepy. Then their
  // answers become four DATA cards, and Pip comes in.
  collect: () => `
    ${sara('clip', 110, 0.85)}
    ${kid(0, 'idle', '1')}${kid(1, 'idle', '1')}${kid(2, 'idle', '2')}
    ${part('data-before="2"', kid(3, 'idle'))}
    ${part('data-line="2"', kid(3, 'sleepy', '2'))}
    ${desks()}
    ${part('data-line="1" data-before="3"', bubble(0, 96, 'Nine!') + bubble(1, 104, 'Eight!', 0.4))}
    ${part('data-line="2" data-before="3"', bubble(2, 90, 'Ten!') + bubble(3, 128, 'Only 3...', 0.4))}
    ${part('data-line="3"', svg(`${pop(T(660, 108, 32, '#217A3B', 'DATA'))}${[9, 8, 10, 3].map((v, i) => pop(`<g transform="translate(${434 + i * 112} 128)">
      <rect x="3" y="6" width="92" height="96" rx="12" fill="${NAVY}" opacity=".16"/><rect width="92" height="96" rx="12" fill="#fff" stroke="${NAVY}" stroke-width="3.2"/>
      <rect width="92" height="26" rx="12" fill="${KIDS[i].shirt}" stroke="${NAVY}" stroke-width="3.2"/>${T(46, 64, 40, NAVY, v)}${T(46, 88, 15, '#4A6580', 'hours')}</g>`, i * 0.15)).join('')}`) + pip(300, 110))}`,

  // Sara points at the graph on the whiteboard; then "Most kids!" and "Only 1!"; then Pip.
  graph: () => `
    ${sara('point', 150, 0.85)}
    ${svg(graph())}
    ${part('data-line="1"', svg(pop(`<rect x="610" y="112" width="156" height="116" rx="14" fill="none" stroke="#217A3B" stroke-width="3.4" stroke-dasharray="9 7"/>
      <g transform="translate(688 294)"><rect x="-56" y="-14" width="112" height="28" rx="14" fill="#217A3B" stroke="${NAVY}" stroke-width="3"/>${T(0, 6, 17, '#fff', 'Most kids!')}</g>
      <g transform="translate(478 160)"><rect x="-46" y="-14" width="92" height="28" rx="14" fill="#FF7A6B" stroke="${NAVY}" stroke-width="3"/>${T(0, 6, 17, NAVY, 'Only 1!')}</g>`)))}
    ${part('data-line="2"', pip(800, 120))}`,

  // The centre number and the mean; then Sara's guess; then how sure, and a die rolls.
  // (11 Nov 2026: the how-sure bar and its words sit higher, off the marker tray.)
  numbers: () => `
    ${part('data-before="1"', sara('point', 150, 0.85))}
    ${part('data-line="1"', sara('think', 150, 0.85))}
    ${svg(numCard(416, 82, '#FFC531', 'Centre number', '9', 0.1) + numCard(552, 82, '#38B6FF', 'Mean', '7.8', 0.3))}
    ${part('data-line="1"', svg(numCard(688, 82, '#A596FF', "Sara's guess", '8')))}
    ${part('data-line="1"', pip(800, 120))}
    ${part('data-line="2"', svg(pop(`<g transform="translate(430 214)">
      <rect width="430" height="14" rx="7" fill="#E1EEF8" stroke="${NAVY}" stroke-width="2.6"/><rect width="300" height="14" rx="7" fill="#4CC26B" opacity=".9"/>
      <circle cx="300" cy="7" r="11" fill="#fff" stroke="${NAVY}" stroke-width="3.4"/>
      ${T(0, 32, 15, '#4A6580', 'Not sure', 'start', "'Nunito', sans-serif")}${T(430, 32, 15, '#4A6580', 'Very sure', 'end', "'Nunito', sans-serif")}</g>`)) + '<div class="st-die"><div class="st-die-roll">' + DIE + '</div></div>')}`,

  // The Evidence Card; then the LIKELY! stamp; then the class claps under confetti.
  conclude: () => `
    ${part('data-before="2"', sara('write', 110, 0.85))}
    ${part('data-line="2"', sara('cheer', 110, 0.85))}
    ${part('data-line="2"', DESK_X.map((_, i) => kid(i, 'clap', '2')).join('') + desks())}
    ${svg(pop(`<g transform="translate(424 70)">
      <rect x="4" y="8" width="448" height="124" rx="14" fill="${NAVY}" opacity=".18"/>
      <rect width="448" height="124" rx="14" fill="#fff" stroke="${NAVY}" stroke-width="3.4"/>
      <path d="M0 28 a14 14 0 0 1 14 -14 H434 a14 14 0 0 1 14 14 V38 H0Z" fill="#A596FF" stroke="${NAVY}" stroke-width="3.4" stroke-linejoin="round"/>
      ${T(224, 33, 20, '#fff', 'EVIDENCE CARD')}
      ${T(20, 70, 18, NAVY, 'Claim: most kids sleep 8 to 9 hours.', 'start', "'Nunito', sans-serif")}
      ${T(20, 102, 18, NAVY, 'Proof: the centre number is 9.', 'start', "'Nunito', sans-serif")}</g>`))}
    ${part('data-line="1"', svg(`<g transform="translate(804 174)"><g class="st-stamp-in"><rect x="-62" y="-20" width="124" height="40" rx="9" fill="#fff" fill-opacity=".92" stroke="#217A3B" stroke-width="4"/>${T(0, 9, 28, '#217A3B', 'LIKELY!')}</g></g>`))}
    ${part('data-line="2"', svg(`<g>${Array.from({ length: 24 }, (_, i) => `<rect class="st-confetti" x="${(i * 41 + 17) % 940}" y="-30" width="${8 + (i % 3) * 3}" height="${12 + (i % 4) * 2}" rx="2" fill="${KIDS[i % 4].shirt}" style="animation-delay: -${(i * 0.37) % 3.6}s; animation-duration: ${3 + (i % 5) * 0.4}s"/>`).join('')}</g>`))}`,

  // From here on the child is the investigator, so Sara is gone and Pip is the
  // main character, big (Habiba, 10 Nov 2026). The pretend class (no number);
  // then "Your mission!" and Pip cheers.
  mission: () => `
    ${part('data-before="2"', pip(170, 260))}
    ${part('data-line="2"', pip(170, 260, true))}
    ${part('data-line="1"', svg(pop(`<g transform="translate(590 76)">
      <rect x="5" y="8" width="270" height="214" rx="18" fill="${NAVY}" opacity=".2"/>
      <rect width="270" height="214" rx="18" fill="#fff" fill-opacity=".95" stroke="${NAVY}" stroke-width="3.6"/>
      ${T(135, 36, 22, NAVY, 'A pretend class')}
      ${Array.from({ length: 15 }, (_, i) => {
        const k = KIDS[i % 4];
        return `<g transform="translate(${43 + (i % 5) * 46} ${76 + Math.floor(i / 5) * 46})"><ellipse cy="12" rx="17" ry="10" fill="${k.shirt}" stroke="${NAVY}" stroke-width="2.4"/><circle r="14" fill="${k.skin}" stroke="${NAVY}" stroke-width="2.4"/><path d="M-14 -3 Q0 -20 14 -3 Q0 -9 -14 -3Z" fill="${k.hair}"/><circle cx="-5" cy="2" r="1.8" fill="${NAVY}"/><circle cx="5" cy="2" r="1.8" fill="${NAVY}"/><path d="M-5 7 Q0 11 5 7" stroke="${NAVY}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
      }).join('')}</g>`)))}
    ${part('data-line="2"', svg(pop(`<g transform="translate(590 318)">
      <rect x="4" y="6" width="270" height="68" rx="20" fill="${NAVY}" opacity=".2"/>
      <rect width="270" height="68" rx="20" fill="#217A3B" stroke="${NAVY}" stroke-width="3.6"/>
      ${T(146, 45, 30, '#fff', 'Your mission!')}
      <path d="M26 34 l4 -12 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4Z" fill="#FFC531" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/></g>`)))}`,
};

// The scene's people and props (its place is drawn by placeHTML).
export function sceneHTML(id) {
  return SCENES[id]();
}
