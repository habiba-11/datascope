import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCode, ANIMALS } from '../js/helpers/code-maker.js';
import { isValidCode } from '../js/helpers/log.js';

test('a made code is an animal, a dash and 4 digits', () => {
  for (let i = 0; i < 500; i++) {
    assert.match(makeCode(), /^[A-Z]{3,5}-\d{4}$/);
  }
});

test('every possible code passes the app and database code rule', () => {
  for (const animal of ANIMALS) {
    assert.ok(animal.length <= 5, `${animal} is too long: the code must stay 10 or less`);
    assert.ok(isValidCode(`${animal}-1000`));
    assert.ok(isValidCode(`${animal}-9999`));
  }
});

test('never a test code (OWL- and TEST- are deleted before the pilot)', () => {
  assert.ok(!ANIMALS.includes('OWL'));
  assert.ok(!ANIMALS.includes('TEST'));
  assert.equal(new Set(ANIMALS).size, ANIMALS.length, 'no animal twice');
});

test('the smallest and the biggest choice give the first and last codes', () => {
  assert.equal(makeCode(() => 0), `${ANIMALS[0]}-1000`);
  assert.equal(makeCode((n) => n - 1), `${ANIMALS[ANIMALS.length - 1]}-9999`);
});
