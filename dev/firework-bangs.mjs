// Developer tool (Part 61b, 11 Nov 2026): finds the bangs in the fireworks
// recording, so each firework on screen bursts exactly on its bang.
// Run: node dev/firework-bangs.mjs   ->   writes assets/sounds/fireworks-bangs.json
// Run it again whenever assets/sounds/fireworks.mp3 is replaced.
//
// How: Chrome decodes the MP3; we measure how loud it is every 10 ms; a bang
// is a sudden jump: much louder than the 150 ms before it AND loud compared
// with the loudest moment. Two bangs are at least 0.12 s apart (a double bang counts twice).
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOUND = 'assets/sounds/fireworks.mp3';
const OUT = join(ROOT, 'assets', 'sounds', 'fireworks-bangs.json');
const PORT = 5599;

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const data = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': extname(path) === '.mp3' ? 'audio/mpeg' : 'text/html' });
    res.end(data);
  } catch {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!doctype html><title>bangs</title>');
  }
}).listen(PORT);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/`);
const result = await page.evaluate(async (src) => {
  const bytes = await (await fetch(src)).arrayBuffer();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes);
  // Mix the channels into one, then the loudness (RMS) of every 10 ms.
  const frame = Math.round(audio.sampleRate * 0.01);
  const channels = [...Array(audio.numberOfChannels)].map((_, c) => audio.getChannelData(c));
  const loud = [];
  for (let start = 0; start + frame <= audio.length; start += frame) {
    let sum = 0;
    for (let i = start; i < start + frame; i++) {
      let v = 0;
      for (const ch of channels) v += ch[i];
      v /= channels.length;
      sum += v * v;
    }
    loud.push(Math.sqrt(sum / frame));
  }
  const max = Math.max(...loud);
  const bangs = [];
  const BEFORE = 15; // 150 ms
  for (let i = BEFORE; i < loud.length; i++) {
    const before = loud.slice(i - BEFORE, i).reduce((a, b) => a + b, 0) / BEFORE;
    const isJump = loud[i] > 2.2 * before && loud[i] > 0.22 * max;
    const t = i * 0.01;
    if (isJump && (!bangs.length || t - bangs.at(-1) >= 0.12)) bangs.push(Math.round(t * 100) / 100);
  }
  return { duration: Math.round(audio.duration * 100) / 100, bangs };
}, `/${SOUND}`);
await browser.close();
server.close();

const json = { file: SOUND, ...result };
await writeFile(OUT, `${JSON.stringify(json, null, 2)}\n`);
console.log(`${result.bangs.length} bangs in ${result.duration} s: ${result.bangs.join(', ')}`);
console.log(`Saved ${OUT}`);
