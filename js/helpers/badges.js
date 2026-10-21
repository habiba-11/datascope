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
