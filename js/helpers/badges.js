// Layer 3: badges reward good REASONING, never speed (architecture row 9, Papers 26, 30).
// Badges are worked out from the reasoning log itself, so the count can never
// disagree with what the child actually did.

// Which reasoning moment (if any) a log entry shows. Returns a key, or null.
// The key makes each moment count once: rating the same spinner twice, or
// solving the same task again, does not earn a second badge.
export function badgeKey(entry) {
  switch (entry.type) {
    case 'certainty':
      return entry.reason ? `why:${entry.device}` : null;
    case 'revision':
      return entry.changed && entry.reason ? 'changed-mind' : null;
    case 'meaning-task':
      return entry.result === 'correct' || entry.result === 'after-hint' ? `task:${entry.task}` : null;
    case 'reflection':
      // "What does this graph NOT tell you?" with a real answer (not one or two letters).
      return entry.prompt === 'not-tell' && entry.text && entry.text.length >= 10 ? `not-tell:${entry.scenarioId}` : null;
    case 'claim':
      return entry.because && entry.certaintyReason ? `claim:${entry.scenarioId}` : null;
    default:
      return null;
  }
}

// All badge keys a child (by code) has earned in the log.
export function earnedBadges(entries, code) {
  const keys = new Set();
  for (const entry of entries) {
    if (entry.code !== code) continue;
    const key = badgeKey(entry);
    if (key) keys.add(key);
  }
  return keys;
}

// The five kinds of badge. Each one names a kind of good thinking, and says
// where to find it, so the shelf shows children what good reasoning looks like.
// `id` is the start of the badge key ("why:Fair coin" -> "why").
export const BADGE_TYPES = [
  { id: 'why', icon: '🧙', name: 'Why-Wizard', earnedFor: 'You explained WHY something is likely or unlikely.', where: '🎲 Chance Lab: rate a chance and say why.' },
  { id: 'changed-mind', icon: '🔄', name: 'Mind-Changer', earnedFor: 'You changed your mind because of the evidence.', where: '🔢 Number Lab: after Reveal, change your guess and say why.' },
  { id: 'task', icon: '🧮', name: 'Number Cracker', earnedFor: 'You worked out what the numbers really mean.', where: '🔢 Number Lab: solve a puzzle (using a hint is fine!).' },
  { id: 'not-tell', icon: '🔍', name: 'Graph Skeptic', earnedFor: 'You spotted what a graph can NOT tell us.', where: '📊 Graph Lab: say what the graph can NOT tell us.' },
  { id: 'claim', icon: '🏅', name: 'Data Detective', earnedFor: 'You made a claim with evidence and said how sure you are.', where: '🚩 Evidence Board: finish your Evidence Card.' },
];

// Which kind of badge a key belongs to (or undefined).
export function badgeType(key) {
  return BADGE_TYPES.find((type) => type.id === key.split(':')[0]);
}

// Every kind of badge, with how many times this child earned it (0 = still to find).
export function badgeShelf(keys) {
  return BADGE_TYPES.map((type) => ({
    ...type,
    count: [...keys].filter((key) => badgeType(key) === type).length,
  }));
}

// Explorer levels (Paper 30: levels). They only go up with badges, so a child
// levels up by reasoning, never by speed. Since Part 21b the child's level
// counts badge patches (12, see BADGES below); the thesis `level` column still
// counts reasoning moments. There are 19 moments in all: 4 devices,
// 1 change of mind, 6 Number Lab puzzles (build-mean, find-mias-mistake,
// real-life-mode, real-life-median, why-no-mean, compare-range; which ones a
// child meets depends on the scenario), 4 graphs, 4 claim cards.
export const LEVELS = [
  { min: 0, icon: '🐣', name: 'Rookie Explorer' },
  { min: 2, icon: '🔎', name: 'Junior Detective' },
  { min: 5, icon: '🕵️', name: 'Super Detective' },
  { min: 9, icon: '🏆', name: 'Master Detective' },
];

// The child's level for a number of badges, plus the next level (null at the top).
export function levelFor(count) {
  const index = LEVELS.findLastIndex((level) => count >= level.min);
  return { ...LEVELS[index], next: LEVELS[index + 1] || null };
}

