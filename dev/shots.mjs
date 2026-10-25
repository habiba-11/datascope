// Developer tool (never shipped to children): takes screenshots of the main
// pages for the thesis, at Chromebook (1366x768) and tablet (768x1024) size.
// Run: npm run shots   ->   pictures land in dev/screenshots/ (not in Git).
// Uses playwright-core with the Chrome already installed on this computer.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dev', 'screenshots');
const PORT = 5598;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

// A tiny static server, like Live Server (ES modules need http://, not file://).
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const data = await readFile(join(ROOT, path.endsWith('/') ? `${path}index.html` : path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT);

const PAGES = [
  ['start', '/index.html'],
  ['question-studio', '/rooms/question-studio.html'],
  ['data-hub', '/rooms/data-hub.html'],
  ['graph-lab', '/rooms/graph-lab.html'],
  ['number-lab', '/rooms/number-lab.html'],
  ['chance-lab', '/rooms/chance-lab.html'],
  ['evidence-board', '/rooms/evidence-board.html'],
  ['teacher', '/teacher/index.html'],
];
const SIZES = [['chromebook', 1366, 768], ['tablet', 768, 1024]];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [sizeName, width, height] of SIZES) {
  const page = await browser.newPage({ viewport: { width, height } });
  // A test explorer with the teacher preview on, so every room opens.
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.evaluate(() => {
    localStorage.setItem('datascope:explorerCode', 'OWL-07');
    localStorage.setItem('datascope:previewAll', 'on');
  });
  for (const [name, path] of PAGES) {
    await page.goto(`http://localhost:${PORT}${path}`);
    await page.waitForTimeout(1200); // fonts, data and the pop-in animations
    await page.screenshot({ path: join(OUT, `${name}-${sizeName}.png`) });
  }
  await page.close();
}
await browser.close();
server.close();
console.log(`Screenshots saved in ${OUT}`);
