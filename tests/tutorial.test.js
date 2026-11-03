import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  sceneButtons, autoplayStep, stageScale, tutorialExample,
} from '../js/helpers/tutorial-steps.js';
import { allStrings, longestSentence, MAX_SENTENCE_WORDS } from '../js/helpers/readability.js';
import {
  setExplorerCode, hasSeenTutorial, markTutorialSeen, clearChildData,
} from '../js/storage/save.js';

const read = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
const { scenes } = read('content/tutorial.json');
const THEME = readFileSync(new URL('../css/theme.css', import.meta.url), 'utf8');
const everything = allStrings(scenes).join(' | ');
const scene = (id) => scenes.find((s) => s.id === id);
const example = () => tutorialExample(read('scenarios/sleep-hours.json'), read('content/sleep-hours.json'));

test('six scenes, each with its words and a time on screen', () => {
  assert.deepEqual(scenes.map((s) => s.id), ['hello', 'mission', 'journey', 'rooms', 'howto', 'ready']);
  for (const s of scenes) {
    assert.ok(s.title && s.caption && s.heading, s.id);
    assert.ok(s.ms >= 6000 && s.ms <= 15000, s.id);
  }
});

test('about a minute in all, as the start-page button says', () => {
  const total = scenes.reduce((sum, s) => sum + s.ms, 0);
  assert.ok(total >= 45000 && total <= 60000, `${total} ms`);
});

test('it covers what Prof asked: the purpose, how to use it, and every room', () => {
  assert.match(scene('hello').bubble, /lab for numbers/);
  assert.match(scene('mission').heading, /Data Detective/);
  assert.deepEqual(scene('journey').steps.map((s) => s.name), ['Ask', 'Plan', 'Collect', 'Explore', 'Conclude']);
  assert.deepEqual(
    scene('rooms').rooms.map((r) => r.name),
    ['Question Studio', 'Data Hub', 'Graph Lab', 'Number Lab', 'Chance Lab', 'Evidence Board'],
  );
  assert.equal(scene('howto').calls.length, 4);
});

test('the room names are the ones the real rooms use', () => {
  const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  for (const name of ['Graph Lab', 'Number Lab', 'Chance Lab']) assert.ok(source.includes(name), name);
  for (const [file, name] of [['question-studio', 'Question Studio'], ['data-hub', 'Data Hub'], ['evidence-board', 'Evidence Board']]) {
    assert.ok(readFileSync(new URL(`../js/rooms/${file}.js`, import.meta.url), 'utf8').includes(name), name);
  }
});

test('it shows the new way of working: answer hints and the About tab, not the (i) button', () => {
  const howto = scene('howto');
  assert.equal(howto.aboutTab, '📖 About this room');
  assert.doesNotMatch(everything, /ℹ️|\(i\)/);
  assert.match(howto.calls.join(' '), /drag it into the box/);
  assert.match(howto.calls.join(' '), /write it all yourself/);
});

test('the words follow the Grade 5 rule; we say "centre", never "middle"', () => {
  for (const text of allStrings(scenes)) {
    assert.ok(longestSentence(text) <= MAX_SENTENCE_WORDS, `"${text}"`);
    assert.doesNotMatch(text, /middle/i, `"${text}"`);
  }
  assert.match(everything, /pretend class/);
});

test('rewards stay about thinking, and speed is never praised', () => {
  assert.match(scene('ready').stars, /good thinking, not speed/);
  assert.doesNotMatch(everything, /\b(quick|fast|hurry|timer|seconds)\b/i);
});

test('every colour comes from the theme', () => {
  const colours = scenes.flatMap((s) => [...(s.skills || []), ...(s.steps || []), ...(s.rooms || [])]).map((x) => x.colour);
  assert.ok(colours.length > 0);
  for (const colour of colours) {
    assert.ok(THEME.includes(`--color-${colour}:`), colour);
    assert.ok(THEME.includes(`--color-${colour}-light:`), colour);
  }
});

test('scene 5 uses real hints, built from the sleep data', () => {
  const { question, answers } = example();
  assert.match(question, /tell us about our sleep/);
  assert.deepEqual(answers, [
    '9 hours is the most common answer, with 6 kids.',
    'Only 1 kid slept 3 hours.',
    'The answers go from 3 hours to 10 hours.',
  ]);
});

test('the buttons of each scene', () => {
  assert.deepEqual(sceneButtons(0, 6), { backDisabled: true, showSkip: true, showClose: false, nextLabel: 'Next →' });
  assert.deepEqual(sceneButtons(3, 6), { backDisabled: false, showSkip: true, showClose: false, nextLabel: 'Next →' });
  assert.deepEqual(sceneButtons(5, 6), { backDisabled: false, showSkip: false, showClose: true, nextLabel: '↻ Watch again' });
});

test('autoplay stays until the scene\'s time is up, moves on, and stops on the last scene', () => {
  assert.equal(autoplayStep(2000, 6000, 0, 6), 'stay');
  assert.equal(autoplayStep(6000, 6000, 0, 6), 'next');
  assert.equal(autoplayStep(7000, 7000, 5, 6), 'end');
});

test('the scene scales to fit, and never grows past its real size', () => {
  assert.equal(stageScale(1400, 900), 1);
  assert.equal(stageScale(480, 900), 0.5);
  assert.equal(stageScale(960, 270), 0.5);
});

test('it opens by itself once per browser, and clearing the device shows it again', () => {
  clearChildData();
  assert.equal(hasSeenTutorial(), false);
  markTutorialSeen();
  assert.equal(hasSeenTutorial(), true);
  setExplorerCode('FOX-12'); // there is no code yet on the start page, so it is not per child
  assert.equal(hasSeenTutorial(), true);
  clearChildData();
  assert.equal(hasSeenTutorial(), false);
});
