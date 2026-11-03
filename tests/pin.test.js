import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPin, hashText, PIN_HASH } from '../js/helpers/pin.js';

// A made-up PIN, only for these tests. The real PIN is written nowhere.
const TEST_PIN = 'test-only-pin-42';

test('the fingerprint is a SHA-256 hash: 64 hex characters', async () => {
  assert.match(PIN_HASH, /^[0-9a-f]{64}$/);
  assert.match(await hashText(TEST_PIN), /^[0-9a-f]{64}$/);
});

test('the right PIN opens the dashboard (spaces around it are fine)', async () => {
  const hash = await hashText(TEST_PIN);
  assert.equal(await checkPin(TEST_PIN, hash), true);
  assert.equal(await checkPin(`  ${TEST_PIN} `, hash), true);
});

test('wrong PINs do not', async () => {
  const hash = await hashText(TEST_PIN);
  assert.equal(await checkPin('', hash), false);
  assert.equal(await checkPin(TEST_PIN.toUpperCase(), hash), false);
  assert.equal(await checkPin(`${TEST_PIN}0`, hash), false);
});

test('the same text always gives the same fingerprint, and another text a different one', async () => {
  assert.equal(await hashText(TEST_PIN), await hashText(TEST_PIN));
  assert.notEqual(await hashText('a'), await hashText('b'));
});
