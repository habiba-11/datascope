// Developer tool (never shipped to children): run before every push to the live site.
// Run: npm run deploy-check
// It runs all the tests, then lists anything that should not go online.
import { spawnSync } from 'node:child_process';
import { BACKEND } from '../js/config.js';

const problems = [];
const notes = [];

const tests = spawnSync(process.execPath, ['--test'], { encoding: 'utf8' });
const passed = tests.stdout.match(/ℹ pass (\d+)/)?.[1];
const failed = tests.stdout.match(/ℹ fail (\d+)/)?.[1];
if (tests.status !== 0) problems.push(`Tests: ${failed} failing. Run "npm test" to see which.`);
else notes.push(`Tests: all ${passed} pass.`);

// The teacher logs in with email + password while the database is on. The PIN
// (kept as a hash, Habiba's decision 4 Nov 2026) is only asked when it is off.
notes.push(BACKEND.enabled
  ? 'Database: ON. Children\'s work goes online; the teacher logs in with email + password.'
  : 'Database: OFF. Work stays in each browser, and the teacher can only see DEMO data.');

const git = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (git.stdout.trim()) problems.push('Git: there are changes that are not committed yet. Commit them first.');

console.log('\nDataScope deploy check\n');
for (const note of notes) console.log(`  ✅ ${note}`);
for (const problem of problems) console.log(`  ❌ ${problem}`);
console.log(problems.length ? '\nNot ready yet: fix the ❌ lines, then run this again.\n' : '\nReady: you can push (git push).\n');
process.exit(problems.length ? 1 : 0);
