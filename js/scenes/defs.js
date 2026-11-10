// Part 59 (scenes): the shared SVG gradients for the room scenes, the
// characters and Pip, written ONCE per page (a hidden <svg> at the top of <body>).
// Every id starts with "ds-", so it never clashes with the icons' "~" ids.
// No blur or noise filters: they are slow on school laptops (Part 59 rule 6).

const lin = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="ds-${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${
  stops.map(([at, colour, opacity]) => `<stop offset="${at}" stop-color="${colour}"${opacity === undefined ? '' : ` stop-opacity="${opacity}"`}/>`).join('')
}</linearGradient>`;

// A round gradient, lit from (cx, cy) (fractions of the shape's box).
const rad = (id, stops, cx, cy, r) => `<radialGradient id="ds-${id}" cx="${cx}" cy="${cy}" r="${r}">${
  stops.map(([at, colour]) => `<stop offset="${at}" stop-color="${colour}"/>`).join('')
}</radialGradient>`;

export const SCENE_DEFS = [
  // Pip (js/pip.js, Part 59p): lit from the top left
  rad('pip-body', [[0, '#C58A52'], [0.6, '#9A6A3A'], [1, '#6E4524']], 0.38, 0.3, 0.85),
  rad('pip-belly', [[0, '#FFF3D6'], [1, '#EBC98C']], 0.4, 0.25, 0.9),
  rad('pip-iris', [[0, '#E9A53A'], [1, '#7A4A12']], 0.4, 0.35, 0.7),
  lin('pip-hat', [[0, '#FBD968'], [0.6, '#F0B52E'], [1, '#CF8A1B']], 1, 1),
  lin('pip-beak', [[0, '#FFC15A'], [1, '#F08A12']], 1, 1),
  // light and shadow, laid over a shape to make it round
  lin('shine', [[0, '#fff', 0.55], [0.5, '#fff', 0]], 1, 1),
  lin('shade', [[0.4, '#17324D', 0], [1, '#17324D', 0.28]], 1, 1),
  // the classroom (Data Hub)
  lin('wall', [[0, '#FFF1D2'], [1, '#F0D9A8']]),
  lin('wains', [[0, '#D5EFE0'], [1, '#B7DFC9']]),
  lin('floor', [[0, '#C98B50'], [1, '#E3AC6F']]),
  lin('win-sky', [[0, '#7EC8F5'], [1, '#DDF2FF']]),
  lin('wood-top', [[0, '#F0C48A'], [1, '#CF9A5E']], 1, 1),
  lin('board', [[0, '#FFFFFF'], [1, '#E4EBF2']], 1, 1),
  lin('beam', [[0, '#FFF3B8', 0.7], [1, '#FFE9A0', 0]], 1, 1),
  lin('curtain', [[0, '#F08A7A'], [0.25, '#E26B5B'], [0.5, '#F29A8A'], [0.75, '#DE6353'], [1, '#EE8272']], 1, 0),
  // the warm study (Question Studio): a warm wall and a cork pinboard
  lin('wall-warm', [[0, '#FFE9C2'], [1, '#F6CF92']]),
  '<pattern id="ds-cork" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#D9A767"/><circle cx="4" cy="5" r="1.6" fill="#B98543"/><circle cx="12" cy="11" r="1.4" fill="#C0914E"/><circle cx="10" cy="3" r="1" fill="#E4B982"/></pattern>',
  // the science lab (Graph Lab): mint walls and a mint floor
  lin('wall-mint', [[0, '#D8F5EE'], [1, '#B2E6DB']]),
  lin('floor-mint', [[0, '#9ED8C8'], [1, '#C7EEDF']]),
  // the funfair tent (Chance Lab)
  lin('wall-tent', [[0, '#FFE0B8'], [1, '#FFC98A']]),
  lin('floor-sand', [[0, '#E9B26B'], [1, '#F6D49A']]),
  // the maths workshop (Number Lab)
  lin('wall-blue', [[0, '#D6E9FF'], [1, '#B7D6F5']]),
  lin('panel', [[0, '#E3A765'], [1, '#C98B50']]),
  rad('leaf', [[0, '#8BE393'], [0.55, '#4DB462'], [1, '#25774A']], 0.35, 0.3, 0.85),
  // Sara
  lin('hoodie', [[0, '#FF9A8B'], [0.55, '#F26A58'], [1, '#C94A3D']], 1, 1),
  lin('jeans', [[0, '#4C78B5'], [0.5, '#6A97D2'], [1, '#3F669F']], 1, 0),
  lin('hair', [[0, '#5A4030'], [1, '#241812']], 1, 1),
].join('');

// Puts the gradients on the page (once). Needs a browser (document).
export function mountSceneDefs() {
  if (document.getElementById('ds-scene-defs')) return;
  const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  holder.id = 'ds-scene-defs';
  holder.setAttribute('aria-hidden', 'true');
  holder.setAttribute('focusable', 'false');
  // Zero size, not "display none" (then Chrome forgets the gradients).
  holder.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  holder.innerHTML = `<defs>${SCENE_DEFS}</defs>`;
  document.body.prepend(holder);
}
