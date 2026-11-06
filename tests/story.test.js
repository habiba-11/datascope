import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  nextPosition, previousPosition, skipPosition, nextLabel, trailStates, stageScale, STEPS,
} from '../js/helpers/story.js';
import { allStrings, longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import {
  setExplorerCode, hasSeenTutorial, markTutorialSeen, clearChildData,
} from '../js/storage/save.js';

const story = JSON.parse(readFileSync(new URL('../data/content/story.json', import.meta.url), 'utf8'));
const { scenes, buttons } = story;
const STORY_JS = readFileSync(new URL('../js/story.js', import.meta.url), 'utf8');

test('7 scenes: Ask, Plan, Collect, Explore graph, Explore numbers and chance, Conclude, Your mission', () => {
  assert.deepEqual(scenes.map((s) => s.id), ['ask', 'plan', 'collect', 'graph', 'numbers', 'conclude', 'mission']);
  assert.deepEqual(scenes.map((s) => s.step), [0, 1, 2, 3, 3, 4, 5]);
  for (const s of scenes) {
    assert.ok(s.chip && s.lines.length >= 2, s.id);
    for (const line of s.lines) assert.ok(['pip', 'sara', 'kids'].includes(line.who), `${s.id}: ${line.who}`);
  }
});

test('every word is in Grade 5 sentences (12 words or fewer)', () => {
  for (const text of allStrings(story)) assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, text);
});

test('honest about the pretend class, and never a wrong class size (Habiba, 6 Nov 2026)', () => {
  const mission = scenes.at(-1).lines.map((l) => l.text).join(' ');
  assert.match(mission, /pretend class/);
  assert.doesNotMatch(mission, /\d/);
});

test('Next goes line by line, then scene by scene, and stops at the very end', () => {
  assert.deepEqual(nextPosition(scenes, { scene: 0, line: 0 }), { scene: 0, line: 1 });
  assert.deepEqual(nextPosition(scenes, { scene: 0, line: 2 }), { scene: 1, line: 0 });
  assert.equal(nextPosition(scenes, { scene: 6, line: 2 }), null);
});

test('Back goes to the line before, across scenes, and stays on the very first line', () => {
  assert.deepEqual(previousPosition(scenes, { scene: 1, line: 0 }), { scene: 0, line: 2 });
  assert.deepEqual(previousPosition(scenes, { scene: 0, line: 0 }), { scene: 0, line: 0 });
});

test('Skip goes to the mission, so a child who skips still sees it', () => {
  assert.deepEqual(skipPosition(scenes), { scene: 6, line: 0 });
});

test('the green button says Next, Next scene, then Start mission', () => {
  assert.equal(nextLabel(scenes, { scene: 0, line: 0 }, buttons), 'Next');
  assert.equal(nextLabel(scenes, { scene: 0, line: 2 }, buttons), 'Next scene');
  assert.equal(nextLabel(scenes, { scene: 6, line: 2 }, buttons), 'Start mission');
});

test('the trail lights up the step of each scene; the mission has every step done', () => {
  assert.deepEqual(trailStates(2).map((s) => s.state), ['done', 'done', 'now', 'todo', 'todo']);
  assert.ok(trailStates(5).every((s) => s.state === 'done'));
  assert.deepEqual(STEPS.map((s) => s.name), ['Ask', 'Plan', 'Collect', 'Explore', 'Conclude']);
});

test('the stage fits the screen and never grows past its real size', () => {
  assert.equal(stageScale(1920, 1080), 1);
  assert.equal(stageScale(480, 600), 0.5);
});

test('no timer: nothing in the story moves on by itself (Round 4, Habiba)', () => {
  assert.doesNotMatch(STORY_JS, /autoplay|setInterval/i);
});

test('the story opens by itself once per browser (it is remembered as seen)', () => {
  clearChildData();
  setExplorerCode('OWL-07');
  assert.equal(hasSeenTutorial(), false);
  markTutorialSeen();
  assert.equal(hasSeenTutorial(), true);
});
