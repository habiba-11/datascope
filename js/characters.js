// Part 59a: the cast that stands in the room scenes (our own SVG, after
// docs/design/datascope-rooms-ui.html). Sara is an original girl character
// (not a real person); the seat kids are simple invented classmates.
// Pip is not here: there is one Pip for the whole app, pipSVG() in js/pip.js.
// All of it is decoration (aria-hidden): the words stay in the task card.
// The gradients (url(#ds-...)) come from js/scenes/defs.js.

const SKIN = '#D49A66';
const SKIN_DARK = '#B07845';
const SLEEVE = '#E9604F';
const SLEEVE_DARK = '#B83F32';

// One arm: a darker edge under a coral sleeve.
const arm = (d) => `<path d="${d}" stroke="${SLEEVE_DARK}" stroke-width="19" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${SLEEVE}" stroke-width="15" fill="none" stroke-linecap="round"/>`;
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${SKIN}" stroke="${SKIN_DARK}" stroke-width="1.6"/>`;

const CLIPBOARD = '<g transform="translate(14 118) rotate(-10)"><rect width="58" height="78" rx="6" fill="#C99443" stroke="#8C5B2D" stroke-width="2"/><rect x="5" y="9" width="48" height="64" rx="2" fill="#fff"/><rect x="18" y="-4" width="22" height="12" rx="4" fill="#9AA9B8" stroke="#6E8196" stroke-width="1.6"/><path d="M11 26 l5 5 l9 -11" stroke="#217A3B" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 24 H46 M11 44 H46 M11 56 H38" stroke="#9CC6E6" stroke-width="3" stroke-linecap="round"/></g>';
const PAPER = '<g transform="rotate(-8 100 180)"><rect x="70" y="158" width="62" height="46" rx="4" fill="#fff" stroke="#9AA9B8" stroke-width="2"/><path d="M76 170 H124 M76 180 H118 M76 190 H110" stroke="#9CC6E6" stroke-width="2.4" stroke-linecap="round"/></g>';
const PENCIL = '<path d="M110 180 L130 158" stroke="#17324D" stroke-width="6" stroke-linecap="round"/><path d="M110 180 L130 158" stroke="#FFC531" stroke-width="3" stroke-linecap="round"/>';
const POINTER = '<path d="M218 97 L276 62" stroke="#8C5B2D" stroke-width="5" stroke-linecap="round"/><path d="M268 67 L278 61" stroke="#fff" stroke-width="5" stroke-linecap="round"/>';

// What Sara does with her arms. `behind` is drawn before her head, `front` after it.
// idle: arms down · clip: holds her clipboard · write: writes on a paper ·
// think: hand on her chin · point: points with a stick · cheer: both arms up.
const LEFT_DOWN = arm('M66 128 Q50 170 58 206') + hand(58, 213);
const RIGHT_DOWN = arm('M134 128 Q150 170 142 206') + hand(142, 213);
const POSES = {
  idle: { behind: LEFT_DOWN, front: RIGHT_DOWN },
  clip: { behind: arm('M66 128 Q42 160 64 176') + hand(68, 178) + CLIPBOARD, front: RIGHT_DOWN },
  write: { behind: arm('M66 128 Q56 172 88 180') + hand(94, 178) + PAPER, front: arm('M134 128 Q152 174 114 184') + hand(108, 182) + PENCIL },
  think: { behind: LEFT_DOWN, front: arm('M134 128 Q172 150 130 116') + hand(124, 110) },
  point: { behind: LEFT_DOWN, front: arm('M134 126 Q176 122 212 100') + hand(218, 97) + POINTER },
  cheer: { behind: '', front: arm('M66 126 Q24 100 34 46') + arm('M134 126 Q176 100 166 46') + hand(34, 38) + hand(166, 38) },
};
export const SARA_MOODS = Object.keys(POSES);

