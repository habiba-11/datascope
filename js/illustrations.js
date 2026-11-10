/* DataScope illustrations: colourful 3D-style inline SVG, replaces every keyboard emoji.
   (Separate from the line icons in js/icons.js, which stay as they are.)
   Style: Explorer's Toolkit, now with volume: soft gradients, a bright top-left light, darker bottom-right,
   glossy highlights, bevelled edges, extruded sides on blocky shapes, and a soft floor shadow under every icon.
   Navy outline (#17324D) keeps them in the same family as Pip.
   Usage: illustration('trophy', { size: 64, label: 'Trophy' })  -> returns an SVG string.
   Every icon MOVES (idle animation, playful faces on some, hover jump). Options: { animate:false } keeps it still.
   No label  -> decorative (aria-hidden). With label -> role="img" + aria-label.
   Gradient ids are made unique per icon instance (the "~" in the source), so many icons can share one page. */
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
// Part 52b (10 Nov 2026): shapes used twice (a darker copy behind = the extruded side).
const HAND = 'M26 34 V12 Q26 6 31 6 Q36 6 36 12 V30 H44 Q52 30 52 38 V46 Q52 58 40 58 H30 Q20 58 16 48 L12 40 Q10 35 15 34 Q19 33 22 38 L26 42Z';
const MASK = 'M6 12 Q20 6 34 12 V30 Q34 44 20 46 Q6 44 6 30Z';
const TRI = 'M32 6 L60 52 Q61 56 57 56 H7 Q3 56 4 52Z';
const BUBBLE = 'M10 8 H54 Q58 8 58 12 V40 Q58 44 54 44 H30 L16 54 V44 H10 Q6 44 6 40 V12 Q6 8 10 8Z';
const CLOUD = 'M18 50 Q6 50 6 39 Q6 29 16 28 Q18 16 30 16 Q40 16 44 25 Q46 24 48 24 Q58 24 58 37 Q58 50 46 50Z';
const ARCS = 'M50 26 A19 19 0 0 0 14 25 M14 38 A19 19 0 0 0 50 39';
const BRAIN = 'M32 10 Q24 4 16 10 Q8 12 8 22 Q4 28 8 36 Q8 46 18 48 Q24 56 32 50 Q40 56 46 48 Q56 46 56 36 Q60 28 56 22 Q56 12 48 10 Q40 4 32 10Z';
const SPEAKER = 'M8 24 H18 L32 12 V52 L18 40 H8Z';
const PIN = 'M32 57 C32 57 12 37 12 24 A20 20 0 0 1 52 24 C52 37 32 57 32 57Z';
const FEATHER = 'M50 6 Q22 10 14 38 L12 50 L24 46 Q50 36 50 6Z';
const PUZZLE = 'M10 18 H24 Q22 9 30 9 Q38 9 36 18 H50 V32 Q59 30 59 38 Q59 46 50 44 V56 H10 V44 Q19 46 19 38 Q19 30 10 32Z';
// A 3D block (w wide, h high): side (dark), top (light), then the front face.
// (The outline is set once on the group, so the drawing stays under 2.5 KB.)
const bk = (x, y, w, h, front, top, side) => `<g ${ln(2.2)}><path d="M${x + w} ${y + 2} L${x + w + 4} ${y - 2} V${y + h - 4} L${x + w} ${y + h}Z" fill="${side}"/><path d="M${x + 2} ${y} L${x + 6} ${y - 4} H${x + w + 4} L${x + w} ${y}Z" fill="${top}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${front}"/></g><path d="M${x + 4} ${y + 4} H${x + 10}" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`;
const blk = (x, y, s, front, top, side) => bk(x, y, s, s, front, top, side); // a square block

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
<path d="M52 8 Q53 13 58 14 Q53 15 52 20 Q51 15 46 14 Q51 13 52 8Z" fill="#fff" stroke="#FFC531" stroke-width="1.5" stroke-linejoin="round"/>`,
// ---------- Part 52b (10 Nov 2026): batch 1 of the 44, redrawn in 3D ----------
tap: `<defs>${LG('sk', [[0, '#FFE6CF'], [0.5, '#F5C29A'], [1, '#D48A55']], 0, 0, 1, 1)}</defs>
<path class="il-tring" d="M17 13 Q14 6 19 2 M45 13 Q48 6 43 2" fill="none" stroke="#38B6FF" stroke-width="3" stroke-linecap="round"/>
<g class="il-finger"><path d="${HAND}" fill="#B06A3B" transform="translate(2 2.5)" ${ln()}/><path d="${HAND}" fill="${U('sk')}" ${ln()}/><path d="M36 37 V44 M44 37 V44" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><path d="M28 9.5 Q31 7.5 34 9.5" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/>${shine(29.5, 19, 1.8, 5, 0, 0.75)}</g>`,
numbers: `<defs>${LG('y', [[0, '#FFF0A0'], [1, '#F2A91C']], 0, 0, 1, 1)}${LG('r', [[0, '#FFB3A8'], [1, '#E2513F']], 0, 0, 1, 1)}${LG('b', [[0, '#9FE0FF'], [1, '#1F8FD6']], 0, 0, 1, 1)}</defs>
<g class="il-nb">${blk(19, 8, 22, U('y'), '#FFF6C4', '#C57F0C')}<path d="M25.5 13 H34 L29.5 18 Q35 18 35 22.5 Q35 27 30 27 Q26.5 27 25.5 24.5" fill="none" stroke="${O}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>
<g class="il-nb il-nb2">${blk(5, 36, 22, U('r'), '#FFD9D2', '#B63A2C')}<path d="M13 43 L17 40 V54" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>
<g class="il-nb il-nb3">${blk(33, 36, 22, U('b'), '#D6F3FF', '#1C6FA6')}<path d="M39.5 44 Q39.5 40 44 40 Q48.5 40 48.5 44 Q48.5 47 44 50.5 L39.5 54 H48.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
'crystal-ball': `<defs>${RG('o', [[0, '#FFFFFF'], [0.3, '#EDE8FF'], [0.75, '#A596FF'], [1, '#6E5BD6']], 0.35, 0.3, 0.8)}${LG('wd', [[0, '#E9BE7C'], [1, '#9A6334']])}</defs>
<path d="M14 53 Q14 47 20 47 H44 Q50 47 50 53 V58 H14Z" fill="#7A4E1A" ${ln()}/><path d="M14 53 Q14 47 20 47 H44 Q50 47 50 53Z" fill="${U('wd')}" ${ln()}/>
<circle cx="32" cy="27" r="21" fill="${U('o')}" ${ln(2.8)}/>
<g class="il-swirl"><path d="M21 33 Q30 23 43 29" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.6" stroke-linecap="round"/><path d="M38 14 Q39 19 44 20 Q39 21 38 26 Q37 21 32 20 Q37 19 38 14Z" fill="#fff" stroke="#A596FF" stroke-width="1.4" stroke-linejoin="round"/></g>
${shine(23, 17, 7, 3.4, -40, 0.85)}<path d="M41 40 Q46 36 48 30" fill="none" stroke="#4A3AB0" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>`,
scales: `<defs>${LG('g', GOLD, 0, 0, 1, 1)}${LG('m', METAL_H, 0, 0, 1, 0)}${LG('wd', [[0, '#E9BE7C'], [1, '#9A6334']])}</defs>
<path d="M32 14 V50" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M32 14 V50" stroke="${U('m')}" stroke-width="3.4" stroke-linecap="round"/>
<path d="M18 53 L22 48 H42 L46 53 V58 H18Z" fill="#7A4E1A" ${ln()}/><path d="M18 53 L22 48 H42 L46 53Z" fill="${U('wd')}" ${ln()}/>
<g class="il-beam"><path d="M9 18 H55" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M9 18 H55" stroke="#FFC531" stroke-width="2.6" stroke-linecap="round"/>
<path d="M13 18 L7 36 M13 18 L19 36 M51 18 L45 36 M51 18 L57 36" stroke="${O}" stroke-width="1.8" stroke-linecap="round"/>
<path d="M4 36 H22 Q22 46 13 46 Q4 46 4 36Z M42 36 H60 Q60 46 51 46 Q42 46 42 36Z" fill="${U('g')}" ${ln()}/><ellipse cx="13" cy="36" rx="9" ry="2" fill="#FFF3A6" stroke="${O}" stroke-width="1.6"/><ellipse cx="51" cy="36" rx="9" ry="2" fill="#FFF3A6" stroke="${O}" stroke-width="1.6"/>${shine(9, 41, 2.6, 1.3, 25, 0.8)}${shine(47, 41, 2.6, 1.3, 25, 0.8)}</g>
<circle cx="32" cy="11" r="4.6" fill="${U('g')}" ${ln(2.2)}/>`,
masks: `<defs>${LG('bl', [[0, '#C4EEFF'], [0.45, '#38B6FF'], [1, '#1C7DB8']], 0, 0, 1, 1)}${LG('ye', [[0, '#FFF3A6'], [0.45, '#FFC531'], [1, '#D9860B']], 0, 0, 1, 1)}</defs>
<g class="il-mk2"><path d="${MASK}" transform="translate(26 10.5)" fill="#155E8F" ${ln()}/><path d="${MASK}" transform="translate(24 8)" fill="${U('bl')}" ${ln()}/><path d="M36 30 Q38 33 40 30 M48 30 Q50 33 52 30 M37 46 Q44 40 51 46" fill="none" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/></g>
<g class="il-mk1"><path d="${MASK}" transform="translate(2 2.5)" fill="#B5700A" ${ln()}/><path d="${MASK}" fill="${U('ye')}" ${ln()}/><path d="M12 23 Q14 20 16 23 M24 23 Q26 20 28 23 M13 32 Q20 39 27 32" fill="none" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/><path d="M10 16 Q14 13 19 13" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/></g>`,
map: `<defs>${LG('a', [[0, '#A6EB98'], [1, '#3BAF5C']], 0, 0, 1, 1)}${LG('b', [[0, '#FFE98A'], [1, '#E3A51C']], 0, 0, 1, 1)}${LG('c', [[0, '#9FE0FF'], [1, '#1F8FD6']], 0, 0, 1, 1)}</defs>
<path d="M6 16 L22 10 L42 16 L58 10 V52 L42 58 L22 52 L6 58Z" fill="${O}" fill-opacity=".25" transform="translate(2 3)"/>
<path d="M6 16 L22 10 V52 L6 58Z" fill="${U('a')}" ${ln()}/><path d="M22 10 L42 16 V58 L22 52Z" fill="${U('b')}" ${ln()}/><path d="M42 16 L58 10 V52 L42 58Z" fill="${U('c')}" ${ln()}/>
<path d="M23.5 12 L40.5 17 V56 L23.5 51Z" fill="#8A5300" fill-opacity=".1"/><path d="M10 24 L18 21" stroke="#fff" stroke-opacity=".7" stroke-width="3.2" stroke-linecap="round"/><path d="M46 24 L54 21" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
<path class="il-route" d="M12 46 Q20 32 30 36 Q40 40 46 28" fill="none" stroke="#E2513F" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
<g class="il-x"><path d="M44 18 L52 26 M52 18 L44 26" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M44 18 L52 26 M52 18 L44 26" stroke="#FF5C74" stroke-width="3.6" stroke-linecap="round"/></g>`,
warning: `<defs>${LG('y', [[0, '#FFF3A6'], [0.5, '#FFC531'], [1, '#D9860B']], 0, 0, 1, 1)}</defs>
<path d="${TRI}" fill="#B5700A" transform="translate(0 3)" ${ln()}/><path d="${TRI}" fill="${U('y')}" ${ln()}/><path d="M30 14 L12 46" stroke="#fff" stroke-opacity=".65" stroke-width="3.4" stroke-linecap="round"/>
<path d="M32 25 V40" stroke="#8A5300" stroke-opacity=".35" stroke-width="6.4" stroke-linecap="round" transform="translate(0 1.6)"/><path d="M32 24 V39" stroke="${O}" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.6" fill="${O}"/>`,
speech: `<defs>${LG('s', [[0, '#FFFFFF'], [0.5, '#D3EEFF'], [1, '#8FCBF0']], 0, 0, 1, 1)}${marble('d', '#C9EEFF', '#38B6FF', '#1C7DB8')}</defs>
<path d="${BUBBLE}" fill="#5FA6D6" transform="translate(2 3)" ${ln()}/><path d="${BUBBLE}" fill="${U('s')}" ${ln()}/><path d="M12 18 Q12 14 18 14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<g fill="${U('d')}" stroke="${O}" stroke-width="2"><circle class="il-dot" cx="20" cy="27" r="4.4"/><circle class="il-dot il-d2" cx="32" cy="27" r="4.4"/><circle class="il-dot il-d3" cx="44" cy="27" r="4.4"/></g>`,
key: `<defs>${RG('r', [[0, '#FFF6C4'], [0.5, '#FFC531'], [1, '#C57F0C']], 0.35, 0.3, 0.85)}</defs>
<path d="M29 33 L54 58 M45 49 L51 43 M51 55 L57 49" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M29 33 L54 58 M45 49 L51 43 M51 55 L57 49" stroke="#E09A12" stroke-width="4.6" stroke-linecap="round"/><path d="M28 32 L52 56" stroke="#FFE98A" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="23.6" cy="26.4" r="15" fill="#B5700A" ${ln()}/><circle cx="22" cy="24" r="15" fill="${U('r')}" ${ln()}/><circle cx="22" cy="24" r="10" fill="none" stroke="#FFF3A6" stroke-opacity=".6" stroke-width="1.6"/><circle cx="22" cy="24" r="5" fill="#fff" stroke="${O}" stroke-width="2.4"/>${shine(15, 17, 4.5, 2.2, -40, 0.85)}`,
ruler: `<defs>${LG('y', [[0, '#FFF0A0'], [0.5, '#FFC531'], [1, '#E09A12']])}</defs>
<g transform="rotate(-30 32 32)"><rect x="3" y="24" width="58" height="22" rx="4" fill="#B5700A" ${ln()}/><rect x="3" y="20" width="58" height="22" rx="4" fill="${U('y')}" ${ln()}/><path d="M11 20 V29 M19 20 V26 M27 20 V31 M35 20 V26 M43 20 V29 M51 20 V26" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><path d="M9 36 H55" stroke="#fff" stroke-opacity=".6" stroke-width="3.2" stroke-linecap="round"/></g>`,
repeat: `<defs>${LG('g', [[0, '#A6EB98'], [0.5, '#4CC26B'], [1, '#2A8F47']], 0, 0, 1, 1)}</defs>
<g class="il-cyc"><path d="${ARCS}" fill="none" stroke="${O}" stroke-width="11" stroke-linecap="round"/><path d="${ARCS}" fill="none" stroke="#23813F" stroke-width="5.6" stroke-linecap="round" transform="translate(.8 1.2)"/><path d="${ARCS}" fill="none" stroke="${U('g')}" stroke-width="5.2" stroke-linecap="round"/>
<path d="M6 23 L22 23 L14 34Z M42 41 L58 41 L50 30Z" fill="${U('g')}" ${ln()}/><path d="M23 17 Q30 13.5 37 15" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/></g>`,
play: `<defs>${RG('o', [[0, '#C9EEFF'], [0.5, '#38B6FF'], [1, '#1C6FA6']], 0.35, 0.28, 0.85)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('o')}" ${ln(2.8)}/><path d="M26 22 L45 34 L26 46Z" fill="#14507A" fill-opacity=".4" stroke="#14507A" stroke-opacity=".4" stroke-width="4" stroke-linejoin="round"/><path d="M26 20 L45 32 L26 44Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="32" cy="16" rx="16" ry="8" fill="${U('g')}"/>`,
cloud: `<defs>${RG('c', [[0, '#FFFFFF'], [0.55, '#E3F4FF'], [1, '#9CCDEE']], 0.35, 0.25, 0.9)}</defs>
<path d="${CLOUD}" fill="#7FB3D9" transform="translate(1.5 3)" ${ln()}/><path d="${CLOUD}" fill="${U('c')}" ${ln()}/><path d="M13 37 Q14 32 19 31 M25 24 Q28 20 33 20" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>`,
'cloud-off': `<defs>${RG('c', [[0, '#FFFFFF'], [0.55, '#E6ECF2'], [1, '#AEBBC8']], 0.35, 0.25, 0.9)}</defs>
<path d="${CLOUD}" fill="#8C9AA8" transform="translate(1.5 3)" ${ln()}/><path d="${CLOUD}" fill="${U('c')}" ${ln()}/><path d="M13 37 Q14 32 19 31" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>
<path d="M12 10 L52 56" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M12 10 L52 56" stroke="#D04535" stroke-width="5" stroke-linecap="round"/><path d="M10.5 10.1 L50 55.1" stroke="#FFB3A8" stroke-width="1.8" stroke-linecap="round"/>`,
'id-card': `<defs>${LG('h', [[0, '#D9D2FF'], [1, '#7B68E0']])}${LG('w', [[0, '#FFFFFF'], [1, '#E3EDF6']], 0, 0, 1, 1)}${LG('p', [[0, '#FFF0A0'], [1, '#F2B630']], 0, 0, 1, 1)}</defs>
<rect x="6" y="15" width="56" height="40" rx="6" fill="#8C9AA8" ${ln()}/><rect x="4" y="12" width="56" height="40" rx="6" fill="${U('w')}" ${ln()}/>
<path d="M4 22 V18 Q4 12 10 12 H54 Q60 12 60 18 V22Z" fill="${U('h')}" ${ln()}/><path d="M10 16.5 H30" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>
<rect x="10" y="27" width="16" height="19" rx="3" fill="${U('p')}" stroke="${O}" stroke-width="2.4"/><circle cx="18" cy="34" r="4" fill="#9A6334"/><path d="M12 45 Q18 38 24 45Z" fill="#9A6334"/>
<path d="M32 31 H52 M32 38 H48 M32 45 H52" stroke="#9CC6E6" stroke-width="3" stroke-linecap="round"/>`,
// ---------- Part 52c (10 Nov 2026): batch 2 of the 44, redrawn in 3D ----------
brain: `<defs>${LG('p', [[0, '#FFD3E0'], [0.5, '#FF9AB5'], [1, '#D9577D']], 0, 0, 1, 1)}</defs>
<path d="${BRAIN}" fill="#B8456A" transform="translate(2 2.5)" ${ln()}/><path d="${BRAIN}" fill="${U('p')}" ${ln()}/><path d="M32 10 V50" stroke="${O}" stroke-width="2.4"/>
<path d="M18 22 Q24 20 24 28 M14 34 Q20 32 22 38 M46 22 Q40 20 40 28 M50 34 Q44 32 42 38" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M14 18 Q18 12 24 12" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.4" stroke-linecap="round"/>${shine(40, 15, 3, 1.6, -20, 0.7)}`,
owl: `<defs>${RG('b', [[0, '#D9A06A'], [0.55, '#9A6334'], [1, '#6B3F1C']], 0.35, 0.3, 0.85)}${LG('t', [[0, '#FFF8E6'], [1, '#F2CF8A']])}${LG('h', GOLD, 0, 0, 1, 1)}</defs>
<path d="M14 26 L12 10 L26 20Z M50 26 L52 10 L38 20Z" fill="#7A4A22" ${ln()}/><ellipse cx="33.5" cy="42" rx="22" ry="19.5" fill="#5A3416" ${ln()}/><ellipse cx="32" cy="40" rx="22" ry="19.5" fill="${U('b')}" ${ln()}/><ellipse cx="32" cy="45" rx="15" ry="12" fill="${U('t')}" stroke="${O}" stroke-width="2.4"/>
<circle cx="25" cy="38" r="6.4" fill="#fff" stroke="${O}" stroke-width="2.4"/><circle cx="39" cy="38" r="6.4" fill="#fff" stroke="${O}" stroke-width="2.4"/><g class="il-eyes"><circle cx="26" cy="39" r="3" fill="${O}"/><circle cx="40" cy="39" r="3" fill="${O}"/><circle cx="27" cy="38" r="1" fill="#fff"/><circle cx="41" cy="38" r="1" fill="#fff"/></g>
<path d="M29 46 H35 L32 51Z" fill="#F59E0B" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
<path d="M20 17 Q20 4 32 4 Q44 4 44 17Z" fill="${U('h')}" ${ln()}/><path d="M21 14 Q32 10 43 14" fill="none" stroke="#E2513F" stroke-width="4"/><path d="M8 19 Q32 11 56 19 Q32 25 8 19Z" fill="${U('h')}" ${ln()}/><path d="M25 8 Q27 6 30 6" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round"/>`,
'lock-open': `<defs>${LG('bd', [[0, '#B8F2A8'], [0.5, '#4CC26B'], [1, '#2A8F47']])}${LG('sh', [[0, '#FFFFFF'], [0.4, '#D3DFEA'], [1, '#7E91A5']], 0, 0, 1, 0)}</defs>
<g class="il-shackle"><path d="M34 28 V18 Q34 6 45 6 Q56 6 56 18 V22" fill="none" stroke="${O}" stroke-width="10.5" stroke-linecap="round"/><path d="M34 28 V18 Q34 6 45 6 Q56 6 56 18 V22" fill="none" stroke="${U('sh')}" stroke-width="5.2" stroke-linecap="round"/></g>
<rect x="8" y="28" width="42" height="30" rx="8" fill="#1F7A39" ${ln()}/><rect x="8" y="27" width="42" height="28" rx="8" fill="${U('bd')}" ${ln()}/><rect x="12" y="31" width="34" height="20" rx="5" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
<circle cx="29" cy="38.5" r="4.6" fill="${O}"/><path d="M26.6 40 H31.4 L32.6 49 H25.4Z" fill="${O}"/><path d="M13 33 H24" stroke="#fff" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>`,
door: `<defs>${LG('wd', [[0, '#E9BE7C'], [1, '#A86E2C']], 0, 0, 1, 1)}${LG('pn', [[0, '#F6D79E'], [1, '#C99443']], 0, 0, 1, 1)}${marble('k', '#FFF3A6', '#FFC531', '#D9860B')}</defs>
<path d="M6 58 H58" stroke="${O}" stroke-width="3" stroke-linecap="round"/><rect x="16" y="6" width="32" height="52" rx="3" fill="#2B4A66" ${ln()}/><path d="M46 10 V55" stroke="#FFE27A" stroke-opacity=".6" stroke-width="3"/>
<g class="il-leaf"><rect x="16" y="6" width="32" height="52" rx="3" fill="${U('wd')}" ${ln()}/><rect x="21" y="12" width="22" height="16" rx="2" fill="${U('pn')}" stroke="${O}" stroke-width="2"/><rect x="21" y="33" width="22" height="19" rx="2" fill="${U('pn')}" stroke="${O}" stroke-width="2"/><path d="M44.5 9 V55" stroke="#7A4E1A" stroke-opacity=".45" stroke-width="2.4"/><circle cx="41" cy="31" r="3.2" fill="${U('k')}" stroke="${O}" stroke-width="2"/><path d="M24 15 V25 M24 36 V48" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/></g>`,
music: `<defs>${marble('n', '#E3DDFF', '#A596FF', '#6E5BD6')}</defs>
<path d="M25 46 V14 L53 8 V40" fill="none" stroke="${O}" stroke-width="4.4" stroke-linejoin="round"/><path d="M25 14 L53 8 V17 L25 23Z" fill="${O}"/><path d="M28 16 L50 11.5" stroke="#5B7A99" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="18" cy="47" rx="9.5" ry="7.5" fill="${U('n')}" transform="rotate(-20 18 47)" ${ln()}/><ellipse cx="46" cy="41" rx="9.5" ry="7.5" fill="${U('n')}" transform="rotate(-20 46 41)" ${ln()}/>${shine(15, 44, 3.2, 1.6, -20, 0.85)}${shine(43, 38, 3.2, 1.6, -20, 0.85)}`,
speaker: `<defs>${LG('s', [[0, '#C4EEFF'], [0.45, '#38B6FF'], [1, '#1C7DB8']], 0, 0, 1, 1)}</defs>
<path d="${SPEAKER}" fill="#155E8F" transform="translate(1.5 2.5)" ${ln()}/><path d="${SPEAKER}" fill="${U('s')}" ${ln()}/><path d="M12 28 V35 M20 26 L29 18.5" stroke="#fff" stroke-opacity=".7" stroke-width="2.8" stroke-linecap="round"/>
<path class="il-w1" d="M40 24 Q46 32 40 40" fill="none" stroke="${O}" stroke-width="3.6" stroke-linecap="round"/><path class="il-w1 il-w2" d="M46 17 Q57 32 46 47" fill="none" stroke="${O}" stroke-width="3.6" stroke-linecap="round"/>`,
'speaker-off': `<defs>${LG('s', [[0, '#E6ECF2'], [0.5, '#AEBBC8'], [1, '#7C8FA3']], 0, 0, 1, 1)}</defs>
<path d="${SPEAKER}" fill="#5B6B7C" transform="translate(1.5 2.5)" ${ln()}/><path d="${SPEAKER}" fill="${U('s')}" ${ln()}/><path d="M12 28 V35" stroke="#fff" stroke-opacity=".7" stroke-width="2.8" stroke-linecap="round"/>
<g class="il-mute"><path d="M41 24 L56 40 M56 24 L41 40" stroke="${O}" stroke-width="8.5" stroke-linecap="round"/><path d="M41 24 L56 40 M56 24 L41 40" stroke="#E2513F" stroke-width="4" stroke-linecap="round"/></g>`,
letters: `<defs>${LG('g', [[0, '#B8F2A8'], [1, '#2E9A4B']], 0, 0, 1, 1)}${LG('p', [[0, '#E3DDFF'], [1, '#7B68E0']], 0, 0, 1, 1)}${LG('r', [[0, '#FFB3A8'], [1, '#E2513F']], 0, 0, 1, 1)}</defs>
<g class="il-nb">${blk(19, 8, 22, U('g'), '#DDF6E3', '#1F7A39')}<path d="M35 14.5 Q33.5 13 31 13 Q25.5 13 25.5 19 Q25.5 25 31 25 Q33.5 25 35 23.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></g>
<g class="il-nb il-nb2">${blk(5, 36, 22, U('p'), '#EEEAFF', '#4A3AB0')}<path d="M10.5 54 L16 40 L21.5 54 M12.8 49 H19.2" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>
<g class="il-nb il-nb3">${blk(33, 36, 22, U('r'), '#FFD9D2', '#B63A2C')}<path d="M39.5 40 V54 H45 Q49.5 54 49.5 50.3 Q49.5 46.8 45 46.8 H39.5 M39.5 46.8 H44.3 Q48 46.8 48 43.4 Q48 40 44.3 40 H39.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>`,
shoe: `<defs>${LG('u', [[0, '#C4EEFF'], [0.45, '#38B6FF'], [1, '#1C7DB8']], 0, 0, 1, 1)}${LG('s', [[0, '#FFFFFF'], [1, '#C9D6E2']])}</defs>
<path d="M4 46 H58 Q60 46 60 49 V53 Q60 57 56 57 H8 Q4 57 4 53Z" fill="#9AA9B8" ${ln()}/><path d="M4 46 H58 Q60 46 60 49 V51 Q60 54 56 54 H8 Q4 54 4 51Z" fill="${U('s')}" ${ln()}/>
<path d="M6 46 Q5 31 12 27 L26 24 Q30 34 40 34 L52 37 Q58 39 58 46Z" fill="${U('u')}" ${ln()}/><path d="M6 46 Q6 36 10 31 L14 46Z" fill="#FF7A6B" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M24 29 L30 27 M27 33 L33 31" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M20 42 Q32 37 46 42" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>${shine(14, 33, 1.8, 4, 30, 0.7)}`,
ball: `<defs>${RG('w', [[0, '#FFFFFF'], [0.6, '#EEF6FC'], [1, '#A9C4DA']], 0.35, 0.3, 0.8)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('w')}" ${ln(2.8)}/><path d="M32 22 V12 M41.5 29 L51 25.8 M38 40 L43.8 48.2 M26 40 L20.2 48.2 M22.5 29 L13 25.8" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><path d="M32 22 L41.5 29 L38 40 L26 40 L22.5 29Z" fill="${O}"/>
<g fill="${O}"><circle cx="32" cy="11.5" r="4.4"/><circle cx="51.5" cy="25.5" r="4.4"/><circle cx="44" cy="48.5" r="4.4"/><circle cx="20" cy="48.5" r="4.4"/><circle cx="12.5" cy="25.5" r="4.4"/></g><circle cx="32" cy="32" r="26" fill="none" ${ln(2.8)}/>
<ellipse cx="25" cy="18" rx="12" ry="6" transform="rotate(-25 25 18)" fill="${U('g')}"/>`,
pizza: `<defs>${LG('c', [[0, '#FFF0A0'], [1, '#F2B630']], 0, 0, 1, 1)}${LG('k', [[0, '#F6D79E'], [1, '#B07C2A']])}${marble('p', '#FFB3A8', '#E2513F', '#A8301F')}</defs>
<path d="M8 13 Q32 3 56 13 L32 60Z" fill="#C57F0C" transform="translate(1.5 2)" ${ln()}/><path d="M8 13 Q32 3 56 13 L32 60Z" fill="${U('c')}" ${ln()}/><path d="M6 13 Q32 0 58 13 L55 21 Q32 9 9 21Z" fill="${U('k')}" ${ln()}/><path d="M12 11.5 Q32 4 52 11.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
<g fill="${U('p')}" stroke="${O}" stroke-width="2"><circle cx="25" cy="28" r="4.6"/><circle cx="39" cy="30" r="4.2"/><circle cx="31" cy="43" r="3.6"/></g><path d="M17 26 L26 46" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>`,
shop: `<defs>${LG('w', [[0, '#FFFFFF'], [1, '#DDE8F2']], 0, 0, 1, 1)}${LG('a', [[0, '#FFB3A8'], [1, '#E2513F']])}${LG('g', [[0, '#C9EEFF'], [1, '#38B6FF']], 0, 0, 1, 1)}</defs>
<path d="M4 58 H60" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M56 27 L60 24 V55 L56 58Z" fill="#9AA9B8" ${ln(2.2)}/><rect x="8" y="26" width="48" height="32" fill="${U('w')}" ${ln()}/>
<rect x="26" y="38" width="12" height="20" rx="1" fill="${U('g')}" ${ln(2.4)}/><rect x="12" y="34" width="10" height="10" rx="1" fill="${U('g')}" stroke="${O}" stroke-width="2.4"/><rect x="42" y="34" width="10" height="10" rx="1" fill="${U('g')}" stroke="${O}" stroke-width="2.4"/><path d="M14 37 H17 M44 37 H47" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
<g class="il-awn"><path d="M6 14 H58 L56 28 H8Z" fill="${U('a')}"/><path d="M19 14 L18 28 M32 14 V28 M45 14 L46 28" stroke="#fff" stroke-width="4.4"/><path d="M6 14 H58 L56 28 H8Z" fill="none" ${ln()}/><path d="M9 17 H55" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/></g>`,
tent: `<defs>${LG('l', [[0, '#B8F2A8'], [1, '#3BAF5C']], 0, 0, 1, 1)}${LG('r', [[0, '#3BAF5C'], [1, '#1F7A39']], 0, 0, 1, 1)}</defs>
<path d="M2 58 H62" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M5 57 L32 10 V57Z" fill="${U('l')}" ${ln()}/><path d="M32 10 L59 57 H32Z" fill="${U('r')}" ${ln()}/>
<path d="M24 57 L32 30 L40 57Z" fill="${O}" fill-opacity=".85" ${ln()}/><path d="M20 32 L28 18" stroke="#fff" stroke-opacity=".7" stroke-width="3.4" stroke-linecap="round"/>
<path class="il-pennant" d="M32 10 V2 L42 5 L32 8.5" fill="#FFC531" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`,
tools: `<defs>${LG('m', METAL_H, 0, 0, 1, 1)}${marble('b', '#C9EEFF', '#38B6FF', '#1C7DB8')}</defs>
<path d="M50 52 L28 30" stroke="${O}" stroke-width="9.5" stroke-linecap="round"/><path d="M50 52 L28 30" stroke="#1C7DB8" stroke-width="5" stroke-linecap="round"/><path d="M49 50 L29 30" stroke="#9FE0FF" stroke-width="1.6" stroke-linecap="round"/><circle cx="21" cy="22" r="11" fill="${U('b')}" ${ln()}/><path d="M12 15 L19 8 L25 14 L18 21Z" fill="#fff" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
<g class="il-hammer"><path d="M14 52 L38 28" stroke="${O}" stroke-width="9.5" stroke-linecap="round"/><path d="M14 52 L38 28" stroke="#C99443" stroke-width="5" stroke-linecap="round"/><path d="M15 50 L37 28" stroke="#F6D79E" stroke-width="1.6" stroke-linecap="round"/><g transform="rotate(45 45 15)"><rect x="34" y="11" width="24" height="12" rx="3" fill="#5B6B7C" ${ln()}/><rect x="33" y="9" width="24" height="12" rx="3" fill="${U('m')}" ${ln()}/><path d="M36 12 H50" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/></g></g>`,
'book-green': `<defs>${LG('pg', [[0, '#FFFFFF'], [1, '#DDF6E3']], 0, 0, 1, 0)}${LG('pr', [[0, '#DDF6E3'], [1, '#FFFFFF']], 0, 0, 1, 0)}${LG('cv', [[0, '#7AE08F'], [1, '#23813F']])}</defs>
<path d="M3 15 Q18 8 32 17 Q46 8 61 15 V53 Q46 50 32 58 Q18 50 3 53Z" fill="${U('cv')}" ${ln(2.8)}/>
<path d="M7 15 Q19 10 32 18 V54 Q19 47 7 50Z" fill="${U('pg')}" ${ln(2.4)}/><path d="M57 15 Q45 10 32 18 V54 Q45 47 57 50Z" fill="${U('pr')}" ${ln(2.4)}/>
<path d="M12 22 Q20 21 27 24 M12 30 Q20 29 27 32 M12 38 Q20 37 27 40 M37 24 Q44 21 52 22 M37 32 Q44 29 52 30 M37 40 Q44 37 52 38" fill="none" stroke="#7FCF92" stroke-width="2.2" stroke-linecap="round"/>
<path d="M9 52 Q19 49 31 56 M33 56 Q45 49 55 52" fill="none" stroke="#9BDDAA" stroke-width="2" stroke-linecap="round"/>`,
// ---------- Part 52d (10 Nov 2026): batch 3, the last of the 44, redrawn in 3D ----------
bricks: `<defs>${LG('r', [[0, '#FFB3A8'], [1, '#E2513F']], 0, 0, 1, 1)}${LG('o', [[0, '#FFD0C7'], [1, '#FF7A6B']], 0, 0, 1, 1)}</defs>
${bk(6, 38, 22, 16, U('r'), '#FFD9D2', '#B63A2C')}${bk(34, 38, 22, 16, U('r'), '#FFD9D2', '#B63A2C')}
<g class="il-drop">${bk(20, 17, 22, 16, U('o'), '#FFE6E1', '#C9493A')}</g>`,
cart: `<defs>${LG('b', [[0, '#C4EEFF'], [0.45, '#38B6FF'], [1, '#1C7DB8']], 0, 0, 1, 1)}${marble('w', '#FFF3A6', '#FFC531', '#D9860B')}</defs>
<path d="M17 21 H58 L52 43 H21Z" fill="#155E8F" ${ln()}/><path d="M15 18 H56 L50 40 H19Z" fill="${U('b')}" ${ln()}/><path d="M27 18 L29 40 M39 18 L38 40 M17 29 H53" stroke="#fff" stroke-opacity=".7" stroke-width="2.4"/>
<path d="M4 10 H12 L19 40 L17 46 H52" fill="none" stroke="${O}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10 H12 L19 40 L17 46 H52" fill="none" stroke="#C9D6E2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="23" cy="53" r="5.5" fill="${U('w')}" ${ln()}/><circle cx="47" cy="53" r="5.5" fill="${U('w')}" ${ln()}/>`,
cards: `<defs>${LG('p', [[0, '#E3DDFF'], [1, '#7B68E0']], 0, 0, 1, 1)}${LG('w', [[0, '#FFFFFF'], [1, '#DDE8F2']], 0, 0, 1, 1)}</defs>
<g transform="rotate(-12 23 31)"><rect x="11" y="14" width="28" height="38" rx="4" fill="#4A3AB0" ${ln()}/><rect x="9" y="12" width="28" height="38" rx="4" fill="${U('p')}" ${ln()}/><path d="M15 19 V44" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></g>
<g class="il-fan"><g transform="rotate(10 38 33)"><rect x="26" y="16" width="28" height="38" rx="4" fill="#8C9AA8" ${ln()}/><rect x="24" y="14" width="28" height="38" rx="4" fill="${U('w')}" ${ln()}/><path d="M32 25 H44 L37 44" fill="none" stroke="${O}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="29" cy="47" r="2" fill="#FF7A6B"/><circle cx="47" cy="19" r="2" fill="#FF7A6B"/></g></g>`,
pin: `<defs>${RG('r', [[0, '#FFC4BB'], [0.5, '#FF7A6B'], [1, '#C43A2B']], 0.35, 0.25, 0.85)}</defs>
<ellipse cx="32" cy="58" rx="11" ry="3.5" fill="#9CC6E6" stroke="${O}" stroke-width="2"/>
<g class="il-pinb"><path d="${PIN}" fill="#A8301F" transform="translate(1.5 1.5)" ${ln()}/><path d="${PIN}" fill="${U('r')}" ${ln()}/><circle cx="32" cy="24" r="7.5" fill="#fff" stroke="${O}" stroke-width="2.4"/>${shine(21, 16, 5, 2.5, -45, 0.8)}</g>`,
feather: `<defs>${LG('f', [[0, '#C4EEFF'], [0.5, '#38B6FF'], [1, '#1C6FA6']], 0, 0, 1, 1)}</defs>
<path d="${FEATHER}" fill="#155E8F" transform="translate(2 2)" ${ln()}/><path d="${FEATHER}" fill="${U('f')}" ${ln()}/><path d="M50 6 L10 56" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
<path d="M38 18 L30 17 M34 26 L24 25 M28 34 L19 33" stroke="${O}" stroke-width="2" stroke-linecap="round"/><path d="M44 12 Q40 14 37 18" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>`,
'wizard-hat': `<defs>${LG('h', [[0, '#E3DDFF'], [0.5, '#A596FF'], [1, '#5B48C2']], 0, 0, 1, 1)}${LG('b', [[0, '#C9BEFF'], [1, '#6E5BD6']])}</defs>
<path d="M5 53 Q32 63 59 53 Q32 43 5 53Z" fill="#4A3AB0" ${ln()}/><path d="M5 51 Q32 61 59 51 Q32 41 5 51Z" fill="${U('b')}" ${ln()}/>
<path d="M14 48 L33 5 L50 46 Q32 52 14 48Z" fill="${U('h')}" ${ln()}/><path d="M28 16 L21 34" stroke="#fff" stroke-opacity=".6" stroke-width="3.4" stroke-linecap="round"/>
<path d="M16 45 Q32 50 48 44" fill="none" stroke="${O}" stroke-width="6.4" stroke-linecap="round"/><path d="M16 45 Q32 50 48 44" fill="none" stroke="#FFC531" stroke-width="3.6" stroke-linecap="round"/>
<path class="il-hstar" d="M33 22 L35 28 L41 30 L35 32 L33 38 L31 32 L25 30 L31 28Z" fill="#FFE27A" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/>`,
chick: `<defs>${RG('y', [[0, '#FFF6C4'], [0.5, '#FFE27A'], [1, '#E9A919']], 0.35, 0.3, 0.85)}${LG('s', [[0, '#FFFFFF'], [1, '#D6E2EC']])}</defs>
<g class="il-peek"><circle cx="32" cy="36" r="20" fill="${U('y')}" ${ln()}/><path d="M30 17 Q31 10 36 14" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/><g class="il-eyes"><circle cx="25" cy="32" r="2.8" fill="${O}"/><circle cx="39" cy="32" r="2.8" fill="${O}"/><circle cx="25.9" cy="31.1" r=".9" fill="#fff"/><circle cx="39.9" cy="31.1" r=".9" fill="#fff"/></g>
<path d="M29 38 H35 L32 42Z" fill="#F59E0B" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 30 Q19 24 24 21" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/></g>
<path d="M9 44 L15 39 L21 46 L27 39 L33 46 L39 39 L45 46 L51 39 L55 44 Q56 60 32 60 Q8 60 9 44Z" fill="${U('s')}" ${ln()}/><path d="M13 50 Q16 56 24 57" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
puzzle: `<defs>${LG('g', [[0, '#B8F2A8'], [0.5, '#4CC26B'], [1, '#2A8F47']], 0, 0, 1, 1)}</defs>
<path d="${PUZZLE}" fill="#1F7A39" transform="translate(2 2.5)" ${ln()}/><path d="${PUZZLE}" fill="${U('g')}" ${ln()}/><path d="M15 36 V24 H21" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>${shine(30, 13, 3, 1.5, 0, 0.7)}`,
rocket: `<defs>${LG('w', [[0, '#FFFFFF'], [0.6, '#E3EDF6'], [1, '#A9B9C9']], 0, 0, 1, 0)}${LG('r', [[0, '#FFB3A8'], [1, '#D04535']], 0, 0, 1, 1)}${RG('g', [[0, '#F2FBFF'], [0.55, '#A8E0FF'], [1, '#2AA3E8']], 0.35, 0.3, 0.8)}${LG('f', [[0, '#FFF3A6'], [0.5, '#FFC531'], [1, '#FF7A6B']])}</defs>
<path class="il-thrust" d="M24 42 Q32 64 40 42Z" fill="${U('f')}" ${ln()}/><path d="M20 32 L10 45 L21 42Z M44 32 L54 45 L43 42Z" fill="${U('r')}" ${ln()}/>
<path d="M32 4 Q46 16 44 42 H20 Q18 16 32 4Z" fill="${U('w')}" ${ln()}/><path d="M32 4 Q38 9 41 15 H23 Q26 9 32 4Z" fill="${U('r')}" ${ln()}/><circle cx="32" cy="26" r="6.4" fill="${U('g')}" stroke="${O}" stroke-width="2.4"/>${shine(30, 24, 2, 1.2, -40, 0.9)}<path d="M25 20 Q23.5 30 25 38" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
'arrow-up': `<defs>${RG('o', [[0, '#C7F7B4'], [0.5, '#4CC26B'], [1, '#2A8F47']], 0.35, 0.28, 0.85)}${LG('g', [[0, '#FFFFFF', 0.85], [1, '#FFFFFF', 0]])}</defs>
<circle cx="32" cy="32" r="26" fill="${U('o')}" ${ln(2.8)}/><g class="il-up"><path d="M32 46 V20 M21 31 L32 20 L43 31" fill="none" stroke="#14602B" stroke-opacity=".4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2)"/><path d="M32 46 V20 M21 31 L32 20 L43 31" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
<ellipse cx="32" cy="16" rx="16" ry="8" fill="${U('g')}"/>`,
email: `<defs>${LG('e', [[0, '#FFFFFF'], [0.5, '#D3EEFF'], [1, '#8FCBF0']], 0, 0, 1, 1)}${LG('f', [[0, '#FFFFFF'], [1, '#E3EDF6']])}</defs>
<rect x="8" y="17" width="52" height="38" rx="5" fill="#5FA6D6" ${ln()}/><rect x="6" y="14" width="52" height="38" rx="5" fill="${U('e')}" ${ln()}/><path d="M8 50 L26 33 M56 50 L38 33" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M8 17 L32 36 L56 17" fill="${U('f')}" ${ln()}/><path d="M12 22 L20 28" stroke="#fff" stroke-opacity=".85" stroke-width="3" stroke-linecap="round"/>`,
gear: `<defs>${LG('m', METAL_H, 0, 0, 1, 1)}</defs>
<g class="il-cog"><g fill="#A9B9C9" ${ln()}>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="27" y="3" width="10" height="13" rx="2" transform="rotate(${a} 32 32)"/>`).join('')}</g>
<circle cx="32" cy="32" r="19" fill="${U('m')}" ${ln()}/><circle cx="32" cy="32" r="13" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><circle cx="32" cy="32" r="7" fill="#fff" ${ln()}/></g>${shine(24, 22, 6, 3, -40, 0.75)}`,
download: `<defs>${LG('b', [[0, '#C4EEFF'], [0.45, '#38B6FF'], [1, '#1C7DB8']], 0, 0, 1, 1)}${LG('t', [[0, '#FFFFFF'], [1, '#C9D6E2']])}</defs>
<path d="M8 40 V51 Q8 57 14 57 H50 Q56 57 56 51 V40 H46 V47 H18 V40Z" fill="${U('t')}" ${ln()}/>
<g class="il-down"><path d="M32 6 V30" stroke="${O}" stroke-width="10.5" stroke-linecap="round"/><path d="M32 6 V30" stroke="#38B6FF" stroke-width="5" stroke-linecap="round"/><path d="M19 26 L32 42 L45 26Z" fill="${U('b')}" ${ln()}/><path d="M30.5 8 V26" stroke="#fff" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/></g>`,
broom: `<defs>${LG('s', [[0, '#FFF0A0'], [0.5, '#FFC531'], [1, '#D9860B']], 0, 0, 1, 1)}</defs>
<path d="M50 6 L30 34" stroke="${O}" stroke-width="8.4" stroke-linecap="round"/><path d="M50 6 L30 34" stroke="#C99443" stroke-width="4" stroke-linecap="round"/><path d="M49 7 L31.5 31.5" stroke="#F6D79E" stroke-width="1.4" stroke-linecap="round"/>
<path d="M25.5 33 L39.5 43 L31.5 61 Q19.5 61 11.5 53Z" fill="#B5700A" ${ln()}/><path d="M24 30 L38 40 L30 58 Q18 58 10 50Z" fill="${U('s')}" ${ln()}/>
<path d="M24 30 L38 40" stroke="${O}" stroke-width="7.4" stroke-linecap="round"/><path d="M24 30 L38 40" stroke="#FF7A6B" stroke-width="4" stroke-linecap="round"/><path d="M16 50 L26 41 M22 55 L31 45" stroke="#D9860B" stroke-width="2.4" stroke-linecap="round"/>`
};
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
  key: tw(54, 12, 0.9, 0.4),
  brain: tw(54, 8, 0.9, 0) + tw(9, 54, 0.7, 0.8),
  'wizard-hat': tw(10, 14, 0.9, 0) + tw(56, 24, 0.8, 0.7),
  rocket: tw(8, 12, 0.8, 0.3) + tw(56, 8, 0.9, 0.9),
};
const BACK0 = {
  bulb: `<circle class="il-glow" cx="32" cy="26" r="29" fill="#FFE27A"/>`,
  check: `<circle class="il-ring" cx="32" cy="32" r="26" fill="none" stroke="#4CC26B" stroke-width="3"/>`,
  star: `<circle class="il-glow" cx="32" cy="32" r="30" fill="#FFE27A"/>`,
  coin: `<circle class="il-glow" cx="32" cy="32" r="30" fill="#FFE27A"/>`,
  'crystal-ball': `<circle class="il-glow" cx="32" cy="26" r="28" fill="#D9D2FF"/>`,
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
.il-finger{transform-origin:31px 58px;animation:il-press 1.8s ease-in-out infinite}
.il-tring{transform-origin:31px 8px;animation:il-ringflash 1.8s ease-out infinite}
.il-nb{transform-box:fill-box;transform-origin:50% 100%;animation:il-blockhop 2.4s ease-in-out infinite}
.il-nb2{animation-delay:calc(var(--dl,0s) + .25s)}.il-nb3{animation-delay:calc(var(--dl,0s) + .5s)}
.il-crystal-ball{transform-origin:32px 58px;animation:il-bobble 3.2s ease-in-out infinite}
.il-swirl{transform-origin:32px 27px;animation:il-turn 6s linear infinite}
.il-beam{transform-origin:32px 18px;animation:il-tilt 3s ease-in-out infinite}
.il-mk1{transform-origin:20px 46px;animation:il-wobble 2.6s ease-in-out infinite}
.il-mk2{transform-origin:46px 54px;animation:il-wobble 2.6s ease-in-out infinite reverse}
.il-map{transform-origin:32px 58px;animation:il-wobble 3.4s ease-in-out infinite}
.il-route{animation:il-march 1.6s linear infinite}
.il-x{transform-origin:48px 22px;animation:il-beat 1.8s ease-in-out infinite}
.il-warning{transform-origin:32px 56px;animation:il-shake 3.2s ease-in-out infinite}
.il-dot{transform-box:fill-box;transform-origin:50% 50%;animation:il-typing 1.4s ease-in-out infinite}
.il-d2{animation-delay:calc(var(--dl,0s) + .18s)}.il-d3{animation-delay:calc(var(--dl,0s) + .36s)}
.il-key{transform-origin:22px 24px;animation:il-keyturn 3s ease-in-out infinite}
.il-ruler{animation:il-wobble 2.8s ease-in-out infinite}
.il-cyc{transform-origin:32px 32px;animation:il-cycle 3.6s ease-in-out infinite}
.il-play{animation:il-breathe 2.4s ease-in-out infinite}
.il-cloud,.il-cloud-off{animation:il-drift 4.5s ease-in-out infinite}
.il-id-card{transform-origin:32px 54px;animation:il-wobble 3s ease-in-out infinite}
.il-brain{animation:il-breathe 2.6s ease-in-out infinite}
.il-owl{transform-origin:32px 60px;animation:il-wobble 3s ease-in-out infinite}
.il-shackle{animation:il-unlock 2.8s ease-in-out infinite}
.il-leaf{transform-origin:16px 32px;animation:il-ajar 3.4s ease-in-out infinite}
.il-music{transform-origin:32px 56px;animation:il-bob 2.2s ease-in-out infinite}
.il-w1{animation:il-waveout 1.6s ease-in-out infinite}.il-w2{animation-delay:calc(var(--dl,0s) + .3s)}
.il-mute{transform-origin:48.5px 32px;animation:il-shakeh 3s ease-in-out infinite}
.il-shoe{transform-origin:32px 56px;animation:il-hop 2.6s ease-in-out infinite}
.il-ball{transform-origin:32px 58px;animation:il-hop 1.8s ease-in-out infinite}
.il-pizza{transform-origin:32px 58px;animation:il-wobble 2.8s ease-in-out infinite}
.il-awn{transform-origin:32px 14px;animation:il-flutter 2.2s ease-in-out infinite}
.il-pennant{transform-origin:32px 5px;animation:il-wave 1.4s ease-in-out infinite}
.il-hammer{transform-origin:14px 52px;animation:il-hammer 2s ease-in-out infinite}
.il-book-green{animation:il-bob 2.8s ease-in-out infinite}
.il-drop{transform-origin:31px 33px;animation:il-dropin 2.8s ease-in-out infinite}
.il-cart{animation:il-roll 2.6s ease-in-out infinite}
.il-fan{transform-origin:38px 54px;animation:il-wobble 2.6s ease-in-out infinite}
.il-pinb{transform-origin:32px 57px;animation:il-hop 2.4s ease-in-out infinite}
.il-feather{animation:il-search 3.2s ease-in-out infinite}
.il-wizard-hat{transform-origin:32px 56px;animation:il-bobble 3s ease-in-out infinite}
.il-hstar{transform-origin:33px 30px;animation:il-spinpulse 2.4s ease-in-out infinite}
.il-peek{animation:il-peek 2.8s ease-in-out infinite}
.il-puzzle{transform-origin:32px 56px;animation:il-hop 2.8s ease-in-out infinite}
.il-rocket{animation:il-launch 2.4s ease-in-out infinite}
.il-thrust{transform-origin:32px 42px;animation:il-flicker 1.1s ease-in-out infinite}
.il-up{animation:il-up 1.8s ease-in-out infinite}
.il-email{transform-origin:32px 54px;animation:il-wobble 3s ease-in-out infinite}
.il-cog{transform-origin:32px 32px;animation:il-turn 8s linear infinite}
.il-down{animation:il-dl 1.8s ease-in-out infinite}
.il-broom{transform-origin:50px 6px;animation:il-tilt 1.8s ease-in-out infinite}
.ds-illo:hover .il,.ds-illo.cheer .il{animation:il-jump .55s ease-out 2}
.ds-illo.still *{animation:none!important}
.ds-illo.ds-calm *{animation:none!important}
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
@keyframes il-press{0%,50%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(3px) scale(.97)}}
@keyframes il-ringflash{0%,15%{opacity:0;transform:scale(.7)}30%{opacity:1;transform:scale(1)}60%,100%{opacity:0;transform:scale(1.15)}}
@keyframes il-blockhop{0%,40%,100%{transform:translateY(0) scale(1)}15%{transform:translateY(-4px) scale(1)}28%{transform:translateY(0) scale(1.05,.94)}}
@keyframes il-tilt{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
@keyframes il-march{to{stroke-dashoffset:-14}}
@keyframes il-typing{0%,60%,100%{transform:translateY(0)}25%{transform:translateY(-4px)}}
@keyframes il-keyturn{0%,60%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(6deg)}}
@keyframes il-cycle{0%,50%{transform:rotate(0)}85%,100%{transform:rotate(-360deg)}}
@keyframes il-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes il-drift{0%,100%{transform:translate(-2px,0)}50%{transform:translate(2px,-2px)}}
@keyframes il-unlock{0%,55%,100%{transform:translateY(0)}20%{transform:translateY(-4px)}35%{transform:translateY(0)}}
@keyframes il-ajar{0%,50%,100%{transform:scaleX(1)}65%,85%{transform:scaleX(.8)}}
@keyframes il-waveout{0%,100%{opacity:.35;transform:translateX(0)}50%{opacity:1;transform:translateX(2px)}}
@keyframes il-flutter{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.07)}}
@keyframes il-dropin{0%,50%,100%{transform:translateY(0) scale(1)}15%{transform:translateY(-6px) scale(1)}30%{transform:translateY(0) scale(1.03,.95)}40%{transform:translateY(0) scale(1)}}
@keyframes il-roll{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
@keyframes il-peek{0%,55%,100%{transform:translateY(0)}20%{transform:translateY(-4px)}35%{transform:translateY(0)}}
@keyframes il-launch{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes il-up{0%,100%{transform:translateY(1px)}50%{transform:translateY(-3px)}}
@keyframes il-dl{0%,100%{transform:translateY(-2px)}50%{transform:translateY(2px)}}
@keyframes il-hammer{0%,50%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}30%{transform:rotate(3deg)}}
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