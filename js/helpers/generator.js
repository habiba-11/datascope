import { mean, median, mode, range, formatMean } from './stats.js';

const MAX_ATTEMPTS = 2000;

// A small, dependency-free seeded random number generator (mulberry32).
// Same seed always produces the same sequence of numbers between 0 and 1.
function mulberry32(seed) {
  return function random() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildValues(scenario, seed) {
  const random = mulberry32(seed);
  const mustInclude = scenario.mustInclude || [];
  const randomCount = scenario.classSize - mustInclude.length;

  const values = [];
  for (let i = 0; i < randomCount; i++) {
    const pick = scenario.valuePool[Math.floor(random() * scenario.valuePool.length)];
    values.push(pick);
  }
  values.push(...mustInclude);

  return shuffle(values, random);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function matchesTarget(scenario, values) {
  const target = scenario.target;

  if (scenario.answerType === 'number') {
    if (formatMean(mean(values)) !== target.mean) return false;
    if (median(values) !== target.median) return false;
    if (range(values) !== target.range) return false;
  }

  const actualMode = [...mode(values)].sort();
  const expectedMode = [...target.mode].sort();
  return arraysEqual(actualMode, expectedMode);
}

// Tries seeds starting at startSeed until the generated class matches the
// scenario's target stats exactly (this is what "checks itself" means).
export function generateClassData(scenario, startSeed = 1) {
  for (let seed = startSeed; seed < startSeed + MAX_ATTEMPTS; seed++) {
    const values = buildValues(scenario, seed);
    if (matchesTarget(scenario, values)) {
      return { scenarioId: scenario.id, seed, values };
    }
  }
  throw new Error(
    `No seed matched the target for scenario "${scenario.id}" within ${MAX_ATTEMPTS} attempts.`
  );
}
