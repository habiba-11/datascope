// Shell layer: the story's characters (Part 44), drawn as SVG from the
// approved design (docs/design/frames/datascope-story-ui.html). Sara is an
// original girl character (not a real person); the classmates are simple
// invented kids. Pip is the app's own Pip (js/pip.js). Their motions are CSS
// classes in css/story.css, so reduced motion stops them all in one place.
// All decoration: the words are in the dialog card.
import { pipSVG } from './pip.js';

const NAVY = '#17324D';
const SKIN = '#C68B59';

// One arm: a navy outline with a coral sleeve.
const arm = (d) => `<path d="${d}" stroke="${NAVY}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#FF7A6B" stroke-width="5" fill="none" stroke-linecap="round"/>`;
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${SKIN}" stroke="${NAVY}" stroke-width="3"/>`;

// Sara's arms for each mood: thinking (hand on chin), pointing, cheering,
// writing, or holding her clipboard.
const SARA_ARMS = {
  think: arm('M-34 70 Q-60 40 -26 24') + hand(-22, 26),
  point: `<g class="st-point">${arm('M32 66 Q80 62 120 30')}${hand(126, 26)}</g>`,
  cheer: arm('M-34 68 Q-78 40 -70 -14') + arm('M34 68 Q78 40 70 -14') + hand(-70, -18) + hand(70, -18),
  write: `${arm('M32 70 Q70 92 104 80')}<line x1="106" y1="80" x2="130" y2="56" stroke="${NAVY}" stroke-width="8" stroke-linecap="round"/><line x1="106" y1="80" x2="130" y2="56" stroke="#FFC531" stroke-width="3" stroke-linecap="round"/>`,
  clip: `<g transform="translate(34,52) rotate(8)"><rect width="86" height="108" rx="10" fill="#fff" stroke="${NAVY}" stroke-width="4"/><rect x="24" y="-8" width="38" height="16" rx="6" fill="#C99443" stroke="${NAVY}" stroke-width="3"/><line x1="12" y1="32" x2="74" y2="32" stroke="#9CC6E6" stroke-width="4" stroke-linecap="round"/><line x1="12" y1="50" x2="74" y2="50" stroke="#9CC6E6" stroke-width="4" stroke-linecap="round"/><line x1="12" y1="68" x2="56" y2="68" stroke="#9CC6E6" stroke-width="4" stroke-linecap="round"/><path d="M16 32 l6 6 l12 -12" stroke="#217A3B" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>${hand(34, 96)}`,
};

// Sara. `mood`: think, point, cheer, write or clip. Her mouth moves while
// she talks (the class "st-talking" is set on the story while she speaks).
export function saraSVG(mood = 'think') {
  return `
<svg class="st-sara st-sara--${mood}" viewBox="-100 -70 200 230" aria-hidden="true" focusable="false">
  <g class="st-body">
    <rect x="-36" y="46" width="72" height="92" rx="28" fill="#FF7A6B" stroke="${NAVY}" stroke-width="4"/>
    <rect x="-24" y="136" width="18" height="18" rx="6" fill="${NAVY}"/><rect x="6" y="136" width="18" height="18" rx="6" fill="${NAVY}"/>
    <circle cx="-48" cy="-30" r="17" fill="#3B2A20" stroke="${NAVY}" stroke-width="4"/><circle cx="48" cy="-30" r="17" fill="#3B2A20" stroke="${NAVY}" stroke-width="4"/>
    <circle r="46" fill="${SKIN}" stroke="${NAVY}" stroke-width="4"/>
    <path d="M-45 -4 Q-48 -52 0 -52 Q48 -52 45 -4 Q30 -28 0 -28 Q-30 -28 -45 -4 Z" fill="#3B2A20"/>
    <g class="st-blink"><circle cx="-16" cy="4" r="5.5" fill="${NAVY}"/><circle cx="16" cy="4" r="5.5" fill="${NAVY}"/></g>
    <circle cx="-27" cy="20" r="6" fill="#FF9A8B" opacity="0.7"/><circle cx="27" cy="20" r="6" fill="#FF9A8B" opacity="0.7"/>
    <path class="st-mouth-closed" d="M-14 18 Q0 30 14 18" stroke="${NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g class="st-mouth-open"><path d="M-14 17 Q0 40 14 17 Z" fill="#fff" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/></g>
    ${SARA_ARMS[mood] || ''}
  </g>
</svg>`;
}

