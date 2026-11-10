/* DataScope illustrations: colourful 3D-style inline SVG, replaces every keyboard emoji.
   (Separate from the line icons in js/icons.js, which stay as they are.)
   Style: Explorer's Toolkit, now with volume: soft gradients, a bright top-left light, darker bottom-right,
   glossy highlights, bevelled edges, extruded sides on blocky shapes, and a soft floor shadow under every icon.
   Navy outline (#17324D) keeps them in the same family as Pip.
   Usage: illustration('trophy', { size: 64, label: 'Trophy' })  -> returns an SVG string.
   Every icon MOVES (idle animation, playful faces on some, hover jump). Options: { animate:false } keeps it still.
   No label  -> decorative (aria-hidden). With label -> role="img" + aria-label.
   Gradient ids are made unique per icon instance (the "~" in the source), so many icons can share one page. */
import { FLAT_STANDINS } from './illustrations-flat.js';
const O = '#17324D';
const N = O;
const ln = (w = 2.6) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const st = (a) => a.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('');
const LG = (id, a, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="~${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(a)}</linearGradient>`;
const RG = (id, a, cx = 0.35, cy = 0.3, r = 0.8) => `<radialGradient id="~${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}">${st(a)}</radialGradient>`;
const U = (id) => `url(#~${id})`;
const shine = (cx, cy, rx, ry, rot, op = 0.8) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" fill-opacity="${op}"/>`;
const GOLD = [[0, '#FFF3A6'], [0.45, '#FFC531'], [1, '#D9860B']];
const METAL_H = [[0, '#FFFFFF'], [0.3, '#DCE6EF'], [0.7, '#A9B9C9'], [1, '#7C8FA3']];
const marble = (id, l, m, d) => RG(id, [[0, l], [0.5, m], [1, d]], 0.35, 0.3, 0.75);
const STAR = 'M32 5 L39.5 22 L58 23.8 L44 36 L48.2 54 L32 44.6 L15.8 54 L20 36 L6 23.8 L24.5 22Z';
const HEART = 'M32 56 C10 40 5 28 8 20 C11 11 22 8 29 16 Q32 19 32 19 Q32 19 35 16 C42 8 53 11 56 20 C59 28 54 40 32 56Z';

const ILLUSTRATIONS = {
die: `<defs>${LG('t', [[0, '#FFD0C7'], [1, '#FF9A8B']], 0, 0, 1, 1)}${LG('l', [[0, '#FF8B7B'], [1, '#F2604F']])}${LG('r', [[0, '#DB5545'], [1, '#B63A2C']])}</defs>
<path d="M32 6 L54 18 L32 30 L10 18Z" fill="${U('t')}" ${ln()}/><path d="M10 18 L32 30 L32 54 L10 42Z" fill="${U('l')}" ${ln()}/><path d="M54 18 L32 30 L32 54 L54 42Z" fill="${U('r')}" ${ln()}/>
<path d="M12 18.6 L32 30 M32 31 V52" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.8" stroke-linecap="round"/>
<g fill="${O}"><g transform="matrix(22 -12 22 12 10 18)"><ellipse cx=".27" cy=".27" rx=".085" ry=".085"/><ellipse cx=".73" cy=".27" rx=".085" ry=".085"/><ellipse cx=".5" cy=".5" rx=".085" ry=".085"/><ellipse cx=".27" cy=".73" rx=".085" ry=".085"/><ellipse cx=".73" cy=".73" rx=".085" ry=".085"/></g>
<g transform="matrix(22 12 0 24 10 18)"><ellipse cx=".3" cy=".28" rx=".09" ry=".085"/><ellipse cx=".7" cy=".28" rx=".09" ry=".085"/><ellipse cx=".3" cy=".72" rx=".09" ry=".085"/><ellipse cx=".7" cy=".72" rx=".09" ry=".085"/></g>
<g transform="matrix(22 -12 0 24 32 30)"><ellipse cx=".3" cy=".3" rx=".09" ry=".085"/><ellipse cx=".5" cy=".5" rx=".09" ry=".085"/><ellipse cx=".7" cy=".7" rx=".09" ry=".085"/></g></g>`,
trophy: `<defs>${LG('cup', [[0, '#FFE98A'], [0.3, '#FFC531'], [0.75, '#E69A12'], [1, '#C0700A']], 0, 0, 1, 0)}${LG('base', [[0, '#3E6A95'], [1, '#17324D']])}${LG('stem', METAL_H.map(x => [x[0], x[0] < 0.5 ? '#FFD96B' : '#D68A0B']), 0, 0, 1, 0)}</defs>
<path d="M16 12 H8 Q6 28 22 34" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 12 H8 Q6 28 22 34" fill="none" stroke="#FFC531" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M48 12 H56 Q58 28 42 34" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M48 12 H56 Q58 28 42 34" fill="none" stroke="#E69A12" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28 40 H36 V50 H28Z" fill="${U('stem')}" ${ln()}/>
<path d="M14 9 H50 V24 Q50 40 32 43 Q14 40 14 24Z" fill="${U('cup')}" ${ln()}/><ellipse cx="32" cy="9" rx="18" ry="4" fill="#FFF1A8" ${ln()}/><ellipse cx="32" cy="9.6" rx="14" ry="2.4" fill="#C0700A" fill-opacity=".45"/>
<path d="M20 17 V25 Q20 33 26 37" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3.6" stroke-linecap="round"/>
<path d="M32 17 L34.4 22 L39.8 22.7 L35.8 26.4 L36.9 31.8 L32 29.1 L27.1 31.8 L28.2 26.4 L24.2 22.7 L29.6 22Z" fill="#fff" stroke="#C0700A" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M15 56 V51 Q15 48.5 18 48.5 H46 Q49 48.5 49 51 V56Z" fill="${U('base')}" ${ln()}/><path d="M17 51 H47" stroke="#8FB4D8" stroke-width="2" stroke-linecap="round"/><rect x="26" y="51.5" width="12" height="3.2" rx="1.2" fill="#FFC531"/>`,
star: `<defs>${RG('s', [[0, '#FFF7BE'], [0.45, '#FFC531'], [1, '#DE8D0F']], 0.38, 0.3, 0.8)}${RG('h', [[0, '#FFFFFF', 0.85], [1, '#FFF1A6', 0]], 0.4, 0.3, 0.7)}</defs>
<path d="${STAR}" fill="${U('s')}" ${ln(2.8)}/><path d="${STAR}" fill="${U('h')}" transform="translate(32 33) scale(.7) translate(-32 -33)"/>
<path d="M44 36 L48.2 54 L32 44.6 L36 38Z" fill="#B8650A" fill-opacity=".28"/><path d="M32 44.6 L15.8 54 L20 36 L26 40Z" fill="#B8650A" fill-opacity=".16"/>${shine(24, 19, 5, 2.4, -38, 0.9)}<circle cx="16.5" cy="26.5" r="1.4" fill="#fff" fill-opacity=".9"/>`,
medal: `<defs>${LG('ra', [[0, '#FF9A8B'], [1, '#E0503F']], 0, 0, 1, 0)}${LG('rb', [[0, '#7FD0FF'], [1, '#1F8FD0']], 0, 0, 1, 0)}${RG('d', GOLD, 0.35, 0.28, 0.85)}${LG('e', [[0, '#D9860B'], [1, '#FFE98A']], 0, 0, 1, 1)}</defs>
<path d="M15 3 L29 28 H40 L26 3Z" fill="${U('ra')}" ${ln()}/><path d="M49 3 L35 28 H24 L38 3Z" fill="${U('rb')}" ${ln()}/><path d="M22 14 L27 23" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="32" cy="58" rx="12" ry="2" fill="none"/><circle cx="32" cy="41" r="18" fill="#B8650A" ${ln()}/><circle cx="32" cy="39" r="18" fill="${U('d')}" ${ln()}/><circle cx="32" cy="39" r="12" fill="${U('e')}" stroke="#C0700A" stroke-width="2"/>
<path d="M32 31 L34.4 36.6 L40.5 37.2 L35.9 41.2 L37.3 47.2 L32 44 L26.7 47.2 L28.1 41.2 L23.5 37.2 L29.6 36.6Z" fill="#FFD84A" stroke="#C0700A" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M19 33 Q21 26 28 23" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.2" stroke-linecap="round"/>`,
magnifier: `<defs>${LG('rim', [[0, '#FFFFFF'], [0.4, '#D5E0EA'], [1, '#8497AB']], 0, 0, 1, 1)}${RG('gl', [[0, '#F2FBFF'], [0.55, '#A8E0FF'], [1, '#4FB8F0']], 0.35, 0.3, 0.8)}</defs>
<path d="M41 41 L56 56" stroke="${O}" stroke-width="12" stroke-linecap="round"/><path d="M41 41 L56 56" stroke="#9A5F26" stroke-width="8.2" stroke-linecap="round"/><path d="M40 40.5 L55 55.5" stroke="#D9A45A" stroke-width="3" stroke-linecap="round" transform="translate(-1.2 -1.2)"/><path d="M45 44 L48 47" stroke="#C9D6E2" stroke-width="9" stroke-linecap="round"/><path d="M45 44 L48 47" stroke="${O}" stroke-width="1.4" transform="translate(0 4.2)"/>
<circle cx="26" cy="26" r="21" fill="${U('rim')}" ${ln()}/><circle cx="26" cy="26" r="15.5" fill="${U('gl')}" ${ln(2.2)}/>${shine(19, 18, 7, 3.4, -42, 0.85)}<circle cx="34" cy="35" r="1.7" fill="#fff" fill-opacity=".8"/><path d="M33 20 Q37 22 38 27" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`,
clipboard: `<defs>${LG('bd', [[0, '#E9BE7C'], [1, '#B2792B']], 0, 0, 1, 1)}${LG('pp', [[0, '#FFFFFF'], [1, '#DDE8F2']])}${LG('cl', METAL_H, 0, 0, 1, 0)}</defs>
<rect x="14" y="13" width="42" height="47" rx="7" fill="#7A4E1A" ${ln()}/><rect x="11" y="9" width="42" height="48" rx="7" fill="${U('bd')}" ${ln()}/><path d="M14 16 V50" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" stroke-linecap="round"/>
<rect x="17" y="18" width="32" height="35" rx="3" fill="#17324D" fill-opacity=".25"/><rect x="16" y="16" width="32" height="35" rx="3" fill="${U('pp')}" stroke="${O}" stroke-width="2.4"/>
<rect x="22" y="3.5" width="20" height="12" rx="4" fill="${U('cl')}" ${ln()}/><rect x="28" y="7" width="8" height="3.2" rx="1.6" fill="${O}" fill-opacity=".7"/>
<path d="M21 28 l4 4 l7 -8" fill="none" stroke="#14602B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(.8 1.2)" stroke-opacity=".35"/><path d="M21 28 l4 4 l7 -8" fill="none" stroke="#3DB85F" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 29 H44 M21 40 H44 M21 46 H36" stroke="#9CC6E6" stroke-width="3" stroke-linecap="round"/>`,
chart: `<defs>${LG('b1', [[0, '#8ADBFF'], [1, '#2AA3E8']], 0, 0, 1, 0)}${LG('g1', [[0, '#9BEA8A'], [1, '#35A857']], 0, 0, 1, 0)}${LG('y1', [[0, '#FFE27A'], [1, '#EDA51A']], 0, 0, 1, 0)}</defs>
<g class="il-b il-b1"><path d="M20 34 L25 30 V52 L20 56Z" fill="#1C7DB8" ${ln(2.2)}/><path d="M10 34 L15 30 H25 L20 34Z" fill="#C4EEFF" ${ln(2.2)}/><rect x="10" y="34" width="10" height="22" fill="${U('b1')}" ${ln(2.2)}/></g>
<g class="il-b il-b2"><path d="M35 16 L40 12 V52 L35 56Z" fill="#23813F" ${ln(2.2)}/><path d="M25 16 L30 12 H40 L35 16Z" fill="#D4FBC9" ${ln(2.2)}/><rect x="25" y="16" width="10" height="40" fill="${U('g1')}" ${ln(2.2)}/></g>
<g class="il-b il-b3"><path d="M50 26 L55 22 V52 L50 56Z" fill="#C57F0C" ${ln(2.2)}/><path d="M40 26 L45 22 H55 L50 26Z" fill="#FFF3B8" ${ln(2.2)}/><rect x="40" y="26" width="10" height="30" fill="${U('y1')}" ${ln(2.2)}/></g>
<path d="M12 38 V50 M27 20 V34 M42 30 V40" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/><path d="M5 57 H60" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
bulb: `<defs>${RG('gl', [[0, '#FFFDE0'], [0.5, '#FFE27A'], [1, '#F5B21B']], 0.38, 0.3, 0.85)}${LG('sc', METAL_H, 0, 0, 1, 0)}</defs>
<path d="M32 4 C19 4 11 14 11 25 C11 33 16 38 20 42 C22 44 22 46 22 48 H42 C42 46 42 44 44 42 C48 38 53 33 53 25 C53 14 45 4 32 4Z" fill="${U('gl')}" ${ln(2.8)}/>
<path d="M26 45 L29 35 L32 41 L35 35 L38 45" fill="none" stroke="#C0700A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="21" y="47" width="22" height="10" rx="3" fill="${U('sc')}" ${ln()}/><path d="M21.5 50.4 H42.5 M21.5 53.8 H42.5" stroke="#6E8196" stroke-width="2"/><path d="M26 57 H38 Q37 62 32 62 Q27 62 26 57Z" fill="#4D6279" ${ln()}/>
${shine(21, 15, 6, 3, -50, 0.85)}<circle cx="15" cy="24" r="1.5" fill="#fff" fill-opacity=".9"/>`,
lock: `<defs>${LG('bd', [[0, '#FFE98A'], [0.5, '#FFC531'], [1, '#D68A0B']])}${LG('sh', [[0, '#FFFFFF'], [0.4, '#D3DFEA'], [1, '#7E91A5']], 0, 0, 1, 0)}</defs>
<path d="M20 29 V20 Q20 8 32 8 Q44 8 44 20 V29" fill="none" stroke="${O}" stroke-width="10.5" stroke-linecap="round"/><path d="M20 29 V20 Q20 8 32 8 Q44 8 44 20 V29" fill="none" stroke="${U('sh')}" stroke-width="5.2" stroke-linecap="round"/>
<rect x="11" y="28" width="42" height="30" rx="8" fill="#C0700A" ${ln()}/><rect x="11" y="27" width="42" height="28" rx="8" fill="${U('bd')}" ${ln()}/><rect x="15" y="31" width="34" height="20" rx="5" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
<circle cx="32" cy="38.5" r="4.6" fill="${O}"/><path d="M29.6 40 H34.4 L35.6 49 H28.4Z" fill="${O}"/><path d="M16 33 H27" stroke="#fff" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>`,
heart: `<defs>${RG('h', [[0, '#FFC1CC'], [0.5, '#FF5C74'], [1, '#CC2A52']], 0.35, 0.28, 0.85)}</defs>
<path d="${HEART}" fill="${U('h')}" ${ln(2.8)}/><path d="M32 54 C16 42 9 33 8.6 25" fill="none" stroke="#7E1236" stroke-opacity=".2" stroke-width="0"/>${shine(18.5, 20, 6.5, 3.2, -38, 0.85)}<circle cx="12" cy="28" r="1.5" fill="#fff" fill-opacity=".85"/><path d="M36 51 C46 44 53 37 54.5 29" fill="none" stroke="#fff" stroke-opacity=".0" stroke-width="2"/>`,
thumbsup: `<defs>${LG('hd', [[0, '#FFE6D1'], [0.55, '#F4C7A4'], [1, '#D9A07A']], 0, 0, 1, 1)}${LG('sl', [[0, '#7FD0FF'], [1, '#1F8FD0']], 0, 0, 1, 0)}</defs>
<rect x="5" y="28" width="13" height="28" rx="4" fill="${U('sl')}" ${ln()}/><path d="M8 32 V52" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>
<path d="M21 30 L31 8 Q35 6 38 10 Q40 15 36 24 H53 Q59 25 58 31 Q59 34 56 36 Q58 40 55 43 Q56 47 52 49 Q52 53 47 53 H25 Q21 53 21 49Z" fill="${U('hd')}" ${ln(2.8)}/>
<path d="M36 36 H55 M36 43 H53 M36 49 H50" fill="none" stroke="#C0875E" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/><path d="M26 33 L32 17" stroke="#fff" stroke-opacity=".65" stroke-width="3.4" stroke-linecap="round"/>`,
party: `<defs>${LG('c', [[0, '#E0951B'], [0.5, '#FFC531'], [1, '#FFE98A']], 0, 1, 1, 0)}</defs>
<path d="M8 57 L22 20 L45 43Z" fill="${U('c')}" ${ln(2.8)}/><path d="M12 46 L26 30 M9 54 L35 36" stroke="#FF7A6B" stroke-width="5" stroke-linecap="round"/><path d="M12 46 L16 38 M20 41 L27 34" stroke="#38B6FF" stroke-width="3.5" stroke-linecap="round" stroke-opacity="0"/>
<path d="M10 52 L21.5 24" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="33.5" cy="31.5" rx="17" ry="4.6" transform="rotate(45 33.5 31.5)" fill="#FFE98A" ${ln()}/><ellipse cx="33.5" cy="31.5" rx="12.5" ry="2.6" transform="rotate(45 33.5 31.5)" fill="#8A4A14"/>
<g class="il-conf" stroke="${O}" stroke-width="2" stroke-linejoin="round"><circle cx="40" cy="14" r="4" fill="#38B6FF"/><rect x="50" y="25" width="7" height="7" rx="1.5" fill="#FF7A6B" transform="rotate(20 53 28)"/><circle cx="54" cy="46" r="3.2" fill="#4CC26B"/><rect x="25" y="5" width="6" height="6" rx="1" fill="#A596FF" transform="rotate(-20 28 8)"/></g>
<path d="M38 26 Q44 20 50 22 M46 36 Q52 34 56 38" fill="none" stroke="#A596FF" stroke-width="3" stroke-linecap="round"/>`,
coin: `<defs>${RG('f', [[0, '#FFF7BE'], [0.5, '#FFC531'], [1, '#DE8D0F']], 0.35, 0.28, 0.85)}${LG('in', [[0, '#D9860B'], [1, '#FFE98A']], 0, 0, 1, 1)}</defs>
<circle cx="32" cy="37" r="24" fill="#B8650A" ${ln()}/><path d="M9 37 V33 M55 37 V33" stroke="#8A4A0A" stroke-width="0"/><circle cx="32" cy="33" r="24" fill="${U('f')}" ${ln(2.8)}/><circle cx="32" cy="33" r="17.5" fill="${U('in')}" stroke="#C0700A" stroke-width="2.4"/>
<path d="M32 22 L34.8 28.4 L41.6 29.2 L36.5 33.8 L37.9 40.6 L32 37.2 L26.1 40.6 L27.5 33.8 L22.4 29.2 L29.2 28.4Z" fill="#FFE98A" stroke="#C0700A" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M13 26 Q16 17 25 13" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3.6" stroke-linecap="round"/>`,
spinner: `<defs>${RG('gloss', [[0, '#FFFFFF', 0.55], [0.6, '#FFFFFF', 0.08], [1, '#17324D', 0.28]], 0.32, 0.25, 0.9)}${RG('hub', [[0, '#FFFFFF'], [0.5, '#CFDBE6'], [1, '#7C8FA3']], 0.35, 0.3, 0.8)}${LG('pt', [[0, '#FF9AA9'], [1, '#D8304F']], 0, 0, 1, 0)}</defs>
<circle cx="32" cy="38" r="25" fill="#17324D" fill-opacity=".9" ${ln()}/>
<g class="il-wheel"><circle cx="32" cy="34" r="25" fill="#fff"/><path d="M32 34 L32 9 A25 25 0 0 1 55.8 26.3Z" fill="#FF7A6B"/><path d="M32 34 L55.8 26.3 A25 25 0 0 1 46.7 55.3Z" fill="#FFC531"/><path d="M32 34 L46.7 55.3 A25 25 0 0 1 17.3 55.3Z" fill="#4CC26B"/><path d="M32 34 L17.3 55.3 A25 25 0 0 1 8.2 26.3Z" fill="#38B6FF"/><path d="M32 34 L8.2 26.3 A25 25 0 0 1 32 9Z" fill="#A596FF"/>
<path d="M32 34 L32 9 M32 34 L55.8 26.3 M32 34 L46.7 55.3 M32 34 L17.3 55.3 M32 34 L8.2 26.3" stroke="${O}" stroke-width="2.4"/><circle cx="32" cy="34" r="25" fill="${U('gloss')}"/><circle cx="32" cy="34" r="25" fill="none" ${ln(3)}/><circle cx="32" cy="34" r="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>
<circle cx="32" cy="34" r="6" fill="${U('hub')}" ${ln(2.2)}/></g>
<path class="il-ptr" d="M32 3 L39 14 H25Z" fill="${U('pt')}" ${ln()}/><path d="M29 11 L32 6" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`,
bag: `<defs>${RG('sk', [[0, '#F6D79E'], [0.5, '#DDAE63'], [1, '#B07C2A']], 0.35, 0.28, 0.9)}${marble('m1', '#FFC1B6', '#FF7A6B', '#CC4636')}${marble('m2', '#C9EEFF', '#38B6FF', '#1C7DB8')}${marble('m3', '#FFF3A6', '#FFC531', '#D9860B')}${LG('rp', [[0, '#7AE08F'], [1, '#2E9A4B']])}</defs>
<path d="M24 11 Q32 19 40 11 L36 21 Q32 23 28 21Z" fill="#B07C2A" ${ln()}/>
<path d="M26 21 Q12 27 10 43 Q9 59 32 59 Q55 59 54 43 Q52 27 38 21 Q32 24 26 21Z" fill="${U('sk')}" ${ln(2.8)}/><path d="M18 30 Q14 38 15 47" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.4" stroke-linecap="round"/><path d="M46 30 Q51 38 50 50" fill="none" stroke="#8A5A1A" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>
<path d="M23 22.5 H41" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M23 22.5 H41" stroke="${U('rp')}" stroke-width="3.6" stroke-linecap="round"/>
<circle cx="26" cy="46" r="6.4" fill="${U('m1')}" ${ln(2.2)}/>${shine(24, 43.6, 2.2, 1.2, -35, 0.9)}<circle cx="39" cy="48" r="6.4" fill="${U('m2')}" ${ln(2.2)}/>${shine(37, 45.6, 2.2, 1.2, -35, 0.9)}<circle cx="32.5" cy="37" r="5.8" fill="${U('m3')}" ${ln(2.2)}/>${shine(30.8, 34.8, 2, 1.1, -35, 0.9)}`,
check: `<defs>${RG('o', [[0, '#C7F7B4'], [0.5, '#4CC26B'], [1, '#2A8F47']], 0.35, 0.28, 0.85)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('o')}" ${ln(2.8)}/><path d="M18 34 L28 44 L47 23" fill="none" stroke="#14602B" stroke-opacity=".4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2)"/><path d="M18 34 L28 44 L47 23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="32" cy="17" rx="17" ry="9" fill="${U('g')}"/>`,
cross: `<defs>${RG('o', [[0, '#FFC4BB'], [0.5, '#FF7A6B'], [1, '#D04535']], 0.35, 0.28, 0.85)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('o')}" ${ln(2.8)}/><path d="M22 24 L42 44 M42 24 L22 44" stroke="#8E241A" stroke-opacity=".4" stroke-width="8" stroke-linecap="round" transform="translate(0 2)"/><path d="M22 22 L42 42 M42 22 L22 42" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="32" cy="17" rx="17" ry="9" fill="${U('g')}"/>`,
question: `<defs>${RG('o', [[0, '#E3DDFF'], [0.5, '#A596FF'], [1, '#6E5BD6']], 0.35, 0.28, 0.85)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('o')}" ${ln(2.8)}/><path d="M23 27 Q23 17 32 17 Q41 17 41 26 Q41 31 35 34 Q32 36 32 40" fill="none" stroke="#3E2F9A" stroke-opacity=".4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2)"/><path d="M23 27 Q23 17 32 17 Q41 17 41 26 Q41 31 35 34 Q32 36 32 40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="49" r="4" fill="#3E2F9A" fill-opacity=".4"/><circle cx="32" cy="47.5" r="3.8" fill="#fff"/>
<ellipse cx="32" cy="15" rx="17" ry="8" fill="${U('g')}"/>`,
pencil: `<defs>${LG('bd', [[0, '#FFF0A0'], [0.45, '#FFC531'], [1, '#D68A0B']], 0, 0, 1, 1)}${LG('wd', [[0, '#FFE6D1'], [1, '#D9A86A']], 0, 0, 1, 1)}${LG('er', [[0, '#FFC1CC'], [1, '#E8576E']], 0, 0, 1, 1)}</defs>
<path d="M14 40 L43 11 Q48 8 52 12 Q56 16 53 21 L24 50Z" fill="${U('bd')}" ${ln(2.8)}/><path d="M14 40 L24 50 L9 55Z" fill="${U('wd')}" ${ln(2.8)}/><path d="M9 55 L11.6 47.6 L16.4 52.4Z" fill="${O}"/>
<path d="M36.5 17.5 L47.5 28.5" stroke="${O}" stroke-width="6.5" stroke-linecap="round"/><path d="M36.5 17.5 L47.5 28.5" stroke="#C9D6E2" stroke-width="3.6" stroke-linecap="round"/>
<path d="M43 11 Q48 8 52 12 Q56 16 53 21 L48 16Z" fill="${U('er')}" ${ln(2.4)}/><path d="M18 40 L40 18" stroke="#fff" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/><path d="M25 47 L45 27" stroke="#9A5A06" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>`,
target: `<defs>${RG('r1', [[0, '#FFFFFF'], [1, '#D8E4EE']], 0.35, 0.3, 0.9)}${RG('r2', [[0, '#FFB3A6'], [0.6, '#FF7A6B'], [1, '#D04535']], 0.35, 0.3, 0.9)}${LG('fl', [[0, '#8ADBFF'], [1, '#1F8FD0']], 0, 0, 1, 1)}</defs>
<circle cx="30" cy="38" r="24" fill="#17324D" fill-opacity=".92" ${ln()}/>
<circle cx="30" cy="34" r="24" fill="${U('r1')}" ${ln()}/><circle cx="30" cy="34" r="17.5" fill="${U('r2')}" stroke="${O}" stroke-width="2.4"/><circle cx="30" cy="34" r="10.5" fill="${U('r1')}" stroke="${O}" stroke-width="2.4"/><circle cx="30" cy="34" r="4.6" fill="${U('r2')}" stroke="${O}" stroke-width="2.2"/>
<path d="M11 24 Q13 17 20 13" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>
<path d="M31 33 L55 9" stroke="${O}" stroke-width="5.4" stroke-linecap="round"/><path d="M31 33 L55 9" stroke="#D9A45A" stroke-width="2.4" stroke-linecap="round"/>
<path d="M49 7 L58 6 L57 15 L53 13 L51 11Z" fill="${U('fl')}" ${ln(2.2)}/><path d="M43 17 L50 10" stroke="#38B6FF" stroke-width="2" stroke-linecap="round" stroke-opacity="0"/>`,
clock: `<defs>${LG('rim', [[0, '#FFFFFF'], [0.4, '#D5E0EA'], [1, '#7E91A5']], 0, 0, 1, 1)}${RG('fc', [[0, '#FFFFFF'], [1, '#D6E8F6']], 0.4, 0.3, 0.9)}${LG('cr', [[0, '#8ADBFF'], [1, '#1F8FD0']], 0, 0, 1, 0)}</defs>
<rect x="25" y="2.5" width="14" height="8" rx="3" fill="${U('cr')}" ${ln()}/><rect x="29" y="9" width="6" height="5" fill="#8497AB" ${ln(2)}/>
<circle cx="32" cy="38" r="24" fill="#5F7389" ${ln()}/><circle cx="32" cy="36" r="24" fill="${U('rim')}" ${ln(2.8)}/><circle cx="32" cy="36" r="18.5" fill="${U('fc')}" stroke="#7E91A5" stroke-width="2"/>
<path d="M32 19.5 V22 M48.5 36 H46 M32 52.5 V50 M15.5 36 H18" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
<path class="il-hr" d="M32 36 L41 41" stroke="${O}" stroke-width="4" stroke-linecap="round"/><path class="il-min" d="M32 36 V21" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/><circle cx="32" cy="36" r="3.4" fill="#FF7A6B" ${ln(2)}/>${shine(23, 24, 8, 3.4, -45, 0.45)}`,
book: `<defs>${LG('pg', [[0, '#FFFFFF'], [1, '#D8E6F2']], 0, 0, 1, 0)}${LG('pr', [[0, '#D8E6F2'], [1, '#FFFFFF']], 0, 0, 1, 0)}${LG('cv', [[0, '#3BB4F5'], [1, '#1A6FAF']])}</defs>
<path d="M3 15 Q18 8 32 17 Q46 8 61 15 V53 Q46 50 32 58 Q18 50 3 53Z" fill="${U('cv')}" ${ln(2.8)}/>
<path d="M7 15 Q19 10 32 18 V54 Q19 47 7 50Z" fill="${U('pg')}" ${ln(2.4)}/><path d="M57 15 Q45 10 32 18 V54 Q45 47 57 50Z" fill="${U('pr')}" ${ln(2.4)}/>
<path d="M9 52 Q19 49 31 56 M33 56 Q45 49 55 52" fill="none" stroke="#9CC6E6" stroke-width="2" stroke-linecap="round"/>
<path d="M12 23 Q20 21 27 25 M12 31 Q20 29 27 33 M12 39 Q20 37 27 41" fill="none" stroke="#7FB4DA" stroke-width="2.4" stroke-linecap="round"/><path d="M37 25 Q44 21 52 23 M37 33 Q44 29 52 31 M37 41 Q44 37 52 39" fill="none" stroke="#7FB4DA" stroke-width="2.4" stroke-linecap="round"/><path d="M32 18 V54" stroke="#17324D" stroke-opacity=".35" stroke-width="3"/>`,
moon: `<defs>${RG('m', [[0, '#FFF7BE'], [0.5, '#FFE27A'], [1, '#EDAE2A']], 0.3, 0.28, 0.9)}${RG('cr', [[0, '#E8B33A'], [1, '#F9D65C']], 0.7, 0.7, 0.9)}</defs>
<path d="M40 6 A26 26 0 1 0 58 40 A21 21 0 0 1 40 6Z" fill="${U('m')}" ${ln(2.8)}/><circle cx="20" cy="46" r="4" fill="${U('cr')}" stroke="#C0700A" stroke-width="1.6"/><circle cx="33" cy="52" r="3" fill="${U('cr')}" stroke="#C0700A" stroke-width="1.6"/><circle cx="12" cy="20" r="2.6" fill="${U('cr')}" stroke="#C0700A" stroke-width="1.4"/>
<path d="M17 20 Q21 12 29 9" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>
<path class="il-z" d="M44 12 H54 L44 22 H54" fill="none" stroke="#7A68E0" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
flag: `<defs>${LG('cl', [[0, '#8EEBA6'], [0.28, '#4CC26B'], [0.5, '#2A8F47'], [0.75, '#4CC26B'], [1, '#2A8F47']], 0, 0, 1, 0)}${LG('pl', [[0, '#FFFFFF'], [0.45, '#D3DFEA'], [1, '#6E8196']], 0, 0, 1, 0)}${RG('kn', GOLD, 0.35, 0.3, 0.8)}${RG('hl', [[0, '#DCE6EF'], [1, '#7E91A5']], 0.4, 0.3, 0.9)}</defs>
<ellipse cx="12" cy="58" rx="10" ry="3.4" fill="${U('hl')}" ${ln(2.2)}/>
<rect x="9.8" y="6" width="4.6" height="52" rx="2.3" fill="${U('pl')}" ${ln(2.2)}/><circle cx="12" cy="5" r="3.8" fill="${U('kn')}" ${ln(2)}/>
<g class="il-cloth"><path d="M15 9 Q26 4 34 9 T53 9 L45 20 L53 32 Q43 37 34 32 T15 32Z" fill="${U('cl')}" ${ln(2.6)}/><path d="M21 15 H36" stroke="#fff" stroke-opacity=".6" stroke-width="3.4" stroke-linecap="round"/></g>`,
flame: `<defs>${LG('o', [[0, '#FF9A6B'], [1, '#E8402F']])}${LG('m', [[0, '#FFEB8A'], [1, '#FFA21B']])}</defs>
<path d="M32 4 C34 14 46 18 46 34 C46 46 40 58 32 58 C22 58 16 50 16 40 C16 32 20 28 22 22 C26 28 26 30 28 30 C30 22 28 12 32 4Z" fill="${U('o')}" ${ln(2.8)}/>
<path d="M32 28 C34 34 40 36 40 44 C40 51 36 56 32 56 C27 56 24 52 24 47 C24 42 28 40 29 35 C30 33 31 31 32 28Z" fill="${U('m')}" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M32 42 C33 46 35 47 35 50 C35 53 33 54 32 54 C30 54 29 52 29 50 C29 47 31 45 32 42Z" fill="#FFF8D6"/><path d="M22 28 Q19 36 20 42" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>`,
sparkle: `<defs>${LG('s', [[0, '#FFF3A6'], [0.5, '#FFC531'], [1, '#DE8D0F']], 0, 0, 1, 1)}</defs>
<path d="M32 4 Q35 28 60 32 Q35 36 32 60 Q29 36 4 32 Q29 28 32 4Z" fill="${U('s')}" ${ln(2.8)}/><path d="M32 6 Q29.4 28 6 32 L32 32Z" fill="#fff" fill-opacity=".38"/><path d="M32 58 Q34.6 36 58 32 L32 32Z" fill="#B8650A" fill-opacity=".26"/><path d="M32 6 V58 M6 32 H58" stroke="#fff" stroke-opacity="0" stroke-width="1"/>
<path d="M52 8 Q53 13 58 14 Q53 15 52 20 Q51 15 46 14 Q51 13 52 8Z" fill="#fff" stroke="#FFC531" stroke-width="1.5" stroke-linejoin="round"/>`
};
// Part 52a: names not drawn in 3D yet use their old flat drawing for now (js/illustrations-flat.js).
for (const [name, body] of Object.entries(FLAT_STANDINS)) if (!ILLUSTRATIONS[name]) ILLUSTRATIONS[name] = body;
/* ---------- playful layer: faces, sparkles, glow, motion ---------- */
const eyes = (a, b, r) => `<g class="il-eyes"><circle cx="${a[0]}" cy="${a[1]}" r="${r || 2.6}" fill="${N}"/><circle cx="${b[0]}" cy="${b[1]}" r="${r || 2.6}" fill="${N}"/><circle cx="${a[0] + 0.9}" cy="${a[1] - 0.9}" r="0.9" fill="#fff"/><circle cx="${b[0] + 0.9}" cy="${b[1] - 0.9}" r="0.9" fill="#fff"/></g>`;
const smile = (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round"/>`;
const cheeks = (a, b) => `<circle cx="${a[0]}" cy="${a[1]}" r="3" fill="#FF9A8B" fill-opacity=".7"/><circle cx="${b[0]}" cy="${b[1]}" r="3" fill="#FF9A8B" fill-opacity=".7"/>`;
const FACES = {
  star: eyes([26, 29], [38, 29]) + smile(32, 35, 4.5) + cheeks([21, 35], [43, 35]),
  heart: eyes([24, 28], [40, 28]) + smile(32, 34, 4.5) + cheeks([19, 34], [45, 34]),
  bulb: eyes([26, 22], [38, 22]) + smile(32, 28, 4.5) + cheeks([21, 28], [43, 28]),
  flame: eyes([28, 46], [36, 46], 2.2) + smile(32, 50.5, 3) + cheeks([24.5, 50], [39.5, 50]),
  moon: `<g class="il-eyes"><path d="M13 31 Q17 27 21 31" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round"/><path d="M23 43 Q27 39 31 43" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round"/></g><circle cx="14" cy="40" r="2.6" fill="#FF9A8B" fill-opacity=".7"/>`,
  coin: '',
};
const tw = (x, y, sc, d) => `<g transform="translate(${x},${y}) scale(${sc})"><path class="il-tw" style="animation-delay:${d}s" d="M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z" fill="#fff" stroke="#FFC531" stroke-width="1.3" stroke-linejoin="round"/></g>`;
const EXTRAS = {
  star: tw(10, 12, 1.2, 0) + tw(54, 16, 1, 0.6) + tw(52, 54, 0.8, 1.2),
  trophy: tw(10, 12, 1, 0.2) + tw(55, 8, 0.8, 0.9),
  medal: tw(9, 40, 1, 0) + tw(56, 34, 0.9, 0.7),
  coin: tw(9, 12, 1, 0.3) + tw(55, 52, 0.8, 1),
  heart: tw(8, 10, 0.9, 0) + tw(56, 12, 1, 0.7),
  bulb: tw(8, 18, 0.9, 0) + tw(57, 14, 0.9, 0.6),
  check: tw(54, 8, 1, 0),
  thumbsup: tw(52, 8, 1, 0.3),
  book: tw(55, 8, 1, 0),
  pencil: tw(10, 14, 0.9, 0),
  magnifier: tw(8, 8, 0.9, 0.2),
  sparkle: '',
  moon: tw(8, 56, 0.8, 0.5),
};
const BACK0 = {
  bulb: `<circle class="il-glow" cx="32" cy="26" r="29" fill="#FFE27A"/>`,
  check: `<circle class="il-ring" cx="32" cy="32" r="26" fill="none" stroke="#4CC26B" stroke-width="3"/>`,
  star: `<circle class="il-glow" cx="32" cy="32" r="30" fill="#FFE27A"/>`,
  coin: `<circle class="il-glow" cx="32" cy="32" r="30" fill="#FFE27A"/>`,
};
const SHADOW = `<ellipse class="il-shadow" cx="32" cy="61" rx="19" ry="2.6" fill="#17324D" fill-opacity=".17"/>`;
let _uid = 0;
function illustration(name, opts) {
  const o = opts || {};
  const body = ILLUSTRATIONS[name];
  if (!body) return '';
  const size = o.size || 32;
  const a11y = o.label ? `role="img" aria-label="${o.label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  const still = o.animate === false ? ' still' : '';
  let h = 0; for (const ch of (name + (o.seed || ''))) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const dl = -((h % 30) / 10).toFixed(1);
  const face = o.face === false ? '' : (FACES[name] || '');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="ds-illo${still}" width="${size}" height="${size}" viewBox="0 0 64 64" style="--dl:${dl}s" ${a11y}>${SHADOW}${BACK0[name] || ''}<g class="il il-${name}"><g transform="translate(3.2 .5) scale(.9)">${body}${face}</g></g>${EXTRAS[name] || ''}</svg>`.replace(/~/g, 'u' + (++_uid) + '-');
}
const ILLUSTRATION_CSS = `
.ds-illo{overflow:visible;display:inline-block;vertical-align:middle;cursor:default}
.il{transform-origin:32px 32px}
.ds-illo *{animation-delay:var(--dl,0s)}
.il-die{animation:il-tumble 3.2s ease-in-out infinite}
.il-trophy{transform-origin:32px 58px;animation:il-hop 2.6s ease-in-out infinite}
.il-star{animation:il-pulse 2.2s ease-in-out infinite}
.il-medal{transform-origin:32px 4px;animation:il-swing 2.6s ease-in-out infinite}
.il-magnifier{animation:il-search 3s ease-in-out infinite}
.il-clipboard{transform-origin:32px 58px;animation:il-wobble 2.6s ease-in-out infinite}
.il-b{transform-box:fill-box;transform-origin:50% 100%;animation:il-grow 2.6s ease-in-out infinite}
.il-b2{animation-delay:calc(var(--dl,0s) + .2s)}.il-b3{animation-delay:calc(var(--dl,0s) + .4s)}
.il-bulb{transform-origin:32px 58px;animation:il-bobble 2.8s ease-in-out infinite}
.il-glow{transform-origin:32px 28px;animation:il-glowpulse 2s ease-in-out infinite}
.il-lock{transform-origin:32px 57px;animation:il-shake 3.2s ease-in-out infinite}
.il-heart{animation:il-beat 1.6s ease-in-out infinite}
.il-thumbsup{transform-origin:8px 56px;animation:il-nod 2.8s ease-in-out infinite}
.il-party{transform-origin:8px 56px;animation:il-partyshake 2s ease-in-out infinite}
.il-conf{animation:il-confetti 1.8s ease-out infinite}
.il-coin{animation:il-flip 3s ease-in-out infinite}
.il-wheel{transform-origin:32px 34px;animation:il-spin 4.5s cubic-bezier(.2,.7,.3,1) infinite}
.il-ptr{transform-origin:32px 10px;animation:il-tick .3s ease-in-out 12}
.il-bag{transform-origin:32px 58px;animation:il-wobble 2.2s ease-in-out infinite}
.il-check{animation:il-popin 2.8s ease-out infinite}
.il-ring{transform-origin:32px 32px;animation:il-ripple 2.8s ease-out infinite}
.il-cross{animation:il-shakeh 2.8s ease-in-out infinite}
.il-question{animation:il-bob 2.4s ease-in-out infinite}
.il-pencil{transform-origin:10px 54px;animation:il-write 1.8s ease-in-out infinite}
.il-target{animation:il-hop 2.4s ease-in-out infinite}
.il-clock{transform-origin:32px 36px;animation:il-wobble 3s ease-in-out infinite}
.il-min{transform-origin:32px 36px;animation:il-turn 4s linear infinite}
.il-hr{transform-origin:32px 36px;animation:il-turn 24s linear infinite}
.il-book{animation:il-bob 2.8s ease-in-out infinite}
.il-moon{transform-origin:32px 6px;animation:il-swing 3.4s ease-in-out infinite}
.il-z{animation:il-float 2.4s ease-in-out infinite}
.il-flag{transform-origin:12px 58px;animation:il-wobble 3s ease-in-out infinite}
.il-cloth{transform-origin:14px 20px;animation:il-wave 1.4s ease-in-out infinite}
.il-flame{transform-origin:32px 58px;animation:il-flicker 1.1s ease-in-out infinite}
.il-sparkle{animation:il-spinpulse 2.4s ease-in-out infinite}
.il-shadow{transform-origin:32px 61px;animation:il-shadowpulse 2.6s ease-in-out infinite}
.il-eyes{transform-box:fill-box;transform-origin:50% 50%;animation:il-blink 4s infinite}
.il-tw{animation:il-twinkle 1.8s ease-in-out infinite}
.ds-illo:hover .il,.ds-illo.cheer .il{animation:il-jump .55s ease-out 2}
.ds-illo.still *{animation:none!important}
.ds-paused .ds-illo *{animation-play-state:paused!important}
@keyframes il-tumble{0%,60%,100%{transform:translateY(0) rotate(0)}10%{transform:translateY(-6px) rotate(-16deg)}25%{transform:translateY(-3px) rotate(14deg)}40%{transform:translateY(0) rotate(-6deg)}50%{transform:rotate(3deg)}}
@keyframes il-hop{0%,55%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.08,.9)}26%{transform:translateY(-6px) scale(.95,1.06)}42%{transform:translateY(0) scale(1.06,.94)}50%{transform:scale(1,1)}}
@keyframes il-pulse{0%,100%{transform:scale(1) rotate(-4deg)}50%{transform:scale(1.1) rotate(4deg)}}
@keyframes il-swing{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes il-search{0%,100%{transform:translate(-3px,-2px) rotate(-8deg)}50%{transform:translate(3px,2px) rotate(8deg)}}
@keyframes il-wobble{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes il-grow{0%{transform:scaleY(.25)}30%{transform:scaleY(1.08)}40%,85%{transform:scaleY(1)}100%{transform:scaleY(.25)}}
@keyframes il-bobble{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes il-glowpulse{0%,100%{opacity:.18;transform:scale(.9)}50%{opacity:.6;transform:scale(1.08)}}
@keyframes il-shake{0%,65%,100%{transform:rotate(0)}70%{transform:rotate(-9deg)}76%{transform:rotate(8deg)}82%{transform:rotate(-6deg)}88%{transform:rotate(4deg)}}
@keyframes il-beat{0%,70%,100%{transform:scale(1)}14%{transform:scale(1.16)}28%{transform:scale(1)}42%{transform:scale(1.12)}}
@keyframes il-nod{0%,60%,100%{transform:rotate(0) translateY(0)}18%{transform:rotate(-14deg) translateY(-3px)}38%{transform:rotate(4deg)}}
@keyframes il-partyshake{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
@keyframes il-confetti{0%{transform:translate(-6px,10px) scale(.4);opacity:0}25%{opacity:1}65%{transform:translate(0,-4px) scale(1);opacity:1}100%{transform:translate(2px,3px) scale(1);opacity:0}}
@keyframes il-flip{0%{transform:scaleX(1)}25%{transform:scaleX(-1)}50%,100%{transform:scaleX(1)}}
@keyframes il-spin{0%{transform:rotate(0)}70%{transform:rotate(720deg)}100%{transform:rotate(745deg)}}
@keyframes il-tick{0%,100%{transform:rotate(0)}50%{transform:rotate(-12deg)}}
@keyframes il-popin{0%{transform:scale(.7)}10%{transform:scale(1.16)}20%,100%{transform:scale(1)}}
@keyframes il-ripple{0%{transform:scale(1);opacity:.8}60%,100%{transform:scale(1.5);opacity:0}}
@keyframes il-shakeh{0%,60%,100%{transform:translateX(0)}66%{transform:translateX(-4px)}72%{transform:translateX(4px)}78%{transform:translateX(-3px)}84%{transform:translateX(3px)}}
@keyframes il-bob{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-4px) rotate(6deg)}}
@keyframes il-write{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(3px,-2px) rotate(-5deg)}50%{transform:translate(0,0) rotate(2deg)}75%{transform:translate(4px,-1px) rotate(-4deg)}}
@keyframes il-turn{to{transform:rotate(360deg)}}
@keyframes il-float{0%{transform:translate(0,6px);opacity:0}40%{opacity:1}100%{transform:translate(2px,-7px);opacity:0}}
@keyframes il-wave{0%,100%{transform:scaleX(1) skewY(0)}50%{transform:scaleX(.88) skewY(6deg)}}
@keyframes il-flicker{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.94,1.08) skewX(-3deg)}50%{transform:scale(1.04,.95) skewX(2deg)}75%{transform:scale(.97,1.06) skewX(3deg)}}
@keyframes il-spinpulse{0%,100%{transform:rotate(0) scale(.88)}50%{transform:rotate(90deg) scale(1.1)}}
@keyframes il-shadowpulse{0%,100%{transform:scaleX(1);opacity:1}30%{transform:scaleX(.82);opacity:.7}}
@keyframes il-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes il-twinkle{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
@keyframes il-jump{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-9px) scale(1.12,.94)}70%{transform:translateY(0) scale(.94,1.06)}100%{transform:translateY(0) scale(1)}}
@media (prefers-reduced-motion: reduce){.ds-illo *{animation:none!important}}
`;
let _installed = false;
function installIllustrationStyles() {
  if (_installed || typeof document === 'undefined') return;
  _installed = true;
  const el = document.createElement('style');
  el.setAttribute('data-ds-illustrations', '');
  el.textContent = ILLUSTRATION_CSS;
  document.head.appendChild(el);
  // Part 52a: a hidden tab does not keep the icons moving (saves the battery).
  const pause = () => document.documentElement.classList.toggle('ds-paused', document.hidden);
  document.addEventListener('visibilitychange', pause);
  pause();
}
export { ILLUSTRATIONS, illustration, ILLUSTRATION_CSS, installIllustrationStyles };