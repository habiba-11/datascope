// Part 58a (10 Nov 2026): Pip's Wardrobe, the art. Each item is drawn in Pip's
// own 120x132 space (js/pip.js), so it sits on Pip without any moving or scaling.
// Copied exactly from Habiba's approved design: docs/design/pip-wardrobe-ui.html.
// The words (names, Pip's lines, how to unlock) are in data/content/wardrobe.json.
//
// OUTFIT_ART[id] = { slot: svg } for the item's own slot. The cape also has a
// "neck" part (its golden clasp), drawn in the neck layer.
// OUTFIT_VIEW[id] = the part of Pip's space the item card shows (its viewBox).
//
// The explorer hat and the magnifier are Pip's own hat and glass from before
// (same classes, so the moods in css/base.css still move them): with the
// default outfit, Pip looks exactly as before.

const S = 'stroke="#17324D" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const S2 = 'stroke="#17324D" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';

// A 5-pointed star (the wizard hat).
function star(cx, cy, r, fill) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? r * 0.45 : r;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `<path d="M${points.join(' L')}Z" fill="${fill}" stroke="#17324D" stroke-width="1.4" stroke-linejoin="round"/>`;
}

// A coloured band across the party hat (the cone gets wider lower down).
const halfWidth = (y) => (16 * (y + 16)) / 49;
const band = (y1, y2, colour) => `<path d="M${60 - halfWidth(y1)} ${y1} L${60 + halfWidth(y1)} ${y1} L${60 + halfWidth(y2)} ${y2} L${60 - halfWidth(y2)} ${y2}Z" fill="${colour}"/>`;

// One bar on the graph scarf (it follows the scarf's curve).
function scarfStripe(x, colour) {
  const t = (x - 60) / 34;
  const k = 1 - t * t;
  return `<path d="M${x} ${(84 + 7 * k).toFixed(1)} V${(96 + 7 * k).toFixed(1)}" stroke="${colour}" stroke-width="4.5" stroke-linecap="butt"/>`;
}

// One rainbow wing; the other is its mirror image.
const WING = `<g class="pip-flutter"><path d="M26 66 Q-22 34 -6 -8 Q24 12 32 52Z" fill="#BFEAFF" fill-opacity=".92" ${S}/><path d="M26 80 Q-16 88 -8 128 Q24 108 32 92Z" fill="#E3DDFF" fill-opacity=".92" ${S}/><path d="M24 62 Q4 36 2 6 M26 84 Q6 96 0 118" stroke="#fff" stroke-opacity=".9" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="2" cy="40" r="3.4" fill="#FF7A6B"/><circle cx="6" cy="102" r="3" fill="#FFC531"/></g>`;