// What Pip says when a badge is earned: it names the reasoning, not the speed.
export function badgeMessage(entry) {
  switch (entry.type) {
    case 'certainty':
      return 'Great reasoning! You explained WHY. ⭐';
    case 'revision':
      return 'You changed your mind because of the evidence. That\'s what scientists do! ⭐';
    case 'meaning-task':
      return entry.result === 'after-hint'
        ? 'You used the hint and worked it out! ⭐'
        : 'You worked it out! ⭐';
    case 'reflection':
      return 'Smart thinking! You spotted what the graph can\'t tell us. ⭐';
    case 'claim':
      return 'Claim + evidence + how sure: a real data detective! ⭐';
    default:
      return 'Great thinking! ⭐';
  }
}

// How far the child is from their level to the next one, 0 to 100 (100 at
// the top level). Drawn as the bar under the badge counter (Part 21b).
export function levelProgress(count) {
  const level = levelFor(count);
  if (!level.next) return 100;
  return Math.round((100 * (count - level.min)) / (level.next.min - level.min));
}

// ---------------------------------------------------------------------------
// Badge patches (Part 21b, docs/design/badges-spec.md). Each patch is earned
// ONCE per child code and shown in the "My Explorer Backpack". The 5 kinds
// above keep their ids (why, changed-mind, task, not-tell, claim); 7 patches
// are new. The "moments" above stay as they are: the thesis columns `badges`
// and `level` (helpers/thesis.js) still count moments.
//
// Every rule looks only at the log, and only at reasoning moves (guessing
// first, explaining, changing your mind, using evidence). Never at speed.
// `color` is a room colour name from css/theme.css; `icon` is in js/icons.js.

// A typed answer that explains: it says "because" (or "so") and is more than a word or two.
export function explains(text) {
  return typeof text === 'string' && text.trim().length >= 10 && /\b(because|so)\b/i.test(text);
}

// How many of the child's answers explain, one per question (typing the same
// answer again does not count twice). The claim card's "because" box counts:
// the card reads "I think ... because ...".
function becauseAnswers(entries) {
  const keys = new Set();
  for (const e of entries) {
    if (e.type === 'reflection' && explains(e.text)) keys.add(`reflection:${e.scenarioId}:${e.prompt}`);
    if (e.type === 'certainty' && explains(e.reason)) keys.add(`certainty:${e.device}`);
    if (e.type === 'revision' && e.changed && explains(e.reason)) keys.add(`revision:${e.scenarioId}`);
    if (e.type === 'claim' && e.because && e.because.trim().length >= 10) keys.add(`claim-because:${e.scenarioId}`);
    if (e.type === 'claim' && explains(e.certaintyReason)) keys.add(`claim-sure:${e.scenarioId}`);
  }
  return keys.size;
}

const phaseDone = (entries, phase) => entries.some((e) => e.type === 'phase-complete' && e.phase === phase);
const solved = (e) => e.type === 'meaning-task' && (e.result === 'correct' || e.result === 'after-hint');
const hasMoment = (entries, start) => entries.some((e) => (badgeKey(e) || '').startsWith(start));

// Ran 10 tries AND 500 tries with the same coin, dice or spinner.
function testedSmallAndBig(entries) {
  const sizes = {};
  for (const e of entries) {
    if (e.type !== 'trials') continue;
    if (!sizes[e.device]) sizes[e.device] = new Set();
    sizes[e.device].add(e.trials);
  }
  return Object.values(sizes).some((s) => s.has(10) && s.has(500));
}