const SARA_LEGS = `
  <rect x="72" y="204" width="27" height="118" rx="9" fill="url(#ds-jeans)"/><rect x="101" y="204" width="27" height="118" rx="9" fill="url(#ds-jeans)"/>
  <path d="M86 214 V316 M114 214 V316" stroke="#2F5185" stroke-width="1.6" opacity=".4"/>
  <path d="M64 318 Q62 304 78 304 H99 V330 H62 Q58 324 64 318Z" fill="#fff" stroke="#9AA9B8" stroke-width="2"/><rect x="60" y="326" width="40" height="6" rx="3" fill="#17324D"/>
  <path d="M136 318 Q138 304 122 304 H101 V330 H138 Q142 324 136 318Z" fill="#fff" stroke="#9AA9B8" stroke-width="2"/><rect x="100" y="326" width="40" height="6" rx="3" fill="#17324D"/>
  <path d="M70 312 Q80 306 92 312 M130 312 Q120 306 108 312" stroke="#FF7A6B" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const BODY_SHAPE = 'M64 120 Q58 160 62 214 Q100 228 138 214 Q142 160 136 120 Q100 106 64 120Z';
const SARA_TORSO = `
  <ellipse cx="100" cy="118" rx="34" ry="13" fill="#C94A3D"/>
  <path d="${BODY_SHAPE}" fill="url(#ds-hoodie)"/><path d="${BODY_SHAPE}" fill="url(#ds-shade)"/>
  <path d="M76 180 Q100 192 124 180 L120 208 Q100 214 80 208Z" fill="#D9534A" opacity=".55" stroke="#B83F32" stroke-width="1.4"/>
  <path d="M92 122 L90 154 M108 122 L110 154" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;

const SARA_EYE = (cx) => `<ellipse cx="${cx}" cy="79" rx="9.6" ry="10.6" fill="#fff" stroke="#A87B55" stroke-width=".8"/><circle cx="${cx}" cy="80" r="6.6" fill="#5B3B22"/><circle cx="${cx}" cy="80" r="3.4" fill="#1B1008"/><circle cx="${cx + 2.6}" cy="76.6" r="2.3" fill="#fff"/><path d="M${cx - 10} 76 Q${cx} 66 ${cx + 10} 76" stroke="#2B1C14" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
const SARA_MOUTH_OPEN = '<g class="st-mouth-open"><path d="M88 101 Q100 126 112 101Z" fill="#7A2A22"/><rect x="92" y="101" width="16" height="5" rx="2" fill="#fff"/><ellipse cx="100" cy="115" rx="7" ry="4" fill="#F27A7A"/></g>';
// In the story (`story` true) her eyes blink and her mouth can open while she
// talks (css/story.css); in the rooms and on the start page she stays still.
const saraHead = (story) => `
  <circle cx="54" cy="40" r="22" fill="url(#ds-hair)"/><circle cx="146" cy="40" r="22" fill="url(#ds-hair)"/>
  <ellipse cx="64" cy="56" rx="10" ry="5" fill="#FFC531" transform="rotate(-18 64 56)"/><ellipse cx="136" cy="56" rx="10" ry="5" fill="#FFC531" transform="rotate(18 136 56)"/>
  <rect x="90" y="100" width="20" height="20" rx="8" fill="${SKIN_DARK}"/>
  <circle cx="63" cy="80" r="7.5" fill="${SKIN}"/><circle cx="137" cy="80" r="7.5" fill="${SKIN}"/>
  <ellipse cx="100" cy="76" rx="37" ry="40" fill="${SKIN}"/><ellipse cx="100" cy="76" rx="37" ry="40" fill="url(#ds-shine)" opacity=".7"/><ellipse cx="100" cy="76" rx="37" ry="40" fill="url(#ds-shade)" opacity=".5"/>
  <path d="M62 74 Q56 28 100 26 Q144 28 138 74 Q130 48 100 50 Q70 48 62 74Z" fill="url(#ds-hair)"/>
  <path d="M76 40 Q92 32 114 36" stroke="#9A7A62" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="M71 64 Q82 58 93 62 M107 62 Q118 58 129 64" stroke="#2B1C14" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <g${story ? ' class="st-blink"' : ''}>${SARA_EYE(82)}${SARA_EYE(118)}</g>
  <path d="M99 88 Q104 94 99 96" stroke="${SKIN_DARK}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="76" cy="96" r="7" fill="#F07A6A" opacity=".3"/><circle cx="124" cy="96" r="7" fill="#F07A6A" opacity=".3"/>
  <path${story ? ' class="st-mouth-closed"' : ''} d="M88 102 Q100 113 112 102" stroke="#8A3B2E" stroke-width="3.2" fill="none" stroke-linecap="round"/>${story ? SARA_MOUTH_OPEN : ''}`;

// Sara, 200 x 340, standing on her shadow. `mood`: one of SARA_MOODS.
// `story`: true in the story (js/story-scenes.js): she bobs, blinks, talks and
// points with the story's classes (css/story.css). `viewBox`: a crop, e.g. her
// face for the story's dialog card.
export function saraSVG(mood = 'idle', { story = false, viewBox = '0 0 200 340' } = {}) {
  const pose = POSES[mood] || POSES.idle;
  const front = story && mood === 'point' ? `<g class="st-point">${pose.front}</g>` : pose.front;
  const cls = story ? `st-sara st-sara--${mood}` : 'cast-sara';
  return `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="332" rx="58" ry="8" fill="#17324D" opacity=".2"/>
  ${SARA_LEGS}<g${story ? ' class="st-body"' : ''}>${SARA_TORSO}${pose.behind}${saraHead(story)}${front}</g></svg>`;
}

// The classmates' looks (invented kids), used in turn.
export const KIDS = [
  { skin: '#EFC8A4', skinDark: '#C79A74', hair: '#3B2A20', style: 'short', shirt: '#38B6FF' },
  { skin: '#8D5A3B', skinDark: '#6E4128', hair: '#1F1612', style: 'curly', shirt: '#4CC26B' },
  { skin: '#F4D0B0', skinDark: '#CDA27C', hair: '#B5702A', style: 'long', shirt: '#A596FF', glasses: true },
  { skin: '#D9A87A', skinDark: '#B3825A', hair: '#2FA39A', style: 'scarf', shirt: '#FFC531' },
];

const SEAT_HAIR = {
  short: 'M11 18 Q12 5 24 5 Q36 5 37 18 Q30 11 24 12 Q18 11 11 18Z',
  curly: 'M11 18 Q12 5 24 5 Q36 5 37 18 Q30 11 24 12 Q18 11 11 18Z',
  long: 'M10 26 Q8 4 24 4 Q40 4 38 26 Q36 12 24 12 Q12 12 10 26Z',
  scarf: 'M10 20 Q8 4 24 4 Q40 4 38 20 Q36 12 24 12 Q12 12 10 20Z',
};

// One small classmate in a Data Hub seat (48 x 54). Before answering: a grey
// shape with a "?". After: a face, and a shirt in the colour of the answer's
// tally bar (CSS variable --seat, set by js/rooms/data-hub.js).
export function seatKidSVG(index, answered) {
  const kid = KIDS[index % KIDS.length];
  const body = `<path d="M5 50 Q4 30 24 29 Q44 30 43 50Z" ${answered ? 'style="fill: var(--seat)"' : 'fill="#D5DEE8"'} stroke="#17324D" stroke-width="2"/>`;
  const face = answered
    ? `<circle cx="24" cy="18" r="12" fill="${kid.skin}" stroke="#17324D" stroke-width="2"/><path d="${SEAT_HAIR[kid.style]}" fill="${kid.hair}"/><circle cx="19.5" cy="19" r="1.7" fill="#17324D"/><circle cx="28.5" cy="19" r="1.7" fill="#17324D"/><path d="M20 24 Q24 27 28 24" stroke="#17324D" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    : '<circle cx="24" cy="18" r="12" fill="#E6ECF2" stroke="#9AA9B8" stroke-width="2"/><text x="24" y="24" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="16" fill="#6E8196">?</text>';
  return `<svg class="seat-kid" viewBox="0 0 48 54" aria-hidden="true" focusable="false"><ellipse cx="24" cy="50" rx="17" ry="3.4" fill="#17324D" opacity=".16"/>${body}${face}</svg>`;
}

