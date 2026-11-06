// Helper layer: the rules of the start-page story (Part 44, Round 4). It
// replaces the old film (Part 34): Sara solves a mystery in 7 scenes, then it
// is the child's turn. Nothing moves on by itself: the child taps Next or Back
// (Habiba: no timer). Pure, tested in Node (tests/story.test.js); the screens
// are in js/story.js, the words in data/content/story.json.

// The 5-step trail at the top, lit up by each scene's `step` (5 = the mission:
// every step done).
export const STEPS = [
  { name: 'Ask', colour: 'ask' },
  { name: 'Plan', colour: 'plan' },
  { name: 'Collect', colour: 'collect' },
  { name: 'Explore', colour: 'explore' },
  { name: 'Conclude', colour: 'conclude' },
];

// The story is drawn at this size, then scaled to fit the screen.
export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 600;

// Where the story is: { scene, line } (both counted from 0).
// The next line, or the first line of the next scene, or null at the very end.
export function nextPosition(scenes, { scene, line }) {
  if (line < scenes[scene].lines.length - 1) return { scene, line: line + 1 };
  if (scene < scenes.length - 1) return { scene: scene + 1, line: 0 };
  return null;
}

// The line before (Back), or the same place on the very first line.
export function previousPosition(scenes, { scene, line }) {
  if (line > 0) return { scene, line: line - 1 };
  if (scene > 0) return { scene: scene - 1, line: scenes[scene - 1].lines.length - 1 };
  return { scene, line };
}

// "Skip story" goes to the mission (the last scene), so the child still sees it.
export function skipPosition(scenes) {
  return { scene: scenes.length - 1, line: 0 };
}

// What the green button says: Next, Next scene, or (at the very end) Start mission.
export function nextLabel(scenes, position, buttons) {
  const lastLine = position.line === scenes[position.scene].lines.length - 1;
  if (lastLine && position.scene === scenes.length - 1) return buttons.end;
  return lastLine ? buttons.nextScene : buttons.next;
}

// Each step of the trail for this scene: 'done', 'now' or 'todo'.
export function trailStates(step) {
  return STEPS.map((s, i) => {
    let state = 'todo';
    if (i < step) state = 'done';
    else if (i === step) state = 'now';
    return { ...s, state };
  });
}

// The scene sound effects of the approved design, per "scene:line": each is
// [effect, seconds after the line starts, (for a pop) its note in Hz].
// js/story-sounds.js plays them. A new scene also gets its whoosh (js/story.js).
export const STORY_EFFECTS = {
  'ask:1': [['pop', 0.5, 700]], // the thought bubble pops in
  'plan:0': [['ticks', 0.4], ['pop', 0.9, 640]], // Sara writes, the guess card pops in
  'collect:1': [['pop', 0.3, 620], ['pop', 0.9, 740]], // "9 hours", "8 hours"
  'collect:2': [['pop', 0.3, 860], ['yawn', 0.6]], // "10 hours", and a sleepy yawn
  'collect:3': [['ding', 0]],
  'graph:0': [['grow', 0.5]], // the bars grow
  'graph:1': [['pop', 0.1, 520]],
  'numbers:0': [['pop', 0.9, 600], ['pop', 1.1, 760]], // the centre number and the mean
  'numbers:1': [['ding', 0]],
  'numbers:2': [['rattle', 0], ['ding', 0.95]], // the die rolls
  'conclude:0': [['ding', 0]],
  'conclude:1': [['pop', 0.1, 840]],
  'conclude:2': [['stamp', 0], ['fanfare', 0.1], ['clap', 0.2]], // Checked!, hooray
  'mission:0': [['chime', 0]],
  'mission:1': [['pop', 0.2, 700]],
  'mission:2': [['ding', 0]],
};
export const EFFECT_NAMES = ['pop', 'ticks', 'yawn', 'ding', 'grow', 'rattle', 'stamp', 'fanfare', 'clap', 'chime'];

// How much to scale the stage so it fills the window, as big as fits, like the
// approved design (Habiba, 6 Nov 2026: it must look like the design's screens).
export function stageScale(availableWidth, availableHeight) {
  return Math.min(availableWidth / STAGE_WIDTH, availableHeight / STAGE_HEIGHT);
}
