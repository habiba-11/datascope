import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import {
  triedText, buildFrequencyData, makeChartConfig, describeChart, dotSize, valueText, countText, directLabelText,
  pieCountLabels, pieKeyPosition, tallestIndex, numberLine, lineFits, linePoints,
} from '../js/helpers/charts.js';

const SLEEP = { chartAxis: 'Hours of sleep', valueLabel: '{value} hours' };
const SHOES = { chartAxis: 'Shoe size', valueLabel: 'Size {value}' };
const GAMES = { chartAxis: 'Game', valueLabel: '{value}' };

test('dot plot of text answers uses a category x-axis (one column per game)', () => {
  const { labels, data } = buildFrequencyData(['Tag', 'Football', 'Football']);
  const config = makeChartConfig('dot', labels, data, GAMES);
  assert.equal(config.options.scales.x.type, 'category');
  assert.deepEqual(config.options.scales.x.labels, ['Football', 'Tag']);
});

test('dot plot of numbers keeps a number line from the first to the last value', () => {
  const { labels, data } = buildFrequencyData([3, 9, 9, 10]);
  const x = makeChartConfig('dot', labels, data, SLEEP).options.scales.x;
  assert.equal(x.type, 'linear');
  assert.equal(x.min, 2);
  assert.equal(x.max, 11);
});

test('the y-axis leaves one step above the tallest bar for its label', () => {
  const config = makeChartConfig('bar', [3, 9], [1, 6], SLEEP);
  assert.equal(config.options.scales.y.max, 7);
});

test('shared labels give a count of 0 for values nobody chose (Class A vs B)', () => {
  const { labels, data } = buildFrequencyData([20, 20, 21], [5, 20, 21, 35]);
  assert.deepEqual(labels, [5, 20, 21, 35]);
  assert.deepEqual(data, [0, 2, 1, 0]);
});

test('a chart is also described in words for screen readers', () => {
  assert.equal(describeChart('bar', [3, 9, 10], [1, 6, 0], SLEEP), 'Bar chart. 3 hours: 1 kid. 9 hours: 6 kids.');
  assert.equal(describeChart('pie', ['Football', 'Tag'], [6, 3], GAMES), 'Pie chart. Football: 6 kids. Tag: 3 kids.');
});

test('dots shrink to fit when answers are close on a long number line, and never vanish', () => {
  assert.equal(dotSize(60), 14); // lots of room: the big f13 size
  assert.equal(dotSize(14), 6); // Class A on the shared 4-36 line: 2 x 6 = 12 px < 14 px, no overlap
  assert.equal(dotSize(4), 3); // very tight: still a visible dot
});

test('sizes and counts are said in different words (Prof comment 2)', () => {
  assert.equal(valueText(34, SHOES), 'Size 34');
  assert.equal(valueText(9, SLEEP), '9 hours');
  assert.equal(valueText('Football', GAMES), 'Football');
  assert.equal(countText(1), '1 kid');
  assert.equal(countText(6), '6 kids');
});

test('a bar chart shows the words on the x-axis, with titles on both axes', () => {
  const config = makeChartConfig('bar', [34, 35], [5, 3], SHOES);
  assert.deepEqual(config.data.labels, ['Size 34', 'Size 35']);
  assert.equal(config.options.scales.x.title.text, 'Shoe size');
  assert.equal(config.options.scales.y.title.text, 'Number of kids');
});

test('a line fits numbers, but not words (games have no order)', () => {
  assert.equal(lineFits([3, 7, 8]), true);
  assert.equal(lineFits(['Football', 'Tag']), false);
});

