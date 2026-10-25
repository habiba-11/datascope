import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkPin, hashText, PIN_HASH } from '../js/helpers/pin.js';

test('the right PIN opens the dashboard (spaces around it are fine)', async () => {
  assert.equal(await checkPin('teacher123'), true);
  assert.equal(await checkPin('  teacher123 '), true);
});

test('wrong PINs do not', async () => {
  assert.equal(await checkPin(''), false);
  assert.equal(await checkPin('Teacher123'), false);
  assert.equal(await checkPin('teacher1234'), false);
});

test('the PIN itself is not written in the code, only its fingerprint', async () => {
  assert.equal(PIN_HASH.length, 64);
  assert.equal(await hashText('teacher123'), PIN_HASH);
  const code = readFileSync(new URL('../js/helpers/pin.js', import.meta.url), 'utf8');
  assert.ok(!code.includes('teacher' + '123'));
});
