// Layer 3: the words on "My journey" (f10 design, 4 Nov 2026), built from
// buildJourney() and data/content/journey.json. Pure, tested in Node
// (tests/journey-view.test.js). The page puts every line in with textContent,
// because most of it is what the child typed.
import { CERTAINTY } from './certainty.js';
import { shownTheory } from './chance.js';

export const STOPS = [
  { phase: 'ask', icon: '❓', name: 'Ask', color: 'ask' },
  { phase: 'plan', icon: '🗺️', name: 'Plan', color: 'plan' },
  { phase: 'collect', icon: '📋', name: 'Collect', color: 'collect' },
  { phase: 'graph', icon: '📊', name: 'Graph Lab', color: 'explore' },
  { phase: 'number', icon: '🔢', name: 'Number Lab', color: 'explore' },
  { phase: 'chance', icon: '🎲', name: 'Chance Lab', color: 'explore' },
  { phase: 'conclude', icon: '🚩', name: 'Conclude', color: 'conclude' },
];

export const claimSentence = (c) => `I think ${c.claim} because ${c.because}.`;

// The child's own answers at each stop, in short sentences ("My journey" tab).
export function stopLines(phase, p, { cardTitle, kind }) {
  const lines = [];
  switch (phase) {
    case 'ask':
      lines.push(`You picked: ${cardTitle}`);
      break;
    case 'plan':
      if (p.guess !== null) lines.push(`Your guess: ${p.guess}`);
      break;
    case 'collect':
      if (p.classes.length) lines.push(`You asked ${p.classes.map((c) => c.classSize).join(' + ')} pretend classmates.`);
      break;
    case 'graph':
      if (p.tell) lines.push(`It shows: "${p.tell}"`);
      if (p.notTell) lines.push(`It can't show: "${p.notTell}"`);
      break;
    case 'number':
      if (p.guess !== null) {
        lines.push(kind === 'category'
          ? `You guessed ${p.guess}. The mode was ${(p.mode || []).join(' and ')}.`
          : `You guessed ${p.guess}. The mean was ${p.mean}.`);
      }
      if (p.revision && p.revision.changed) lines.push(`You changed to ${p.revision.newGuess} because "${p.revision.reason}".`);
      if (p.tasks.length) {
        const solved = p.firstTry + p.afterHint;
        lines.push(`🧩 Puzzles solved: ${solved}${p.afterHint ? ` (${p.afterHint} after trying again 💪)` : ''}`);
      }
      break;
    case 'chance':
      if (p.rating) lines.push(`${p.device}: you said "${p.rating}" because "${p.reason}".`);
      if (p.biggestRun) {
        const r = p.biggestRun;
        lines.push(`${r.trials} tries: ${r.outcome} came up ${r.pct}%. It should be ${shownTheory(r.theory)}.`);
      }
      break;
    case 'conclude':
      if (p.claim) {
        const c = p.claim;
        lines.push(claimSentence(c));
        lines.push(`Proof: ${(c.evidence || []).join(', ')}`);
        lines.push(`How sure: ${certaintyLevel(c.certainty).word}. ${c.certaintyReason}`);
        if (c.audience) lines.push(`For: ${c.audience}`); // cards from before 26 Oct 2026
      }
      break;
    default:
      break;
  }
  return lines;
}

// "I showed it when: ..." on a skill card: the child's best own words for that
// stop, or null (then the line is hidden).
export function showedLine(phase, p, info) {
  if (phase === 'graph' && p.notTell) return `I said what it can't show: "${p.notTell}"`;
  if (phase === 'number' && p.revision && p.revision.changed) return `I changed my guess because "${p.revision.reason}".`;
  if (phase === 'chance' && p.rating) return `I said "${p.rating}" because "${p.reason}".`;
  return stopLines(phase, p, info)[0] || null;
}

// What the child learned at a stop. Games get their own Number Lab line.
export function learnedLine(skills, phase, kind) {
  const s = skills[phase];
  return kind === 'category' && s.learnedWords ? s.learnedWords : s.learned;
}

// Where a certainty answer sits on the 5-step scale (1 = impossible, 5 = certain).
export function certaintyLevel(value) {
  const index = CERTAINTY.findIndex((c) => c.value === value);
  return index === -1 ? { step: 0, word: value || '' } : { step: index + 1, word: CERTAINTY[index].word };
}