// A classmate in the story (120 x 170): kid `index` of KIDS. `mood`: idle,
// sleepy (eyes shut, a yawning mouth, a "z") or clap. The classes are the
// story's (css/story.css): the body bobs, the mouth opens while the class
// speaks, the sleepy one yawns, the hands clap. `delay` starts the bob later.
export function kidSVG(index, mood = 'idle', { delay = 0, viewBox = '0 0 120 170' } = {}) {
  const kid = KIDS[index % KIDS.length];
  const sk = kid.skin;
  const skd = kid.skinDark;
  let hair = '';
  let back = '';
  let cover = '';
  if (kid.style === 'short') hair = `<path d="M30 64 Q26 26 60 24 Q94 26 90 64 Q80 44 60 44 Q40 44 30 64Z" fill="${kid.hair}"/>`;
  if (kid.style === 'curly') hair = [[34, 48, 12], [47, 33, 13], [62, 28, 14], [78, 33, 13], [88, 48, 12], [29, 62, 9], [93, 62, 9]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${kid.hair}"/>`).join('');
  if (kid.style === 'long') {
    back = `<path d="M27 60 Q20 130 34 156 L86 156 Q100 130 93 60Z" fill="${kid.hair}"/>`;
    hair = `<path d="M30 62 Q34 26 60 26 Q86 26 90 62 Q72 44 60 52 Q48 44 30 62Z" fill="${kid.hair}"/>`;
  }
  if (kid.style === 'scarf') {
    back = `<path d="M22 70 Q20 22 60 20 Q100 22 98 70 Q102 112 90 132 L30 132 Q18 112 22 70Z" fill="${kid.hair}"/><path d="M30 120 Q60 144 90 120 L98 138 Q60 160 22 138Z" fill="${kid.hair}"/>`;
    cover = `<path d="M34 54 Q60 40 86 54" stroke="${kid.hair}" stroke-width="12" fill="none"/>`;
  }
  const sleepy = mood === 'sleepy';
  const eyes = sleepy
    ? '<path d="M38 68 Q46 74 54 68 M66 68 Q74 74 82 68" stroke="#2B1C14" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : `<g class="st-blink">${[47, 73].map((cx) => `<ellipse cx="${cx}" cy="68" rx="5.6" ry="6.4" fill="#fff"/><circle cx="${cx}" cy="69" r="3.8" fill="#2B1C14"/><circle cx="${cx + 1.4}" cy="67" r="1.4" fill="#fff"/>`).join('')}</g>`;
  const brows = sleepy ? '' : '<path d="M40 57 Q47 53 54 56 M66 56 Q73 53 80 57" stroke="#2B1C14" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  const mouth = sleepy
    ? '<ellipse class="st-kid-yawn" cx="60" cy="88" rx="5" ry="4" fill="#7A2A22"/>'
    : '<path class="st-kid-mouth-closed" d="M50 84 Q60 94 70 84" stroke="#8A3B2E" stroke-width="3" fill="none" stroke-linecap="round"/><g class="st-kid-mouth-open"><path d="M50 83 Q60 102 70 83Z" fill="#7A2A22"/></g>';
  const glasses = kid.glasses ? '<circle cx="47" cy="68" r="10.5" fill="#fff" fill-opacity=".18" stroke="#17324D" stroke-width="2.6"/><circle cx="73" cy="68" r="10.5" fill="#fff" fill-opacity=".18" stroke="#17324D" stroke-width="2.6"/><path d="M57.5 67 H62.5 M36.5 66 L30 62 M83.5 66 L90 62" stroke="#17324D" stroke-width="2.6" fill="none" stroke-linecap="round"/>' : '';
  const hand = (cx) => `<circle cx="${cx}" cy="138" r="9" fill="${sk}" stroke="${skd}" stroke-width="1.6"/>`;
  const hands = mood === 'clap'
    ? `<g class="st-clap">${hand(52)}</g><g class="st-clap st-clap--back">${hand(68)}</g>`
    : `<circle cx="28" cy="162" r="9" fill="${sk}" stroke="${skd}" stroke-width="1.6"/><circle cx="92" cy="162" r="9" fill="${sk}" stroke="${skd}" stroke-width="1.6"/>`;
  const zzz = sleepy ? '<text class="st-zzz" x="92" y="34" font-family="Baloo 2, sans-serif" font-weight="700" font-size="18" fill="#17324D">z</text>' : '';
  return `<svg class="st-kid st-kid--${mood}" viewBox="${viewBox}" aria-hidden="true" focusable="false" style="--delay: -${delay}s">
  <g class="st-kid-body">${back}
    <path d="M8 170 Q6 120 36 110 L84 110 Q114 120 112 170Z" fill="${kid.shirt}"/><path d="M8 170 Q6 120 36 110 L84 110 Q114 120 112 170Z" fill="url(#ds-shade)"/><path d="M48 110 L60 126 L72 110Z" fill="#fff" opacity=".75"/>
    <rect x="52" y="92" width="16" height="22" rx="6" fill="${skd}"/><circle cx="31" cy="70" r="6.5" fill="${sk}"/><circle cx="89" cy="70" r="6.5" fill="${sk}"/>
    <ellipse cx="60" cy="66" rx="29" ry="32" fill="${sk}"/><ellipse cx="60" cy="66" rx="29" ry="32" fill="url(#ds-shine)" opacity=".6"/><ellipse cx="60" cy="66" rx="29" ry="32" fill="url(#ds-shade)" opacity=".4"/>
    ${hair}${cover}${brows}${eyes}${glasses}<path d="M59 74 Q62 79 59 80" stroke="${skd}" stroke-width="1.6" fill="none"/>
    <circle cx="40" cy="80" r="5" fill="#F07A6A" opacity=".3"/><circle cx="80" cy="80" r="5" fill="#F07A6A" opacity=".3"/>${mouth}${hands}${zzz}
  </g></svg>`;
}
