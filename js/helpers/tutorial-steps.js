// Layer 3: the rules of the start-page tutorial (Part 34). Pure, tested in Node
// (tests/tutorial.test.js). The screens themselves are in js/tutorial.js.
import { generateClassData } from './generator.js';
import { answerFacts, fillSuggestions } from './suggestions.js';

// The scene is drawn at this size, then scaled to fit the screen.
export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;

// The buttons of a scene. The last scene's own green button starts the app, so
// its Next becomes "Watch again", and a ✕ in the corner closes it instead of Skip.
export function sceneButtons(index, total) {
  const isLast = index === total - 1;
  return {
    backDisabled: index === 0,
    showSkip: !isLast,
    showClose: isLast,
    nextLabel: isLast ? '↻ Watch again' : 'Next →',
  };
}

// Autoplay, once a scene has been on screen for `elapsed` ms: stay, go on to the
// next scene, or stop on the last one. Pause simply stops `elapsed` growing.
export function autoplayStep(elapsed, ms, index, total) {
  if (elapsed < ms) return 'stay';
  return index < total - 1 ? 'next' : 'end';
}

// How much to scale the scene so it fits the space it has, and never grows past its real size.
export function stageScale(availableWidth, availableHeight) {
  return Math.min(1, availableWidth / STAGE_WIDTH, availableHeight / STAGE_HEIGHT);
}

// Scene 5 shows real hints, the same as a child gets in Graph Lab: the sleep
// scenario's own question, and answers built from its real data.
export function tutorialExample(recipe, content) {
  const facts = answerFacts(recipe, generateClassData(recipe).values);
  return {
    question: content.graphLab.tell,
    answers: fillSuggestions(content.graphLab.tellAnswers, facts).map((s) => s.text),
  };
}