export const OUTFIT_ART = {
  // ---------- head ----------
  explorer: { head: `<path class="pip-hat-top" d="M36 30 Q38 6 60 6 Q82 6 84 30 Z" ${S}/><path class="pip-hat-band" d="M37 24 L83 24 L84 30 L36 30 Z" ${S}/><path class="pip-hat-brim" d="M18 32 Q60 20 102 32 Q60 42 18 32 Z" ${S}/>` },
  detective: { head: `<path d="M18 33 Q60 22 102 33 Q60 41 18 33Z" fill="#A8742E" ${S}/><path d="M35 31 Q34 4 60 4 Q86 4 85 31Z" fill="#C99443" ${S}/><path d="M36 25 H84 L85 31 H35Z" fill="#6B3F1E"/><circle cx="60" cy="3.5" r="3.2" fill="#6B3F1E" ${S2}/><path d="M55 14 Q55 9.5 60 9.5 Q65 9.5 65 13.5 Q65 17 60 18.5 V20" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="60" cy="23.4" r="1.6" fill="#fff"/><path d="M42 12 Q46 8 52 7" stroke="#fff" stroke-opacity=".55" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
  party: { head: `<path d="M44 33 L60 -16 L76 33 Q60 40 44 33Z" fill="#FF7A6B" stroke="none"/>${band(6, 12, '#FFC531')}${band(20, 26, '#38B6FF')}<path d="M44 33 L60 -16 L76 33 Q60 40 44 33Z" fill="none" ${S}/><circle cx="60" cy="-16" r="5.5" fill="#FFC531" ${S}/><circle cx="55" cy="15" r="2" fill="#fff"/><circle cx="66" cy="14" r="2" fill="#fff"/><path d="M52 24 L57 4" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round"/>` },
  wizard: { head: `<ellipse cx="60" cy="32" rx="46" ry="8.5" fill="#6E5BD6" ${S}/><path d="M36 32 Q42 6 72 -22 Q76 8 86 32 Q60 38 36 32Z" fill="#A596FF" ${S}/><path d="M37 28 Q60 34 85 28 L86 31.5 Q60 38 36 32Z" fill="#FFC531"/>${star(58, 14, 5.5, '#FFE27A')}${star(70, -2, 4, '#FFE27A')}${star(50, 25, 3.2, '#FFE27A')}<path d="M44 20 Q50 6 60 -4" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
  crown: { head: `<path d="M30 33 L34 8 L46 20 L60 2 L74 20 L86 8 L90 33 Q60 40 30 33Z" fill="#FFC531" ${S}/><path d="M31 28 Q60 35 89 28" stroke="#E0951B" stroke-width="3" fill="none"/><circle cx="60" cy="19" r="5.4" fill="#FF7A6B" ${S2}/><circle cx="42" cy="27" r="3" fill="#38B6FF" ${S2}/><circle cx="78" cy="27" r="3" fill="#4CC26B" ${S2}/><circle cx="34" cy="8" r="3" fill="#FFF3A6" ${S2}/><circle cx="60" cy="2" r="3" fill="#FFF3A6" ${S2}/><circle cx="86" cy="8" r="3" fill="#FFF3A6" ${S2}/><path d="M36 28 L38 14" stroke="#fff" stroke-opacity=".65" stroke-width="2.6" stroke-linecap="round"/>` },
  cap: { head: `<path d="M40 22 V35 Q60 43 80 35 V22Z" fill="#2B4C6F" ${S}/><path d="M60 0 L102 16 L60 31 L18 16Z" fill="#17324D" ${S}/><path d="M60 16 Q92 18 94 31" stroke="#FFC531" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="90" y="30" width="7" height="12" rx="2" fill="#FFC531" ${S2}/><circle cx="60" cy="16" r="3.2" fill="#FFC531" ${S2}/><path d="M30 14 L56 6" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" stroke-linecap="round"/>` },
  // ---------- face (the lenses let the eyes and the blink show through) ----------
  sunglasses: { face: `<path d="M29.5 55 L19 50 M90.5 55 L101 50" fill="none" ${S}/><circle cx="43" cy="58" r="14.5" fill="#38B6FF" fill-opacity=".38" ${S}/><circle cx="77" cy="58" r="14.5" fill="#38B6FF" fill-opacity=".38" ${S}/><path d="M56.5 56 Q60 52.5 63.5 56" fill="none" ${S}/><path d="M33 51 Q36 47 41 46 M67 51 Q70 47 75 46" stroke="#fff" stroke-opacity=".85" stroke-width="2.8" fill="none" stroke-linecap="round"/>` },
  professor: { face: `<path d="M29 56 L19 52 M91 56 L101 52" fill="none" stroke="#17324D" stroke-width="5.4" stroke-linecap="round"/><path d="M29 56 L19 52 M91 56 L101 52" fill="none" stroke="#E0A21B" stroke-width="2.6" stroke-linecap="round"/><path d="M56.5 56 Q60 52.5 63.5 56" fill="none" stroke="#17324D" stroke-width="5.4" stroke-linecap="round"/><path d="M56.5 56 Q60 52.5 63.5 56" fill="none" stroke="#E0A21B" stroke-width="2.6" stroke-linecap="round"/><circle cx="43" cy="58" r="15.5" fill="#fff" fill-opacity=".14" stroke="#17324D" stroke-width="5.6"/><circle cx="43" cy="58" r="15.5" fill="none" stroke="#E0A21B" stroke-width="2.6"/><circle cx="77" cy="58" r="15.5" fill="#fff" fill-opacity=".14" stroke="#17324D" stroke-width="5.6"/><circle cx="77" cy="58" r="15.5" fill="none" stroke="#E0A21B" stroke-width="2.6"/><path d="M33 51 Q36 47 41 46 M67 51 Q70 47 75 46" stroke="#fff" stroke-opacity=".9" stroke-width="2.6" fill="none" stroke-linecap="round"/>` },
  // ---------- neck ----------
  bow: { neck: `<path d="M58 90 L36 79 Q33 90 36 101Z" fill="#FF7A6B" ${S}/><path d="M62 90 L84 79 Q87 90 84 101Z" fill="#FF7A6B" ${S}/><path d="M40 85 L52 90 M80 85 L68 90" stroke="#D9503F" stroke-width="2.4" stroke-linecap="round"/><rect x="53" y="83" width="14" height="14" rx="4" fill="#D9503F" ${S}/><path d="M40 82 Q38 88 39 93" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/>` },
  scarf: { neck: `<path d="M70 98 L80 124 L95 116 L86 94Z" fill="#38B6FF" ${S}/><path d="M74 104 L88 98 M77 112 L91 106" stroke="#FFC531" stroke-width="4" stroke-linecap="round"/><path d="M26 84 Q60 98 94 84 L96 96 Q60 110 24 96Z" fill="#38B6FF" stroke="none"/>${scarfStripe(36, '#FF7A6B')}${scarfStripe(48, '#FFC531')}${scarfStripe(60, '#4CC26B')}${scarfStripe(72, '#FF7A6B')}${scarfStripe(84, '#FFC531')}<path d="M26 84 Q60 98 94 84 L96 96 Q60 110 24 96Z" fill="none" ${S}/>` },
  // ---------- back (behind Pip's body) ----------
  cape: {
    back: `<path d="M24 54 Q0 100 6 130 Q60 142 114 130 Q120 100 96 54 Q60 76 24 54Z" fill="#E85D4E" ${S}/><path d="M30 62 Q12 100 15 123 Q60 133 105 123 Q108 100 90 62 Q60 78 30 62Z" fill="#B63A2C"/><path d="M6 130 Q60 142 114 130" stroke="#FFC531" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    neck: `<path d="M30 85 Q60 99 90 85" stroke="#17324D" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 85 Q60 99 90 85" stroke="#FFC531" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="29" cy="83" r="5.4" fill="#FFC531" ${S2}/><circle cx="91" cy="83" r="5.4" fill="#FFC531" ${S2}/>`,
  },
  wings: { back: `${WING}<g transform="translate(120 0) scale(-1 1)">${WING}</g>` },
  // ---------- held (inside the right wing, so it moves with the wing) ----------
  magnifier: { held: `<g class="pip-glass"><line x1="104" y1="96" x2="96" y2="108" stroke="#17324D" stroke-width="5" stroke-linecap="round"/><circle cx="109" cy="88" r="9" ${S}/></g>` },
  compass: { held: `<g transform="translate(104 94)"><circle cx="11" cy="-14" r="12" fill="#FFC531" ${S}/><circle cx="11" cy="-14" r="8.6" fill="#fff" stroke="#17324D" stroke-width="1.8"/><path d="M11 -22 L14.6 -14 L7.4 -14Z" fill="#FF7A6B" ${S2}/><path d="M11 -6 L14.6 -14 L7.4 -14Z" fill="#9CC6E6" ${S2}/><circle cx="11" cy="-14" r="1.4" fill="#17324D"/><circle cx="11" cy="-28" r="2.6" fill="#E0A21B" ${S2}/></g>` },
  clipboard: { held: `<g transform="translate(104 94)"><rect x="1" y="-32" width="22" height="30" rx="3.5" fill="#C99443" ${S}/><rect x="4.5" y="-27" width="15" height="22" fill="#fff" stroke="#17324D" stroke-width="1.8"/><rect x="7.5" y="-35" width="9" height="6" rx="2" fill="#9AA9B8" ${S2}/><path d="M7 -20 l3 3 l5 -6" stroke="#217A3B" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 -11 H17" stroke="#9CC6E6" stroke-width="2" stroke-linecap="round"/></g>` },
  dice: { held: `<g transform="translate(104 94) rotate(12 13 -15)"><rect x="2" y="-27" width="22" height="22" rx="5.5" fill="#FF7A6B" ${S}/><g fill="#fff"><circle cx="8" cy="-21" r="2.2"/><circle cx="18" cy="-21" r="2.2"/><circle cx="13" cy="-16" r="2.2"/><circle cx="8" cy="-11" r="2.2"/><circle cx="18" cy="-11" r="2.2"/></g></g>` },
};

// What each item card shows of Pip's space (from the design).
const VIEW_BY_SLOT = { head: '6 -28 108 72', face: '10 38 100 42', neck: '14 72 92 52', back: '-4 40 128 100', held: '86 52 52 58' };
export const OUTFIT_VIEW = Object.fromEntries(Object.entries(OUTFIT_ART).map(([id, art]) => [id, VIEW_BY_SLOT[Object.keys(art)[0]]]));
OUTFIT_VIEW.wings = '-30 -14 180 150';
