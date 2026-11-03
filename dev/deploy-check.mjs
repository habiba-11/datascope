// Developer tool (never shipped to children): run before every push to the live site.
// Run: npm run deploy-check
// It runs all the tests, then lists anything that should not go online.
import { spawnSync } from 'node:child_process';
import { PIN_HASH } from '../js/helpers/pin.js';
import { BACKEND } from '../js/config.js';

// The fingerprint of the old PIN, which was written in the docs before Part 36.
const OLD_PIN_HASH = 'cde383eee8ee7a4400adf7a15f716f179a2eb97646b37e089eb8d6d04e663416';

const problems = [];
const notes = [];

const tests = spawnSync(process.execPath, ['--test'], { encoding: 'utf8' });
const passed = tests.stdout.match(/ℹ pass (\d+)/)?.[1];
const failed = tests.stdout.match(/ℹ fail (\d+)/)?.[1];
if (tests.status !== 0) problems.push(`Tests: ${failed} failing. Run "npm test" to see which.`);
else notes.push(`Tests: all ${passed} pass.`);

if (PIN_HASH === OLD_PIN_HASH) {
  problems.push('Teacher PIN: still the old one, which was written in the public docs. Run "npm run pin" and paste the new line into js/helpers/pin.js.');
} else {
  notes.push('Teacher PIN: changed.');
}

notes.push(BACKEND.enabled
  ? 'Database: ON. Children\'s work will go online. Only if Prof and the ethics check said yes.'
  : 'Database: off (work stays in each browser; "Save my work" files are the fallback).');

const git = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (git.stdout.trim()) problems.push('Git: there are changes that are not committed yet. Commit them first.');

console.log('\nDataScope deploy check\n');
for (const note of notes) console.log(`  ✅ ${note}`);
for (const problem of problems) console.log(`  ❌ ${problem}`);
console.log(problems.length ? '\nNot ready yet: fix the ❌ lines, then run this again.\n' : '\nReady: you can push (git push).\n');
process.exit(problems.length ? 1 : 0);