// A classmate: shirt, skin and hair colours, and a mood: idle, sleepy or clap.
// The mouth opens and closes while the class speaks; the sleepy one yawns.
export function classmateSVG({ shirt = '#38B6FF', skin = '#F2C4A0', hair = '#7A4A21', mood = 'idle', delay = 0 } = {}) {
  const face = mood === 'sleepy'
    ? `<path d="M-24 2 Q-16 -4 -8 2" stroke="${NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 2 Q16 -4 24 2" stroke="${NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse class="st-kid-yawn" cx="0" cy="22" rx="7" ry="6" fill="${NAVY}"/><text class="st-zzz" x="30" y="-30" font-family="Baloo 2, sans-serif" font-weight="800" font-size="22" fill="${NAVY}">z</text>`
    : `<circle cx="-16" cy="0" r="5.5" fill="${NAVY}"/><circle cx="16" cy="0" r="5.5" fill="${NAVY}"/><path class="st-kid-mouth-closed" d="M-14 14 Q0 28 14 14" stroke="${NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/><g class="st-kid-mouth-open"><path d="M-12 13 Q0 34 12 13 Z" fill="#fff" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/></g>`;
  const clap = mood === 'clap'
    ? `<g class="st-clap"><circle cx="-8" cy="78" r="11" fill="${skin}" stroke="${NAVY}" stroke-width="4"/></g><g class="st-clap st-clap--back"><circle cx="8" cy="78" r="11" fill="${skin}" stroke="${NAVY}" stroke-width="4"/></g>`
    : '';
  return `
<svg class="st-kid st-kid--${mood}" viewBox="-50 -62 100 200" aria-hidden="true" focusable="false" style="--delay: -${delay}s">
  <g class="st-kid-body">
    <rect x="-36" y="40" width="72" height="90" rx="28" fill="${shirt}" stroke="${NAVY}" stroke-width="4"/>
    <circle cy="-4" r="46" fill="${skin}" stroke="${NAVY}" stroke-width="4"/>
    <path d="M-46 -10 Q-44 -58 0 -58 Q44 -58 46 -10 Q20 -38 -46 -10 Z" fill="${hair}"/>${face}${clap}
  </g>
</svg>`;
}

// The speaker's small round picture in the dialog card.
export function avatarSVG(who) {
  if (who === 'pip') return pipSVG();
  if (who === 'sara') {
    return `<svg viewBox="-60 -60 120 120" aria-hidden="true" focusable="false"><circle cx="-40" cy="-28" r="17" fill="#3B2A20" stroke="${NAVY}" stroke-width="5"/><circle cx="40" cy="-28" r="17" fill="#3B2A20" stroke="${NAVY}" stroke-width="5"/><circle r="44" fill="${SKIN}" stroke="${NAVY}" stroke-width="5"/><path d="M-43 -4 Q-46 -50 0 -50 Q46 -50 43 -4 Q28 -28 0 -28 Q-28 -28 -43 -4 Z" fill="#3B2A20"/><circle cx="-15" cy="4" r="5.5" fill="${NAVY}"/><circle cx="15" cy="4" r="5.5" fill="${NAVY}"/><path d="M-14 18 Q0 32 14 18" stroke="${NAVY}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  }
  return `<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><circle cx="16" cy="34" r="12" fill="#38B6FF" stroke="${NAVY}" stroke-width="3"/><circle cx="44" cy="34" r="12" fill="#4CC26B" stroke="${NAVY}" stroke-width="3"/><circle cx="30" cy="22" r="13" fill="#FFC531" stroke="${NAVY}" stroke-width="3"/></svg>`;
}
