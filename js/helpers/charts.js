import { compareValues } from './stats.js';

const PALETTE = ['#FF7A6B', '#FFC531', '#38B6FF', '#4CC26B', '#8E7CFF'];

// Counts how often each value appears. `allLabels` is optional: pass it to
// use the same labels for two classes (a value nobody chose gets a count of 0).
export function buildFrequencyData(values, allLabels) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  const labels = allLabels || [...counts.keys()].sort(compareValues);
  const data = labels.map((label) => counts.get(label) || 0);
  return { labels, data };
}

const CHART_NAMES = { bar: 'Bar chart', line: 'Line chart', pie: 'Pie chart', dot: 'Dot plot' };
const COUNT_AXIS = 'Number of kids';
// With more values than this (reading minutes: 11), "18 min" and "5 kids" would
// run into each other. Those charts show plain numbers; the axis titles say what they are.
const CROWDED_LABELS = 7;
// Prof's comment 2: all chart text is large, bold and dark.
const CHART_FONT = { size: 18, weight: 'bold', family: 'Nunito, sans-serif' };
const CHART_TEXT_COLOUR = '#17324D';
const LINE_COLOUR = '#0E7CC7'; // darker than the bars' blue, so the line stands out on white
const LINE_FILL = 'rgba(56, 182, 255, 0.18)';
// f13 (4 Nov 2026): number answers are blue, and the ONE tallest bar or point is
// gold (the read-out says "tallest" in words too, so colour is not the only signal).
const BLUE = '#38B6FF';
const GOLD = '#FFC531';
// A pie's counts sit this far outside the slice, one 18px line each.
const PIE_COUNT_GAP = 10;
const PIE_COUNT_HEIGHT = 22;
const NARROW_PIE = 700; // px: narrower, and the key title (e.g. "Minutes of reading") would be cut off beside the pie
// The pie is linked to its key by colour, so each slice needs its own colour
// (at most 7 answers on a pie today). The first 5 are the bar chart's colours.
const PIE_PALETTE = [...PALETTE, '#FF9F43', '#F06FB5', '#1FC8B4'];

// The size or answer: "Size 34", "9 hours", "Football" (from the recipe's valueLabel).
export function valueText(value, recipe) {
  return recipe?.valueLabel ? recipe.valueLabel.replace('{value}', value) : String(value);
}

// The count: "1 kid", "6 kids". Never just a number, so it can't be mixed up with a size.
export function countText(count) {
  return `${count} kid${count === 1 ? '' : 's'}`;
}

// A chart drawn on a <canvas> is invisible to screen readers, so we also say
// what it shows in words, e.g. "Bar chart. 3 hours: 1 kid. 9 hours: 6 kids."
export function describeChart(type, labels, data, recipe) {
  const parts = labels
    .map((label, i) => ({ label, count: data[i] }))
    .filter(({ count }) => count > 0)
    .map(({ label, count }) => `${valueText(label, recipe)}: ${countText(count)}`);
  return `${CHART_NAMES[type] || 'Chart'}. ${parts.join('. ')}.`;
}

// The number written on a bar or dot. Graph Lab turns on `kids`; the teacher's
// charts leave it off and keep their plain numbers.
export function directLabelText(count, { kids = false } = {}) {
  return kids ? countText(count) : count;
}

// Where a pie's counts go: just outside the middle of each slice, the way
// Habiba's reference picture does it; the names are in the key beside the pie.
// Counts on the same side are moved up or down just enough never to overlap,
// and they stay between 0 and `height`.
export function pieCountLabels(slices, height) {
  const labels = slices.map((slice) => {
    const middle = (slice.startAngle + slice.endAngle) / 2;
    const cos = Math.cos(middle);
    const reach = slice.outerRadius + PIE_COUNT_GAP;
    return {
      index: slice.index,
      side: cos >= 0 ? 1 : -1,
      x: slice.x + cos * reach,
      y: slice.y + Math.sin(middle) * reach,
    };
  });
  for (const side of [1, -1]) {
    const column = labels.filter((l) => l.side === side).sort((a, b) => a.y - b.y);
    // Down the column: never above the top, never on the label above.
    column.forEach((label, i) => {
      const lowest = i === 0 ? PIE_COUNT_HEIGHT / 2 : column[i - 1].y + PIE_COUNT_HEIGHT;
      label.y = Math.max(label.y, lowest);
    });
    // Back up the column: never below the bottom, never on the label below.
    for (let i = column.length - 1; i >= 0; i -= 1) {
      const highest = i === column.length - 1 ? height - PIE_COUNT_HEIGHT / 2 : column[i + 1].y - PIE_COUNT_HEIGHT;
      column[i].y = Math.min(column[i].y, highest);
    }
  }
  return labels;
}

