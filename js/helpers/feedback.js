// Layer 3: the instant feedback card at the end of each phase (Part 16).
// Pure: it gets `facts` (what the child did) and returns the card's content.
// Tested in Node (tests/feedback.test.js).
//
// Stars count REASONING moves (a reason written, a number used as proof,
// a second graph tried, a mind changed by data). Never speed, never
// first-try perfection, and using a hint never costs a star.

// Number of words in a text the child typed.
export function countWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// A "real" explanation has at least this many words.
const EXPLAINED = 5;

const RULES = {
  // facts: { scenarioTitle, ownQuestionClear }
  ask: (f) => ({
    stars: 2 + (f.ownQuestionClear ? 1 : 0),
    wins: [
      `You picked "${f.scenarioTitle}".`,
      'You fixed 2 unclear questions.',
      f.ownQuestionClear && 'You wrote your own clear question!',
    ],
    nextTime: f.ownQuestionClear ? 'Ask your real class a question like that!' : 'Try writing your own question too.',
    learned: 'A good question is clear, fair and says when.',
  }),

  // facts: { guessText }. Guessing before looking IS this phase's reasoning.
  plan: (f) => ({
    stars: 3,
    wins: [`You guessed ${f.guessText} before looking.`, 'Guess first, then check. Just like scientists!'],
    nextTime: 'Remember why you guessed that.',
    learned: 'A guess helps you notice surprises in the data.',
  }),

  // facts: { classSizes: [20] or [18, 18], mostCommon (text or null), guess (or null) }
  collect: (f) => {
    const hasGuess = f.guess !== null && f.guess !== undefined;
    const sizes = f.classSizes || [];
    const guessWin = hasGuess && (f.mostCommon
      ? `Most common answer: ${f.mostCommon}. Your guess: ${f.guess}.`
      : `Your guess was ${f.guess}. Now compare the classes!`);
    return {
      stars: 2 + (hasGuess ? 1 : 0),
      wins: [
        sizes.length > 1
          ? `You surveyed both classes: ${sizes.join(' + ')} kids.`
          : `You asked ${sizes[0]} pretend classmates.`,
        guessWin,
        'You watched every answer arrive.',
      ],
      nextTime: hasGuess ? 'In Explore, find out why answers spread out.' : 'Next time, make a guess first.',
      learned: 'Data is a set of answers, one from each person.',
    };
  },

  // facts: { typesTried, notTellWords }
  graph: (f) => {
    const triedMore = f.typesTried >= 2;
    const explained = f.notTellWords >= EXPLAINED;
    let nextTime = 'Compare two graphs. Which one is clearer?';
    if (!triedMore) nextTime = 'Try another graph type. What changes?';
    else if (!explained) nextTime = "Say more about what the graph can't tell.";
    return {
      stars: 1 + (triedMore ? 1 : 0) + (explained ? 1 : 0),
      wins: [
        `You tried ${f.typesTried} kind${f.typesTried === 1 ? '' : 's'} of graph.`,
        'You said what the graph shows.',
        explained && 'You found something the graph can NOT tell us!',
      ],
      nextTime,
      learned: 'A graph shows how many, but not why.',
    };
  },

  // facts: { guess, mean, changedWithReason, teaches }
  number: (f) => {
    const close = Math.abs(f.guess - f.mean) <= 1;
    return {
      stars: 2 + (close || f.changedWithReason ? 1 : 0),
      wins: [
        close ? `Your guess ${f.guess} was close to the mean ${f.mean}!` : `You guessed ${f.guess}. The mean was ${f.mean}.`,
        f.changedWithReason && 'You changed your mind because of the data.',
        'You solved all the number puzzles.',
      ],
      nextTime: f.changedWithReason
        ? 'Which number do you trust most? Say why.'
        : "If the data surprises you, it's OK to change your guess.",
      learned: f.teaches || 'Mean, median and mode each tell a different story.',
    };
  },

  // facts: { rating, target, runSizes: [10, 500, ...], pct500 (or null), theoryText }
  chance: (f) => {
    const sizes = [...new Set(f.runSizes)].sort((a, b) => a - b);
    const ran500 = sizes.includes(500);
    return {
      stars: 1 + (sizes.length >= 2 ? 1 : 0) + (ran500 ? 1 : 0),
      wins: [
        `You said "${f.rating}" and explained why.`,
        sizes.length >= 2 && `You tested ${sizes.join(', then ')} trials.`,
        ran500 && f.pct500 !== null && `500 trials: ${f.target} came up ${f.pct500}%. Theory: ${f.theoryText}.`,
      ],
      nextTime: ran500 ? 'Run 500 again. Does it stay close?' : 'Try 500 trials. Does it get closer?',
      learned: 'More trials usually get closer to what should happen.',
    };
  },

  // facts: { evidenceCount, certaintyReasonWords, audience, teaches }
  conclude: (f) => {
    const twoNumbers = f.evidenceCount >= 2;
    const explained = f.certaintyReasonWords >= EXPLAINED;
    let nextTime = `Now tell your claim to ${f.audience}!`;
    if (!twoNumbers) nextTime = 'Use two numbers as proof next time.';
    else if (!explained) nextTime = 'Say more about why you are that sure.';
    return {
      stars: 1 + (twoNumbers ? 1 : 0) + (explained ? 1 : 0),
      wins: [
        'You made a claim and said why.',
        twoNumbers ? `You used ${f.evidenceCount} numbers as proof.` : 'You used a number as proof.',
        explained && 'You said how sure you are, and why.',
      ],
      nextTime,
      learned: f.teaches || 'A claim needs proof and how sure you are.',
    };
  },
};

export const FEEDBACK_PHASES = Object.keys(RULES);

// Returns { stars (1 to 3), wins (at most 3), nextTime, learned }.
export function buildPhaseFeedback(phase, facts = {}) {
  const rule = RULES[phase];
  if (!rule) throw new Error(`No feedback rules for phase "${phase}"`);
  const card = rule(facts);
  return {
    stars: Math.min(3, Math.max(1, card.stars)),
    wins: card.wins.filter(Boolean).slice(0, 3),
    nextTime: card.nextTime,
    learned: card.learned,
  };
}