test('the line keeps true gaps: nobody slept 4, 5 or 6 hours', () => {
  const points = linePoints([3, 7, 8, 9, 10], [1, 4, 4, 6, 5]);
  assert.deepEqual(points.map((p) => p.x), [3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(points.map((p) => p.y), [1, 0, 0, 0, 4, 4, 6, 5]);
  assert.deepEqual(points.map((p) => p.top), [true, false, false, false, true, true, true, true]);
});

test('the line steps by the answers\' own step, so Class B has no false dips', () => {
  const shared = [5, 10, 15, 18, 19, 20, 21, 22, 25, 30, 35];
  const classB = linePoints(shared, [2, 2, 4, 0, 0, 2, 0, 0, 3, 4, 1]);
  assert.deepEqual(classB.map((p) => p.x), [5, 10, 15, 20, 25, 30, 35]);
  assert.deepEqual(classB.map((p) => p.y), [2, 2, 4, 2, 3, 4, 1]);
  // Class A answers in 1s, on the same shared range.
  const classA = linePoints(shared, [0, 0, 0, 2, 5, 4, 5, 2, 0, 0, 0]);
  assert.equal(classA[0].x, 5);
  assert.equal(classA[classA.length - 1].x, 35);
  assert.equal(classA.find((p) => p.x === 19).y, 5);
  assert.equal(classA.find((p) => p.x === 6).y, 0);
});

test('a line chart uses the number line, with words and titles', () => {
  const config = makeChartConfig('line', [3, 7], [1, 4], SLEEP);
  const { x, y } = config.options.scales;
  assert.equal(x.type, 'linear');
  assert.equal(x.ticks.callback(3), '3 hours');
  assert.equal(x.title.text, 'Hours of sleep');
  assert.equal(y.title.text, 'Number of kids');
  assert.equal(config.data.datasets[0].borderWidth, 5);
});

test('the dot plot says Number of kids too, and its number line uses words', () => {
  const { x, y } = makeChartConfig('dot', [34, 35], [5, 3], SHOES).options.scales;
  assert.equal(y.title.text, 'Number of kids');
  assert.equal(x.title.text, 'Shoe size');
  assert.equal(x.ticks.callback(34), 'Size 34');
});

test('all chart text is at least 18px, bold and dark', () => {
  const config = makeChartConfig('bar', [34, 35], [5, 3], SHOES);
  const { x, y } = config.options.scales;
  for (const part of [x.ticks, x.title, y.ticks, y.title]) {
    assert.ok(part.font.size >= 18);
    assert.equal(part.font.weight, 'bold');
    assert.equal(part.color, '#17324D');
  }
  assert.equal(config.options.plugins.directLabels.large, true);
});

test('every answer keeps its label on a narrow chart', () => {
  assert.equal(makeChartConfig('bar', ['Tag', 'Football'], [1, 2], GAMES).options.scales.x.ticks.autoSkip, false);
});

test('a crowded chart (11 values) uses plain numbers; its axis titles say what they are', () => {
  const labels = [5, 10, 15, 18, 19, 20, 21, 22, 25, 30, 35];
  const data = labels.map(() => 2);
  const reading = { chartAxis: 'Minutes of reading', valueLabel: '{value} min' };
  const bar = makeChartConfig('bar', labels, data, reading);
  assert.equal(bar.data.labels[0], '5');
  assert.equal(bar.options.plugins.directLabels.kids, false);
  assert.equal(bar.options.scales.x.title.text, 'Minutes of reading');
  assert.equal(bar.options.scales.y.title.text, 'Number of kids');
  // A pie has no axes, so it keeps its full words.
  assert.equal(makeChartConfig('pie', labels, data, reading).data.labels[0], '5 min');
});

test('words on the chart: kids, pie slices, and plain numbers for the teacher charts', () => {
  assert.equal(directLabelText(6, { kids: true }), '6 kids');
  assert.equal(directLabelText(6, {}), 6);
});

// Slices from the top, clockwise, like Chart.js draws a pie.
function pieSlices(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  let angle = -Math.PI / 2;
  return counts.map((count, index) => {
    const startAngle = angle;
    angle += (count / total) * 2 * Math.PI;
    return { index, x: 200, y: 150, startAngle, endAngle: angle, outerRadius: 100 };
  });
}

test('pie counts sit outside the pie, on the side of their slice', () => {
  for (const label of pieCountLabels(pieSlices([3, 6, 2, 1, 3]), 300)) {
    assert.ok(Math.hypot(label.x - 200, label.y - 150) > 100, 'outside the pie');
    assert.equal(label.side, label.x >= 200 ? 1 : -1);
  }
});

test('pie counts never overlap and stay on the chart, even with many small slices', () => {
  for (const counts of [[3, 6, 2, 1, 3], [2, 2, 4, 2, 3, 4, 1], [1, 1, 1, 1, 1, 1, 20]]) {
    const labels = pieCountLabels(pieSlices(counts), 300);
    for (const side of [1, -1]) {
      const ys = labels.filter((l) => l.side === side).map((l) => l.y).sort((a, b) => a - b);
      ys.forEach((y, i) => {
        assert.ok(y >= 11 && y <= 289, `y ${y} on the chart`);
        if (i > 0) assert.ok(y - ys[i - 1] >= 22, `gap between ${ys[i - 1]} and ${y}`);
      });
    }
  }
});

test('a pie has a key with the names, titled with the axis name', () => {
  const { options, data } = makeChartConfig('pie', ['Football', 'Tag'], [6, 3], GAMES);
  assert.equal(options.plugins.legend.display, true);
  assert.equal(options.plugins.legend.title.text, 'Game');
  assert.deepEqual(data.labels, ['Football', 'Tag']);
  assert.equal(options.plugins.legend.labels.font.size, 18);
});

test('the key moves under a narrow pie, and follows the chart when it resizes', () => {
  assert.equal(pieKeyPosition(445), 'bottom');
  assert.equal(pieKeyPosition(900), 'right');
  const { options } = makeChartConfig('pie', ['Tag'], [1], GAMES);
  const chart = { options };
  options.onResize(chart, { width: 445 });
  assert.equal(options.plugins.legend.position, 'bottom');
  options.onResize(chart, { width: 900 });
  assert.equal(options.plugins.legend.position, 'right');
});

test('numbers: the one tallest bar is gold, the rest blue; a tie has no gold', () => {
  assert.equal(tallestIndex([1, 6, 4]), 1);
  assert.equal(tallestIndex([5, 2, 5]), -1);
  const colours = makeChartConfig('bar', [3, 9, 10], [1, 6, 4], SLEEP).data.datasets[0].backgroundColor;
  assert.deepEqual(colours, ['#38B6FF', '#FFC531', '#38B6FF']);
  // Words keep one colour each.
  const games = makeChartConfig('bar', ['Football', 'Tag'], [6, 3], GAMES).data.datasets[0].backgroundColor;
  assert.equal(new Set(games).size, 2);
});

test('games on a line chart: dots on stems, no line between them', () => {
  const config = makeChartConfig('line', ['Football', 'Tag'], [6, 3], GAMES);
  assert.equal(config.data.datasets[0].showLine, false);
  assert.equal(config.options.plugins.directLabels.stems, true);
  assert.equal(config.options.scales.y.title.text, 'Number of kids');
});

test('every chart keeps the real answers, for the tap-to-read helper', () => {
  assert.deepEqual(makeChartConfig('bar', [34, 35], [5, 3], SHOES).data.datasets[0].values, [34, 35]);
  assert.deepEqual(makeChartConfig('pie', [5, 18], [0, 2], SLEEP).data.datasets[0].values, [18]);
});

test('answers nobody chose get no slice and no key row', () => {
  const { data } = makeChartConfig('pie', [5, 18, 19], [0, 2, 5], { valueLabel: '{value} min' });
  assert.deepEqual(data.labels, ['18 min', '19 min']);
  assert.deepEqual(data.datasets[0].data, [2, 5]);
});

test('every pie slice has its own colour, because the key links names by colour', () => {
  const labels = [5, 10, 15, 20, 25, 30, 35]; // Class B: the most answers on any pie
  const colours = makeChartConfig('pie', labels, [2, 2, 4, 2, 3, 4, 1], SLEEP).data.datasets[0].backgroundColor;
  assert.equal(new Set(colours).size, labels.length);
});

test('a number line counts in 1s, or in 5s across a wide range', () => {
  assert.deepEqual(numberLine([3, 7, 8, 9, 10]), { min: 2, max: 11, step: 1 });
  assert.deepEqual(numberLine([5, 10, 15, 18, 22, 35]), { min: 0, max: 40, step: 5 });
});

test('every recipe names its axis and its value label', () => {
  const folder = new URL('../data/scenarios/', import.meta.url);
  for (const file of readdirSync(folder)) {
    const recipe = JSON.parse(readFileSync(new URL(file, folder), 'utf8'));
    assert.ok(recipe.chartAxis, `${file}: chartAxis`);
    assert.ok(recipe.valueLabel?.includes('{value}'), `${file}: valueLabel`);
  }
});

test("the toolbar counter counts the graphs tried, and cheers at all 4", () => {
  assert.equal(triedText(1), "Graphs tried: 1 of 4");
  assert.equal(triedText(2), "Graphs tried: 2 of 4");
  assert.equal(triedText(4), 'Graphs tried: 4 of 4 :party:');
});

// ---------- 10 Nov 2026: each graph comes in its own way ----------
import { chartEntrance, ENTRANCE_STEP_MS } from '../js/helpers/charts.js';

test('graphs come in with movement: bars one after another, a popping pie, falling dots, a rising line', () => {
  const at = (opts, dataIndex) => opts.animation.delay({ type: 'data', mode: 'default', dataIndex });
  const bar = chartEntrance('bar');
  assert.equal(at(bar, 0), 0);
  assert.equal(at(bar, 3), 3 * ENTRANCE_STEP_MS.bar); // the 4th bar starts last
  assert.equal(bar.animation.delay({ type: 'chart', mode: 'default' }), 0); // the axes do not wait
  const pie = chartEntrance('pie');
  // 10 Nov 2026 (Habiba): no slow spin; it pops open from the middle, quickly.
  assert.ok(pie.animation.animateScale && !pie.animation.animateRotate);
  assert.ok(pie.animation.duration <= 800);
  // The first graph waits until the room is on screen: every bar starts later.
  const first = chartEntrance('bar', 700);
  assert.equal(at(first, 0), 700);
  assert.equal(at(first, 2), 700 + 2 * ENTRANCE_STEP_MS.bar);
  const dot = chartEntrance('dot');
  assert.equal(dot.animation.easing, 'easeOutBounce');
  assert.equal(dot.animations.y.from({ chart: { chartArea: { top: 50 } } }), 20); // just above the chart
  const line = chartEntrance('line');
  assert.equal(line.animations.y.from({ chart: { scales: { y: { getPixelForValue: () => 300 } } } }), 300); // from the bottom
  // A whole entrance stays short (under 3 s for 12 bars), so children never wait.
  assert.ok(at(bar, 11) + bar.animation.duration < 3000);
});
