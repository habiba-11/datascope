const PALETTE = ['#FF7A6B', '#FFC531', '#38B6FF', '#4CC26B', '#8E7CFF'];

export function buildFrequencyData(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  const labels = [...counts.keys()].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  const data = labels.map((label) => counts.get(label));
  return { labels, data };
}

// Draws each value's number directly on the chart, so kids don't have to
// hover to read it (Shah & Hoeffner, Paper 20: label directly, not a legend).
export const directLabelsPlugin = {
  id: 'directLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((element, index) => {
        const value = dataset.data[index];
        if (value === null || value === undefined) return;
        const label = typeof value === 'object' ? value.y : value;
        const { x, y } = element.tooltipPosition();
        ctx.save();
        ctx.fillStyle = '#17324D';
        ctx.font = "bold 14px Nunito, sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x, y - 8);
        ctx.restore();
      });
    });
  },
};

function toDotPoints(labels, data) {
  const points = [];
  labels.forEach((label, i) => {
    for (let stack = 1; stack <= data[i]; stack++) {
      points.push({ x: label, y: stack });
    }
  });
  return points;
}

export function makeChartConfig(type, labels, data, unitLabel) {
  const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

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
          x: { title: { display: true, text: unitLabel || 'value' }, ticks: { stepSize: 1 } },
          y: { title: { display: true, text: 'classmate #' }, ticks: { stepSize: 1 }, beginAtZero: true },
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
        tension: 0.25,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type === 'pie' } },
      scales: type === 'pie'
        ? undefined
        : {
            x: { title: { display: true, text: unitLabel || 'value' } },
            y: { title: { display: true, text: 'classmates' }, beginAtZero: true, ticks: { stepSize: 1 } },
          },
    },
  };
}
