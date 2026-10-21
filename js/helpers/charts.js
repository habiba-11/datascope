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

// Draws each value's number directly on the chart, so kids don't have to
// hover to read it (Shah & Hoeffner, Paper 20: label directly, not a legend).
export const directLabelsPlugin = {
  id: 'directLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const isPie = chart.config.type === 'pie';
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((element, index) => {
        const value = dataset.data[index];
        if (value === null || value === undefined) return;
        // Dot plot: only the top dot of each stack gets a number.
        if (typeof value === 'object' && !value.top) return;
        const count = typeof value === 'object' ? value.y : value;
        if (count === 0) return; // nothing to label on an empty bar or slice

        // A pie has no x-axis, so each slice also names its value ("Football (6)").
        // That way colour is never the only way to tell the slices apart.
        const text = isPie ? `${chart.data.labels[index]} (${count})` : count;
        const { x, y } = element.tooltipPosition();
        ctx.save();
        ctx.fillStyle = '#17324D';
        ctx.font = 'bold 14px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = isPie ? 'middle' : 'bottom';
        // A white outline behind the text keeps it readable on slice borders.
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, isPie ? y : y - 8);
        ctx.fillText(text, x, isPie ? y : y - 8);
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

// The x-axis of a dot plot. Numbers get a number line from the first to the
// last label (so two compared classes share the same line). Text answers
// (e.g. playground games) get one column per category instead.
function dotXAxis(labels, unitLabel) {
  const title = { display: true, text: unitLabel || 'value' };
  if (typeof labels[0] === 'string') {
    return { type: 'category', labels, offset: true, title };
  }
  return {
    type: 'linear',
    title,
    ticks: { stepSize: 1 },
    min: labels[0] - 1,
    max: labels[labels.length - 1] + 1,
  };
}

// `yMax` is optional: when comparing two classes, both charts use the same height.
export function makeChartConfig(type, labels, data, unitLabel, yMax) {
  const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);
  // One extra step above the tallest bar, so its number label is not cut off.
  const yTop = (yMax ?? Math.max(...data)) + 1;

  if (type === 'dot') {
    return {
      type: 'scatter',
      data: {
        datasets: [{
          data: toDotPoints(labels, data),
          backgroundColor: '#38B6FF',
          pointBorderColor: '#17324D',
          pointBorderWidth: 2,
          pointRadius: 9,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: dotXAxis(labels, unitLabel),
          y: { title: { display: true, text: 'classmate #' }, ticks: { stepSize: 1 }, beginAtZero: true, max: yTop },
        },
      },
    };
  }

  return {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#17324D',
        borderWidth: 2,
        tension: 0, // straight lines: a curve would bulge past the real counts
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Pie slices are labelled directly, so no legend is needed.
      plugins: { legend: { display: false } },
      scales: type === 'pie'
        ? undefined
        : {
            x: { title: { display: true, text: unitLabel || 'value' } },
            y: { title: { display: true, text: 'classmates' }, beginAtZero: true, ticks: { stepSize: 1 }, max: yTop },
          },
    },
  };
}
