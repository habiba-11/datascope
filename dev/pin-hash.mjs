// Developer tool (never shipped to children): makes the fingerprint of a new
// teacher PIN. Run: npm run pin
// It asks for the PIN, then prints ONLY its fingerprint. Paste that into
// js/helpers/pin.js (PIN_HASH). The PIN itself is never saved anywhere.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hashText } from '../js/helpers/pin.js';

const ask = createInterface({ input: stdin, output: stdout });
const pin = (await ask.question('Type the new teacher PIN (10 or more characters, not a word): ')).trim();
ask.close();

if (pin.length < 10) {
  console.log('\nToo short: use 10 or more characters, so it cannot be guessed. Nothing changed.');
  process.exit(1);
}
console.log('\nPaste this line into js/helpers/pin.js, replacing the old PIN_HASH line:\n');
console.log(`export const PIN_HASH = '${await hashText(pin)}';\n`);
console.log('Then run: npm test   (then commit and push). Keep the PIN somewhere safe; it is not saved here.');
