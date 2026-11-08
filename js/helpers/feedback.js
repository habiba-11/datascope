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

  // facts: { guessText }. Predicting before looking IS this phase's reasoning
  // (Part 50: Plan is a PREDICTION; Number Lab makes an ESTIMATE).
  plan: (f) => ({
    stars: 3,
    wins: [`You predicted ${f.guessText} before looking.`, 'Predict first, then check. Just like scientists!'],
    nextTime: 'Remember why you predicted that.',
    learned: 'A prediction helps you notice surprises in the data.',
  }),

  // facts: { classSizes: [20] or [18, 18], mostCommon (text or null), guess (or null) }
  collect: (f) => {
    const hasGuess = f.guess !== null && f.guess !== undefined;
    const sizes = f.classSizes || [];
    const guessWin = hasGuess && (f.mostCommon
      ? `Most common answer: ${f.mostCommon}. Your prediction: ${f.guess}.`
      : `Your prediction was ${f.guess}. Now compare the classes!`);
    return {
      stars: 2 + (hasGuess ? 1 : 0),
      wins: [
        sizes.length > 1
          ? `You surveyed both classes: ${sizes.join(' + ')} kids.`
          : `You asked ${sizes[0]} pretend classmates.`,
        guessWin,
        'You watched every answer arrive.',
      ],
      nextTime: hasGuess ? 'In Explore, find out why answers spread out.' : 'Make a guess first.',
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

  // facts: { guess, mean, changedWithReason, teaches }, or for words (games):
  // { guess, mode (list), changedWithReason, teaches }
  number: (f) => {
    const isWords = Array.isArray(f.mode) && f.mean === undefined;
    const close = isWords ? f.mode.includes(f.guess) : Math.abs(f.guess - f.mean) <= 1;
    // Part 50: an ESTIMATE of the mean, or (games) the Plan PREDICTION checked.
    // Part 51: the games card never talks about numbers.
    let guessWin = close ? `Your estimate ${f.guess} was close to the mean ${f.mean}!` : `You estimated ${f.guess}. The mean was ${f.mean}.`;
    if (isWords) guessWin = close ? `You predicted ${f.guess}. That is the mode!` : `You predicted ${f.guess}. The mode was ${f.mode.join(' and ')}.`;
    return {
      stars: 2 + (close || f.changedWithReason ? 1 : 0),
      wins: [
        guessWin,
        f.changedWithReason && 'You changed your mind because of the data.',
        isWords ? 'You solved all the puzzles.' : 'You solved all the number puzzles.',
      ],
      nextTime: f.changedWithReason
        ? (isWords ? 'Why is the mode the best answer for games? Say why.' : 'Which number do you trust most? Say why.')
        : `If the data surprises you, it's OK to change your ${isWords ? 'prediction' : 'estimate'}.`,
      learned: f.teaches || (isWords ? 'The mode shows the most popular answer.' : 'Mean, median and mode each tell a different story.'),
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

  // facts: { evidenceCount, evidenceOptions, certaintyReasonWords, teaches }
  // evidenceOptions = how many proof chips there were. Games (words) have only
  // one, the mode, so picking it is full proof (Habiba, 4 Nov 2026).
  conclude: (f) => {
    const onlyMode = f.evidenceOptions === 1;
    const enoughProof = onlyMode ? f.evidenceCount >= 1 : f.evidenceCount >= 2;
    const explained = f.certaintyReasonWords >= EXPLAINED;
    let nextTime = 'Now share your claim with your class!';
    if (!enoughProof) nextTime = onlyMode ? 'Use the mode as proof next time.' : 'Use two numbers as proof next time.';
    else if (!explained) nextTime = 'Say more about why you are that sure.';
    let proofWin = enoughProof ? `You used ${f.evidenceCount} numbers as proof.` : 'You used a number as proof.';
    if (onlyMode) proofWin = 'You used the mode as proof.';
    return {
      stars: 1 + (enoughProof ? 1 : 0) + (explained ? 1 : 0),
      wins: [
        'You made a claim and said why.',
        proofWin,
        explained && 'You said how sure you are, and why.',
      ],
      nextTime,
      learned: f.teaches || 'A claim needs proof and how sure you are.',
    };
  },
};

export const FEEDBACK_PHASES = Object.keys(RULES);

// The words under the stars (f7b design), so the stars are never the only
// signal. Kind at every level: there is no "bad".
export const STAR_WORDS = { 3: 'Great thinking!', 2: 'Good thinking!', 1: 'Nice start!' };

// Where "Your work" came from, as the small chip on the card says it.
export const SOURCE_CHIPS = {
  own: ':pencil: your own words', // :name: = icon (Part 54d)
  choice: ':tap: your own choice',
  hint: ':bulb: a hint',
  'hint-edited': ':bulb: a hint you changed',
  mixed: ':pencil::bulb: your words and a hint',
};

// One source for an answer made of several boxes (the claim: "I think" + "because").
export function combineSources(sources) {
  const known = sources.filter(Boolean);
  if (known.length === 0) return null;
  if (known.every((s) => s === known[0])) return known[0];
  if (known.every((s) => s !== 'own')) return 'hint-edited';
  return 'mixed';
}

// "Your work": the child's own answer in this phase, shown back to them (f7b
// design), or null when the phase has none. `source` may be null for an
// answer logged before Round 3 (then no chip). Shown with textContent only.
const YOUR_WORK = {
  ask: (f) => {
    if (f.ownQuestion) return { label: 'Your question', text: f.ownQuestion, source: 'own' };
    return f.question ? { label: 'Your question', text: f.question, source: 'choice' } : null;
  },
  plan: (f) => (f.guessText ? { label: 'Your guess', text: f.guessText, source: 'choice' } : null),
  collect: (f) => (f.guess !== null && f.guess !== undefined ? { label: 'Your guess', text: String(f.guess), source: 'choice' } : null),
  graph: (f) => (f.notTellText ? { label: 'What the graph can NOT tell', text: f.notTellText, source: f.notTellSource || null } : null),
  number: (f) => {
    if (f.revision && f.revision.reason) return { label: 'Why you changed your guess', text: f.revision.reason, source: f.revision.source || null };
    return f.guess !== null && f.guess !== undefined ? { label: 'Your guess', text: String(f.guess), source: 'choice' } : null;
  },
  chance: (f) => (f.reason ? { label: 'How likely, and why', text: `${f.rating}: ${f.reason}`, source: f.reasonSource || null } : null),
  conclude: (f) => (f.claimText ? { label: 'Your claim', text: f.claimText, source: combineSources(f.claimSources || []) } : null),
};

export function yourWork(phase, facts = {}) {
  return YOUR_WORK[phase] ? YOUR_WORK[phase](facts) : null;
}

// Returns { stars (1 to 3), starWord, wins (at most 3), nextTime, learned, yourWork }.
export function buildPhaseFeedback(phase, facts = {}) {
  const rule = RULES[phase];
  if (!rule) throw new Error(`No feedback rules for phase "${phase}"`);
  const card = rule(facts);
  const stars = Math.min(3, Math.max(1, card.stars));
  return {
    stars,
    starWord: STAR_WORDS[stars],
    wins: card.wins.filter(Boolean).slice(0, 3),
    nextTime: card.nextTime,
    learned: card.learned,
    yourWork: yourWork(phase, facts),
  };
}
