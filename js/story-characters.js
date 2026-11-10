// Shell layer: the speaker's small round picture in the story's dialog card.
// Part 59s: cropped from the cast of the rooms and the story (js/characters.js,
// the look of docs/design/datascope-story-ui-v2.html). Pip is the app's own
// Pip (js/pip.js). Decoration only: the words are in the dialog card.
import { pipSVG } from './pip.js';
import { saraSVG, kidSVG } from './characters.js';

export function avatarSVG(who) {
  if (who === 'pip') return pipSVG();
  if (who === 'sara') return saraSVG('idle', { viewBox: '40 6 120 120' });
  return kidSVG(1, 'idle', { viewBox: '14 16 92 92' }); // "the class": one classmate's face
}
