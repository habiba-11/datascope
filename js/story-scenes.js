// Shell layer: the pictures of the story's 7 scenes (Part 44), from the
// approved design (docs/design/frames/datascope-story-ui.html). Each scene is
// built once when it opens; parts marked data-line="n" appear from line n on
// (js/story.js shows them), so they pop in as the story goes on.
// Our own drawings only: no child text ever goes through here.
import { pipSVG } from './pip.js';
import { saraSVG } from './story-characters.js';

// Sara's pose in each scene, and whether small Pip watches from the side.
const SARA_POSE = {
  ask: 'think', plan: 'write', collect: 'clip', graph: 'point', numbers: 'point', conclude: 'cheer',
};

export function sceneHTML(id) {
  if (id === 'mission') {
    return `<div class="st-mission-pip">${pipSVG()}</div>`;
  }
  return `
    <div class="st-sara-spot">${saraSVG(SARA_POSE[id])}</div>
    <div class="st-small-pip">${pipSVG()}</div>`;
}