// The index of the one tallest value, or -1 when two or more share the top
// (then nothing is gold: there is no single tallest).
export function tallestIndex(data) {
  const max = Math.max(...data);
  return max > 0 && data.filter((d) => d === max).length === 1 ? data.indexOf(max) : -1;
}

// A pie's key sits beside it, or underneath when the chart is narrow (so the
// counts and the key's title are never cut off).
export function pieKeyPosition(chartWidth) {
  return chartWidth < NARROW_PIE ? 'bottom' : 'right';
}

function drawPieCounts(chart, ctx) {
  const data = chart.data.datasets[0].data;
  const slices = chart.getDatasetMeta(0).data.map((element, index) => ({
    index,
    x: element.x,
    y: element.y,
    startAngle: element.startAngle,
    endAngle: element.endAngle,
    outerRadius: element.outerRadius,
  }));
  ctx.save();
  ctx.fillStyle = CHART_TEXT_COLOUR;
  ctx.font = `bold ${CHART_FONT.size}px Nunito, sans-serif`;
  ctx.textBaseline = 'middle';
  for (const label of pieCountLabels(slices, chart.height)) {
    ctx.textAlign = label.side === 1 ? 'left' : 'right';
    ctx.fillText(countText(data[label.index]), label.x, label.y);
  }
  ctx.restore();
}

// The steps of a number line. A wide range counts in 5s (reading minutes: 5, 10,
// 15...), so the 18px labels fit without skipping to odd numbers like 4, 7, 10.
export function numberLine(labels) {
  const first = labels[0];
  const last = labels[labels.length - 1];
  if (last - first <= 12) return { min: first - 1, max: last + 1, step: 1 };
  return { min: Math.floor((first - 1) / 5) * 5, max: Math.ceil((last + 1) / 5) * 5, step: 5 };
}


