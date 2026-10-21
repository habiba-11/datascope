import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFrequencyData, makeChartConfig, describeChart } from '../js/helpers/charts.js';

test('dot plot of text answers uses a category x-axis (one column per game)', () => {
  const { labels, data } = buildFrequencyData(['Tag', 'Football', 'Football']);
  const config = makeChartConfig('dot', labels, data, 'game');
  assert.equal(config.options.scales.x.type, 'category');
  assert.deepEqual(config.options.scales.x.labels, ['Football', 'Tag']);
});

test('dot plot of numbers keeps a number line from the first to the last value', () => {
  const { labels, data } = buildFrequencyData([3, 9, 9, 10]);
  const x = makeChartConfig('dot', labels, data, 'hours').options.scales.x;
  assert.equal(x.type, 'linear');
  assert.equal(x.min, 2);
  assert.equal(x.max, 11);
});

test('the y-axis leaves one step above the tallest bar for its label', () => {
  const config = makeChartConfig('bar', [3, 9], [1, 6], 'hours');
  assert.equal(config.options.scales.y.max, 7);
});

test('shared labels give a count of 0 for values nobody chose (Class A vs B)', () => {
  const { labels, data } = buildFrequencyData([20, 20, 21], [5, 20, 21, 35]);
  assert.deepEqual(labels, [5, 20, 21, 35]);
  assert.deepEqual(data, [0, 2, 1, 0]);
});

test('a chart is also described in words for screen readers', () => {
  assert.equal(
    describeChart('bar', [3, 9, 10], [1, 6, 0], 'hours'),
    'Bar chart. 3 hours: 1 classmate. 9 hours: 6 classmates.'
  );
  assert.equal(describeChart('pie', ['Football', 'Tag'], [6, 3]), 'Pie chart. Football: 6 classmates. Tag: 3 classmates.');
});
