// Part 60d (Habiba, 11 Nov 2026): the child gets an explorer code by pressing
// "Make me a code" (no more codes from the teacher). A code is an animal and
// 4 digits, e.g. "FOX-4725": easy to read out and to write on paper.
//
// It follows the code rule of the app and the database (log.js isValidCode,
// backend/schema.sql): capital letters, digits and a dash, at most 10 long.
// Never "OWL-" or "TEST-": those are the test codes deleted before the pilot
// (project-notes section 4). No animal a child could be teased with.
//
// 40 animals x 9000 numbers = 360,000 codes. Children cannot read the database,
// so the app cannot check that a code is new: two children get the same code
// with a chance of about 1 in 70 among 100 children (n * n / 720,000).
export const ANIMALS = [
  'ANT', 'BEAR', 'BEE', 'BISON', 'CAMEL', 'CAT', 'CRAB', 'DEER', 'DOG', 'DOVE',
  'DUCK', 'EAGLE', 'ELK', 'EMU', 'FOX', 'FROG', 'GECKO', 'GOAT', 'HAWK', 'HIPPO',
  'KOALA', 'LION', 'LLAMA', 'LYNX', 'MOOSE', 'OTTER', 'PANDA', 'PONY', 'PUMA', 'RHINO',
  'ROBIN', 'SEAL', 'SHARK', 'SWAN', 'TIGER', 'TUNA', 'WHALE', 'WOLF', 'YAK', 'ZEBRA',
];

// A whole number from 0 to n - 1, from the browser's secure random numbers.
function randomBelow(n) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % n;
}

// `pick` can be replaced in the tests, so a test knows which code comes out.
export function makeCode(pick = randomBelow) {
  const animal = ANIMALS[pick(ANIMALS.length)];
  const number = 1000 + pick(9000); // always 4 digits: 1000 to 9999
  return `${animal}-${number}`;
}