// Draws each value's number directly on the chart, so kids don't have to
// hover to read it (Shah & Hoeffner, Paper 20: label directly, not a legend).
export const directLabelsPlugin = {
  id: 'directLabels',
  // Games on a "line" chart: each dot stands on a dashed stem, not on a line
  // (games have no order, so a line between them would mean nothing).
  beforeDatasetsDraw(chart, args, options) {
    if (!options.stems) return;
    const { ctx } = chart;
    const bottom = chart.scales.y.getPixelForValue(0);
    ctx.save();
    ctx.strokeStyle = CHART_TEXT_COLOUR;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.setLineDash([2, 9]);
    chart.getDatasetMeta(0).data.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(point.x, bottom);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });
    ctx.restore();
  },
  afterDatasetsDraw(chart, args, options) {
    const { ctx } = chart;
    if (chart.config.type === 'pie') {
      drawPieCounts(chart, ctx);
      return;
    }
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((element, index) => {
        const value = dataset.data[index];
        if (value === null || value === undefined) return;
        // Dot plot: only the top dot of each stack gets a number.
        if (typeof value === 'object' && !value.top) return;
        const count = typeof value === 'object' ? value.y : value;
        if (count === 0) return; // nothing to label on an empty bar or slice

        const text = directLabelText(count, { kids: options.kids });
        const { x, y } = element.tooltipPosition();
        ctx.save();
        ctx.fillStyle = CHART_TEXT_COLOUR;
        ctx.font = `bold ${options.large ? CHART_FONT.size : 14}px Nunito, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // A white outline behind the text keeps it readable on slice borders.
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        // Clear of the big dots (line chart, dot plot, stems); bars need less.
        const lift = chart.config.type === 'bar' ? 8 : (element.options?.radius || 8) + 6;
        ctx.strokeText(text, x, y - lift);
        ctx.fillText(text, x, y - lift);
        ctx.restore();
      });
    });
  },
};

// One dot per classmate, stacked upwards. The top dot of each stack is marked
// so the labels plugin can write the count there (and only there).
function toDotPoints(labels, data) {
  const points = [];
  labels.forEach((label, i) => {
    for (let stack = 1; stack <= data[i]; stack++) {
      points.push({ x: label, y: stack, top: stack === data[i] });
    }
  });
  return points;
}

// A line joins answers in order, so it only makes sense for numbers. Games
// have no order: a line between them would mean nothing (Paper 20).
export function lineFits(labels) {
  return typeof labels[0] !== 'string';
}

const greatestDivisor = (a, b) => (b === 0 ? a : greatestDivisor(b, a % b));

// The points of a line chart on a true number line. Values nobody chose count
// as 0, so a gap really shows (nobody slept 4, 5 or 6 hours). It steps by the
// answers' own step: Class B answers in 5s, so 6 to 9 minutes are not false dips.
export function linePoints(labels, data) {
  const chosen = labels.filter((_, i) => data[i] > 0);
  const step = chosen.reduce((gap, value, i) => (i === 0 ? gap : greatestDivisor(gap, value - chosen[i - 1])), 0) || 1;
  const counts = new Map(labels.map((label, i) => [label, data[i]]));
  const first = labels[0];
  const start = chosen[0] - Math.floor((chosen[0] - first) / step) * step;
  const points = [];
  for (let x = start; x <= labels[labels.length - 1]; x += step) {
    const y = counts.get(x) || 0;
    points.push({ x, y, top: y > 0 }); // `top`: the labels plugin writes a count here
  }
  return points;
}

const MAX_DOT = 14; // f13: big dots, one per kid
// How big a dot can be: at most 14px, and never wider than the gap between two
// neighbouring values on the x-axis (or the height of one stack step), so the
// dots never overlap. Chart.js asks again when the chart is resized.
export function dotSize(pixelsPerStep) {
  return Math.max(3, Math.min(MAX_DOT, Math.floor(pixelsPerStep / 2) - 1));
}

function dotRadius({ chart }) {
  const { x, y } = chart.scales;
  if (!x || !y) return MAX_DOT;
  const across = Math.abs(x.getPixelForValue(1) - x.getPixelForValue(0));
  const up = Math.abs(y.getPixelForValue(1) - y.getPixelForValue(0));
  return dotSize(Math.min(across, up));
}

// The x-axis of a dot plot or line chart. Numbers get a number line from the
// first to the last label (so two compared classes share the same line). Text
// answers (e.g. playground games) get one column per category instead.
function dotXAxis(labels, title, shownValue) {
  if (typeof labels[0] === 'string') {
    return { type: 'category', labels, offset: true, title, ticks: bigTicks({ autoSkip: false }) };
  }
  const { min, max, step } = numberLine(labels);
  return {
    type: 'linear',
    title,
    ticks: bigTicks({ stepSize: step, callback: shownValue }),
    min,
    max,
  };
}

const bigTicks = (extra = {}) => ({ font: CHART_FONT, color: CHART_TEXT_COLOUR, ...extra });
const axisTitle = (text) => ({ display: true, text, font: CHART_FONT, color: CHART_TEXT_COLOUR });

// A pie, like Habiba's reference picture: counts outside the slices, and a key
// with the names beside it. Answers nobody chose get no slice and no key row.
function makePieConfig(labels, data, recipe) {
  const shown = labels.map((_, i) => i).filter((i) => data[i] > 0);
  return {
    type: 'pie',
    data: {
      labels: shown.map((i) => valueText(labels[i], recipe)),
      datasets: [{
        data: shown.map((i) => data[i]),
        backgroundColor: shown.map((_, i) => PIE_PALETTE[i % PIE_PALETTE.length]),
        borderColor: CHART_TEXT_COLOUR,
        borderWidth: 2,
        radius: '72%', // leaves room for the counts around the pie
        hoverBorderWidth: 5,
        values: shown.map((i) => labels[i]), // the real answers, for the tap-to-read helper
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // The chart changes width when the question appears beside it, or the tablet turns.
      onResize: (chart, size) => { chart.options.plugins.legend.position = pieKeyPosition(size.width); },
      plugins: {
        directLabels: { kids: true, large: true },
        legend: {
          display: true,
          position: 'right',
          onClick: () => {}, // tapping the key must not hide a slice
          title: { display: true, text: recipe?.chartAxis || 'Answer', font: CHART_FONT, color: CHART_TEXT_COLOUR },
          labels: { font: CHART_FONT, color: CHART_TEXT_COLOUR, boxWidth: 20, boxHeight: 20, padding: 10 },
        },
      },
    },
  };
}

// How each kind of graph comes in (10 Nov 2026, Habiba: "movement when I open
// them"). Bars grow up one after another; a line's points rise left to right;
// a pie spins open; the dots drop in and bounce, one by one. The number labels
// follow their bar or dot. Graph Lab uses none of this with reduced motion.
// Returns options to add to a Chart.js config (Chart.js 4).
export const ENTRANCE_STEP_MS = { bar: 110, line: 150, dot: 70 };

export function chartEntrance(type) {
  // Each bar / point / dot starts a little after the one before it.
  const oneByOne = (ms) => (ctx) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * ms : 0);
  if (type === 'pie') {
    return { animation: { animateRotate: true, animateScale: true, duration: 1100, easing: 'easeOutQuart' } };
  }
  if (type === 'dot') {
    return {
      animation: { duration: 700, easing: 'easeOutBounce', delay: oneByOne(ENTRANCE_STEP_MS.dot) },
      // From just above the chart: the dots fall into place.
      animations: { y: { from: (ctx) => (ctx.chart.chartArea ? ctx.chart.chartArea.top - 30 : 0) } },
    };
  }
  if (type === 'line') {
    return {
      animation: { duration: 650, easing: 'easeOutQuad', delay: oneByOne(ENTRANCE_STEP_MS.line) },
      // From the bottom of the chart: the line waves up into place.
      animations: { y: { from: (ctx) => (ctx.chart.scales?.y ? ctx.chart.scales.y.getPixelForValue(0) : 0) } },
    };
  }
  return { animation: { duration: 700, easing: 'easeOutBack', delay: oneByOne(ENTRANCE_STEP_MS.bar) } };
}

// `recipe` gives the words: chartAxis (the axis title) and valueLabel ("Size {value}").
// `yMax` is optional: when comparing two classes, both charts use the same height.
export function makeChartConfig(type, labels, data, recipe, yMax) {
  if (type === 'pie') return makePieConfig(labels, data, recipe);
  const words = typeof labels[0] === 'string';
  const tallest = tallestIndex(data);
  // Words: one colour each. Numbers: blue, and the one tallest in gold.
  const colors = labels.map((_, i) => {
    if (words) return PALETTE[i % PALETTE.length];
    return i === tallest ? GOLD : BLUE;
  });
  // One extra step above the tallest bar, so its number label is not cut off.
  const yTop = (yMax ?? Math.max(...data)) + 1;
  const crowded = labels.length > CROWDED_LABELS;
  const shownValue = (value) => (crowded ? String(value) : valueText(value, recipe));
  const xTitle = axisTitle(recipe?.chartAxis || 'Answer');
  const yAxis = { title: axisTitle(COUNT_AXIS), beginAtZero: true, ticks: bigTicks({ stepSize: 1 }), max: yTop };
  const plugins = { legend: { display: false }, directLabels: { kids: !crowded, large: true } };

  if (type === 'dot') {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          data: toDotPoints(labels, data),
          backgroundColor: '#38B6FF',
          pointBorderColor: '#17324D',
          pointBorderWidth: 2,
          pointRadius: dotRadius,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins,
        scales: {
          x: dotXAxis(labels, xTitle, shownValue),
          y: yAxis,
        },
      },
    };
  }

  if (type === 'line' && lineFits(labels)) {
    return {
      type: 'line',
      data: {
        datasets: [{
          data: linePoints(labels, data),
          borderColor: LINE_COLOUR,
          borderWidth: 5,
          backgroundColor: LINE_FILL,
          fill: 'origin',
          tension: 0, // straight lines: a curve would bulge past the real counts
          // The one tallest point is gold, the others blue.
          pointBackgroundColor: (context) => (context.raw?.x === labels[tallest] ? GOLD : BLUE),
          pointBorderColor: CHART_TEXT_COLOUR,
          pointBorderWidth: 3,
          // Big dots where kids answered, small ones where nobody did (none on a crowded chart).
          pointRadius: (context) => {
            if (context.raw?.y > 0) return dotRadius(context);
            return crowded ? 0 : 3;
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins,
        scales: {
          x: dotXAxis(labels, xTitle, shownValue),
          y: yAxis,
        },
      },
    };
  }

  if (type === 'line') {
    // Games: big dots on dashed stems instead of a line (the stems are drawn by
    // directLabelsPlugin), and Graph Lab shows a "Careful!" note.
    return {
      type: 'line',
      data: {
        labels: labels.map(shownValue),
        datasets: [{
          data,
          showLine: false,
          pointRadius: 15,
          pointHoverRadius: 17,
          pointBackgroundColor: colors,
          pointBorderColor: CHART_TEXT_COLOUR,
          pointBorderWidth: 3,
          values: labels,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { ...plugins, directLabels: { ...plugins.directLabels, stems: true } },
        scales: {
          x: { title: xTitle, offset: true, ticks: bigTicks({ autoSkip: false }) },
          y: yAxis,
        },
      },
    };
  }

  return {
    type,
    data: {
      labels: labels.map(shownValue),
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: CHART_TEXT_COLOUR,
        borderWidth: 2,
        hoverBorderWidth: 5,
        borderRadius: 8,
        values: labels, // the real answers, for the tap-to-read helper
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins,
      scales: {
        // autoSkip off: every answer keeps its label, even on a narrow chart.
        x: { title: xTitle, ticks: bigTicks({ autoSkip: false }) },
        y: yAxis,
      },
    },
  };
}

// Part 48 (Round 4 pilot: the big chart cards looked like answers): the small
// counter beside the "Pick a graph to draw" toolbar. Trying graphs is
// exploring, never a race, so it only counts (no timer, no stars).
export function triedText(tried, total = 4) {
  return `Graphs tried: ${tried} of ${total}${tried >= total ? ' :party:' : ''}`; // :name: = icon (Part 54d)
}
