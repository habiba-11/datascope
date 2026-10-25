import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createModalQueue } from '../js/helpers/modal-queue.js';

test('the first pop-up shows straight away', () => {
  const queue = createModalQueue();
  assert.equal(queue.add('intro'), 'intro');
  assert.equal(queue.current, 'intro');
});

test('a second pop-up waits while one is open', () => {
  const queue = createModalQueue();
  queue.add('intro');
  assert.equal(queue.add('recap'), null);
  assert.equal(queue.current, 'intro');
  assert.equal(queue.waitingCount, 1);
});

test('closing a pop-up opens the next one, in the order they came', () => {
  const queue = createModalQueue();
  queue.add('intro');
  queue.add('recap');
  queue.add('feedback');
  assert.equal(queue.done(), 'recap');
  assert.equal(queue.done(), 'feedback');
  assert.equal(queue.done(), null);
  assert.equal(queue.current, null);
});

test('after the line is empty, a new pop-up shows straight away again', () => {
  const queue = createModalQueue();
  queue.add('intro');
  queue.done();
  assert.equal(queue.add('feedback'), 'feedback');
});