export const BADGES = [
  {
    id: 'question-fixer', name: 'Question Fixer', phase: 'Ask', color: 'ask', icon: 'question',
    why: 'You fixed a confusing question. Clear questions get clear answers!',
    how: 'Fix a question that is not clear.',
    // Ask is only done when both fix-it questions pass the checker.
    rule: (entries) => phaseDone(entries, 'ask'),
  },
  {
    id: 'brave-guesser', name: 'Brave Guesser', phase: 'Plan', color: 'plan', icon: 'compass',
    why: 'You made a guess before looking. Scientists guess first, then check!',
    how: 'Make a guess before you see the data.',
    rule: (entries) => entries.some((e) => e.type === 'prediction'),
  },
  {
    id: 'data-collector', name: 'Data Collector', phase: 'Collect', color: 'collect', icon: 'clipboard',
    why: 'You asked the whole pretend class. More answers, better evidence!',
    how: 'Ask the whole pretend class.',
    // Collect is only done when the survey is complete (both classes for reading).
    rule: (entries) => phaseDone(entries, 'collect'),
  },
  {
    id: 'graph-explorer', name: 'Graph Explorer', phase: 'Explore', color: 'explore', icon: 'bars',
    why: 'You tried two kinds of graphs. Each one shows something new!',
    how: 'Try 2 different graphs.',
    rule: (entries) => entries.some((e) => e.type === 'chart-switch' && e.chartType !== e.from),
  },
  {
    id: 'not-tell', name: 'Graph Skeptic', phase: 'Explore', color: 'explore', icon: 'magnifier',
    why: 'You spotted what a graph can NOT tell us.',
    how: 'Say what the graph can NOT tell us.',
    rule: (entries) => hasMoment(entries, 'not-tell:'),
  },
  {
    id: 'middle-finder', name: 'Centre Finder', phase: 'Explore', color: 'collect', icon: 'median',
    why: 'You put the numbers in order to find the centre. That is the median!',
    how: 'Sort the numbers to find the median.',
    // Mia's mistake is only solved after the cards are sorted (Part 21c).
    rule: (entries) => entries.some((e) => solved(e) && e.task === 'find-mias-mistake'),
  },
  {
    id: 'task', name: 'Number Cracker', phase: 'Explore', color: 'collect', icon: 'calculator',
    why: 'You worked out what the numbers really mean.',
    how: 'Solve a Number Lab puzzle. Using a hint is fine!',
    rule: (entries) => entries.some(solved),
  },
  {
    id: 'chance-tester', name: 'Chance Tester', phase: 'Explore', color: 'conclude', icon: 'dice',
    why: 'You saw that more tries get closer to the real chance!',
    how: 'Run 10 tries, then 500 tries.',
    rule: testedSmallAndBig,
  },
  {
    id: 'why', name: 'Why-Wizard', phase: 'Explore', color: 'conclude', icon: 'wand',
    why: 'You explained WHY something is likely or unlikely.',
    how: 'Rate a chance and say why.',
    rule: (entries) => hasMoment(entries, 'why:'),
  },
  {
    id: 'changed-mind', name: 'Mind Changer', phase: 'Any', color: 'conclude', icon: 'refresh', super: true,
    why: 'You changed your mind because of the data. Real scientists do that!',
    how: 'Change your guess after you see the data.',
    rule: (entries) => hasMoment(entries, 'changed-mind'),
  },
  {
    id: 'because-builder', name: 'Because Builder', phase: 'Any', color: 'plan', icon: 'bubble', super: true,
    why: 'You explained your thinking with "because" three times. Great reasoning!',
    how: 'Explain 3 answers using "because".',
    rule: (entries) => becauseAnswers(entries) >= 3,
  },
  {
    id: 'claim', name: 'Evidence Expert', phase: 'Conclude', color: 'ask', icon: 'flag', super: true,
    why: 'You made a claim, showed proof and said how sure you are!',
    how: 'Finish your Evidence Card.',
    rule: (entries) => entries.some((e) => (badgeKey(e) || '').startsWith('claim:') && e.evidence && e.evidence.length >= 1),
  },
];

export function findBadge(id) {
  return BADGES.find((b) => b.id === id);
}

// The patches this child's log has earned (shown yet or not), in list order.
export function earnedPatches(entries, code) {
  const own = entries.filter((e) => e.code === code);
  return BADGES.filter((b) => b.rule(own)).map((b) => b.id);
}

// The NEW patches: earned by the log, but with no "badge-earned" entry yet.
// Pure (no page), so it is tested in Node (tests/badges.test.js).
export function checkBadges(entries, code) {
  const shown = new Set(
    entries.filter((e) => e.code === code && e.type === 'badge-earned').map((e) => e.badgeId),
  );
  return earnedPatches(entries, code).filter((id) => !shown.has(id));
}

// Every patch for the backpack shelf, each with earned: true / false.
export function backpack(entries, code) {
  const earned = new Set(earnedPatches(entries, code));
  return BADGES.map((b) => ({ ...b, earned: earned.has(b.id) }));
}
