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
// levels up by reasoning, never by speed. There are 17 badges in all: 4 devices,
// 1 change of mind, 4 Number Lab puzzles, 4 graphs, 4 claim cards.
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
