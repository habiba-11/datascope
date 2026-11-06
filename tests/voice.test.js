import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rankVoices, pickVoice, speechText, speakingTime, VOICE_STYLE,
} from '../js/helpers/voice.js';

// Voices like the ones on a Windows laptop with Chrome, and on a Chromebook.
const WINDOWS = [
  { name: 'Microsoft David - English (United States)', lang: 'en-US' },
  { name: 'Microsoft Zira - English (United States)', lang: 'en-US' },
  { name: 'Google US English', lang: 'en-US' },
  { name: 'Google UK English Male', lang: 'en-GB' },
  { name: 'Google français', lang: 'fr-FR' },
  { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US' },
];

test('only English voices, the clearest first (a Natural voice beats Google beats the rest)', () => {
  const ranked = rankVoices(WINDOWS);
  assert.ok(ranked.every((v) => v.lang.startsWith('en')));
  assert.match(ranked[0].name, /Natural/);
  assert.ok(ranked.findIndex((v) => /Google US/.test(v.name)) < ranked.findIndex((v) => /David/.test(v.name)));
});

test('Sara gets a female voice and Pip a male one, so they sound different', () => {
  const ranked = rankVoices(WINDOWS);
  assert.match(pickVoice(ranked, 'sara').name, /Aria|Zira|Google US/);
  assert.match(pickVoice(ranked, 'pip').name, /Male|David/);
  assert.notEqual(pickVoice(ranked, 'sara').name, pickVoice(ranked, 'pip').name);
});

test('no voices at all: no voice (the words stay on screen)', () => {
  assert.equal(pickVoice([], 'pip'), null);
  assert.equal(pickVoice(rankVoices([{ name: 'Google français', lang: 'fr-FR' }]), 'sara'), null);
});

test('the spoken words: CAPITAL words in lowercase (not spelled out), calm "!", "..." as a pause', () => {
  assert.equal(speechText('Now it is YOUR turn!'), 'Now it is your turn.');
  assert.equal(speechText('Hmm... do my classmates sleep enough?'), 'Hmm, do my classmates sleep enough?');
  assert.equal(speechText('I am Pip.'), 'I am Pip.'); // a single capital letter stays
});

test('each speaker has a gentle speed and pitch, and a line has a safety time', () => {
  for (const style of Object.values(VOICE_STYLE)) assert.ok(style.rate >= 0.9 && style.rate <= 1.1);
  assert.ok(VOICE_STYLE.kids.pitch > VOICE_STYLE.sara.pitch && VOICE_STYLE.sara.pitch > VOICE_STYLE.pip.pitch);
  assert.equal(speakingTime('Hi!'), 1200);
  assert.ok(speakingTime('x'.repeat(100)) > 6000);
});

test('a laptop with only George, Hazel and Susan (found on 6 Nov 2026): Pip is George, Sara is Hazel', () => {
  const ranked = rankVoices([
    { name: 'Microsoft George - English (United Kingdom)', lang: 'en-GB' },
    { name: 'Microsoft Hazel - English (United Kingdom)', lang: 'en-GB' },
    { name: 'Microsoft Susan - English (United Kingdom)', lang: 'en-GB' },
  ]);
  assert.match(pickVoice(ranked, 'pip').name, /George/);
  assert.match(pickVoice(ranked, 'sara').name, /Hazel/);
  assert.match(pickVoice(ranked, 'kids').name, /Susan/);
});
